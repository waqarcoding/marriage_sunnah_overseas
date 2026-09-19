// lib/features/guardian/pages/link_guardian_page.dart
// @dart=2.17
// Pixel-perfect Flutter copy of link_guardian_page.jsx

import 'package:app/core/theme/app_colors.dart';
import 'package:app/core/widgets/islamic_page_header.dart';
import 'package:app/data/models/guardian_model.dart';
import 'package:app/features/intro/profile_progress_widget.dart';
import 'package:app/features/userguardian/link_guardian_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class LinkGuardianPage extends GetView<LinkGuardianController> {
  final bool isShowHeader;
  const LinkGuardianPage({super.key, this.isShowHeader = true});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(LinkGuardianController());
    return Scaffold(
      body: SafeArea(
          child: Container(
        color: Colors.white,
        child: Column(
          children: [
            // ── Header ──
            isShowHeader
                ? const IslamicPageHeader(
                    title: 'Guardian',
                    subtitle: 'Fulfilling your sacred duty with honor',
                  )
                : SizedBox.shrink(),
            // Profile process progress
            if (!isShowHeader) ProfileProgressWidget(),
            // ── Content ──
            Expanded(
              child: Obx(() {
                if (controller.loading.value) return const _LoadingState();

                return SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 600),
                    child: controller.guardian.value != null
                        ? _GuardianLinkedView(controller: controller)
                        : _PinFlowView(controller: controller),
                  ),
                );
              }),
            ),
          ],
        ),
      )),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Loading State
// ─────────────────────────────────────────────────────────
class _LoadingState extends StatefulWidget {
  const _LoadingState();

  @override
  State<_LoadingState> createState() => _LoadingStateState();
}

