import 'dart:io';
import 'dart:math' as math;
import 'package:app/bottom_tabs.dart';
import 'package:app/features/intro/profile_progress_widget.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../controllers/verification_controller.dart';
import '../services/verification_service.dart';

// ─── Colors ───────────────────────────────────────────────────────────────────
const _kPrimary = Color(0xFF1B4D3E);
const _kPrimaryFg = Color(0xFFF5F0E8);
const _kSecondary = Color(0xFFF0F5F3);
const _kAccent = Color(0xFFF5F0E8);

class VerificationCNICPage extends StatelessWidget {
  final bool hideBackButton;
  const VerificationCNICPage({Key? key, this.hideBackButton = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<VerificationService>()) {
      Get.put(VerificationService(), permanent: true);
    }
    final ctrl = Get.put(VerificationController());

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            ProfileProgressWidget(),
            Expanded(
              child: Obx(() {
                switch (ctrl.status.value) {
                  case VerificationStatus.loading:
                    return _LoadingView();
                  case VerificationStatus.verified:
                    return _VerifiedPage(
                        ctrl: ctrl, hideBackButton: hideBackButton);
                  case VerificationStatus.pending:
                    return _PendingPage(
                        ctrl: ctrl, hideBackButton: hideBackButton);
                  case VerificationStatus.submit:
                  default:
                    return _SubmitPage(
                        ctrl: ctrl, hideBackButton: hideBackButton);
                }
              }),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 1 — Submit
// ═══════════════════════════════════════════════════════════════════
class _SubmitPage extends StatelessWidget {
  final VerificationController ctrl;
  final bool hideBackButton;
  const _SubmitPage({required this.ctrl, required this.hideBackButton});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 40),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Back button

        if (!hideBackButton) _BackButton(onTap: ctrl.goBack),
        if (!hideBackButton) SizedBox(height: 16),

        // Identity badge
        if (!hideBackButton) _GreenPill(label: 'Identity Verification'),
        if (!hideBackButton) SizedBox(height: 16),

        Text('Get verified',
            style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w600,
                color: _kPrimary,
                height: 1.25)),
        SizedBox(height: 8),
        Text(
            'Upload a clear photo of your government-issued ID. '
            'Your information is encrypted and kept private.',
            style: TextStyle(
                fontSize: 14, color: Color(0xFF6B7280), height: 1.65)),
        SizedBox(height: 28),

        // Upload cards
        Obx(() => Row(children: [
              Expanded(
                  child: _UploadCard(
                side: 'front',
                icon: Icon(Icons.credit_card, color: _kPrimary, size: 20),
                sub: 'National ID, passport\nor driving licence',
                filePath: ctrl.frontPreview.value,
                onPick: () => _pickImage(ctrl, 'front'),
              )),
              SizedBox(width: 14),
              Expanded(
                  child: _UploadCard(
                side: 'back',
                icon: Icon(Icons.credit_card_outlined,
                    color: _kPrimary, size: 20),
                sub: 'Clear photo,\nall corners visible',
                filePath: ctrl.backPreview.value,
                onPick: () => _pickImage(ctrl, 'back'),
              )),
            ])),
        SizedBox(height: 20),

        // Tips banner
        Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
                color: _kAccent, borderRadius: BorderRadius.circular(12)),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Icon(Icons.info_outline, color: _kPrimary, size: 18),
              SizedBox(width: 10),
              Expanded(
                  child: Text(
                      'Tips for a clear photo: Ensure all four corners are visible, '
                      'no glare or blur, and the text is fully readable.',
                      style: TextStyle(
                          fontSize: 13, color: _kPrimary, height: 1.55))),
            ])),
        SizedBox(height: 20),

        // Error
        Obx(() {
          if (ctrl.errorMsg.value == null) return SizedBox.shrink();
          return Container(
              margin: EdgeInsets.only(bottom: 12),
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: Color(0xFFFEE2E2),
                  border: Border.all(color: Color(0xFFFCA5A5)),
                  borderRadius: BorderRadius.circular(10)),
              child: Text(ctrl.errorMsg.value!,
                  style: TextStyle(fontSize: 13, color: Color(0xFFDC2626))));
        }),

        // Submit button
        Obx(() => GestureDetector(
              onTap: ctrl.canSubmit ? ctrl.submit : null,
              child: AnimatedContainer(
                duration: Duration(milliseconds: 200),
                width: double.infinity,
                padding: EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                    color: ctrl.canSubmit ? _kPrimary : Color(0xFF9CA3AF),
                    borderRadius: BorderRadius.circular(10)),
                child: Center(
                    child: ctrl.isSubmitting.value
                        ? Row(mainAxisSize: MainAxisSize.min, children: [
                            SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                    color: _kPrimaryFg, strokeWidth: 2)),
                            SizedBox(width: 8),
                            Text('Uploading…',
                                style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w500,
                                    color: _kPrimaryFg)),
                          ])
                        : Text('Submit for verification',
                            style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w500,
                                color: _kPrimaryFg))),
              ),
            )),
      ]),
    );
  }

  Future<void> _pickImage(VerificationController ctrl, String side) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
        source: ImageSource.gallery, imageQuality: 85, maxWidth: 1920);
    if (picked == null) return;
    if (side == 'front') {
      ctrl.setFrontFile(picked.path);
    } else {
      ctrl.setBackFile(picked.path);
    }
  }
}

