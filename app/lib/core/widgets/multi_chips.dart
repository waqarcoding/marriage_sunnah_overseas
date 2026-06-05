import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class MultiChips extends StatelessWidget {
  final String label;
  final List<String> value;
  final ValueChanged<List<String>> onChange;
  final List<String> options;
  final bool optional;

  const MultiChips({
    Key? key,
    required this.label,
    required this.value,
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
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: options.map((opt) {
            final isSelected = value.contains(opt);
            return GestureDetector(
              onTap: () {
                final newVal = List<String>.from(value);
                if (opt == 'No Preference') {
                  onChange(['No Preference']);
                  return;
                }
                if (isSelected) {
                  newVal.remove(opt);
                } else {
                  newVal.remove('No Preference');
                  newVal.add(opt);
                }
                onChange(newVal);
              },
              child: AnimatedContainer(
                duration: Duration(milliseconds: 200),
                padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.border,
                    width: isSelected ? 1.5 : 1,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.2),
                            blurRadius: 8,
                            offset: Offset(0, 2),
                          )
                        ]
                      : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isSelected) ...[
                      Icon(Icons.check, size: 12, color: Colors.white),
                      SizedBox(width: 4),
                    ],
                    Text(
                      opt,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                        color: isSelected ? Colors.white : AppColors.foreground,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
