import 'package:app/core/widgets/app_textarea.dart';
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

// ─── STEP 6: Lifestyle ───────────────────────────────────────────────────────
class LifestyleWidget extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final interests = opts?.interests ?? <String>[];
      final religion = controller.getForm('religion')?.toString() ?? 'Muslim';
      final relOpts = opts?.getRelationshipOptions(religion) ?? <String>[];
      final interestsList = controller.getForm('interests');
      final List<String> selectedInterests = interestsList is List
          ? interestsList.map((e) => e.toString()).toList()
          : <String>[];
      final theme = Theme.of(context);
      return StepCard(
        icon: Icons.auto_awesome_outlined,
        title: 'Lifestyle & About You',
        subtitle: 'Let matches know who you are',
        variant: StepCardVariant.primary,
        children: [
          // About Me
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('ABOUT ME (BIO)',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8,
                      color: theme.disabledColor)),
              Spacer(),
              GestureDetector(
                  onTap: controller.randomizeBio,
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
                value: controller.getForm('bio')?.toString() ?? '',
                onChanged: (v) => controller.setForm('bio', v),
                hintText: 'Tell potential matches about yourself...',
                maxLines: 4),
          ]),

          MultiChips(
              label: 'Interests & Hobbies',
              value: selectedInterests,
              onChange: (v) => controller.setForm('interests', v),
              options: interests,
              optional: true),

          ToggleGroup(
              label: 'Willing to Relocate?',
              value: controller.getForm('willing_to_relocate')?.toString() ??
                  'Maybe',
              onChange: (v) => controller.setForm('willing_to_relocate', v),
              options: [
                ToggleOption(value: 'Yes', label: 'Yes'),
                ToggleOption(value: 'No', label: 'No'),
                ToggleOption(value: 'Maybe', label: 'Maybe')
              ]),

          // Relationship Intent
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('RELATIONSHIP INTENT',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8,
                      color: theme.disabledColor)),
              Spacer(),
              GestureDetector(
                  onTap: controller.randomizeRelationship,
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
            RangeSelect(
                label: '',
                value: controller.getForm('relationship')?.toString() ?? '',
                onChange: (v) => controller.setForm('relationship', v),
                options: relOpts,
                placeholder: 'Select relationship intent',
                optional: true),
          ]),
        ],
      );
    });
  }
}