// ─── Upload card ──────────────────────────────────────────────────────────────
class _UploadCard extends StatelessWidget {
  final String side;
  final Widget icon;
  final String sub;
  final String? filePath;
  final VoidCallback onPick;

  const _UploadCard({
    required this.side,
    required this.icon,
    required this.sub,
    this.filePath,
    required this.onPick,
  });

  bool get _isUploaded => filePath != null && filePath!.isNotEmpty;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPick,
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        constraints: BoxConstraints(minHeight: 164),
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _isUploaded ? _kSecondary : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: _isUploaded ? _kPrimary : Color(0xFFB6CFC9),
            style: BorderStyle.solid,
            width: 1.5,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_isUploaded && filePath!.startsWith('/')) ...[
              // Local file preview
              Stack(children: [
                ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.file(File(filePath!),
                        width: double.infinity, height: 90, fit: BoxFit.cover)),
                Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                            color: _kPrimary, shape: BoxShape.circle),
                        child:
                            Icon(Icons.check, size: 12, color: Colors.white))),
              ]),
              SizedBox(height: 8),
              Text(side == 'front' ? 'Front side' : 'Back side',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: _kPrimary)),
              GestureDetector(
                  onTap: onPick,
                  child: Text('Change',
                      style: TextStyle(
                          fontSize: 11,
                          color: _kPrimary,
                          decoration: TextDecoration.underline))),
            ] else ...[
              Container(
                width: 42,
                height: 42,
                decoration:
                    BoxDecoration(color: _kSecondary, shape: BoxShape.circle),
                child: Center(child: icon),
              ),
              SizedBox(height: 10),
              Text(side == 'front' ? 'Front side' : 'Back side',
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: _kPrimary),
                  textAlign: TextAlign.center),
              SizedBox(height: 4),
              Text(sub,
                  style: TextStyle(
                      fontSize: 11, color: Color(0xFF9CA3AF), height: 1.5),
                  textAlign: TextAlign.center),
            ],
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 2 — Pending
// ═══════════════════════════════════════════════════════════════════
class _PendingPage extends StatelessWidget {
  final VerificationController ctrl;
  final bool hideBackButton;
  const _PendingPage({required this.ctrl, required this.hideBackButton});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 40),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (!hideBackButton) _BackButton(onTap: ctrl.goBack),
        if (!hideBackButton) SizedBox(height: 16),

        // Under review pill
        if (!hideBackButton)
          Container(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                  color: Color(0xFFFEF9EC),
                  border:
                      Border.all(color: Color(0xFFF5D97A).withOpacity(0.25)),
                  borderRadius: BorderRadius.circular(20)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                _PulsingDot(color: Color(0xFFF0B429)),
                SizedBox(width: 6),
                Text('Under Review',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF92650A))),
              ])),
        SizedBox(height: 16),

        Text('Verification pending',
            style: TextStyle(
                fontSize: 26, fontWeight: FontWeight.w600, color: _kPrimary)),
        SizedBox(height: 8),
        Text(
            'Your documents have been submitted. Our team typically '
            'reviews submissions within 24–48 hours.',
            style: TextStyle(
                fontSize: 14, color: Color(0xFF6B7280), height: 1.65)),
        SizedBox(height: 24),

        // Steps
        Container(
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: _kPrimary.withOpacity(0.10)),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: _kPrimary.withOpacity(0.05), blurRadius: 12)
                ]),
            child: Column(children: [
              _StepRow(
                  label: 'Documents submitted',
                  done: true,
                  active: false,
                  isLast: false),
              _StepRow(
                  label: 'Under review',
                  done: false,
                  active: true,
                  isLast: false,
                  sub: 'Usually takes 24–48 hours'),
              _StepRow(
                  label: 'Verification complete',
                  done: false,
                  active: false,
                  isLast: true),
            ])),
        SizedBox(height: 24),

        // Submitted docs
        Text('SUBMITTED DOCUMENTS',
            style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: Color(0xFF9CA3AF),
                letterSpacing: 0.06 * 11)),
        SizedBox(height: 10),
        Obx(() => Row(children: [
              Expanded(
                  child: _DocCard(
                      label: 'Front side', url: ctrl.frontIdUrl.value)),
              SizedBox(width: 14),
              Expanded(
                  child:
                      _DocCard(label: 'Back side', url: ctrl.backIdUrl.value)),
            ])),
        SizedBox(height: 20),

        // Info banner
        Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
                color: Color(0xFFFEF9EC),
                border: Border.all(color: Color(0xFFF5D97A).withOpacity(0.25)),
                borderRadius: BorderRadius.circular(12)),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Icon(Icons.info_outline, color: Color(0xFF92650A), size: 18),
              SizedBox(width: 10),
              Expanded(
                  child: Text(
                      'You will be notified once your identity has been reviewed. '
                      'You can continue using the app in the meantime.',
                      style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF92650A),
                          height: 1.55))),
            ])),
      ]),
    );
  }
}

