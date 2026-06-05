import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

enum StepCardVariant { primary, muted, accent }

class StepCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final StepCardVariant variant;
  final List<Widget> children;

  const StepCard({
    Key? key,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.variant = StepCardVariant.primary,
    required this.children,
  }) : super(key: key);

  Color _getBgColor() {
    switch (variant) {
      case StepCardVariant.primary:
        return Colors.white;
      case StepCardVariant.muted:
        return AppColors.secondary;
      case StepCardVariant.accent:
        return AppColors.accent.withOpacity(0.3);
    }
  }

  Color _getIconBgColor() {
    switch (variant) {
      case StepCardVariant.primary:
        return AppColors.primary.withOpacity(0.1);
      case StepCardVariant.muted:
        return AppColors.primary.withOpacity(0.08);
      case StepCardVariant.accent:
        return AppColors.accent;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _getBgColor(),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.border,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: Offset(0, 2),
          ),
        ],
      ),
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _getIconBgColor(),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 20),
          // Children with spacing
          ...children.map((child) => Padding(
                padding: EdgeInsets.only(bottom: 16),
                child: child,
              )),
        ],
      ),
    );
  }
}
