import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class AuroraBackground extends StatelessWidget {
  final Widget child;
  
  const AuroraBackground({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Base gradient background
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.backgroundStart,
                AppColors.backgroundMid,
                AppColors.backgroundEnd,
              ],
              stops: [0.0, 0.5, 1.0],
            ),
          ),
        ),
        
        // Primary Glow - Top Center
        Positioned(
          top: -300,
          left: MediaQuery.of(context).size.width / 2 - 500,
          child: Container(
            width: 1000,
            height: 1000,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.primaryGlow.withOpacity(0.14),
                  Colors.transparent,
                ],
                stops: [0.0, 0.7],
              ),
            ),
          ),
        ),
        
        // Secondary Glow - Bottom Right
        Positioned(
          bottom: -250,
          right: -150,
          child: Container(
            width: 700,
            height: 700,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.secondaryGlow.withOpacity(0.09),
                  Colors.transparent,
                ],
                stops: [0.0, 0.7],
              ),
            ),
          ),
        ),
        
        // Tertiary Glow - Top Left
        Positioned(
          top: MediaQuery.of(context).size.height * 0.2,
          left: -200,
          child: Container(
            width: 500,
            height: 500,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.tertiaryGlow.withOpacity(0.11),
                  Colors.transparent,
                ],
                stops: [0.0, 0.7],
              ),
            ),
          ),
        ),
        
        // Overlay Tint
        Container(
          decoration: BoxDecoration(
            color: AppColors.overlayTint.withOpacity(0.13),
          ),
        ),
        
        // Content
        child,
      ],
    );
  }
}
