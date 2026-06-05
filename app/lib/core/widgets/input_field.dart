import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';

class InputField extends StatelessWidget {
  final String label;
  final String? value;
  final ValueChanged<String> onChange;
  final String placeholder;
  final TextInputType keyboardType;
  final bool optional;
  final int? max;
  final int? maxLength;
  final int? minLines;
  final int? maxLines;
  final bool readOnly;
  final String? type; // 'date', 'number', 'tel', etc.

  const InputField({
    Key? key,
    required this.label,
    this.value,
    required this.onChange,
    this.placeholder = '',
    this.keyboardType = TextInputType.text,
    this.optional = false,
    this.max,
    this.maxLength,
    this.minLines,
    this.maxLines = 1,
    this.readOnly = false,
    this.type,
  }) : super(key: key);

  TextInputType _getKeyboardType() {
    if (type == 'number') return TextInputType.number;
    if (type == 'tel') return TextInputType.phone;
    if (type == 'date') return TextInputType.datetime;
    return keyboardType;
  }

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
        SizedBox(height: 6),
        type == 'date'
            ? _buildDateField(context)
            : TextFormField(
                initialValue: value,
                onChanged: onChange,
                keyboardType: _getKeyboardType(),
                readOnly: readOnly,
                minLines: minLines,
                maxLines: maxLines,
                maxLength: maxLength ?? max,
                inputFormatters: type == 'number'
                    ? [FilteringTextInputFormatter.digitsOnly]
                    : null,
                decoration: InputDecoration(
                  hintText: placeholder,
                  hintStyle:
                      TextStyle(color: AppColors.mutedForeground, fontSize: 14),
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                  counterText: '',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        BorderSide(color: AppColors.primary, width: 1.5),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                ),
                style: TextStyle(fontSize: 14, color: AppColors.foreground),
              ),
      ],
    );
  }

  Widget _buildDateField(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final DateTime? picked = await showDatePicker(
          context: context,
          initialDate: value != null && value!.isNotEmpty
              ? DateTime.tryParse(value!) ?? DateTime(1990)
              : DateTime(1990),
          firstDate: DateTime(1940),
          lastDate: DateTime.now().subtract(Duration(days: 365 * 18)),
          builder: (ctx, child) {
            return Theme(
              data: Theme.of(ctx).copyWith(
                colorScheme: ColorScheme.light(
                  primary: AppColors.primary,
                  onPrimary: Colors.white,
                  surface: Colors.white,
                ),
              ),
              child: child!,
            );
          },
        );
        if (picked != null) {
          onChange(
              '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}');
        }
      },
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
            Icon(Icons.calendar_today_outlined,
                size: 18, color: AppColors.mutedForeground),
          ],
        ),
      ),
    );
  }
}
