import 'package:app/data/services/settings_service.dart';
import 'package:app/features/subscription/controller/subscription_controller.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

/// A widget that renders an in-line terms and privacy policy text.
///
/// Designed to be used anywhere you need to show:
///   "By signing up you agree to MSO's Terms & Conditions and Privacy Policy."
///
/// [onTermsTap] and [onPrivacyTap] allow you to override the default
/// behavior of opening the URL in an external browser.
class TermsText extends StatelessWidget {
  final VoidCallback? onTermsTap;
  final VoidCallback? onPrivacyTap;
  final Color? textColor;
  final Color? linkColor;
  final double? fontSize;

  const TermsText({
    Key? key,
    this.onTermsTap,
    this.onPrivacyTap,
    this.textColor,
    this.linkColor,
    this.fontSize,
  }) : super(key: key);

  Future<void> _openUrl(String? url) async {
    if (url == null || url.isEmpty) return;
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final Color resolvedTextColor =
        textColor ?? theme.colorScheme.onSurface.withOpacity(0.4);
    final Color resolvedLinkColor = linkColor ?? theme.colorScheme.primary;

    final settingsService = Get.find<SettingsService>();
    final privacyUrl = settingsService.privacyPolicyUrl;
    final termsUrl = settingsService.termsOfServiceUrl;

    return Text.rich(
      TextSpan(
        text: "By signing up you agree to MSO's ",
        style: TextStyle(
          color: resolvedTextColor,
          fontSize: fontSize ?? 11.5,
          height: 1.4,
        ),
        children: [
          TextSpan(
            text: 'Terms & Conditions',
            style: TextStyle(
              color: resolvedLinkColor,
              decoration: TextDecoration.underline,
              fontWeight: FontWeight.w600,
              fontSize: fontSize ?? 11.5,
              height: 1.4,
            ),
            recognizer: TapGestureRecognizer()
              ..onTap = onTermsTap ?? () => _openUrl(termsUrl),
          ),
          const TextSpan(text: ' and '),
          TextSpan(
            text: 'Privacy Policy',
            style: TextStyle(
              color: resolvedLinkColor,
              decoration: TextDecoration.underline,
              fontWeight: FontWeight.w600,
              fontSize: fontSize ?? 11.5,
              height: 1.4,
            ),
            recognizer: TapGestureRecognizer()
              ..onTap = onPrivacyTap ?? () => _openUrl(privacyUrl),
          ),
          const TextSpan(text: '.'),
        ],
      ),
      textAlign: TextAlign.center,
    );
  }
}

/// Legacy functional widget to match existing usage in welcome_page and elsewhere.
Widget terms({
  VoidCallback? onTermsTap,
  VoidCallback? onPrivacyTap,
  Color? textColor,
  Color? linkColor,
  double? fontSize,
}) {
  return TermsText(
    onTermsTap: onTermsTap,
    onPrivacyTap: onPrivacyTap,
    textColor: textColor,
    linkColor: linkColor,
    fontSize: fontSize,
  );
}
