import 'dart:async';

import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:google_sign_in_platform_interface/google_sign_in_platform_interface.dart';
import 'package:google_sign_in_web/google_sign_in_web.dart' as web;

import 'auth_sheet.dart';

/// MSO-style welcome / register screen.
///
/// Responsive: centers/constrains content on wide web desktop screens,
/// while using the full-width mobile layout on phones and mobile web.
class WellcomePage extends StatelessWidget {
  const WellcomePage({super.key});

  static const double _kMaxContentWidth = 480; // desktop web content cap

  // Single hero image used as the background instead of the old
  // scrolling product collage. Swap this path for whichever asset
  // you want to feature.
  static const String _backgroundImage = 'assets/images/sample1.jpg';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final isWideScreen = kIsWeb && screenWidth > 700; // desktop web breakpoint

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: theme.colorScheme.primary,
        body: Stack(
          children: [
            // Single static hero image instead of the animated collage.
            SizedBox(
              height: 0.64.sh,
              width: double.infinity,
              child: Image.asset(
                _backgroundImage,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  debugPrint('❌ Failed to load $_backgroundImage: $error');
                  return Container(color: Colors.grey.shade300);
                },
              ),
            ),

            // Fade the image into the solid background.
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.white.withValues(alpha: 0.10),
                      Colors.white.withValues(alpha: 0.35),
                      theme.colorScheme.surface.withValues(alpha: 0.88),
                      theme.colorScheme.surface,
                    ],
                    stops: const [
                      0.0,
                      0.34,
                      0.58,
                      0.76,
                    ],
                  ),
                ),
              ),
            ),

            SafeArea(
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth:
                        isWideScreen ? _kMaxContentWidth : double.infinity,
                  ),
                  child: Column(
                    children: [
                      const Spacer(),
                      _tagline(theme, isWideScreen),
                      SizedBox(height: 28.h),
                      _actions(context, theme, isWideScreen),
                      SizedBox(height: 16.h),
                      SizedBox(height: 8.h),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _actions(BuildContext context, ThemeData theme, bool isWideScreen) {
    final primaryColor = theme.colorScheme.onSurface;
    final AuthController authController = Get.find<AuthController>();

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: isWideScreen ? 0 : 20.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Continue with Google
          SizedBox(
            height: 54.h,
            child: kIsWeb
                ? _OverlayGoogleButton(authController: authController)
                : ElevatedButton(
                    onPressed: () {
                      authController.googleLogin(
                        onFailed: (msg) {
                          Get.snackbar(
                            'Google Sign In',
                            msg,
                            snackPosition: SnackPosition.BOTTOM,
                          );
                        },
                        context: context,
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14.r),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        BrandLogo.google(22),
                        const SizedBox(width: 12),
                        const Text(
                          'Continue with Google',
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
          ),

          SizedBox(height: 12.h),

          // Already have an account? Login
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {
                showAuthSheet(
                  context,
                  mode: AuthMode.signIn,
                );
              },
              style: TextButton.styleFrom(
                foregroundColor: primaryColor,
                padding: const EdgeInsets.symmetric(
                  horizontal: 4,
                  vertical: 8,
                ),
              ),
              child: Text.rich(
                TextSpan(
                  children: [
                    TextSpan(
                      text: 'Already have an account? ',
                      style: TextStyle(
                        color: Colors.black54,
                        fontSize: isWideScreen ? 14 : 14.sp,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    TextSpan(
                      text: 'Login',
                      style: TextStyle(
                        color: primaryColor,
                        fontSize: isWideScreen ? 14 : 14.sp,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tagline(ThemeData theme, bool isWideScreen) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: isWideScreen ? 0 : 24.w),
      child: Column(
        children: [
          // Main heading - Varela Round
          Text(
            'Connect Hearts\nAcross Borders',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'round',
              color: theme.colorScheme.onSurface,
              fontSize: isWideScreen ? 44 : 40.sp,
              height: 1.08,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.5,
            ),
          ),

          SizedBox(height: 12.h),

          // Description - DM Sans
          Text(
            'Find Your Partner with Dignity & Sunna.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'DM Sans',
              color: theme.colorScheme.onSurface.withValues(
                alpha: 0.7,
              ),
              fontSize: isWideScreen ? 16 : 15.sp,
              fontWeight: FontWeight.w500,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}

class _OverlayGoogleButton extends StatefulWidget {
  final AuthController authController;
  const _OverlayGoogleButton({required this.authController});

  @override
  State<_OverlayGoogleButton> createState() => _OverlayGoogleButtonState();
}

class _OverlayGoogleButtonState extends State<_OverlayGoogleButton> {
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
            Get.snackbar('Google Sign In', msg,
                snackPosition: SnackPosition.BOTTOM);
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
          // Visible layer: your exact custom button, purely visual
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
          // Invisible layer: real Google iframe, receives the actual tap
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
