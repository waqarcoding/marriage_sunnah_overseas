import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_navigation/src/snackbar/snackbar.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'auth_sheet.dart';

/// MSO-style welcome / register screen.
///
/// Fonts are loaded locally from assets:
/// - Playfair Display -> main tagline
/// - DM Sans -> body text and buttons
/// - round -> Varela Round
class WellcomePage extends StatelessWidget {
  const WellcomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
            // Infinitely scrolling product collage.
            SizedBox(
              height: 0.64.sh,
              width: double.infinity,
              child: const _Collage(),
            ),

            // Fade collage into the solid background.
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
              child: Column(
                children: [
                  const Spacer(),
                  _tagline(theme),
                  SizedBox(height: 28.h),
                  _actions(context, theme),
                  SizedBox(height: 16.h),
                  SizedBox(height: 8.h),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _actions(BuildContext context, ThemeData theme) {
    final primaryColor = theme.colorScheme.onSurface;
    final AuthController authController = Get.find<AuthController>();
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 20.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Continue with Google
          SizedBox(
            height: 54.h,
            child: ElevatedButton(
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
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    TextSpan(
                      text: 'Login',
                      style: TextStyle(
                        color: primaryColor,
                        fontSize: 14.sp,
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

  Widget _tagline(ThemeData theme) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      child: Column(
        children: [
          // Main heading - Varela Round
          Text(
            'Connect Hearts\nAcross Borders',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'round',
              color: theme.colorScheme.onSurface,
              fontSize: 40.sp,
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
              fontSize: 15.sp,
              fontWeight: FontWeight.w500,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}

/// Two rows of portrait product photos that scroll infinitely
/// in opposite directions.
class _Collage extends StatelessWidget {
  const _Collage();

  @override
  Widget build(BuildContext context) {
    final all = _extraImages;

    // First 3 images
    final rowA = all.take(3).toList();

    // Last 3 images
    final rowB = all.skip(3).toList();

    return Column(
      children: [
        Expanded(
          child: _MarqueeRow(
            urls: rowA,
            toLeft: false,
            speed: 18,
          ),
        ),
        SizedBox(height: 8.h),
        Expanded(
          child: _MarqueeRow(
            urls: rowB,
            toLeft: true,
            speed: 22,
          ),
        ),
      ],
    );
  }
}

/// A single horizontally self-scrolling,
/// seamlessly looping row.
class _MarqueeRow extends StatefulWidget {
  const _MarqueeRow({
    required this.urls,
    required this.toLeft,
    required this.speed,
  });

  final List<String> urls;

  /// When true the row moves left.
  /// When false the row moves right.
  final bool toLeft;

  /// Scroll speed in logical pixels per second.
  final double speed;

  @override
  State<_MarqueeRow> createState() => _MarqueeRowState();
}

class _MarqueeRowState extends State<_MarqueeRow>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tileW = 132.w;
    final gap = 8.w;
    final unit = tileW + gap;
    final setWidth = unit * widget.urls.length;

    // Keep a constant pixels-per-second speed.
    final seconds = (setWidth / widget.speed).clamp(8, 120).round();

    final wanted = Duration(
      seconds: seconds,
    );

    if (_controller.duration != wanted) {
      _controller.duration = wanted;

      _controller
        ..reset()
        ..repeat();
    }

    // Duplicate images for seamless infinite scrolling.
    final tiles = [
      ...widget.urls,
      ...widget.urls,
    ].map(
      (asset) {
        print(asset);
        return Padding(
          padding: EdgeInsets.symmetric(
            horizontal: gap / 2,
          ),
          child: SizedBox(
            width: tileW,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12.r),
              child: Image.asset(
                asset,
                width: tileW,
                height: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
          ),
        );
      },
    ).toList();

    return ClipRect(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final t = _controller.value;

          final dx = widget.toLeft ? -t * setWidth : (t - 1) * setWidth;

          return Transform.translate(
            offset: Offset(dx, 0),
            child: child,
          );
        },
        child: OverflowBox(
          alignment: Alignment.centerLeft,
          minWidth: 0,
          maxWidth: double.infinity,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: tiles,
          ),
        ),
      ),
    );
  }
}

/// Local fashion images.
///
/// Make sure these files exist:
///
/// assets/images/sample1.jpg
/// assets/images/sample2.jpg
/// assets/images/sample3.jpg
/// assets/images/sample4.jpg
/// assets/images/sample5.jpg
/// assets/images/sample6.jpg
const List<String> _extraImages = [
  'assets/images/sample1.jpg',
  'assets/images/sample2.jpg',
  'assets/images/sample3.jpg',
  'assets/images/sample4.jpg',
  'assets/images/sample5.jpg',
  'assets/images/sample6.jpg',
];