class _LoadingStateState extends State<_LoadingState>
    with SingleTickerProviderStateMixin {
  late AnimationController _spin;

  @override
  void initState() {
    super.initState();
    _spin = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat();
  }

  @override
  void dispose() {
    _spin.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 64,
            height: 64,
            child: AnimatedBuilder(
              animation: _spin,
              builder: (_, __) => CustomPaint(
                painter: _SpinnerPainter(_spin.value, primary),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Loading guardian...',
            style: TextStyle(
              color: primary,
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Please wait',
            style: TextStyle(color: Colors.grey, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _SpinnerPainter extends CustomPainter {
  final double value;
  final Color color;
  _SpinnerPainter(this.value, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final trackPaint = Paint()
      ..color = color.withOpacity(0.2)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;
    final arcPaint = Paint()
      ..color = color
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    final rect = Rect.fromLTWH(2, 2, size.width - 4, size.height - 4);
    canvas.drawArc(rect, 0, 2 * 3.14159, false, trackPaint);
    canvas.drawArc(rect, value * 2 * 3.14159, 3.14159 * 0.75, false, arcPaint);
  }

  @override
  bool shouldRepaint(_SpinnerPainter old) => old.value != value;
}

// ─────────────────────────────────────────────────────────
// Guardian Linked View
// ─────────────────────────────────────────────────────────
class _GuardianLinkedView extends StatelessWidget {
  final LinkGuardianController controller;
  const _GuardianLinkedView({required this.controller});

  @override
  Widget build(BuildContext context) {
    final g = controller.guardian.value!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _GuardianCard(
          guardian: g,
          onChat: controller.handleStartChat,
          onRemove: () => _showRemoveModal(context, controller),
        ),
        const SizedBox(height: 12),
        _InfoBanner(
          icon: Icons.shield_rounded,
          tone: _BannerTone.blue,
          title: 'Guardian Permissions',
          body:
              'Your guardian can view your profile and approve interest requests on your behalf.',
        ),
      ],
    );
  }

  void _showRemoveModal(
      BuildContext context, LinkGuardianController controller) {
    Get.dialog(
      Material(
        type: MaterialType.transparency,
        child: _RemoveModal(
          title: 'Remove Guardian?',
          message:
              '${controller.guardian.value?.name ?? 'Your guardian'} will no longer be able to view your profile or approve interests.',
          onCancel: () => Get.back(),
          onConfirm: controller.handleRemoveGuardian,
          loading: controller.removing,
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// PIN Flow View (no guardian)
// ─────────────────────────────────────────────────────────
class _PinFlowView extends StatelessWidget {
  final LinkGuardianController controller;
  const _PinFlowView({required this.controller});

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Hero icon
        Center(
          child: Padding(
            padding: const EdgeInsets.only(top: 4, bottom: 28),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        primary,
                        Color.lerp(primary, Colors.black, 0.15)!,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: primary.withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.key_rounded,
                      size: 40, color: Color(0xFFFEF3C7)),
                ),
                Positioned(
                  top: -4,
                  right: -4,
                  child: Container(
                    width: 28,
                    height: 28,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black12,
                            blurRadius: 6,
                            offset: Offset(0, 2))
                      ],
                    ),
                    child: Icon(Icons.auto_awesome_rounded,
                        size: 14, color: primary),
                  ),
                ),
              ],
            ),
          ),
        ),

        // PIN card
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 20,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.all(28),
          child: Obx(() => controller.pin.value != null
              ? _PinDisplay(controller: controller)
              : _GeneratePinPrompt(controller: controller)),
        ),

        const SizedBox(height: 16),

        // Instructions banner
        const _InstructionsBanner(),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────
// PIN Display (pin exists)
// ─────────────────────────────────────────────────────────
class _PinDisplay extends StatelessWidget {
  final LinkGuardianController controller;
  const _PinDisplay({required this.controller});

  @override
  Widget build(BuildContext context) {
    final primary = AppColors.primary;
    final secondary = AppColors.secondary;
    final pin = controller.pin.value!;

    return Column(
      children: [
        Text(
          'YOUR PIN CODE',
          style: TextStyle(
            color: primary,
            fontWeight: FontWeight.w800,
            fontSize: 12,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Share this with your guardian',
          style: TextStyle(color: Colors.grey, fontSize: 12),
        ),
        const SizedBox(height: 20),

        // Big PIN display
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          decoration: BoxDecoration(
            color: secondary.withOpacity(0.15),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(
            pin,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 42,
              fontWeight: FontWeight.w900,
              letterSpacing: 8,
              color: primary,
            ),
          ),
        ),
        const SizedBox(height: 20),

        Row(
          children: [
            // Copy button
            Expanded(
              child: Obx(() {
                final copied = controller.copied.value;
                return OutlinedButton.icon(
                  onPressed: controller.copyPin,
                  icon: Icon(
                    copied ? Icons.check_rounded : Icons.copy_rounded,
                    size: 16,
                    color: copied ? const Color(0xFF059669) : primary,
                  ),
                  label: Text(
                    copied ? 'Copied!' : 'Copy PIN',
                    style: TextStyle(
                        color: copied ? const Color(0xFF059669) : primary,
                        fontWeight: FontWeight.w600,
                        fontSize: 13),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: BorderSide(
                      color: copied ? const Color(0xFF10b981) : primary,
                      width: 2,
                    ),
                    backgroundColor:
                        copied ? const Color(0xFFD1FAE5) : Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                );
              }),
            ),
            const SizedBox(width: 10),
            // New PIN button
            Expanded(
              child: Obx(() => ElevatedButton.icon(
                    onPressed: controller.loading.value
                        ? null
                        : controller.generatePin,
                    icon: const Icon(Icons.refresh_rounded,
                        size: 16, color: Color(0xFFFEF3C7)),
                    label: const Text('New PIN',
                        style: TextStyle(
                            color: Color(0xFFFEF3C7),
                            fontWeight: FontWeight.w600,
                            fontSize: 13)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primary,
                      disabledBackgroundColor: primary.withOpacity(0.7),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                      shadowColor: primary.withOpacity(0.2),
                    ),
                  )),
            ),
          ],
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────
// Generate PIN Prompt (no pin yet)
// ─────────────────────────────────────────────────────────
class _GeneratePinPrompt extends StatelessWidget {
  final LinkGuardianController controller;
  const _GeneratePinPrompt({required this.controller});

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;
    return Column(
      children: [
        const Text(
          'Generate a 6-digit PIN to share\nwith your guardian',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey, fontSize: 13, height: 1.6),
        ),
        const SizedBox(height: 20),
        Obx(() => ElevatedButton(
              onPressed:
                  controller.loading.value ? null : controller.generatePin,
              style: ElevatedButton.styleFrom(
                backgroundColor: primary,
                disabledBackgroundColor: primary.withOpacity(0.7),
                padding:
                    const EdgeInsets.symmetric(vertical: 14, horizontal: 32),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                elevation: 4,
                shadowColor: primary.withOpacity(0.25),
              ),
              child: Text(
                controller.loading.value ? 'Generating...' : 'Generate PIN',
                style: const TextStyle(
                    color: Color(0xFFFEF3C7),
                    fontWeight: FontWeight.w600,
                    fontSize: 13),
              ),
            )),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────
// Guardian Card
// ─────────────────────────────────────────────────────────
class _GuardianCard extends StatelessWidget {
  final GuardianModel guardian;
  final VoidCallback onChat;
  final VoidCallback onRemove;

  const _GuardianCard({
    required this.guardian,
    required this.onChat,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;

    final subtitle = [
      if (guardian.relationship.isNotEmpty) 'Your ${guardian.relationship}',
      if (guardian.profession.isNotEmpty) guardian.profession,
    ].join(' • ');

    final location =
        [guardian.city, guardian.country].where((s) => s.isNotEmpty).join(', ');

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x141B4D3E)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar
                _Avatar(name: guardian.name, src: guardian.avatar, size: 72),
                const SizedBox(width: 16),

                // Info
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          guardian.name,
                          style: TextStyle(
                            color: primary,
                            fontWeight: FontWeight.w800,
                            fontSize: 17,
                            height: 1.2,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (subtitle.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(subtitle,
                              style: const TextStyle(
                                  color: Colors.grey, fontSize: 13)),
                        ],
                        if (location.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.location_on_rounded,
                                  size: 13, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text(location,
                                  style: const TextStyle(
                                      color: Colors.grey, fontSize: 12)),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

                // Guardian badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.shield_rounded, size: 10, color: primary),
                      const SizedBox(width: 4),
                      Text(
                        'Guardian',
                        style: TextStyle(
                          color: primary,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Divider
          Container(
              height: 1,
              color: const Color(0x141B4D3E),
              margin: const EdgeInsets.symmetric(horizontal: 20)),

          // Actions
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onChat,
                    icon: const Icon(Icons.chat_bubble_rounded,
                        size: 16, color: Color(0xFFFEF3C7)),
                    label: const Text('Message',
                        style: TextStyle(
                            color: Color(0xFFFEF3C7),
                            fontWeight: FontWeight.w600,
                            fontSize: 13)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Remove button
                InkWell(
                  onTap: onRemove,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: const Color(0xFFFECACA), width: 1.5),
                    ),
                    child: const Icon(Icons.delete_outline_rounded,
                        size: 18, color: Color(0xFFEF4444)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Info Banner
// ─────────────────────────────────────────────────────────
enum _BannerTone { primary, gold, success, warning, danger, blue }

class _InfoBanner extends StatelessWidget {
  final IconData icon;
  final _BannerTone tone;
  final String title;
  final String body;

  const _InfoBanner({
    required this.icon,
    required this.tone,
    required this.title,
    required this.body,
  });

  @override
  Widget build(BuildContext context) {
    final cfg = _bannerConfig(tone);
    return Container(
      decoration: BoxDecoration(
        color: cfg.bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cfg.border, width: 1.5),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              borderRadius: BorderRadius.circular(8),
              boxShadow: const [
                BoxShadow(
                    color: Colors.black12, blurRadius: 4, offset: Offset(0, 1))
              ],
            ),
            child: Icon(icon, size: 16, color: cfg.iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(
                        color: cfg.titleColor,
                        fontWeight: FontWeight.w700,
                        fontSize: 13)),
                const SizedBox(height: 4),
                Text(body,
                    style: TextStyle(
                        color: cfg.bodyColor, fontSize: 13, height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  _BannerColors _bannerConfig(_BannerTone t) {
    switch (t) {
      case _BannerTone.blue:
        return _BannerColors(
          bg: const Color(0xFFEFF6FF),
          border: const Color(0xFFBFDBFE),
          iconColor: const Color(0xFF1D4ED8),
          titleColor: const Color(0xFF1E3A8A),
          bodyColor: const Color(0xFF1D4ED8),
        );
      case _BannerTone.gold:
        return _BannerColors(
          bg: const Color(0xFFFFFBEB),
          border: const Color(0xFFFDE68A),
          iconColor: const Color(0xFFD4AF37),
          titleColor: const Color(0xFFB8941F),
          bodyColor: const Color(0xFF9C7D1A),
        );
      case _BannerTone.success:
        return _BannerColors(
          bg: const Color(0xFFF0FDF4),
          border: const Color(0xFFBBF7D0),
          iconColor: const Color(0xFF2D8C6E),
          titleColor: const Color(0xFF1B4D3E),
          bodyColor: const Color(0xFF2D8C6E),
        );
      case _BannerTone.warning:
        return _BannerColors(
          bg: const Color(0xFFFFFBEB),
          border: const Color(0xFFFDE68A),
          iconColor: const Color(0xFFD97706),
          titleColor: const Color(0xFF92400E),
          bodyColor: const Color(0xFF78350F),
        );
      case _BannerTone.danger:
        return _BannerColors(
          bg: const Color(0xFFFEF2F2),
          border: const Color(0xFFFECACA),
          iconColor: const Color(0xFFEF4444),
          titleColor: const Color(0xFF991B1B),
          bodyColor: const Color(0xFF7F1D1D),
        );
      default:
        return _BannerColors(
          bg: const Color(0x0D1B4D3E),
          border: const Color(0x261B4D3E),
          iconColor: const Color(0xFF1B4D3E),
          titleColor: const Color(0xFF1B4D3E),
          bodyColor: const Color(0xFF2D8C6E),
        );
    }
  }
}

class _BannerColors {
  final Color bg, border, iconColor, titleColor, bodyColor;
  const _BannerColors(
      {required this.bg,
      required this.border,
      required this.iconColor,
      required this.titleColor,
      required this.bodyColor});
}

// ─────────────────────────────────────────────────────────
// Instructions Banner
// ─────────────────────────────────────────────────────────
class _InstructionsBanner extends StatelessWidget {
  const _InstructionsBanner();

  static const _steps = [
    'Your guardian creates an account or logs in',
    'They go to "Add Ward" in their dashboard',
    'They enter this 6-digit PIN',
    'They select their relationship to you',
    'They confirm the linking request',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDE68A), width: 1.5),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.info_outline_rounded,
                size: 16, color: Color(0xFFD97706)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'How to Link Your Guardian',
                  style: TextStyle(
                    color: Color(0xFF92400E),
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 8),
                ..._steps.asMap().entries.map((e) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 16,
                            height: 16,
                            margin: const EdgeInsets.only(top: 1),
                            decoration: const BoxDecoration(
                              color: Color(0xFFD97706),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                '${e.key + 1}',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              e.value,
                              style: const TextStyle(
                                  color: Color(0xFF78350F),
                                  fontSize: 12.5,
                                  height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    )),
                const SizedBox(height: 4),
                Row(
                  children: const [
                    Icon(Icons.warning_amber_rounded,
                        size: 12, color: Color(0xFF92400E)),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'The PIN expires after successful linking',
                        style: TextStyle(
                          color: Color(0xFF92400E),
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────
class _Avatar extends StatelessWidget {
  final String name;
  final String src;
  final double size;

  const _Avatar({required this.name, required this.src, required this.size});

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;
    final initial = name.isNotEmpty ? name[0].toUpperCase() : '?';

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.grey[200],
        border: Border.all(color: primary, width: 3),
      ),
      clipBehavior: Clip.antiAlias,
      child: src.isNotEmpty
          ? Image.network(
              src,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _Initials(initial, size, primary),
            )
          : _Initials(initial, size, primary),
    );
  }
}

class _Initials extends StatelessWidget {
  final String initial;
  final double size;
  final Color color;
  const _Initials(this.initial, this.size, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey[200],
      child: Center(
        child: Text(
          initial,
          style: TextStyle(
              fontSize: size * 0.38, fontWeight: FontWeight.bold, color: color),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Remove Confirmation Modal
// ─────────────────────────────────────────────────────────
class _RemoveModal extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback onCancel;
  final VoidCallback onConfirm;
  final RxBool loading;

  const _RemoveModal({
    required this.title,
    required this.message,
    required this.onCancel,
    required this.onConfirm,
    required this.loading,
  });

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;
    return GestureDetector(
      onTap: onCancel,
      child: Container(
        color: Colors.black54,
        child: Center(
          child: GestureDetector(
            onTap: () {},
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              constraints: const BoxConstraints(maxWidth: 380),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 60,
                    offset: const Offset(0, 20),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: const BoxDecoration(
                      color: Color(0xFFFEE2E2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.warning_amber_rounded,
                        color: Color(0xFFEF4444), size: 28),
                  ),
                  const SizedBox(height: 16),
                  Text(title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          color: primary,
                          fontWeight: FontWeight.w800,
                          fontSize: 18)),
                  const SizedBox(height: 10),
                  Text(message,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          color: Colors.grey, fontSize: 13, height: 1.5)),
                  const SizedBox(height: 24),
                  Obx(() => Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: loading.value ? null : onCancel,
                              style: OutlinedButton.styleFrom(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                side: const BorderSide(
                                    color: Color(0xFFE5E7EB), width: 2),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Cancel',
                                  style: TextStyle(
                                      color: Color(0xFF6B7280),
                                      fontWeight: FontWeight.w600)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: loading.value ? null : onConfirm,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFEF4444),
                                disabledBackgroundColor:
                                    const Color(0xFFEF4444).withOpacity(0.7),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                elevation: 0,
                              ),
                              child: Text(
                                loading.value ? 'Removing...' : 'Remove',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600),
                              ),
                            ),
                          ),
                        ],
                      )),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
