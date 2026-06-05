import 'package:app/core/widgets/islamic_page_header.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/interest_controller.dart';
import '../services/interest_service.dart';
import '../widgets/interest_item.dart';
import '../widgets/premium_banner.dart';
import '../../profile/pages/profile_detail_page.dart';
import '../../chat/pages/chat_page.dart';

class InterestPage extends StatelessWidget {
  const InterestPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Get.put(InterestService(), permanent: true);
    Get.put(InterestController());
    return _InterestView();
  }
}

class _InterestView extends GetView<InterestController> {
  List<String> _parseImages(dynamic v) {
    if (v == null) return [];
    if (v is List)
      return v.map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
    try {
      return v
          .toString()
          .replaceAll('[', '')
          .replaceAll(']', '')
          .replaceAll('"', '')
          .split(',')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();
    } catch (_) {
      return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Header
          IslamicPageHeader(
            title: 'Interests',
            subtitle: 'Souls seeking halal connection with you',
            icon: Icon(Icons.favorite_outline, color: Colors.white, size: 18),
          ),

          // Tab switcher (sticky)
          Obx(() => _TwoTabSwitcher(
                activeTab: controller.activeTab.value,
                onSelect: controller.selectTab,
                sentCount: controller.sentCount,
                receivedCount: controller.receivedCount,
                isPro: controller.isPro.value,
              )),

          // Content
          Expanded(
            child: Stack(
              children: [
                Obx(() => SingleChildScrollView(
                      child: Column(
                        children: [
                          // Premium banner (non-pro users)
                          if (controller.isPro.value == false)
                            PremiumBanner(onUpgrade: () {
                              Get.snackbar(
                                  'Premium', 'Upgrade feature coming soon',
                                  snackPosition: SnackPosition.BOTTOM);
                            }),

                          Padding(
                            padding: EdgeInsets.fromLTRB(12, 12, 12, 12),
                            child: controller.isLoading.value
                                ? _SkeletonGrid()
                                : controller.interests.isEmpty
                                    ? _EmptyState(
                                        tab: controller.activeTab.value,
                                        onExplore: () => Get.back())
                                    : _InterestGrid(
                                        interests: controller.interests,
                                        activeTab: controller.activeTab.value,
                                        isPro: controller.isPro.value,
                                        parseImages: _parseImages,
                                        onAccept: controller.openAcceptDialog,
                                        onDecline: controller.openDeclineDialog,
                                      ),
                          ),
                        ],
                      ),
                    )),

                // Confirm dialog overlay
                Obx(() => controller.dialog.value != null
                    ? _ConfirmDialog(
                        dialog: controller.dialog.value!,
                        onConfirm: controller.confirmDialog,
                        onCancel: () => controller.dialog.value = null,
                      )
                    : SizedBox.shrink()),

                // Cancel confirm overlay
                Obx(() => controller.cancelConfirm.value != null
                    ? _CancelConfirmModal(
                        data: controller.cancelConfirm.value!,
                        onClose: () => controller.cancelConfirm.value = null,
                        onConfirm: controller.confirmCancel,
                      )
                    : SizedBox.shrink()),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Two Tab Switcher ─────────────────────────────────────────────────────────
class _TwoTabSwitcher extends StatelessWidget {
  final String activeTab;
  final ValueChanged<String> onSelect;
  final int sentCount, receivedCount;
  final bool isPro;

  const _TwoTabSwitcher({
    required this.activeTab,
    required this.onSelect,
    required this.sentCount,
    required this.receivedCount,
    required this.isPro,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 8, 16, 12),
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
              color: Color(0xFF1B4D3E).withOpacity(0.06),
              blurRadius: 1,
              offset: Offset(0, 1))
        ],
      ),
      child: Container(
        padding: EdgeInsets.all(4),
        decoration: BoxDecoration(
            color: Color(0xFFEBEBEB), borderRadius: BorderRadius.circular(16)),
        child: Row(
          children: [
            // Sent
            Expanded(
                child: _TabBtn(
              label: 'Sent',
              count: sentCount,
              isActive: activeTab == 'Sent',
              onTap: () => onSelect('Sent'),
              isPro: true,
            )),
            // Received
            Expanded(
                child: _TabBtn(
              label: 'Received',
              count: receivedCount,
              isActive: activeTab == 'Received',
              onTap: () => onSelect('Received'),
              isPro: isPro,
              showProBadge: !isPro,
            )),
          ],
        ),
      ),
    );
  }
}

class _TabBtn extends StatelessWidget {
  final String label;
  final int count;
  final bool isActive, isPro, showProBadge;
  final VoidCallback onTap;

  const _TabBtn({
    required this.label,
    required this.count,
    required this.isActive,
    required this.onTap,
    this.isPro = true,
    this.showProBadge = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          boxShadow: isActive
              ? [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.10),
                      blurRadius: 6,
                      offset: Offset(0, 1))
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: isActive ? Color(0xFF1B4D3E) : Colors.grey[400],
                )),
            if (count > 0) ...[
              SizedBox(width: 6),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isActive ? Color(0xFF1B4D3E) : Colors.grey[300],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text('$count',
                    style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: isActive ? Colors.white : Colors.grey[600])),
              ),
            ],
            if (showProBadge) ...[
              SizedBox(width: 6),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                      colors: [Color(0xFFF59E0B), Color(0xFFD97706)]),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.workspace_premium, size: 9, color: Colors.white),
                    SizedBox(width: 2),
                    Text('PRO',
                        style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: Colors.white)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Interest Grid ────────────────────────────────────────────────────────────