class _StepRow extends StatelessWidget {
  final String label;
  final bool done, active, isLast;
  final String? sub;
  const _StepRow(
      {required this.label,
      required this.done,
      required this.active,
      required this.isLast,
      this.sub});

  @override
  Widget build(BuildContext context) {
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Column(children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: done
                  ? _kPrimary
                  : active
                      ? Color(0xFFFEF9EC)
                      : _kSecondary,
              border: active
                  ? Border.all(color: Color(0xFFF0B429), width: 2)
                  : null),
          child: Center(
              child: done
                  ? Icon(Icons.check, size: 13, color: Colors.white)
                  : active
                      ? _PulsingDot(color: Color(0xFFF0B429))
                      : Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                              color: Color(0xFFD1D5DB),
                              shape: BoxShape.circle))),
        ),
        if (!isLast)
          Container(
              width: 2,
              height: 32,
              color: done ? _kPrimary : Color(0xFFE5E7EB),
              margin: EdgeInsets.symmetric(vertical: 4)),
      ]),
      SizedBox(width: 14),
      Expanded(
        child: Padding(
            padding: EdgeInsets.only(top: 4, bottom: isLast ? 0 : 32),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label,
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: done
                          ? _kPrimary
                          : active
                              ? Color(0xFF92650A)
                              : Color(0xFF9CA3AF))),
              if (sub != null)
                Text(sub!,
                    style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
            ])),
      ),
    ]);
  }
}

class _DocCard extends StatelessWidget {
  final String label;
  final String? url;
  const _DocCard({required this.label, this.url});

  @override
  Widget build(BuildContext context) {
    return Container(
        decoration: BoxDecoration(
            color: _kSecondary,
            border: Border.all(color: _kPrimary.withOpacity(0.10)),
            borderRadius: BorderRadius.circular(12)),
        child: Column(children: [
          ClipRRect(
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              child: url != null && url!.isNotEmpty
                  ? (url!.startsWith('/')
                      ? Image.file(File(url!),
                          width: double.infinity, height: 90, fit: BoxFit.cover)
                      : Image.network(url!,
                          width: double.infinity,
                          height: 90,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _DocPlaceholder()))
                  : _DocPlaceholder()),
          Padding(
              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(label,
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: _kPrimary)),
                    Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                            color: Color(0xFFFEF9EC),
                            borderRadius: BorderRadius.circular(10)),
                        child: Text('Pending',
                            style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFFF0B429)))),
                  ])),
        ]));
  }
}

