import 'package:app/core/widgets/islamic_page_header.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../controllers/settings_controller.dart';
import '../services/settings_service.dart';
import '../widgets/settings_widgets.dart';
import 'change_password_page.dart';
import 'subscription_detail_page.dart';
import 'referral_page.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Get.put(UserSettingsService(), permanent: true);
    Get.put(SettingsController());
    return _SettingsView();
  }
}

class _SettingsView extends GetView<SettingsController> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF0F5F3),
      body: Obx(() {
        if (controller.isLoading.value) return _LoadingView();

        final userData = controller.userData;
        final name = userData?['name']?.toString() ?? 'Your Profile';
        final email = userData?['email']?.toString() ?? '';
        final avatarUrl = userData?['avatar_url']?.toString();
        final isPro = controller.isPro.value;
        final isGuardian = controller.isGuardian;

        return Column(
          children: [
            // Page header
            IslamicPageHeader(
              title: 'Settings',
              subtitle: 'Manage your journey with intention',
              icon:
                  Icon(Icons.settings_outlined, color: Colors.white, size: 18),
            ),
            Divider(height: 1, color: Color(0xFF1B4D3E).withOpacity(0.06)),

            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.only(top: 16, bottom: 48),
                child: Column(
                  children: [
                    // ── Pro upgrade banner (non-pro individuals only) ──────
                    if (!isPro && !isGuardian)
                      GestureDetector(
                        onTap: () => Get.to(() => SubscriptionDetailPage(),
                            transition: Transition.rightToLeft),
                        child: Container(
                          margin: EdgeInsets.fromLTRB(16, 0, 16, 16),
                          padding: EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Color(0xFF1B4D3E),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                  color: Color(0xFF1B4D3E).withOpacity(0.25),
                                  blurRadius: 20,
                                  offset: Offset(0, 4))
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(14)),
                                child: Icon(Icons.workspace_premium,
                                    color: Color(0xFFFCD34D), size: 24),
                              ),
                              SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Upgrade to Premium',
                                        style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: Colors.white)),
                                    SizedBox(height: 2),
                                    Text(
                                        'Unlock last seen, priority matching & more',
                                        style: TextStyle(
                                            fontSize: 12,
                                            color:
                                                Colors.white.withOpacity(0.7))),
                                  ],
                                ),
                              ),
                              Icon(Icons.chevron_right,
                                  color: Colors.white.withOpacity(0.6),
                                  size: 20),
                            ],
                          ),
                        ),
                      ),

                    // ── Account section ───────────────────────────────────
                    SettingsSectionCard(
                      title: 'Account',
                      children: [
                        // Profile row
                        _ProfileRow(
                          name: name,
                          email: email,
                          avatarUrl: avatarUrl,
                          isPro: isPro,
                          onTap: () {
                            // Navigate to profile page
                            Get.back();
                          },
                        ),

                        // Meetings
                        NavRow(
                          icon: Icons.calendar_today_outlined,
                          label: 'Meetings',
                          sublabel: 'View and manage your meetings',
                          onTap: () => Get.snackbar('Meetings', 'Coming soon',
                              snackPosition: SnackPosition.BOTTOM),
                        ),

                        // Guardian: My Ward
                        if (isGuardian)
                          NavRow(
                            icon: Icons.person_outline,
                            label: 'My Ward',
                            sublabel: "Manage your ward's account",
                            onTap: () {},
                          ),

                        // Individual: Subscription
                        if (!isGuardian)
                          NavRow(
                            icon: Icons.workspace_premium_outlined,
                            label: 'Subscription',
                            sublabel: 'Manage your subscription details',
                            onTap: () => Get.to(() => SubscriptionDetailPage(),
                                transition: Transition.rightToLeft),
                          ),

                        // Verification
                        NavRow(
                          icon: Icons.verified_outlined,
                          label: isGuardian
                              ? 'Verification'
                              : 'Get Verified Badge',
                          sublabel: 'Apply for account verification',
                          onTap: () {},
                        ),

                        // Individual: Referral
                        if (!isGuardian)
                          NavRow(
                            icon: Icons.people_outline,
                            label: 'Referral Program',
                            sublabel: 'Invite friends & earn rewards',
                            onTap: () => Get.to(() => ReferralPage(),
                                transition: Transition.rightToLeft),
                          ),

                        // Change Password
                        NavRow(
                          icon: Icons.lock_outline,
                          label: 'Change Password',
                          sublabel: 'Update your account password',
                          onTap: () => Get.to(() => ChangePasswordPage(),
                              transition: Transition.rightToLeft),
                          isLast: true,
                        ),
                      ],
                    ),

                    // ── Privacy (individuals only) ────────────────────────
                    if (!isGuardian)
                      Obx(() => SettingsSectionCard(
                            title: 'Privacy',
                            children: [
                              ToggleRow(
                                icon: Icons.access_time,
                                iconBg: isPro
                                    ? Color(0xFFF0FDF4)
                                    : Color(0xFFF5F5F5),
                                iconColor: isPro
                                    ? Color(0xFF16A34A)
                                    : Color(0xFF9CA3AF),
                                label: 'Show last seen',
                                sublabel: isPro
                                    ? 'Let others see when you were last active'
                                    : 'Upgrade to Pro to control your visibility',
                                value: controller.settings['is_show_last_seen']
                                        as bool? ??
                                    true,
                                onChange: isPro
                                    ? (v) => controller.handleToggle(
                                        'is_show_last_seen', v)
                                    : (_) => Get.to(
                                        () => SubscriptionDetailPage(),
                                        transition: Transition.rightToLeft),
                                disabled: !isPro,
                              ),
                              ToggleRow(
                                icon: Icons.hide_image_outlined,
                                iconBg: isPro
                                    ? Color(0xFFFAF5FF)
                                    : Color(0xFFF5F5F5),
                                iconColor: isPro
                                    ? Color(0xFF7C3AED)
                                    : Color(0xFF9CA3AF),
                                label: 'Blur profile photos',
                                sublabel: isPro
                                    ? 'Others will see your photos as blurred'
                                    : 'Upgrade to Pro to restrict photo access',
                                value: controller.settings['is_blurred_images']
                                        as bool? ??
                                    false,
                                onChange: isPro
                                    ? (v) => controller.handleToggle(
                                        'is_blurred_images', v)
                                    : (_) => Get.to(
                                        () => SubscriptionDetailPage(),
                                        transition: Transition.rightToLeft),
                                disabled: !isPro,
                                isLast: true,
                              ),
                            ],
                          )),

                    // ── Notifications ─────────────────────────────────────
                    Obx(() => SettingsSectionCard(
                          title: 'Notifications',
                          children: [
                            ToggleRow(
                              icon: Icons.notifications_outlined,
                              iconBg: Color(0xFFEFF6FF),
                              iconColor: Color(0xFF3B82F6),
                              label: 'Push notifications',
                              sublabel: 'Interests, matches and messages',
                              value: controller.settings['notifications']
                                      as bool? ??
                                  true,
                              onChange: (v) =>
                                  controller.handleToggle('notifications', v),
                            ),
                            ToggleRow(
                              icon: Icons.email_outlined,
                              iconBg: Color(0xFFF0FDF4),
                              iconColor: Color(0xFF16A34A),
                              label: 'Email updates',
                              sublabel: 'Weekly digest and platform news',
                              value: controller.settings['email_updates']
                                      as bool? ??
                                  false,
                              onChange: (v) =>
                                  controller.handleToggle('email_updates', v),
                              isLast: true,
                            ),
                          ],
                        )),

                    // ── Support ───────────────────────────────────────────
                    SettingsSectionCard(
                      title: 'Support',
                      children: [
                        NavRow(
                            icon: Icons.info_outline,
                            label: 'About Marriage Sunnah',
                            sublabel: 'Version 1.0.0',
                            onTap: () {}),
                        NavRow(
                            icon: Icons.shield_outlined,
                            label: 'Privacy Policy',
                            onTap: () {}),
                        NavRow(
                            icon: Icons.phone_outlined,
                            label: 'Contact Support',
                            sublabel: 'WhatsApp or email',
                            onTap: () {},
                            isLast: true),
                      ],
                    ),

                    // ── Danger zone ───────────────────────────────────────
                    SettingsSectionCard(
                      title: 'Account Actions',
                      children: [
                        NavRow(
                          icon: Icons.logout,
                          iconBg: Color(0xFFFFF7ED),
                          iconColor: Color(0xFFF97316),
                          label: 'Log out',
                          onTap: controller.logout,
                        ),
                        NavRow(
                          icon: Icons.delete_outline,
                          iconBg: Color(0xFFFFF1F2),
                          iconColor: Color(0xFFEF4444),
                          label: 'Delete Account',
                          sublabel: 'Permanently remove all your data',
                          danger: true,
                          onTap: () => Get.dialog(
                            _DeleteAccountModal(
                              onClose: () => Get.back(),
                              onConfirm: () {
                                Get.back();
                                controller.deleteAccount();
                              },
                            ),
                            barrierColor: Colors.black.withOpacity(0.5),
                            barrierDismissible: true,
                          ),
                          isLast: true,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      }),
    );
  }
}

