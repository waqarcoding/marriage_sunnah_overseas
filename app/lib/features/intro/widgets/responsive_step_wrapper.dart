import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

/// Wraps step content so it's centered with a constrained width on
/// desktop, and full-width (unchanged) on mobile — same responsive
/// pattern used on the OTP page. Also locks text scaling so large
/// system font settings don't blow up spacing/overflow.
class ResponsiveStepWrapper extends StatelessWidget {
  final Widget child;
  final double widthFraction; // e.g. 0.7 = 70%
  final double desktopBreakpoint;
  final double minWidth; // floor so it doesn't get too narrow on 1025px windows
  final double maxWidth; // ceiling so it doesn't get huge on ultrawide monitors

  const ResponsiveStepWrapper({
    Key? key,
    required this.child,
    this.widthFraction = 0.7,
    this.desktopBreakpoint = 1024,
    this.minWidth = 480,
    this.maxWidth = 900,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MediaQuery(
      data: MediaQuery.of(context).copyWith(
        textScaler: const TextScaler.linear(1.0),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isDesktop = constraints.maxWidth > desktopBreakpoint;

          if (!isDesktop) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
              child: child,
            );
          }

          final targetWidth =
              (constraints.maxWidth * widthFraction).clamp(minWidth, maxWidth);

          return Container(
            width: double.infinity,
            color: AppColors.background,
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(0, 40, 0, 120),
              child: Center(
                child: SizedBox(
                  width: targetWidth,
                  child: Card(
                    elevation: 4,
                    color: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: child,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
