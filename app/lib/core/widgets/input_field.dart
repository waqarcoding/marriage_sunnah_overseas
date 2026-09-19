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
            : MouseRegion(
                cursor: readOnly
                    ? SystemMouseCursors.basic
                    : SystemMouseCursors.text,
                child: TextFormField(
                  initialValue: value,
                  onChanged: onChange,
                  keyboardType: _getKeyboardType(),
                  readOnly: readOnly,
                  minLines: minLines,
                  maxLines: maxLines,
                  maxLength: maxLength ?? max,
                  // Lets desktop users submit with Enter/Tab instead of
                  // only relying on an on-screen action.
                  textInputAction: (maxLines ?? 1) > 1
                      ? TextInputAction.newline
                      : TextInputAction.next,
                  inputFormatters: type == 'number'
                      ? [FilteringTextInputFormatter.digitsOnly]
                      : null,
                  decoration: InputDecoration(
                    hintText: placeholder,
                    hintStyle: TextStyle(
                        color: AppColors.mutedForeground, fontSize: 14),
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
              ),
      ],
    );
  }

  Widget _buildDateField(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _openDatePicker(context),
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
        ),
      ),
    );
  }

  Future<void> _openDatePicker(BuildContext context) async {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= 700;

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: value != null && value!.isNotEmpty
          ? DateTime.tryParse(value!) ?? DateTime(1990)
          : DateTime(1990),
      firstDate: DateTime(1940),
      lastDate: DateTime.now().subtract(Duration(days: 365 * 18)),
      // On desktop, a compact calendar-grid dialog reads better than the
      // mobile-oriented spinner/input entry mode.
      initialEntryMode: isDesktop
          ? DatePickerEntryMode.calendarOnly
          : DatePickerEntryMode.calendar,
      builder: (ctx, child) {
        final theme = Theme.of(ctx).copyWith(
          colorScheme: ColorScheme.light(
            primary: AppColors.primary,
            onPrimary: Colors.white,
            surface: Colors.white,
          ),
          // The app's global theme (larger icon size / comfortable density)
          // was leaking into the picker and blowing up the prev/next/dropdown
          // arrows. Pin these back to Material's normal defaults for the
          // dialog only.
          iconTheme: const IconThemeData(size: 24),
          visualDensity: VisualDensity.standard,
          iconButtonTheme: IconButtonThemeData(
            style: IconButton.styleFrom(
              iconSize: 24,
              minimumSize: const Size(40, 40),
            ),
          ),
        );

        return Theme(
          data: theme,
          // Also ignore any app-wide text scaling so the header/arrows
          // don't get scaled up along with body text elsewhere in the app.
          child: MediaQuery(
            data: MediaQuery.of(ctx).copyWith(
              textScaler: const TextScaler.linear(1.0),
            ),
            child: child!,
          ),
        );
      },
    );
    if (picked != null) {
      onChange(
          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}');
    }
  }
}