class _InterestGrid extends StatelessWidget {
  final List<Map<String, dynamic>> interests;
  final String activeTab;
  final bool isPro;
  final List<String> Function(dynamic) parseImages;
  final Function(Map<String, dynamic>, String) onAccept;
  final Function(Map<String, dynamic>, String) onDecline;

  const _InterestGrid({
    required this.interests,
    required this.activeTab,
    required this.isPro,
    required this.parseImages,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.75,
      ),
      itemCount: interests.length,
      itemBuilder: (ctx, i) {
        final item = interests[i];
        final profile = activeTab == 'Sent'
            ? (item['toProfile'] as Map<String, dynamic>? ?? {})
            : (item['fromProfile'] as Map<String, dynamic>? ?? {});

        if (profile.isEmpty) return SizedBox.shrink();

        final images = parseImages(profile['images']);

        return InterestItem(
          key: ValueKey(item['id'] ?? i),
          interest: item,
          profile: profile,
          images: images,
          activeTab: activeTab,
          onOpenProfile: () => Get.to(
              () => ProfileDetailPage(profile: {...profile, 'images': images}),
              transition: Transition.rightToLeft),
          onStartChat: () {
            final otherId = activeTab == 'Sent'
                ? (item['toProfile']?['individual_id']?.toString())
                : (item['fromProfile']?['individual_id']?.toString());
            final otherName = activeTab == 'Sent'
                ? (item['toProfile']?['name']?.toString())
                : (item['fromProfile']?['name']?.toString());
            if (otherId != null) {
              Get.to(
                () => ChatPage(
                  initialReceiverId: otherId,
                  initialReceiverInfo: {
                    'id': otherId,
                    'name': otherName,
                    'avatar': images.isNotEmpty ? images.first : null,
                  },
                ),
                transition: Transition.rightToLeft,
              );
            }
          },
          onAccept: (id, name) => onAccept(item, name),
          onDecline: (id, name) => onDecline(item, name),
          isPro: isPro,
          index: i,
        );
      },
    );
  }
}

// ─── Skeleton Grid ────────────────────────────────────────────────────────────
class _SkeletonGrid extends StatefulWidget {
  @override
  State<_SkeletonGrid> createState() => _SkeletonGridState();
}

