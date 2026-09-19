import 'package:app/features/auth/services/auth_service.dart';
import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:app/features/chat/pages/chat_page.dart';
import 'package:app/features/explore/pages/explore_page.dart';
import 'package:app/features/guardian/pages/guardian_dashboard_page.dart';
import 'package:app/features/guardian/pages/guardian_profile_page.dart';
import 'package:app/features/guardian/pages/guardian_shell.dart';
import 'package:app/features/guardian/pages/link_ward_page.dart';
import 'package:app/features/interest/pages/interest_page.dart';
import 'package:app/features/settings/pages/settings_page.dart';
import 'package:app/features/userguardian/link_guardian_page.dart';
import 'package:app/features/userprofile/services/user_profile_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../core/services/socket_service.dart';

// ── Shell Controller ──────────────────────────────────────────────────────────
class BottomTabBarController extends GetxController {
  @override
  var currentIndex = 0.obs;

  void goTo(int index) => currentIndex.value = index;
}

// ── Main Shell ────────────────────────────────────────────────────────────────
class BottomTabBar extends StatelessWidget {
  const BottomTabBar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.put(BottomTabBarController());
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness:
            Brightness.dark, // dark icons for white bg (Android)
        statusBarBrightness: Brightness.light, // for iOS
        systemNavigationBarColor: Colors.white, // bottom bar background
        systemNavigationBarIconBrightness:
            Brightness.dark, // dark icons/buttons
        systemNavigationBarDividerColor: Colors.transparent,
      ),
    );
    return Obx(() {
      // Read badge counts from socket if available
      SocketService? socket;
      try {
        socket = Get.find<SocketService>();
      } catch (_) {}

      final interestBadge = socket?.badges.interestCount.value ?? 0;
      final chatBadge = socket?.badges.chatCount.value ?? 0;

      final isGuardian = AuthService().userRole == "individual" ? false : true;
      final _indivisualpages = [
        const ExplorePage(),
        const InterestPage(),
        const ChatPage(),
        const SettingsPage(),
      ];

      final _guardianpages = [
        const GuardianDashboardPage(),
        const LinkWardPage(),
        const ChatPage(),
        const SettingsPage(),
      ];

      return Scaffold(
        // IndexedStack keeps all pages alive — no rebuild on tab switch
        body: IndexedStack(
          index: ctrl.currentIndex.value,
          children: isGuardian ? _guardianpages : _indivisualpages,
        ),

        bottomNavigationBar: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.white,
                blurRadius: 20,
                offset: Offset(0, -4),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: SizedBox(
              height: 64,
              child: isGuardian
                  ? getGuardianItems(ctrl, interestBadge, chatBadge)
                  : getIndividualItems(ctrl, interestBadge, chatBadge),
            ),
          ),
        ),
      );
    });
  }
}

Widget getIndividualItems(
    BottomTabBarController ctrl, int interestBadge, int chatBadge) {
  return Row(
    children: [
      _NavItem(
        icon: Icons.explore_outlined,
        activeIcon: Icons.explore,
        label: 'Explore',
        isActive: ctrl.currentIndex.value == 0,
        onTap: () => ctrl.goTo(0),
      ),
      _NavItem(
        icon: Icons.favorite_outline,
        activeIcon: Icons.favorite,
        label: 'Interests',
        isActive: ctrl.currentIndex.value == 1,
        badge: interestBadge,
        onTap: () => ctrl.goTo(1),
      ),
      _NavItem(
        icon: Icons.chat_bubble_outline,
        activeIcon: Icons.chat_bubble,
        label: 'Chats',
        isActive: ctrl.currentIndex.value == 2,
        badge: chatBadge,
        onTap: () => ctrl.goTo(2),
      ),
      _NavItem(
        icon: Icons.settings_outlined,
        activeIcon: Icons.settings,
        label: 'Settings',
        isActive: ctrl.currentIndex.value == 3,
        onTap: () => ctrl.goTo(3),
      ),
    ],
  );
}

Widget getGuardianItems(
    BottomTabBarController ctrl, int interestBadge, int chatBadge) {
  return Row(
    children: [
      _NavItem(
        icon: Icons.explore_outlined,
        activeIcon: Icons.explore,
        label: 'Explore',
        isActive: ctrl.currentIndex.value == 0,
        onTap: () => ctrl.goTo(0),
      ),
      _NavItem(
        icon: Icons.favorite_outline,
        activeIcon: Icons.favorite,
        label: 'Interests',
        isActive: ctrl.currentIndex.value == 1,
        badge: interestBadge,
        onTap: () => ctrl.goTo(1),
      ),
      _NavItem(
        icon: Icons.chat_bubble_outline,
        activeIcon: Icons.chat_bubble,
        label: 'Chats',
        isActive: ctrl.currentIndex.value == 2,
        badge: chatBadge,
        onTap: () => ctrl.goTo(2),
      ),
      _NavItem(
        icon: Icons.settings_outlined,
        activeIcon: Icons.settings,
        label: 'Settings',
        isActive: ctrl.currentIndex.value == 3,
        onTap: () => ctrl.goTo(3),
      ),
    ],
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────
class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isActive;
  final int badge;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isActive,
    this.badge = 0,
    required this.onTap,
  });

  static const _primary = Color(0xFF1B4D3E);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon + badge
              Stack(
                clipBehavior: Clip.none,
                children: [
                  AnimatedSwitcher(
                    duration: Duration(milliseconds: 200),
                    child: Icon(
                      isActive ? activeIcon : icon,
                      key: ValueKey(isActive),
                      size: 24,
                      color: isActive ? _primary : Color(0xFF9CA3AF),
                    ),
                  ),
                  if (badge > 0)
                    Positioned(
                      top: -4,
                      right: -8,
                      child: Container(
                        constraints: BoxConstraints(minWidth: 17),
                        height: 17,
                        padding: EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          color: Color(0xFFEF4444),
                          borderRadius: BorderRadius.circular(9),
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                        child: Center(
                          child: Text(
                            badge > 99 ? '99+' : '$badge',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),

              SizedBox(height: 4),

              // Label
              AnimatedDefaultTextStyle(
                duration: Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive ? _primary : Color(0xFF9CA3AF),
                ),
                child: Text(label),
              ),

              // Active indicator dot
              SizedBox(height: 4),
              AnimatedContainer(
                duration: Duration(milliseconds: 200),
                width: isActive ? 18 : 0,
                height: 3,
                decoration: BoxDecoration(
                  color: _primary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