class _DocPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
      width: double.infinity,
      height: 90,
      color: Color(0xFFE5E7EB),
      child: Center(
          child: Icon(Icons.credit_card, color: Color(0xFF9CA3AF), size: 24)));
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 3 — Verified
// ═══════════════════════════════════════════════════════════════════
class _VerifiedPage extends StatefulWidget {
  final VerificationController ctrl;
  final bool hideBackButton;
  const _VerifiedPage({required this.ctrl, required this.hideBackButton});

  @override
  State<_VerifiedPage> createState() => _VerifiedPageState();
}

class _VerifiedPageState extends State<_VerifiedPage>
    with TickerProviderStateMixin {
  late AnimationController _badgeAnim;
  late AnimationController _shimmerAnim;
  late AnimationController _ringAnim;
  late Animation<double> _badgeScale;
  late Animation<double> _shimmer;
  late Animation<double> _ring;
  bool _visible = false;

  @override
  void initState() {
    super.initState();
    _badgeAnim =
        AnimationController(vsync: this, duration: Duration(milliseconds: 700));
    _shimmerAnim =
        AnimationController(vsync: this, duration: Duration(milliseconds: 2500))
          ..repeat();
    _ringAnim =
        AnimationController(vsync: this, duration: Duration(milliseconds: 2000))
          ..repeat();

    _badgeScale = Tween<double>(begin: 0.4, end: 1.0)
        .animate(CurvedAnimation(parent: _badgeAnim, curve: Curves.elasticOut));
    _shimmer = _shimmerAnim;
    _ring = _ringAnim;

    Future.delayed(Duration(milliseconds: 80), () {
      if (mounted) {
        setState(() => _visible = true);
        _badgeAnim.forward();
      }
    });
  }

  @override
  void dispose() {
    _badgeAnim.dispose();
    _shimmerAnim.dispose();
    _ringAnim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ctrl = widget.ctrl;
    final perks = [
      'Verified badge on profile',
      'Higher match visibility',
      'Trusted by families',
      'Priority in searches',
    ];

    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 40),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (widget.hideBackButton) _BackButton(onTap: ctrl.goBack),
        if (widget.hideBackButton) SizedBox(height: 16),

        // Main badge card
        Obx(() => Container(
              width: double.infinity,
              padding: EdgeInsets.all(28),
              decoration: BoxDecoration(
                  color: _kAccent,
                  border: Border.all(
                      color: _kPrimary.withOpacity(0.13), width: 1.5),
                  borderRadius: BorderRadius.circular(20)),
              child: Stack(children: [
                // Sparkles
                ..._sparkles().map((s) => _SparkleWidget(
                    x: s['x']!,
                    y: s['y']!,
                    delay: s['delay']!,
                    size: s['size']!)),

                // Pulsing rings
                if (_visible)
                  Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: Center(
                          child: AnimatedBuilder(
                        animation: _ring,
                        builder: (_, __) => SizedBox(
                            width: 80,
                            height: 80,
                            child: CustomPaint(
                                painter: _RingPainter(progress: _ring.value))),
                      ))),

                // Badge + text
                Column(children: [
                  ScaleTransition(
                      scale: _badgeScale,
                      child: _BadgeIcon(size: 72, animated: _visible)),
                  SizedBox(height: 12),

                  // Shimmer title
                  AnimatedBuilder(
                    animation: _shimmer,
                    builder: (_, child) => ShaderMask(
                        blendMode: BlendMode.srcIn,
                        shaderCallback: (bounds) => LinearGradient(
                              colors: [
                                _kPrimary,
                                Color(0xFF2d7a5e),
                                Color(0xFF78C4A0),
                                _kPrimary
                              ],
                              stops: [0, 0.4, 0.6, 1],
                              tileMode: TileMode.mirror,
                              transform: GradientRotation(
                                  _shimmer.value * 2 * math.pi),
                            ).createShader(bounds),
                        child: child),
                    child: Text('Identity Verified',
                        style: TextStyle(
                            fontSize: 28, fontWeight: FontWeight.w600),
                        textAlign: TextAlign.center),
                  ),
                  SizedBox(height: 8),

                  Text('Your account is verified, ${ctrl.userName.value}',
                      style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                          color: _kPrimary),
                      textAlign: TextAlign.center),
                  SizedBox(height: 6),
                  Text(
                      'Your identity has been confirmed. Your profile now displays '
                      'the verified badge, building trust with potential matches.',
                      style: TextStyle(
                          fontSize: 13, color: Color(0xFF5A7A6E), height: 1.65),
                      textAlign: TextAlign.center),
                ]),
              ]),
            )),
        SizedBox(height: 16),

        // Profile preview card
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: _kPrimary.withOpacity(0.10)),
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(color: _kPrimary.withOpacity(0.06), blurRadius: 12)
              ]),
          child: Obx(() => Row(children: [
                // Avatar
                Stack(children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient:
                            LinearGradient(colors: [_kSecondary, _kAccent]),
                        border: Border.all(
                            color: _kPrimary.withOpacity(0.13), width: 2)),
                    child: ClipOval(
                        child: ctrl.userImage.value != null &&
                                ctrl.userImage.value!.isNotEmpty
                            ? Image.network(ctrl.userImage.value!,
                                fit: BoxFit.cover)
                            : Center(
                                child: Text(
                                    ctrl.userName.value.isNotEmpty
                                        ? ctrl.userName.value[0]
                                        : 'U',
                                    style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w600,
                                        color: _kPrimary)))),
                  ),
                  Positioned(
                      bottom: -2,
                      right: -2,
                      child: Container(
                          padding: EdgeInsets.all(1),
                          decoration: BoxDecoration(
                              color: Colors.white, shape: BoxShape.circle),
                          child: _BadgeIcon(size: 16))),
                ]),
                SizedBox(width: 14),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      // Verified pill
                      Container(
                          padding:
                              EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                              color: _kSecondary,
                              border: Border.all(
                                  color: _kPrimary.withOpacity(0.16)),
                              borderRadius: BorderRadius.circular(20)),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            _BadgeIcon(size: 14),
                            SizedBox(width: 5),
                            Text('Verified',
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: _kPrimary)),
                          ])),
                      SizedBox(height: 4),
                      Text('This is how others see your profile',
                          style: TextStyle(
                              fontSize: 12, color: Color(0xFF9CA3AF))),
                    ])),
              ])),
        ),
        SizedBox(height: 20),

        // Perks grid
        Text('WHAT YOU UNLOCKED',
            style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: Color(0xFF9CA3AF),
                letterSpacing: 0.06 * 11)),
        SizedBox(height: 10),
        GridView.count(
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.8,
            children: perks
                .map((p) => Container(
                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: _kPrimary.withOpacity(0.10)),
                        borderRadius: BorderRadius.circular(12)),
                    child: Row(children: [
                      Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                              color: _kSecondary, shape: BoxShape.circle),
                          child: Icon(Icons.check, size: 13, color: _kPrimary)),
                      SizedBox(width: 10),
                      Expanded(
                          child: Text(p,
                              style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: _kPrimary,
                                  height: 1.4))),
                    ])))
                .toList()),
        SizedBox(height: 20),

        // Back to profile button
        GestureDetector(
            onTap: () {
              Get.offAll(() => BottomTabBar());
            },
            child: Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                    color: _kPrimary, borderRadius: BorderRadius.circular(10)),
                child: Center(
                    child: Text('View my profile',
                        style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            color: _kPrimaryFg))))),
      ]),
    );
  }

  List<Map<String, double>> _sparkles() => [
        {'x': 0.08, 'y': 0.12, 'delay': 0.1, 'size': 7},
        {'x': 0.82, 'y': 0.08, 'delay': 0.4, 'size': 5},
        {'x': 0.90, 'y': 0.52, 'delay': 0.2, 'size': 8},
        {'x': 0.04, 'y': 0.58, 'delay': 0.6, 'size': 5},
        {'x': 0.72, 'y': 0.78, 'delay': 0.5, 'size': 5},
      ];
}