// ─── Profile Row ──────────────────────────────────────────────────────────────
class _ProfileRow extends StatelessWidget {
  final String name, email;
  final String? avatarUrl;
  final bool isPro;
  final VoidCallback onTap;

  const _ProfileRow({
    required this.name,
    required this.email,
    this.avatarUrl,
    required this.isPro,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
            border: Border(
                bottom:
                    BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.07)))),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                  color: Color(0xFFF0F5F3),
                  borderRadius: BorderRadius.circular(12)),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: avatarUrl != null && avatarUrl!.isNotEmpty
                    ? Image.network(avatarUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Icon(Icons.person_outline,
                            size: 18, color: Color(0xFF1B4D3E)))
                    : Icon(Icons.person_outline,
                        size: 18, color: Color(0xFF1B4D3E)),
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name,
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF1A1A1A)),
                      overflow: TextOverflow.ellipsis),
                  if (email.isNotEmpty)
                    Text(email,
                        style:
                            TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
                        overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            if (isPro)
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                    color: Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(8)),
                child: Text('⭐ PRO',
                    style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF92400E))),
              ),
            SizedBox(width: 8),
            Icon(Icons.chevron_right, size: 18, color: Color(0xFFD1D5DB)),
          ],
        ),
      ),
    );
  }
}

// ─── Delete account modal ─────────────────────────────────────────────────────
class _DeleteAccountModal extends StatefulWidget {
  final VoidCallback onClose;
  final VoidCallback onConfirm;
  const _DeleteAccountModal({required this.onClose, required this.onConfirm});

