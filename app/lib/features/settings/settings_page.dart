import 'package:app_component/core/core.dart';
import 'package:app_component/core/utils/page_transition_manager.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:app/core/values/constants.dart';
import 'settings_controller.dart';
import 'widgets/termsprivacy_page.dart';
import 'package:app/features/settings/report_bug.dart';
import 'package:app/core/utils/styles.dart';

class SettingBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SettingsController>(() => SettingsController());
  }
}

class SettingPage extends GetView<SettingsController> {
  SettingPage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(SettingsController());
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        children: [
          const SizedBox(height: 25),
          _sectionTitle("Preferences"),

          Obx(
            () => _switchTile(
              icon: CupertinoIcons.moon,
              title: "Dark Mode",
              value: controller.isDark.value,
              onChanged: controller.setDarkMode,
            ),
          ),

          _settingTile(
            icon: CupertinoIcons.share,
            title: "Share App",
            subtitle: "Tell your friends",
            onTap: () {
              // Implement share logic
            },
          ),

          Obx(
            () => _settingTile(
              icon: CupertinoIcons.globe,
              title: "App Language",
              subtitle: controller.language.value,
              onTap: () {
                // Open language picker
              },
            ),
          ),

          const SizedBox(height: 25),
          _sectionTitle("App Info"),

          _settingTile(
            icon: CupertinoIcons.info_circle,
            title: "About",
            subtitle: "Version 1.0.0",
            onTap: () {
              showAboutDialog(
                context: context,
                applicationName: Constants.appTitle,
                applicationVersion: "1.0.0",
              );
            },
          ),

          _settingTile(
            icon: CupertinoIcons.doc_text,
            title: "Terms & Privacy",
            subtitle: "Read documentation",
            onTap: () {
              PageManager.slideUp(() => const TermsPrivacyPage());
            },
          ),

          _settingTile(
            icon: CupertinoIcons.pencil,
            title: "Report Bug",
            subtitle: "Send feedback",
            onTap: () {
              PageManager.slideUp(() => ReportBugPage());
            },
          ),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        text,
        style: TextStyle(
          color: AppColors.onSurface,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _settingTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle) : null,
      onTap: onTap,
    );
  }

  Widget _switchTile({
    required IconData icon,
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: CupertinoSwitch(value: value, onChanged: onChanged),
    );
  }
}
