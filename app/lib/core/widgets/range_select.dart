import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class RangeSelect extends StatelessWidget {
  final String label;
  final String? value;
  final ValueChanged<String> onChange;
  final List<dynamic> options;
  final String placeholder;
  final bool optional;
  final String? note;

  const RangeSelect({
    Key? key,
    required this.label,
    this.value,
    required this.onChange,
    required this.options,
    this.placeholder = 'Select...',
    this.optional = false,
    this.note,
  }) : super(key: key);

  String _optionLabel(dynamic opt) {
    if (opt is Map) return opt['label']?.toString() ?? opt['value']?.toString() ?? opt.toString();
    return opt.toString();
  }

  String _optionValue(dynamic opt) {
    if (opt is Map) return opt['value']?.toString() ?? opt.toString();
    return opt.toString();
  }

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
                  style: TextStyle(fontSize: 11, color: AppColors.mutedForeground),
                ),
            ],
          ),
          SizedBox(height: 6),
        ],
        GestureDetector(
          onTap: () => _showBottomSheet(context),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 14, vertical: 13),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: value != null && value!.isNotEmpty
                    ? AppColors.primary.withOpacity(0.4)
                    : AppColors.border,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    value != null && value!.isNotEmpty ? value! : placeholder,
                    style: TextStyle(
                      fontSize: 14,
                      color: value != null && value!.isNotEmpty
                          ? AppColors.foreground
                          : AppColors.mutedForeground,
                    ),
                  ),
                ),
                Icon(Icons.keyboard_arrow_down_rounded,
                    color: AppColors.mutedForeground, size: 20),
              ],
            ),
          ),
        ),
        if (note != null) ...[
          SizedBox(height: 4),
          Text(note!,
              style: TextStyle(fontSize: 11, color: AppColors.mutedForeground)),
        ],
      ],
    );
  }

  void _showBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.65,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            Container(
              margin: EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: [
                  Text(label,
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary)),
                  Spacer(),
                  IconButton(
                      icon: Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(ctx)),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: options.length,
                itemBuilder: (ctx, i) {
                  final opt = options[i];
                  final optVal = _optionValue(opt);
                  final optLabel = _optionLabel(opt);
                  final isSelected = optVal == value;
                  return ListTile(
                    onTap: () {
                      onChange(optVal);
                      Navigator.pop(ctx);
                    },
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    tileColor: isSelected
                        ? AppColors.primary.withOpacity(0.08)
                        : null,
                    title: Text(
                      optLabel,
                      style: TextStyle(
                        fontSize: 14,
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.foreground,
                        fontWeight: isSelected
                            ? FontWeight.w600
                            : FontWeight.normal,
                      ),
                    ),
                    trailing: isSelected
                        ? Icon(Icons.check_circle,
                            color: AppColors.primary, size: 18)
                        : null,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