// ─── Badge icon ───────────────────────────────────────────────────────────────
class _BadgeIcon extends StatelessWidget {
  final double size;
  final bool animated;
  const _BadgeIcon({this.size = 28, this.animated = false});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: size,
        height: size,
        child: CustomPaint(painter: _BadgePainter()));
  }
}

class _BadgePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width / 2;

    // Outer star shape (12 points)
    final outerPath = Path();
    for (int i = 0; i < 24; i++) {
      final angle = (i * math.pi / 12) - math.pi / 2;
      final radius = i.isEven ? r : r * 0.82;
      final x = cx + radius * math.cos(angle);
      final y = cy + radius * math.sin(angle);
      i == 0 ? outerPath.moveTo(x, y) : outerPath.lineTo(x, y);
    }
    outerPath.close();

    canvas.drawPath(outerPath, Paint()..color = _kPrimary);
    canvas.drawPath(outerPath, Paint()..color = Color(0xFF2d7a5e));

    // Check mark
    final checkPaint = Paint()
      ..color = _kPrimaryFg
      ..strokeWidth = size.width * 0.08
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(
        Path()
          ..moveTo(cx - r * 0.28, cy + r * 0.05)
          ..lineTo(cx - r * 0.05, cy + r * 0.28)
          ..lineTo(cx + r * 0.32, cy - r * 0.24),
        checkPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

// ─── Ring painter (for verified pulse effect) ─────────────────────────────────
class _RingPainter extends CustomPainter {
  final double progress;
  const _RingPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final scale = 1.0 + progress;
    final opacity = (1.0 - progress) * 0.5;
    canvas.drawCircle(
      Offset(cx, cy),
      40 * scale,
      Paint()
        ..color = _kPrimary.withOpacity(opacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) => old.progress != progress;
}

// ─── Sparkle widget ───────────────────────────────────────────────────────────
class _SparkleWidget extends StatefulWidget {
  final double x, y, delay, size;
  const _SparkleWidget(
      {required this.x,
      required this.y,
      required this.delay,
      required this.size});

  @override
  State<_SparkleWidget> createState() => _SparkleWidgetState();
}

class _SparkleWidgetState extends State<_SparkleWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ac = AnimationController(
        vsync: this, duration: Duration(milliseconds: 1600));
    _anim = Tween<double>(begin: 0, end: 1)
        .animate(CurvedAnimation(parent: _ac, curve: Curves.easeInOut));
    Future.delayed(Duration(milliseconds: (widget.delay * 1000).toInt()), () {
      if (mounted) _ac.repeat(reverse: true);
    });
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.x * 300,
      top: widget.y * 200,
      child: AnimatedBuilder(
        animation: _anim,
        builder: (_, __) => Opacity(
            opacity: _anim.value,
            child: Transform.rotate(
              angle: _anim.value * math.pi,
              child: SizedBox(
                  width: widget.size,
                  height: widget.size,
                  child: CustomPaint(painter: _StarPainter())),
            )),
      ),
    );
  }
}

