import 'package:flutter/material.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:intl_phone_field/phone_number.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart'; // for fontSans constant

class PhoneInputField extends StatelessWidget {
  final String label;
  final String? value;
  final void Function(String fullNumber, String countryCode, bool isValid)
      onChange;
  final String placeholder;
  final bool optional;
  final String initialCountryCode;
  final bool readOnly;

  const PhoneInputField({
    Key? key,
    required this.label,
    this.value,
    required this.onChange,
    this.placeholder = 'Enter phone number',
    this.optional = false,
    this.initialCountryCode = 'PK',
    this.readOnly = false,
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
                fontFamily: AppTheme.fontSans,
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.foreground,
              ),
            ),
            if (optional)
              Text(
                ' (optional)',
                style: TextStyle(
                  fontFamily: AppTheme.fontSans,
                  fontSize: 11,
                  color: AppColors.mutedForeground,
                ),
              ),
          ],
        ),
        SizedBox(height: 6),
        IntlPhoneField(
          enabled: !readOnly,
          initialCountryCode: initialCountryCode,
          initialValue: value,
          dropdownTextStyle: TextStyle(
            fontSize: 14,
            color: AppColors.foreground,
          ),
          style: TextStyle(
            fontFamily: AppTheme.fontSans,
            fontSize: 14, // ← controls the typed number's size
            color: AppColors.foreground,
          ),
          decoration: InputDecoration(
            hintText: placeholder,
            hintStyle: TextStyle(
              fontFamily: AppTheme.fontSans,
              color: AppColors.mutedForeground,
              fontSize: 14,
            ),
            contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 13),
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
              borderSide: BorderSide(color: AppColors.primary, width: 1.5),
            ),
            filled: true,
            fillColor: Colors.white,
          ),
          dropdownIconPosition: IconPosition.trailing,
          flagsButtonPadding: const EdgeInsets.only(left: 12),
          onChanged: (PhoneNumber phone) {
            final isValid =
                phone.number.length >= 6 && phone.number.length <= 15;
            onChange(phone.completeNumber, phone.countryISOCode, isValid);
          },
        ),
      ],
    );
  }
}