  @override
  State<_DeleteAccountModal> createState() => _DeleteAccountModalState();
}

class _DeleteAccountModalState extends State<_DeleteAccountModal> {
  String _input = '';

  @override
  Widget build(BuildContext context) {
    final canDelete = _input == 'DELETE';
    return Center(
      child: GestureDetector(
        onTap: () {},
        child: Container(
          margin: EdgeInsets.all(20),
          padding: EdgeInsets.all(24),
          constraints: BoxConstraints(maxWidth: 400),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 40)
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                    color: Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(16)),
                child: Icon(Icons.delete_outline,
                    size: 28, color: Color(0xFFEF4444)),
              ),
              SizedBox(height: 16),
              Text('Delete Account',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1A1A1A))),
              SizedBox(height: 8),
              Text(
                'This will permanently delete your profile, photos, matches, and all data. This cannot be undone.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 13, color: Color(0xFF9CA3AF), height: 1.5),
              ),
              SizedBox(height: 20),
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Type DELETE to confirm',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF6B7280))),
              ),
              SizedBox(height: 6),
              TextField(
                onChanged: (v) => setState(() => _input = v),
                decoration: InputDecoration(
                  hintText: 'DELETE',
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Color(0xFFFCA5A5)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Color(0xFFFCA5A5)),
                  ),
                  filled: true,
                  fillColor: Color(0xFFFFF5F5),
                ),
              ),
              SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: widget.onClose,
                      child: Container(
                        height: 44,
                        decoration: BoxDecoration(
                            color: Color(0xFFF0F5F3),
                            borderRadius: BorderRadius.circular(14)),
                        child: Center(
                            child: Text('Cancel',
                                style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF1B4D3E)))),
                      ),
                    ),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: GestureDetector(
                      onTap: canDelete ? widget.onConfirm : null,
                      child: AnimatedContainer(
                        duration: Duration(milliseconds: 200),
                        height: 44,
                        decoration: BoxDecoration(
                          color:
                              canDelete ? Color(0xFFEF4444) : Color(0xFFFCA5A5),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Center(
                            child: Text('Delete Forever',
                                style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
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
    );
  }
}

class _LoadingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: CircularProgressIndicator(
        strokeWidth: 2.5,
        color: Color(0xFF1B4D3E),
      ),
    );
  }
}

// Extension for ToggleRow with isLast
extension ToggleRowExt on ToggleRow {
  bool get isLast => false;
}
