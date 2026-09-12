import 'package:app/core/widgets/phone_field.dart';
import 'package:app/core/widgets/single_photo_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/src/rx_flutter/rx_obx_widget.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/input_field.dart'; // your existing InputField
import '../../../core/widgets/step_card.dart'; // your existing StepCard

class GuardianProfileCard extends StatelessWidget {
  final dynamic controller; // your GuardianProfileController
  final String? photoUrl;
  final bool isPhotoUploading;
  final VoidCallback onPickPhoto;

  const GuardianProfileCard({
    Key? key,
    required this.controller,
    this.photoUrl,
    this.isPhotoUploading = false,
    required this.onPickPhoto,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StepCard(
      icon: Icons.shield_outlined,
      title: 'Guardian Details',
      subtitle: 'Basic information about the guardian',
      variant: StepCardVariant.primary,
      children: [
        // ── Profile Photo ─────────────────────────────────
        SingleProfilePhotoPicker(
          imageUrl: photoUrl,
          isUploading: isPhotoUploading,
          onTap: onPickPhoto,
        ),
        SizedBox(height: 20),

        // ── Full Name ──────────────────────────────────────
        InputField(
          label: 'Full Name',
          value: controller.getForm('guardian_name')?.toString() ?? '',
          onChange: (v) => controller.setForm('guardian_name', v),
          placeholder: 'Enter full name',
        ),
        SizedBox(height: 16),

        // ── Relationship to Applicant ─────────────────────
        InputField(
          label: 'Relationship',
          value: controller.getForm('relationship')?.toString() ?? '',
          onChange: (v) => controller.setForm('relationship', v),
          placeholder: 'e.g. Father, Brother, Uncle',
        ),
        SizedBox(height: 16),

        // ── Gender ─────────────────────────────────────────
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Gender',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.foreground,
              ),
            ),
            SizedBox(height: 8),
            Row(
              children: ['Male', 'Female'].map((g) {
                final isSelected = controller.getForm('guardian_gender') == g;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => controller.setForm('guardian_gender', g),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: EdgeInsets.only(right: g == 'Male' ? 8 : 0),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color:
                              isSelected ? AppColors.primary : AppColors.border,
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              g == 'Male' ? Icons.male : Icons.female,
                              size: 18,
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.foreground,
                            ),
                            SizedBox(width: 4),
                            Text(
                              g,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected
                                    ? FontWeight.w600
                                    : FontWeight.normal,
                                color: isSelected
                                    ? Colors.white
                                    : AppColors.foreground,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        SizedBox(height: 16),

        // ── Phone Number ───────────────────────────────────
        Obx(() {
          final phoneValue = controller.getForm('phone')?.toString() ?? '';
          return PhoneInputField(
            label: 'Phone Number',
            value: phoneValue,
            initialCountryCode: 'PK',
            optional: true,
            onChange: (fullNumber, countryCode, isValid) {
              controller.setForm('phone', fullNumber);
              controller.setForm('is_phone_valid', isValid);
            },
            placeholder: '+92 300 0000000',
          );
        }),
      ],
    );
  }
}
