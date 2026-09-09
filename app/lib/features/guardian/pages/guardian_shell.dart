import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../services/guardian_service.dart';
import 'guardian_dashboard_page.dart';
import 'link_ward_page.dart';
import 'guardian_profile_page.dart';

class GuardianShellController extends GetxController {
  var currentIndex = 0.obs;
  void goTo(int i) => currentIndex.value = i;
}

class GuardianShell extends StatelessWidget {
  const GuardianShell({Key? key}) : super(key: key);

  static final _pages = [
    const GuardianDashboardPage(),
    const LinkWardPage(),
    const GuardianProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<GuardianService>()) {
      Get.put(GuardianService(), permanent: true);
    }
    final ctrl = Get.put(GuardianShellController());

    return Obx(() => Scaffold(
      body: IndexedStack(
        index: ctrl.currentIndex.value,
        children: _pages,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(
              color: Color(0xFF1B4D3E).withOpacity(0.08),
              blurRadius: 20, offset: Offset(0, -4))],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: Row(
              children: [
                _NavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard,
                    label: 'Dashboard', isActive: ctrl.currentIndex.value == 0,
                    onTap: () => ctrl.goTo(0)),
                _NavItem(icon: Icons.people_outline, activeIcon: Icons.people,
                    label: 'My Wards', isActive: ctrl.currentIndex.value == 1,
                    onTap: () => ctrl.goTo(1)),
                _NavItem(icon: Icons.person_outline, activeIcon: Icons.person,
                    label: 'Profile', isActive: ctrl.currentIndex.value == 2,
                    onTap: () => ctrl.goTo(2)),
              ],
            ),
          ),
        ),
      ),
    ));
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon, activeIcon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _NavItem({required this.icon, required this.activeIcon, required this.label,
      required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedSwitcher(
              duration: Duration(milliseconds: 200),
              child: Icon(isActive ? activeIcon : icon,
                  key: ValueKey(isActive),
                  size: 24,
                  color: isActive ? Color(0xFF1B4D3E) : Color(0xFF9CA3AF)),
            ),
            SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive ? Color(0xFF1B4D3E) : Color(0xFF9CA3AF),
                )),
            SizedBox(height: 4),
            AnimatedContainer(
              duration: Duration(milliseconds: 200),
              width: isActive ? 18 : 0,
              height: 3,
              decoration: BoxDecoration(
                color: Color(0xFF1B4D3E),
                borderRadius: BorderRadius.circular(2)),
            ),
          ],
        ),
      ),
    );
  }
}
