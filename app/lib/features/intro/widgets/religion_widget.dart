// ─── STEP 3: Religion ────────────────────────────────────────────────────────
import 'package:app/core/widgets/app_textarea.dart';
import 'package:app/core/widgets/input_field.dart';
import 'package:app/core/widgets/multi_chips.dart';
import 'package:app/core/widgets/range_select.dart';
import 'package:app/core/widgets/select_option.dart';
import 'package:app/core/widgets/step_card.dart';
import 'package:app/core/widgets/toggle_group.dart';
import 'package:app/features/auth/pages/auth_sheet.dart';
import 'package:app/features/profile/controllers/intro_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/src/rx_flutter/rx_obx_widget.dart';
import 'package:get/get_state_manager/src/simple/get_view.dart';

class ReligionWidget extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final religions =
          opts?.religions ?? ['Muslim', 'Christian', 'Hindu', 'Other'];
      final sects =
          opts?.sects ?? ['Sunni', 'Shia', 'Deobandi', 'Barelvi', 'Other'];
      final castes = opts?.castes ?? <String>[];
      final practiceLvls = opts?.practiceLevels ??
          ['Very Religious', 'Moderately Religious', 'Somewhat Religious'];
      final professions = opts?.professions ?? <String>[];
      final country = controller.getForm('country')?.toString() ?? 'Pakistan';
      final tongues = opts?.getMotherTongues(country) ??
          opts?.allMotherTongues ??
          <String>[];
      final religion = controller.getForm('religion')?.toString() ?? 'Muslim';
      final theme = Theme.of(context);

      return StepCard(
        icon: Icons.star_outline,
        title: 'Religion & Background',
        subtitle: 'Faith and cultural background',
        variant: StepCardVariant.primary,
        children: [
          RangeSelect(
              label: 'Religion',
              value: religion,
              onChange: (v) {
                controller.setForm('religion', v);
                if (v != 'Muslim')
                  controller.setForm('sect', '');
                else if (controller.getForm('sect')?.toString().isEmpty ?? true)
                  controller.setForm('sect', 'Sunni');
              },
              options: religions,
              placeholder: 'Select religion'),

          if (religion == 'Muslim')
            SelectOption(
                label: 'Sect',
                value: controller.getForm('sect')?.toString() ?? 'Sunni',
                onChange: (v) => controller.setForm('sect', v),
                options: sects,
                placeholder: 'Select sect',
                optional: true),

          RangeSelect(
              label: 'Religious Practice Level',
              value:
                  controller.getForm('religious_practice_level')?.toString() ??
                      '',
              onChange: (v) =>
                  controller.setForm('religious_practice_level', v),
              options: practiceLvls,
              placeholder: 'Select level'),

          SelectOption(
              label: 'Caste / Biradari',
              value: controller.getForm('caste')?.toString() ?? '',
              onChange: (v) => controller.setForm('caste', v),
              options: castes,
              placeholder: 'Select caste',
              optional: true,
              note: 'Optional — many families consider this',
              customOption: true),

          SelectOption(
              label: 'Mother Tongue',
              value: controller.getForm('mother_tongue')?.toString() ?? '',
              onChange: (v) => controller.setForm('mother_tongue', v),
              options: tongues,
              placeholder: 'Select language',
              optional: true,
              customOption: true),

          // Family Details section
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('FAMILY DETAILS',
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.8,
                    color: theme.disabledColor)),
            SizedBox(height: 12),
            SelectOption(
                label: "Father's Occupation",
                value:
                    controller.getForm('father_occupation')?.toString() ?? '',
                onChange: (v) => controller.setForm('father_occupation', v),
                options: [
                  'Passed Away',
                  ...professions.isNotEmpty
                      ? professions
                      : ['Doctor', 'Engineer', 'Teacher', 'Business Owner']
                ],
                placeholder: 'Select profession',
                note: "Select 'Passed Away' if applicable",
                customOption: true),
            SizedBox(height: 16),
            SelectOption(
                label: "Mother's Occupation",
                value: controller.getForm('mother_occupation')?.toString() ??
                    'Housewife',
                onChange: (v) => controller.setForm('mother_occupation', v),
                options: [
                  'Housewife',
                  'Passed Away',
                  ...professions.isNotEmpty
                      ? professions
                      : ['Doctor', 'Engineer', 'Teacher']
                ],
                placeholder: 'Select profession',
                note: 'Default: Housewife',
                customOption: true),
            SizedBox(height: 16),
            Row(children: [
              Expanded(
                  child: InputField(
                      label: 'No. of Brothers',
                      value: controller.getForm('brothers')?.toString() ?? '',
                      onChange: (v) => controller.setForm('brothers', v),
                      placeholder: 'e.g. 2',
                      type: 'number')),
              SizedBox(width: 16),
              Expanded(
                  child: InputField(
                      label: 'No. of Sisters',
                      value: controller.getForm('sisters')?.toString() ?? '',
                      onChange: (v) => controller.setForm('sisters', v),
                      placeholder: 'e.g. 1',
                      type: 'number')),
            ]),
          ]),

          // Family Background
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('FAMILY BACKGROUND',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8,
                      color: theme.disabledColor)),
              Spacer(),
              GestureDetector(
                  onTap: controller.randomizeFamilyBackground,
                  child: Row(children: [
                    Icon(Icons.refresh, size: 12, color: theme.primaryColor),
                    SizedBox(width: 4),
                    Text('Random',
                        style: TextStyle(
                            fontSize: 12,
                            color: theme.primaryColor,
                            decoration: TextDecoration.underline)),
                  ])),
            ]),
            SizedBox(height: 8),
            AppTextArea(
                value:
                    controller.getForm('family_background')?.toString() ?? '',
                onChanged: (v) => controller.setForm('family_background', v),
                hintText:
                    'Brief description of your family background, values and traditions...',
                maxLines: 3),
          ]),
        ],
      );
    });
  }
}
