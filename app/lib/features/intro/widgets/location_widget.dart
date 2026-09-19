import 'package:app/core/widgets/input_field.dart';
import 'package:app/core/widgets/multi_chips.dart';
import 'package:app/core/widgets/phone_field.dart';
import 'package:app/core/widgets/range_select.dart';
import 'package:app/core/widgets/select_option.dart';
import 'package:app/core/widgets/step_card.dart';
import 'package:app/core/widgets/toggle_group.dart';
import 'package:app/features/auth/pages/auth_sheet.dart';
import 'package:app/features/profile/controllers/intro_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/src/rx_flutter/rx_obx_widget.dart';
import 'package:get/get_state_manager/src/simple/get_view.dart';

// ─── STEP 2: Location ────────────────────────────────────────────────────────
class LocationWidget extends GetView<CompleteProfileController> {
  int _min(int a, int b) => a < b ? a : b;

  @override
  Widget build(BuildContext context) {
    controller.requestLocation();
    return Obx(() {
      final opts = controller.opts.value;
      final countries = opts?.countries ?? <String>[];
      final countryFlags = opts?.countryFlags ?? <String, String>{};
      final currentCountry =
          controller.getForm('country')?.toString() ?? 'Pakistan';
      final cities = opts?.getCities(currentCountry) ?? <String>[];
      final nats = opts?.getNationalities(currentCountry) ?? <String>[];
      final lat = controller.getForm('latitude');
      final lng = controller.getForm('longitude');
      final countryList =
          countries.map((c) => '${countryFlags[c] ?? "🌍"} $c').toList();
      final theme = Theme.of(context);
      return StepCard(
        icon: Icons.location_on_outlined,
        title: 'Location & Contact',
        subtitle: 'Where are you based?',
        variant: StepCardVariant.primary,
        children: [
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

          SelectOption(
              label: 'Country of Residence',
              value: () {
                final match = countryList.cast<String?>().firstWhere(
                      (c) => c != null && c.contains(currentCountry),
                      orElse: () => null,
                    );
                return match ?? currentCountry;
              }(),
              onChange: (v) {
                final country =
                    v.contains(' ') ? v.substring(v.indexOf(' ') + 1) : v;
                controller.handleCountryChange(country);
              },
              options: countryList.isNotEmpty
                  ? countryList
                  : ['🇵🇰 Pakistan', '🇦🇪 UAE', '🇬🇧 UK'],
              placeholder: 'Select country',
              customOption: true),

          cities.isNotEmpty
              ? SelectOption(
                  label: 'City',
                  value: controller.getForm('city')?.toString() ?? '',
                  onChange: (v) => controller.setForm('city', v),
                  options: cities,
                  placeholder: 'Select city',
                  customOption: true)
              : InputField(
                  label: 'City',
                  value: controller.getForm('city')?.toString() ?? '',
                  onChange: (v) => controller.setForm('city', v),
                  placeholder: 'e.g. Lahore, London'),

          SelectOption(
              label: 'Nationality',
              value: controller.getForm('nationality')?.toString() ?? '',
              onChange: (v) => controller.setForm('nationality', v),
              options:
                  nats.isNotEmpty ? nats : ['Pakistani', 'British', 'American'],
              placeholder: 'Select nationality',
              customOption: true),

          ToggleGroup(
              label: 'Hide Contact from Matches?',
              value: controller.getForm('contact_hidden')?.toString() ?? '1',
              onChange: (v) => controller.setForm('contact_hidden', v),
              options: [
                ToggleOption(value: '0', label: 'Visible'),
                ToggleOption(value: '1', label: 'Hidden')
              ]),

          // Location card
          Container(
            padding: EdgeInsets.all(14),
            decoration: BoxDecoration(
                color: theme.secondaryHeaderColor,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border)),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Text('Your Current Location',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: theme.disabledColor)),
                Spacer(),
                GestureDetector(
                    onTap: controller.requestLocation,
                    child: Text('Get My Location',
                        style: TextStyle(
                            fontSize: 12,
                            color: theme.primaryColor,
                            decoration: TextDecoration.underline))),
              ]),
              SizedBox(height: 8),
              lat != null && lng != null
                  ? Text(
                      'Lat: ${lat.toString().substring(0, _min(lat.toString().length, 8))}, '
                      'Lng: ${lng.toString().substring(0, _min(lng.toString().length, 8))}',
                      style:
                          TextStyle(fontSize: 12, color: theme.disabledColor))
                  : Text('Location not set yet.',
                      style:
                          TextStyle(fontSize: 12, color: theme.disabledColor)),
            ]),
          ),
        ],
      );
    });
  }
}
