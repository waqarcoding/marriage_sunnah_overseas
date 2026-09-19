import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:flutter/material.dart';

/// Non-web stub for [OverlayGoogleButton].
///
/// This widget is only ever instantiated when `kIsWeb` is true (see
/// welcome_page.dart), so this build is never actually shown on
/// Android/iOS — but the class still has to exist and type-check on
/// every platform, since Dart resolves conditional imports at compile
/// time based on the target platform's available libraries.
class OverlayGoogleButton extends StatelessWidget {
  final AuthController authController;

  const OverlayGoogleButton({super.key, required this.authController});

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
