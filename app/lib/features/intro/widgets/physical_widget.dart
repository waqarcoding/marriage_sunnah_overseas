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

// ─── STEP 4: Physical ────────────────────────────────────────────────────────
class PhysicalWidget extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final bodyTypes =
          opts?.bodyTypes ?? ['Slim', 'Athletic', 'Average', 'Curvy', 'Heavy'];
      final heightOpts = CompleteProfileController.heightOptions();
      return StepCard(
        icon: Icons.favorite_border,
        title: 'Physical Details',
        subtitle: 'Your appearance details',
        variant: StepCardVariant.primary,
        children: [
          RangeSelect(
              label: 'Height',
              value: controller.getForm('height_inches')?.toString() ?? '68',
              onChange: (v) => controller.setForm('height_inches', v),
              options: heightOpts,
              placeholder: 'Select height',
              note: 'Total inches e.g. 68 = 5\'8"'),
          RangeSelect(
              label: 'Body Type',
              value: controller.getForm('body_type')?.toString() ?? '',
              onChange: (v) => controller.setForm('body_type', v),
              options: bodyTypes,
              placeholder: 'Select body type'),
        ],
      );
    });
  }
}
