import 'package:app/core/widgets/input_field.dart';
import 'package:app/core/widgets/multi_chips.dart';
import 'package:app/core/widgets/range_select.dart';
import 'package:app/core/widgets/select_option.dart';
import 'package:app/core/widgets/step_card.dart';
import 'package:app/core/widgets/toggle_group.dart';
import 'package:app/features/auth/pages/auth_sheet.dart';
import 'package:app/features/profile/controllers/intro_controller.dart';
import 'package:app/features/userprofile/widgets/media_section_widget.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/src/rx_flutter/rx_obx_widget.dart';
import 'package:get/get_state_manager/src/simple/get_view.dart';

// ─── STEP 1: Personal Details ────────────────────────────────────────────────
class PersonalWidget extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final marital = opts?.maritalStatuses ??
          ['Never Married', 'Divorced', 'Widowed', 'Separated'];
      final hasChildrenOpts =
          opts?.hasChildren ?? ['No Children', 'Has Children'];
      final maritalStatus =
          controller.getForm('marital_status')?.toString() ?? '';
      final hasChild = controller.getForm('has_children')?.toString() ?? '';
      final showChildren =
          ['Divorced', 'Widowed', 'Separated'].contains(maritalStatus);
      final dob = controller.getForm('date_of_birth')?.toString() ?? '';
      final age = controller.calcAge(dob);
      final theme = Theme.of(context);
      return StepCard(
        icon: Icons.person_outline,
        title: 'Personal Details',
        subtitle: 'Basic information about you',
        variant: StepCardVariant.primary,
        children: [
          // Gender selector
          MediaSectionWidget(
              hideprofeature: true,
              onCountChanged: (count) {
                print('Number of images selected: $count');
                controller.profileimagecount.value = count;
              }),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Gender',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: theme.disabledColor)),
            SizedBox(height: 8),
            // Cap width so pills don't balloon on wide desktop cards.
            ConstrainedBox(
              constraints: BoxConstraints(maxWidth: 320),
              child: Row(
                  children: ['Male', 'Female'].map((g) {
                final isSelected = controller.getForm('gender') == g;
                return Expanded(
                    child: GestureDetector(
                  onTap: () => controller.setForm('gender', g),
                  child: AnimatedContainer(
                    duration: Duration(milliseconds: 200),
                    margin: EdgeInsets.only(right: g == 'Male' ? 8 : 0),
                    padding: EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected ? theme.primaryColor : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: isSelected
                              ? theme.primaryColor
                              : theme.disabledColor,
                          width: isSelected ? 1.5 : 1),
                    ),
                    child: Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            g == 'Male' ? Icons.male : Icons.female,
                            size: 18,
                            color:
                                isSelected ? Colors.white : theme.primaryColor,
                          ),
                          SizedBox(width: 4),
                          Text(
                            g == 'Male' ? 'Male' : 'Female',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                              color: isSelected
                                  ? Colors.white
                                  : theme.primaryColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ));
              }).toList()),
            ),
            // Go back arrow
          ]),

          // DOB
          InputField(
              label: 'Date of Birth',
              type: 'date',
              value: dob,
              onChange: (v) => controller.setForm('date_of_birth', v),
              placeholder: 'Select date'),

          if (age != null)
            Padding(
                padding: EdgeInsets.only(top: 4),
                child: Text('Age: $age years',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: theme.primaryColor))),

          // Marital Status
          RangeSelect(
              label: 'Marital Status',
              customOption: false,
              value: maritalStatus,
              onChange: (v) {
                controller.setForm('marital_status', v);
                if (!['Divorced', 'Widowed', 'Separated'].contains(v)) {
                  controller.setForm('has_children', '');
                  controller.setForm('no_of_children', '');
                }
              },
              options: marital,
              placeholder: 'Select marital status'),

          if (showChildren) ...[
            RangeSelect(
                customOption: false,
                label: 'Have Children?',
                value: hasChild,
                onChange: (v) => controller.setForm('has_children', v),
                options: hasChildrenOpts,
                placeholder: 'Select'),
            if (hasChild == 'Has Children')
              InputField(
                  label: 'Number of Children',
                  value:
                      controller.getForm('no_of_children')?.toString() ?? '0',
                  onChange: (v) => controller.setForm('no_of_children', v),
                  placeholder: 'e.g. 2',
                  type: 'number',
                  optional: true),
          ],
        ],
      );
    });
  }
}