class _StarPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final path = Path();
    for (int i = 0; i < 8; i++) {
      final angle = (i * math.pi / 4) - math.pi / 2;
      final radius = i.isEven ? size.width / 2 : size.width / 4;
      final x = cx + radius * math.cos(angle);
      final y = cy + radius * math.sin(angle);
      i == 0 ? path.moveTo(x, y) : path.lineTo(x, y);
    }
    path.close();
    canvas.drawPath(path, Paint()..color = _kPrimary.withOpacity(0.65));
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

// ─── Shared sub-widgets ───────────────────────────────────────────────────────
class _BackButton extends StatelessWidget {
  final VoidCallback onTap;
  const _BackButton({required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
      onTap: onTap,
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.arrow_back, size: 16, color: _kPrimary),
        SizedBox(width: 8),
        Text('Back',
            style: TextStyle(
                fontSize: 14, fontWeight: FontWeight.w500, color: _kPrimary)),
      ]));
}

class _GreenPill extends StatelessWidget {
  final String label;
  const _GreenPill({required this.label});

  @override
  Widget build(BuildContext context) => Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
          color: _kSecondary, borderRadius: BorderRadius.circular(20)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(
            width: 6,
            height: 6,
            decoration:
                BoxDecoration(color: _kPrimary, shape: BoxShape.circle)),
        SizedBox(width: 6),
        Text(label,
            style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w500, color: _kPrimary)),
      ]));
}

class _PulsingDot extends StatefulWidget {
  final Color color;
  const _PulsingDot({required this.color});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 1500))
          ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
        animation: _ac,
        builder: (_, __) => Opacity(
            opacity: 0.5 + _ac.value * 0.5,
            child: Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                    color: widget.color, shape: BoxShape.circle))));
  }
}

class _LoadingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        CircularProgressIndicator(color: _kPrimary, strokeWidth: 2.5),
        SizedBox(height: 16),
        Text('Loading your profile…',
            style: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF))),
      ]));
}
