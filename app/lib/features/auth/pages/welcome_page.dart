import 'package:app/core/widgets/terms.dart';
import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:app_component/widgets/image_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'auth_sheet.dart';
import 'package:app/features/auth/widgets/google_overlay_button_stub.dart'
    if (dart.library.js_interop) 'package:app/features/auth/widgets/google_overlay_button_web.dart';

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
  static const String _backgroundImage =
      'https://marriage-sunna-overseas.sgp1.cdn.digitaloceanspaces.com/assets/sample3.jpg';
  static const String _backgroundImagedesktop =
      'https://marriage-sunna-overseas.sgp1.cdn.digitaloceanspaces.com/assets/sample3.jpg';
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
            // Full-page background image.
            Positioned.fill(
              child: ImageWidget(
                path: isWideScreen ? _backgroundImagedesktop : _backgroundImage,
                sourceType: ImageSourceType.network,
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.cover,
                borderRadius: 0,
                isShimmer: true, // shimmer instead of spinkit while loading
                errorWidget: const Icon(Icons.broken_image,
                    color: Colors.grey, size: 32),
                onSuccess: () {
                  debugPrint('Image loaded successfully');
                },
                onError: (error, stackTrace) {
                  debugPrint('Image failed to load: $error');
                  // e.g. log to analytics/crash reporting
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
                      Padding(
                        padding: EdgeInsets.symmetric(
                            horizontal: 24.0, vertical: 8.0),
                        child: TermsText(),
                      ),
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
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Continue with Google
          SizedBox(
            height: 54.h,
            child: kIsWeb
                ? OverlayGoogleButton(authController: authController)
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
            alignment: Alignment.center,
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
