import 'package:app/core/widgets/phone_field.dart';
import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:app/features/intro/widgets/career_widget.dart';
import 'package:app/features/intro/widgets/footer_widget.dart';
import 'package:app/features/intro/widgets/lifestyle_widget.dart';
import 'package:app/features/intro/widgets/location_widget.dart';
import 'package:app/features/intro/widgets/personal_widget.dart';
import 'package:app/features/intro/widgets/physical_widget.dart';
import 'package:app/features/intro/widgets/religion_widget.dart';
import 'package:app/features/intro/widgets/responsive_step_wrapper.dart';
import 'package:app/features/profile/controllers/intro_controller.dart';
import 'package:app/features/userprofile/widgets/media_section_widget.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/step_card.dart';
import '../../../../core/widgets/range_select.dart';
import '../../../../core/widgets/range_row.dart';
import '../../../../core/widgets/select_option.dart';
import '../../../../core/widgets/multi_chips.dart';
import '../../../../core/widgets/toggle_group.dart';
import '../../../../core/widgets/input_field.dart';
import '../../../../core/widgets/app_textarea.dart';

class CompleteProfilePage extends StatelessWidget {
  const CompleteProfilePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Get.put(CompleteProfileController());
    return _CompleteProfileView();
  }
}

class _CompleteProfileView extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    AuthController authController = Get.find<AuthController>();
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Obx(() {
        if (controller.isDone.value) authController.checkProfile(context);

        return Column(
          children: [
            _Header(),
            Expanded(
              child: Obx(() => _StepContent()),
            ),
            FooterWidget(),
          ],
        );
      }),
    );
  }

  gobackstep() {
    if (controller.currentStep.value > 1) {
      controller.currentStep.value--;
    } else {
      Get.back();
    }
  }
}

// ─── Header with progress bar ──────────────────────────────────────────────
class _Header extends GetView<CompleteProfileController> {
  static const _stepLabels = [
    'About You',
    'Location',
    'Religion',
    'Physical',
    'Career',
    'Lifestyle',
  ];

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final step = controller.currentStep.value;
      final progress = step / CompleteProfileController.totalSteps;

      return SafeArea(
          child: Container(
        color: Colors.white,
        child: Column(
          children: [
            // Current profile-page progress
            AnimatedContainer(
              margin: EdgeInsets.only(left: 20, right: 20, top: 20),
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeInOutCubic,
              height: 6,
              width: double.infinity,
              child: Stack(
                children: [
                  // Background track for subtle effect
                  Container(
                    width: double.infinity,
                    height: 6,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.14),
                      borderRadius: BorderRadius.circular(1.5),
                    ),
                  ),
                  // Animated foreground progress bar
                  AnimatedAlign(
                    duration: const Duration(milliseconds: 600),
                    curve: Curves.easeInOutCubic,
                    alignment: Alignment.centerLeft,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 600),
                      curve: Curves.easeInOutCubic,
                      width: (progress * MediaQuery.of(context).size.width)
                          .clamp(0.0, MediaQuery.of(context).size.width),
                      height: 6,
                      decoration: const BoxDecoration(
                        borderRadius: BorderRadius.all(Radius.circular(1.5)),
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primary,
                            Color(0xFF2d7a5e),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ));
    });
  }
}

// ─── Step content router ──────────────────────────────────────────────────
class _StepContent extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final step = controller.currentStep.value;
      if (controller.optsLoading.value && step == 6) {
        return Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text('Loading profile options…',
                style:
                    TextStyle(color: AppColors.mutedForeground, fontSize: 14)),
          ]),
        );
      }
      return Column(children: [
        if (step == 1) PersonalWidget(),
        if (step == 2) LocationWidget(),
        if (step == 3) ReligionWidget(),
        if (step == 4) PhysicalWidget(),
        if (step == 5) CareerWidget(),
        if (step == 6) LifestyleWidget(),
      ]);
    });
  }
}
