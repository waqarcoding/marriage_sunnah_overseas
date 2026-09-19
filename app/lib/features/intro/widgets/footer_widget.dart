import 'package:app/core/widgets/multi_chips.dart';
import 'package:app/core/widgets/range_select.dart';
import 'package:app/core/widgets/select_option.dart';
import 'package:app/core/widgets/step_card.dart';
import 'package:app/core/widgets/toggle_group.dart';
import 'package:app/features/auth/pages/auth_sheet.dart';
import 'package:app/features/profile/controllers/intro_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_navigation/src/extension_navigation.dart';
import 'package:get/get_navigation/src/snackbar/snackbar.dart';
import 'package:get/get_state_manager/src/rx_flutter/rx_obx_widget.dart';
import 'package:get/get_state_manager/src/simple/get_view.dart';

// ─── Footer ──────────────────────────────────────────────────────────────────
class FooterWidget extends GetView<CompleteProfileController> {
  static const _stepLabels = [
    'Continue to Location',
    'Continue to Religion',
    'Continue to Physical',
    'Continue to Career',
    'Continue to Lifestyle',
    'Save Lifestyle'
  ];

  void _handleNext() {
    final step = controller.currentStep.value;
    final missing = controller.validateStep(step);
    if (missing.isNotEmpty) {
      Get.snackbar('Required Fields', 'Please fill in: ${missing.join(", ")}',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Color(0xFFFFE4E6),
          colorText: Color(0xFF7F1D1D),
          margin: EdgeInsets.all(16),
          borderRadius: 12);
      return;
    }
    if (step == CompleteProfileController.totalSteps)
      controller.submit();
    else
      controller.currentStep.value++;
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final step = controller.currentStep.value;
      final isLast = step == CompleteProfileController.totalSteps;
      final isSaving = controller.isSaving.value;
      final theme = Theme.of(context);
      return Container(
        padding: EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: AppColors.border))),
        child: SafeArea(
            top: false,
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              if (controller.errorMessage.value.isNotEmpty)
                Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(12),
                    margin: EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                        color: Color(0xFFFFE4E6),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Color(0xFFFECDD3))),
                    child: Text(controller.errorMessage.value,
                        style:
                            TextStyle(color: Color(0xFF7F1D1D), fontSize: 13))),
              Row(
                children: [
                  // Go back button, only show if not first step and not saving
                  if (step > 1 && !isSaving)
                    Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: GestureDetector(
                        onTap: () {
                          if (controller.currentStep.value > 1) {
                            controller.currentStep.value--;
                          } else {
                            Get.back();
                          }
                        },
                        child: Container(
                          decoration: BoxDecoration(
                              color: theme.primaryColor.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(10)),
                          padding: EdgeInsets.symmetric(
                              horizontal: 10, vertical: 10),
                          child: Icon(Icons.arrow_back_ios_new_rounded,
                              color: theme.primaryColor, size: 20),
                        ),
                      ),
                    ),
                  // Expanded next/save button
                  Expanded(
                    child: GestureDetector(
                      onTap: isSaving ? null : _handleNext,
                      child: AnimatedContainer(
                        duration: Duration(milliseconds: 200),
                        width: double.infinity,
                        padding: EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          gradient: isSaving
                              ? null
                              : LinearGradient(colors: [
                                  theme.primaryColor,
                                  Color(0xFF2d7a5e)
                                ]),
                          color: isSaving ? Colors.grey[400] : null,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                                color: theme.primaryColor.withOpacity(0.3),
                                blurRadius: 12,
                                offset: Offset(0, 4))
                          ],
                        ),
                        child: Center(
                            child: isSaving
                                ? Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                        SizedBox(
                                            width: 18,
                                            height: 18,
                                            child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                                valueColor:
                                                    AlwaysStoppedAnimation(
                                                        Colors.white))),
                                        SizedBox(width: 10),
                                        Text('Saving your profile...',
                                            style: TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.w600,
                                                fontSize: 15)),
                                      ])
                                : Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                        if (isLast) ...[
                                          Icon(Icons.check,
                                              color: Colors.white, size: 18),
                                          SizedBox(width: 8)
                                        ],
                                        Text(
                                            isLast
                                                ? 'Save Preferences & Go Live'
                                                : _stepLabels[step - 1],
                                            style: TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.w600,
                                                fontSize: 15)),
                                        if (!isLast) ...[
                                          SizedBox(width: 8),
                                          Icon(Icons.chevron_right,
                                              color: Colors.white, size: 18)
                                        ],
                                      ])),
                      ),
                    ),
                  ),
                ],
              ),
            ])),
      );
    });
  }
}
