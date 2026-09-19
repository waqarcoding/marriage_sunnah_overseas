// ─── STEP 5: Career ──────────────────────────────────────────────────────────
import 'package:app/core/widgets/range_select.dart';
import 'package:app/core/widgets/select_option.dart';
import 'package:app/core/widgets/step_card.dart';
import 'package:app/features/profile/controllers/intro_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/src/rx_flutter/rx_obx_widget.dart';
import 'package:get/get_state_manager/src/simple/get_view.dart';

import 'package:flutter/material.dart';

class CareerWidget extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final education = opts?.educationLevels ??
          ["High School", "Bachelor's", "Master's", "PhD"];
      final employment = opts?.employmentTypes ??
          ['Government', 'Private', 'Self-Employed', 'Business Owner'];
      final professions =
          opts?.professions ?? ['Doctor', 'Engineer', 'Teacher'];
      final country = controller.getForm('country')?.toString() ?? 'Pakistan';
      final salaries = opts?.getMonthlySalaries(country) ?? <String>[];
      final currency = opts?.getCurrency(country) ?? '';
      return StepCard(
        icon: Icons.work_outline,
        title: 'Education & Career',
        subtitle: 'Your professional background',
        variant: StepCardVariant.primary,
        children: [
          RangeSelect(
              label: 'Education Level',
              value: controller.getForm('education')?.toString() ?? '',
              onChange: (v) => controller.setForm('education', v),
              options: education,
              placeholder: 'Select education'),
          SelectOption(
              label: 'Profession / Job Title',
              value: controller.getForm('profession')?.toString() ?? '',
              onChange: (v) => controller.setForm('profession', v),
              options: professions,
              placeholder: 'Select profession',
              customOption: true),
          RangeSelect(
              label: 'Employment Type',
              value: controller.getForm('employment_type')?.toString() ?? '',
              onChange: (v) => controller.setForm('employment_type', v),
              options: employment,
              placeholder: 'Select employment type'),
          if (salaries.isNotEmpty)
            RangeSelect(
                label:
                    'Monthly Salary${currency.isNotEmpty ? " ($currency)" : ""}',
                value: controller.getForm('monthly_salary')?.toString() ?? '',
                onChange: (v) => controller.setForm('monthly_salary', v),
                options: salaries,
                placeholder: 'Select range',
                optional: true),
        ],
      );
    });
  }
}
