import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class ToggleOption {
  final String value;
  final String label;

  const ToggleOption({required this.value, required this.label});
}

class ToggleGroup extends StatelessWidget {
  final String label;
  final String? value;
  final ValueChanged<String> onChange;
  final List<ToggleOption> options;
  final bool optional;

  const ToggleGroup({
    Key? key,
    required this.label,
    this.value,
    required this.onChange,
    required this.options,
    this.optional = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label.isNotEmpty) ...[
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
        ],
        Container(
          decoration: BoxDecoration(
            color: AppColors.secondary,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          padding: EdgeInsets.all(4),
          child: Row(
            children: options.map((opt) {
              final isSelected = opt.value == value;
              return Expanded(
                child: GestureDetector(
                  onTap: () => onChange(opt.value),
                  child: AnimatedContainer(
                    duration: Duration(milliseconds: 200),
                    padding: EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : Colors.transparent,
                      borderRadius: BorderRadius.circular(9),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.3),
                                blurRadius: 6,
                                offset: Offset(0, 2),
                              )
                            ]
                          : null,
                    ),
                    child: Center(
                      child: Text(
                        opt.label,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                          color: isSelected ? Colors.white : AppColors.mutedForeground,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}