class _SkeletonGridState extends State<_SkeletonGrid>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 1200))
          ..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.3, end: 0.8).animate(_ac);
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.75,
      ),
      itemCount: 6,
      itemBuilder: (_, i) => AnimatedBuilder(
        animation: _anim,
        builder: (_, __) => Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: LinearGradient(
              colors: [
                Color(0xFF1B4D3E).withOpacity(0.02),
                Color(0xFF1B4D3E).withOpacity(_anim.value * 0.12)
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Empty State ──────────────────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  final String tab;
  final VoidCallback onExplore;
  const _EmptyState({required this.tab, required this.onExplore});

  @override
  Widget build(BuildContext context) {
    final configs = {
      'Received': {
        'icon': Icons.favorite_border,
        'title': 'No interests received yet',
        'desc': "When someone sends you an interest, it will appear here.",
        'action': null
      },
      'Sent': {
        'icon': Icons.send_outlined,
        'title': 'No interests sent yet',
        'desc':
            "Browse profiles and send your first interest to start connecting.",
        'action': 'Explore Profiles'
      },
    };
    final config = configs[tab] ?? configs['Sent']!;
    final color = tab == 'Sent' ? Color(0xFF1B4D3E) : Color(0xFFEC4899);

    return Padding(
      padding: EdgeInsets.symmetric(vertical: 60, horizontal: 24),
      child: Column(
        children: [
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                  colors: [color.withOpacity(0.06), color.withOpacity(0.12)]),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: color.withOpacity(0.1)),
              boxShadow: [
                BoxShadow(color: color.withOpacity(0.08), blurRadius: 32)
              ],
            ),
            child: Icon(config['icon'] as IconData,
                size: 36, color: color.withOpacity(0.7)),
          ),
          SizedBox(height: 20),
          Text(config['title'] as String,
              style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1B4D3E),
                  letterSpacing: -0.01),
              textAlign: TextAlign.center),
          SizedBox(height: 8),
          Text(config['desc'] as String,
              style:
                  TextStyle(fontSize: 13, color: Colors.grey[400], height: 1.5),
              textAlign: TextAlign.center),
          if (config['action'] != null) ...[
            SizedBox(height: 24),
            GestureDetector(
              onTap: onExplore,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                      colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)]),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                        color: Color(0xFF1B4D3E).withOpacity(0.25),
                        blurRadius: 16,
                        offset: Offset(0, 4))
                  ],
                ),
                child: Text('${config['action']} →',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
class _ConfirmDialog extends StatelessWidget {
  final Map<String, dynamic> dialog;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const _ConfirmDialog(
      {required this.dialog, required this.onConfirm, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    final isAccept = dialog['type'] == 'accept';
    final name = dialog['name'] as String? ?? '';

    return GestureDetector(
      onTap: onCancel,
      child: Container(
        color: Colors.black.withOpacity(0.5),
        child: Center(
          child: GestureDetector(
            onTap: () {},
            child: Container(
              margin: EdgeInsets.all(24),
              padding: EdgeInsets.all(24),
              constraints: BoxConstraints(maxWidth: 360),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.25)),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Container(
                  color: Colors.black.withOpacity(0.3),
                  child: BackdropFilter(
                    filter: ColorFilter.mode(Colors.transparent, BlendMode.dst),
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: (isAccept
                                      ? Color(0xFF22C55E)
                                      : Color(0xFFEF4444))
                                  .withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isAccept ? Icons.favorite : Icons.close,
                              size: 32,
                              color: isAccept
                                  ? Color(0xFF4ADE80)
                                  : Color(0xFFF87171),
                            ),
                          ),
                          SizedBox(height: 16),
                          Text(
                            isAccept ? 'Accept Interest?' : 'Decline Interest?',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: Colors.white),
                          ),
                          SizedBox(height: 8),
                          Text(
                            isAccept
                                ? "You are about to accept $name's interest. This will allow you to chat."
                                : "You are about to decline $name's interest. This cannot be undone.",
                            style: TextStyle(
                                fontSize: 13,
                                color: Colors.white.withOpacity(0.7),
                                height: 1.5),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 24),
                          Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: onCancel,
                                  child: Container(
                                    padding: EdgeInsets.symmetric(vertical: 12),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                          color: Colors.white.withOpacity(0.2)),
                                    ),
                                    child: Center(
                                        child: Text('Cancel',
                                            style: TextStyle(
                                                color: Colors.white
                                                    .withOpacity(0.8),
                                                fontWeight: FontWeight.w500))),
                                  ),
                                ),
                              ),
                              SizedBox(width: 12),
                              Expanded(
                                child: GestureDetector(
                                  onTap: onConfirm,
                                  child: Container(
                                    padding: EdgeInsets.symmetric(vertical: 12),
                                    decoration: BoxDecoration(
                                      color: isAccept
                                          ? Color(0xFF22C55E)
                                          : Color(0xFFEF4444),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Center(
                                      child: Text(
                                        isAccept
                                            ? 'Yes, Accept'
                                            : 'Yes, Decline',
                                        style: TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w700),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Cancel Confirm Modal ─────────────────────────────────────────────────────
class _CancelConfirmModal extends StatelessWidget {
  final Map<String, dynamic> data;
  final VoidCallback onClose;
  final VoidCallback onConfirm;

  const _CancelConfirmModal(
      {required this.data, required this.onClose, required this.onConfirm});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onClose,
      child: Container(
        color: Colors.black.withOpacity(0.6),
        child: Center(
          child: GestureDetector(
            onTap: () {},
            child: Container(
              margin: EdgeInsets.all(20),
              padding: EdgeInsets.all(28),
              constraints: BoxConstraints(maxWidth: 360),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 60,
                      offset: Offset(0, 20))
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Avatar
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Color(0xFFF0F5F3), width: 3),
                      color: Color(0xFF1B4D3E),
                    ),
                    child: ClipOval(
                      child: data['image'] != null
                          ? Image.network(data['image'] as String,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  _Initial(name: data['name'] as String? ?? ''))
                          : _Initial(name: data['name'] as String? ?? ''),
                    ),
                  ),
                  SizedBox(height: 20),
                  Text('Cancel Interest?',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1B4D3E))),
                  SizedBox(height: 8),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: TextStyle(
                          fontSize: 13, color: Colors.grey[500], height: 1.5),
                      children: [
                        TextSpan(
                            text:
                                'Are you sure you want to cancel your interest sent to '),
                        TextSpan(
                            text: data['name']?.toString() ?? '',
                            style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1B4D3E))),
                        TextSpan(text: '? This action cannot be undone.'),
                      ],
                    ),
                  ),
                  SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: onClose,
                          child: Container(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Color(0xFFEAF2EE)),
                            ),
                            child: Center(
                                child: Text('Keep Interest',
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF1B4D3E)))),
                          ),
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: GestureDetector(
                          onTap: onConfirm,
                          child: Container(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: Color(0xFFEF4444),
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                    color: Color(0xFFEF4444).withOpacity(0.3),
                                    blurRadius: 8,
                                    offset: Offset(0, 2))
                              ],
                            ),
                            child: Center(
                                child: Text('Cancel Interest',
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white))),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Initial extends StatelessWidget {
  final String name;
  const _Initial({required this.name});

  @override
  Widget build(BuildContext context) => Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: Color(0xFFFEF3C7)),
        ),
      );
}
