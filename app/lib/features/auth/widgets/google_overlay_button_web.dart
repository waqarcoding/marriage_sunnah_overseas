import 'dart:async';

import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:app/features/auth/pages/auth_sheet.dart';
// TODO: add the actual import for BrandLogo here — it wasn't in the
// original welcome_page.dart import list, so it must be exported by
// one of these packages already (e.g. app_component). Add it explicitly:
// import 'package:app_component/widgets/brand_logo.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:google_sign_in_platform_interface/google_sign_in_platform_interface.dart';
import 'package:google_sign_in_web/google_sign_in_web.dart' as web;

/// Web-only Google sign-in button.
///
/// Renders a custom-styled button visually, with Google's real
/// (invisible) sign-in iframe/button overlaid on top so the click
/// actually goes through Google's officially supported flow.
///
/// Only ever compiled when `dart.library.js_interop` is available
/// (i.e. web builds) — see the conditional import in welcome_page.dart.
class OverlayGoogleButton extends StatefulWidget {
  final AuthController authController;

  const OverlayGoogleButton({super.key, required this.authController});

  @override
  State<OverlayGoogleButton> createState() => _OverlayGoogleButtonState();
}

class _OverlayGoogleButtonState extends State<OverlayGoogleButton> {
  StreamSubscription? _authSub;

  @override
  void initState() {
    super.initState();
    _authSub = GoogleSignIn.instance.authenticationEvents.listen((event) {
      if (event is GoogleSignInAuthenticationEventSignIn) {
        widget.authController.handleGoogleSignInSuccess(
          event.user,
          context,
          onFailed: (msg) {
            Get.snackbar(
              'Google Sign In',
              msg,
              snackPosition: SnackPosition.BOTTOM,
            );
          },
        );
      }
    }, onError: (error) {
      Get.snackbar(
        'Google Sign In',
        'Sign in failed: $error',
        snackPosition: SnackPosition.BOTTOM,
      );
    });
  }

  @override
  void dispose() {
    _authSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        borderRadius: BorderRadius.circular(18.r),
        border: Border.all(
          color: Theme.of(context).colorScheme.primary,
          width: 2,
        ),
      ),
      width: 260,
      height: 60,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Visible layer: your exact custom button, purely visual.
          IgnorePointer(
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14.r),
                  side: BorderSide(
                    color: Theme.of(context).colorScheme.primary,
                    width: 2,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  BrandLogo.google(26),
                  const SizedBox(width: 14),
                  const Text(
                    'Continue with Google',
                    style: TextStyle(
                      fontSize: 17,
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Invisible layer: real Google iframe, receives the actual tap.
          Opacity(
            opacity: 0.01,
            child: (GoogleSignInPlatform.instance as web.GoogleSignInPlugin)
                .renderButton(
              configuration: web.GSIButtonConfiguration(
                type: web.GSIButtonType.standard,
                theme: web.GSIButtonTheme.filledBlue,
                size: web.GSIButtonSize.large,
                shape: web.GSIButtonShape.pill,
                minimumWidth: 260,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
