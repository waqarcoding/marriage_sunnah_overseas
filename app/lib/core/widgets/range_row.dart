import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import 'range_select.dart';

class RangeRow extends StatelessWidget {
  final String label;
  final String? minVal;
  final String? maxVal;
  final ValueChanged<String> onMinChange;
  final ValueChanged<String> onMaxChange;
  final List<dynamic> minOpts;
  final List<dynamic> maxOpts;
  final bool optional;

  const RangeRow({
    Key? key,
    required this.label,
    this.minVal,
    this.maxVal,
    required this.onMinChange,
    required this.onMaxChange,
    required this.minOpts,
    required this.maxOpts,
    this.optional = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.foreground,
              ),
            ),
            if (optional)
              Text(
                ' (optional)',
                style: TextStyle(
                  fontSize: 11,
                  color: AppColors.mutedForeground,
                ),
              ),
          ],
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Min',
                      style: TextStyle(
                          fontSize: 11, color: AppColors.mutedForeground)),
                  SizedBox(height: 4),
                  RangeSelect(
                    label: '',
                    value: minVal,
                    onChange: onMinChange,
                    options: minOpts,
                    placeholder: 'Min',
                  ),
                ],
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 12),
              child: Column(
                children: [
                  SizedBox(height: 15),
                  Text('—',
                      style: TextStyle(
                          color: AppColors.mutedForeground, fontSize: 16)),
                ],
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Max',
                      style: TextStyle(
                          fontSize: 11, color: AppColors.mutedForeground)),
                  SizedBox(height: 4),
                  RangeSelect(
                    label: '',
                    value: maxVal,
                    onChange: onMaxChange,
                    options: maxOpts,
                    placeholder: 'Max',
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
