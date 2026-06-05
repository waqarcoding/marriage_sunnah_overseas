import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/step_card.dart';
import '../../../core/widgets/range_select.dart';
import '../../../core/widgets/range_row.dart';
import '../../../core/widgets/select_option.dart';
import '../../../core/widgets/multi_chips.dart';
import '../../../core/widgets/toggle_group.dart';
import '../../../core/widgets/input_field.dart';
import '../../../core/widgets/app_textarea.dart';
import '../controllers/complete_profile_controller.dart';

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
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Obx(() {
        if (controller.isDone.value) return _DoneScreen();
        return Column(
          children: [
            _Header(),
            Expanded(
              child: Obx(() => AnimatedSwitcher(
                duration: Duration(milliseconds: 280),
                transitionBuilder: (child, anim) => SlideTransition(
                  position: Tween<Offset>(
                    begin: Offset(0.04, 0),
                    end: Offset.zero,
                  ).animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic)),
                  child: FadeTransition(opacity: anim, child: child),
                ),
                child: KeyedSubtree(
                  key: ValueKey(controller.currentStep.value),
                  child: _StepContent(),
                ),
              )),
            ),
            _Footer(),
          ],
        );
      }),
    );
  }
}

// ─── Header with progress bar ──────────────────────────────────────────────
class _Header extends GetView<CompleteProfileController> {
  static const _stepLabels = [
    'About You','Location','Religion','Physical','Career','Lifestyle','Preferences'
  ];

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final step = controller.currentStep.value;
      final progress = step / CompleteProfileController.totalSteps;
      return Container(
        color: Colors.white,
        child: Column(
          children: [
            SafeArea(
              bottom: false,
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () => step > 1 ? controller.currentStep.value-- : Get.back(),
                      child: Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.secondary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(Icons.chevron_left, color: AppColors.foreground),
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_stepLabels[step - 1],
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.cardForeground)),
                          Text('Step $step of ${CompleteProfileController.totalSteps}',
                              style: TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: progress),
              duration: Duration(milliseconds: 300),
              builder: (_, val, __) => SizedBox(
                height: 3, width: double.infinity,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: FractionallySizedBox(
                    widthFactor: val,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: [AppColors.primary, Color(0xFF2d7a5e)]),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }
}

// ─── Step content router ──────────────────────────────────────────────────
class _StepContent extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final step = controller.currentStep.value;
      if (controller.optsLoading.value && step == 7) {
        return Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text('Loading profile options…',
                style: TextStyle(color: AppColors.mutedForeground, fontSize: 14)),
          ]),
        );
      }
      return SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(16, 16, 16, 120),
        child: Column(children: [
          if (step == 1) _Step1(),
          if (step == 2) _Step2(),
          if (step == 3) _Step3(),
          if (step == 4) _Step4(),
          if (step == 5) _Step5(),
          if (step == 6) _Step6(),
          if (step == 7) _Step7(),
        ]),
      );
    });
  }
}

// ─── STEP 1: Personal Details ────────────────────────────────────────────────
class _Step1 extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final marital = opts?.maritalStatuses ?? ['Never Married','Divorced','Widowed','Separated'];
      final hasChildrenOpts = opts?.hasChildren ?? ['No Children','Has Children'];
      final maritalStatus = controller.getForm('marital_status')?.toString() ?? '';
      final hasChild = controller.getForm('has_children')?.toString() ?? '';
      final showChildren = ['Divorced','Widowed','Separated'].contains(maritalStatus);
      final dob = controller.getForm('date_of_birth')?.toString() ?? '';
      final age = controller.calcAge(dob);

      return StepCard(
        icon: Icons.person_outline,
        title: 'Personal Details',
        subtitle: 'Basic information about you',
        variant: StepCardVariant.primary,
        children: [
          // Gender selector
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Gender', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.foreground)),
            SizedBox(height: 8),
            Row(children: ['Male','Female'].map((g) {
              final isSelected = controller.getForm('gender') == g;
              return Expanded(child: GestureDetector(
                onTap: () => controller.setForm('gender', g),
                child: AnimatedContainer(
                  duration: Duration(milliseconds: 200),
                  margin: EdgeInsets.only(right: g == 'Male' ? 8 : 0),
                  padding: EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isSelected ? AppColors.primary : AppColors.border, width: isSelected ? 1.5 : 1),
                  ),
                  child: Center(child: Text(g == 'Male' ? '♂ Male' : '♀ Female',
                      style: TextStyle(fontSize: 14, fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                          color: isSelected ? Colors.white : AppColors.foreground))),
                ),
              ));
            }).toList()),
          ]),

          // DOB
          InputField(label: 'Date of Birth', type: 'date', value: dob,
              onChange: (v) => controller.setForm('date_of_birth', v), placeholder: 'Select date'),

          if (age != null)
            Padding(padding: EdgeInsets.only(top: 4),
                child: Text('Age: $age years',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.primary))),

          // Marital Status
          RangeSelect(label: 'Marital Status', value: maritalStatus,
              onChange: (v) {
                controller.setForm('marital_status', v);
                if (!['Divorced','Widowed','Separated'].contains(v)) {
                  controller.setForm('has_children', '');
                  controller.setForm('no_of_children', '');
                }
              }, options: marital, placeholder: 'Select marital status'),

          if (showChildren) ...[
            RangeSelect(label: 'Have Children?', value: hasChild,
                onChange: (v) => controller.setForm('has_children', v),
                options: hasChildrenOpts, placeholder: 'Select'),
            if (hasChild == 'Has Children')
              InputField(label: 'Number of Children',
                  value: controller.getForm('no_of_children')?.toString() ?? '',
                  onChange: (v) => controller.setForm('no_of_children', v),
                  placeholder: 'e.g. 2', type: 'number', optional: true),
          ],
        ],
      );
    });
  }
}

// ─── STEP 2: Location ────────────────────────────────────────────────────────
class _Step2 extends GetView<CompleteProfileController> {
  int _min(int a, int b) => a < b ? a : b;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final countries = opts?.countries ?? <String>[];
      final countryFlags = opts?.countryFlags ?? <String, String>{};
      final currentCountry = controller.getForm('country')?.toString() ?? 'Pakistan';
      final cities = opts?.getCities(currentCountry) ?? <String>[];
      final nats = opts?.getNationalities(currentCountry) ?? <String>[];
      final lat = controller.getForm('latitude');
      final lng = controller.getForm('longitude');
      final countryList = countries.map((c) => '${countryFlags[c] ?? "🌍"} $c').toList();

      return StepCard(
        icon: Icons.location_on_outlined, title: 'Location & Contact',
        subtitle: 'Where are you based?', variant: StepCardVariant.muted,
        children: [
          InputField(label: 'Phone Number', value: controller.getForm('phone')?.toString() ?? '',
              onChange: (v) => controller.setForm('phone', v),
              placeholder: '+92 300 0000000', type: 'tel', optional: true),

          SelectOption(label: 'Country of Residence',
              value: () {
                final match = countryList.firstWhereOrNull((c) => c.contains(currentCountry));
                return match ?? currentCountry;
              }(),
              onChange: (v) {
                final country = v.contains(' ') ? v.substring(v.indexOf(' ') + 1) : v;
                controller.handleCountryChange(country);
              },
              options: countryList.isNotEmpty ? countryList : ['🇵🇰 Pakistan','🇦🇪 UAE','🇬🇧 UK'],
              placeholder: 'Select country', customOption: true),

          cities.isNotEmpty
              ? SelectOption(label: 'City', value: controller.getForm('city')?.toString() ?? '',
                  onChange: (v) => controller.setForm('city', v),
                  options: cities, placeholder: 'Select city', customOption: true)
              : InputField(label: 'City', value: controller.getForm('city')?.toString() ?? '',
                  onChange: (v) => controller.setForm('city', v), placeholder: 'e.g. Lahore, London'),

          SelectOption(label: 'Nationality', value: controller.getForm('nationality')?.toString() ?? '',
              onChange: (v) => controller.setForm('nationality', v),
              options: nats.isNotEmpty ? nats : ['Pakistani','British','American'],
              placeholder: 'Select nationality', customOption: true),

          ToggleGroup(label: 'Hide Contact from Matches?',
              value: controller.getForm('contact_hidden')?.toString() ?? '1',
              onChange: (v) => controller.setForm('contact_hidden', v),
              options: [ToggleOption(value: '0', label: 'Visible'), ToggleOption(value: '1', label: 'Hidden')]),

          // Location card
          Container(
            padding: EdgeInsets.all(14),
            decoration: BoxDecoration(color: AppColors.secondary,
                borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Text('Your Current Location',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.cardForeground)),
                Spacer(),
                GestureDetector(onTap: controller.requestLocation,
                    child: Text('Get My Location',
                        style: TextStyle(fontSize: 12, color: AppColors.primary, decoration: TextDecoration.underline))),
              ]),
              SizedBox(height: 8),
              lat != null && lng != null
                  ? Text('Lat: ${lat.toString().substring(0, _min(lat.toString().length, 8))}, '
                      'Lng: ${lng.toString().substring(0, _min(lng.toString().length, 8))}',
                      style: TextStyle(fontSize: 12, color: AppColors.mutedForeground))
                  : Text('Location not set yet.',
                      style: TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
            ]),
          ),
        ],
      );
    });
  }
}

// ─── STEP 3: Religion ────────────────────────────────────────────────────────
class _Step3 extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final religions = opts?.religions ?? ['Muslim','Christian','Hindu','Other'];
      final sects = opts?.sects ?? ['Sunni','Shia','Deobandi','Barelvi','Other'];
      final castes = opts?.castes ?? <String>[];
      final practiceLvls = opts?.practiceLevels ?? ['Very Religious','Moderately Religious','Somewhat Religious'];
      final professions = opts?.professions ?? <String>[];
      final country = controller.getForm('country')?.toString() ?? 'Pakistan';
      final tongues = opts?.getMotherTongues(country) ?? opts?.allMotherTongues ?? <String>[];
      final religion = controller.getForm('religion')?.toString() ?? 'Muslim';

      return StepCard(
        icon: Icons.star_outline, title: 'Religion & Background',
        subtitle: 'Faith and cultural background', variant: StepCardVariant.accent,
        children: [
          RangeSelect(label: 'Religion', value: religion,
              onChange: (v) {
                controller.setForm('religion', v);
                if (v != 'Muslim') controller.setForm('sect', '');
                else if (controller.getForm('sect')?.toString().isEmpty ?? true) controller.setForm('sect', 'Sunni');
              }, options: religions, placeholder: 'Select religion'),

          if (religion == 'Muslim')
            SelectOption(label: 'Sect', value: controller.getForm('sect')?.toString() ?? 'Sunni',
                onChange: (v) => controller.setForm('sect', v),
                options: sects, placeholder: 'Select sect', optional: true),

          RangeSelect(label: 'Religious Practice Level',
              value: controller.getForm('religious_practice_level')?.toString() ?? '',
              onChange: (v) => controller.setForm('religious_practice_level', v),
              options: practiceLvls, placeholder: 'Select level'),

          SelectOption(label: 'Caste / Biradari', value: controller.getForm('caste')?.toString() ?? '',
              onChange: (v) => controller.setForm('caste', v), options: castes,
              placeholder: 'Select caste', optional: true,
              note: 'Optional — many families consider this', customOption: true),

          SelectOption(label: 'Mother Tongue', value: controller.getForm('mother_tongue')?.toString() ?? '',
              onChange: (v) => controller.setForm('mother_tongue', v),
              options: tongues, placeholder: 'Select language', optional: true, customOption: true),

          // Family Details section
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('FAMILY DETAILS',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8, color: AppColors.mutedForeground)),
            SizedBox(height: 12),
            SelectOption(label: "Father's Occupation",
                value: controller.getForm('father_occupation')?.toString() ?? '',
                onChange: (v) => controller.setForm('father_occupation', v),
                options: ['Passed Away', ...professions.isNotEmpty ? professions : ['Doctor','Engineer','Teacher','Business Owner']],
                placeholder: 'Select profession', note: "Select 'Passed Away' if applicable", customOption: true),
            SizedBox(height: 16),
            SelectOption(label: "Mother's Occupation",
                value: controller.getForm('mother_occupation')?.toString() ?? 'Housewife',
                onChange: (v) => controller.setForm('mother_occupation', v),
                options: ['Housewife','Passed Away',...professions.isNotEmpty ? professions : ['Doctor','Engineer','Teacher']],
                placeholder: 'Select profession', note: 'Default: Housewife', customOption: true),
            SizedBox(height: 16),
            Row(children: [
              Expanded(child: InputField(label: 'No. of Brothers',
                  value: controller.getForm('brothers')?.toString() ?? '',
                  onChange: (v) => controller.setForm('brothers', v), placeholder: 'e.g. 2', type: 'number')),
              SizedBox(width: 16),
              Expanded(child: InputField(label: 'No. of Sisters',
                  value: controller.getForm('sisters')?.toString() ?? '',
                  onChange: (v) => controller.setForm('sisters', v), placeholder: 'e.g. 1', type: 'number')),
            ]),
          ]),

          // Family Background
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('FAMILY BACKGROUND',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8, color: AppColors.mutedForeground)),
              Spacer(),
              GestureDetector(onTap: controller.randomizeFamilyBackground,
                  child: Row(children: [
                    Icon(Icons.refresh, size: 12, color: AppColors.primary), SizedBox(width: 4),
                    Text('Random', style: TextStyle(fontSize: 12, color: AppColors.primary, decoration: TextDecoration.underline)),
                  ])),
            ]),
            SizedBox(height: 8),
            AppTextArea(value: controller.getForm('family_background')?.toString() ?? '',
                onChanged: (v) => controller.setForm('family_background', v),
                hintText: 'Brief description of your family background, values and traditions...', maxLines: 3),
          ]),
        ],
      );
    });
  }
}

// ─── STEP 4: Physical ────────────────────────────────────────────────────────
class _Step4 extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final bodyTypes = opts?.bodyTypes ?? ['Slim','Athletic','Average','Curvy','Heavy'];
      final heightOpts = CompleteProfileController.heightOptions();
      return StepCard(
        icon: Icons.favorite_border, title: 'Physical Details',
        subtitle: 'Your appearance details', variant: StepCardVariant.primary,
        children: [
          RangeSelect(label: 'Height', value: controller.getForm('height_inches')?.toString() ?? '68',
              onChange: (v) => controller.setForm('height_inches', v),
              options: heightOpts, placeholder: 'Select height', note: 'Total inches e.g. 68 = 5\'8"'),
          RangeSelect(label: 'Body Type', value: controller.getForm('body_type')?.toString() ?? '',
              onChange: (v) => controller.setForm('body_type', v),
              options: bodyTypes, placeholder: 'Select body type'),
        ],
      );
    });
  }
}

// ─── STEP 5: Career ──────────────────────────────────────────────────────────
class _Step5 extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final education = opts?.educationLevels ?? ["High School","Bachelor's","Master's","PhD"];
      final employment = opts?.employmentTypes ?? ['Government','Private','Self-Employed','Business Owner'];
      final professions = opts?.professions ?? ['Doctor','Engineer','Teacher'];
      final country = controller.getForm('country')?.toString() ?? 'Pakistan';
      final salaries = opts?.getMonthlySalaries(country) ?? <String>[];
      final currency = opts?.getCurrency(country) ?? '';
      return StepCard(
        icon: Icons.work_outline, title: 'Education & Career',
        subtitle: 'Your professional background', variant: StepCardVariant.muted,
        children: [
          RangeSelect(label: 'Education Level', value: controller.getForm('education')?.toString() ?? '',
              onChange: (v) => controller.setForm('education', v), options: education, placeholder: 'Select education'),
          SelectOption(label: 'Profession / Job Title', value: controller.getForm('profession')?.toString() ?? '',
              onChange: (v) => controller.setForm('profession', v),
              options: professions, placeholder: 'Select profession', customOption: true),
          RangeSelect(label: 'Employment Type', value: controller.getForm('employment_type')?.toString() ?? '',
              onChange: (v) => controller.setForm('employment_type', v), options: employment, placeholder: 'Select employment type'),
          if (salaries.isNotEmpty)
            RangeSelect(label: 'Monthly Salary${currency.isNotEmpty ? " ($currency)" : ""}',
                value: controller.getForm('monthly_salary')?.toString() ?? '',
                onChange: (v) => controller.setForm('monthly_salary', v),
                options: salaries, placeholder: 'Select range', optional: true),
        ],
      );
    });
  }
}

// ─── STEP 6: Lifestyle ───────────────────────────────────────────────────────
class _Step6 extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final interests = opts?.interests ?? <String>[];
      final religion = controller.getForm('religion')?.toString() ?? 'Muslim';
      final relOpts = opts?.getRelationshipOptions(religion) ?? <String>[];
      final interestsList = controller.getForm('interests');
      final List<String> selectedInterests = interestsList is List
          ? interestsList.map((e) => e.toString()).toList() : <String>[];

      return StepCard(
        icon: Icons.auto_awesome_outlined, title: 'Lifestyle & About You',
        subtitle: 'Let matches know who you are', variant: StepCardVariant.primary,
        children: [
          // About Me
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('ABOUT ME (BIO)',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8, color: AppColors.mutedForeground)),
              Spacer(),
              GestureDetector(onTap: controller.randomizeBio,
                  child: Row(children: [
                    Icon(Icons.refresh, size: 12, color: AppColors.primary), SizedBox(width: 4),
                    Text('Random', style: TextStyle(fontSize: 12, color: AppColors.primary, decoration: TextDecoration.underline)),
                  ])),
            ]),
            SizedBox(height: 8),
            AppTextArea(value: controller.getForm('bio')?.toString() ?? '',
                onChanged: (v) => controller.setForm('bio', v),
                hintText: 'Tell potential matches about yourself...', maxLines: 4),
          ]),

          MultiChips(label: 'Interests & Hobbies', value: selectedInterests,
              onChange: (v) => controller.setForm('interests', v), options: interests, optional: true),

          ToggleGroup(label: 'Willing to Relocate?',
              value: controller.getForm('willing_to_relocate')?.toString() ?? 'Maybe',
              onChange: (v) => controller.setForm('willing_to_relocate', v),
              options: [ToggleOption(value: 'Yes', label: 'Yes'),
                ToggleOption(value: 'No', label: 'No'), ToggleOption(value: 'Maybe', label: 'Maybe')]),

          // Relationship Intent
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('RELATIONSHIP INTENT',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8, color: AppColors.mutedForeground)),
              Spacer(),
              GestureDetector(onTap: controller.randomizeRelationship,
                  child: Row(children: [
                    Icon(Icons.refresh, size: 12, color: AppColors.primary), SizedBox(width: 4),
                    Text('Random', style: TextStyle(fontSize: 12, color: AppColors.primary, decoration: TextDecoration.underline)),
                  ])),
            ]),
            SizedBox(height: 8),
            RangeSelect(label: '', value: controller.getForm('relationship')?.toString() ?? '',
                onChange: (v) => controller.setForm('relationship', v),
                options: relOpts, placeholder: 'Select relationship intent', optional: true),
          ]),
        ],
      );
    });
  }
}

// ─── STEP 7: Preferences ─────────────────────────────────────────────────────
class _Step7 extends GetView<CompleteProfileController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final opts = controller.opts.value;
      final ageOpts = CompleteProfileController.ageOptions();
      final heightOpts = CompleteProfileController.heightOptions();
      final religions = opts?.religions ?? ['Muslim','Christian','Hindu'];
      final sects = opts?.sects ?? ['Sunni','Shia','Deobandi','Barelvi'];
      final practiceLvls = opts?.practiceLevels ?? ['Very Religious','Moderately Religious','Somewhat Religious'];
      final bodyTypes = opts?.bodyTypes ?? ['Slim','Athletic','Average','Curvy','Heavy'];
      final education = opts?.educationLevels ?? ["High School","Bachelor's","Master's","PhD"];
      final employment = opts?.employmentTypes ?? ['Government','Private','Self-Employed'];
      final marital = opts?.maritalStatuses ?? ['Never Married','Divorced','Widowed','Separated'];
      final hasChildren = opts?.hasChildren ?? ['No Children','Has Children'];
      final countries = opts?.countries ?? <String>[];
      final countryFlags = opts?.countryFlags ?? <String, String>{};
      final countryList = ['No Preference',...countries.map((c) => '${countryFlags[c] ?? "🌍"} $c')];

      final prefCountry = controller.getPref('pref_country')?.toString() ?? 'Pakistan';
      final prefCities = opts?.getCities(prefCountry) ?? <String>[];
      final prefSalaries = opts?.getMonthlySalaries(prefCountry) ?? <String>[];
      final prefCurrency = opts?.getCurrency(prefCountry) ?? '';

      final gender = controller.getForm('gender')?.toString() ?? '';
      final autoGender = gender == 'Male' ? 'Female' : gender == 'Female' ? 'Male' : '';

      final prefReligion = controller.getPref('pref_religion')?.toString() ?? 'Muslim';
      final prefSect = controller.getPref('pref_sect');
      final prefSectList = prefSect is List ? prefSect.map((e) => e.toString()).toList() : <String>[];

      final prefMarital = controller.getPref('pref_marital_status');
      final prefMaritalList = prefMarital is List ? prefMarital.map((e) => e.toString()).toList() : <String>[];
      final showHasChildren = prefMaritalList.any((s) => ['Divorced','Widowed','Separated'].contains(s));

      final prefBodyType = controller.getPref('pref_body_type');
      final prefBodyTypeList = prefBodyType is List ? prefBodyType.map((e) => e.toString()).toList() : <String>[];

      final prefEmpType = controller.getPref('pref_employment_type');
      final prefEmpList = prefEmpType is List ? prefEmpType.map((e) => e.toString()).toList() : <String>[];

      return Column(children: [
        // Banner
        Container(
          padding: EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [AppColors.primary, Color(0xFF2d7a5e)]),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Icon(Icons.favorite_border, color: Colors.white, size: 20), SizedBox(width: 8),
              Text('Partner Preferences', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
              Spacer(),
              Container(padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                  child: Text('All optional', style: TextStyle(color: Colors.white, fontSize: 11))),
            ]),
            SizedBox(height: 8),
            Text('Set your ideal match criteria. Leave blank for "No Preference".',
                style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
          ]),
        ),
        SizedBox(height: 16),

        // Demographics
        StepCard(icon: Icons.person_outline, title: 'Demographics', subtitle: 'Age, gender, marital status', variant: StepCardVariant.primary, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Preferred Gender', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.foreground)),
            SizedBox(height: 8),
            Row(children: ['Male','Female'].map((g) {
              final isSelected = g == autoGender;
              return Expanded(child: Container(
                margin: EdgeInsets.only(right: g == 'Male' ? 8 : 0),
                padding: EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : AppColors.secondary,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isSelected ? AppColors.primary : Colors.transparent),
                ),
                child: Center(child: Text(g == 'Male' ? '♂ Male' : '♀ Female',
                    style: TextStyle(fontSize: 14, fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                        color: isSelected ? Colors.white : AppColors.mutedForeground))),
              ));
            }).toList()),
            SizedBox(height: 4),
            Text('Auto-selected based on your gender — not editable',
                style: TextStyle(fontSize: 11, color: AppColors.mutedForeground)),
          ]),

          RangeRow(label: 'Age Range',
              minVal: controller.getPref('pref_age_min')?.toString() ?? '18',
              maxVal: controller.getPref('pref_age_max')?.toString() ?? '60',
              onMinChange: (v) {
                final max = int.tryParse(controller.getPref('pref_age_max')?.toString() ?? '60') ?? 60;
                if ((int.tryParse(v) ?? 0) >= max) { Get.snackbar('Age','Min must be less than max', snackPosition: SnackPosition.BOTTOM); return; }
                controller.setPrefs('pref_age_min', v);
              },
              onMaxChange: (v) {
                final min = int.tryParse(controller.getPref('pref_age_min')?.toString() ?? '18') ?? 18;
                if ((int.tryParse(v) ?? 0) <= min) { Get.snackbar('Age','Max must be greater than min', snackPosition: SnackPosition.BOTTOM); return; }
                controller.setPrefs('pref_age_max', v);
              },
              minOpts: ageOpts.map((a) => {'value': a, 'label': a}).toList(),
              maxOpts: ageOpts.map((a) => {'value': a, 'label': a}).toList(),
              optional: true),

          RangeSelect(label: 'Preferred Country', value: prefCountry,
              onChange: (v) {
                if (v == 'No Preference') { controller.setPrefs('pref_country', 'No Preference'); controller.setPrefs('pref_city', ''); }
                else { final country = v.contains(' ') ? v.substring(v.indexOf(' ') + 1) : v; controller.handlePrefCountryChange(country); }
              }, options: countryList, placeholder: 'Any country', optional: true),

          prefCountry != 'No Preference' && prefCities.isNotEmpty
              ? RangeSelect(label: 'Preferred City', value: controller.getPref('pref_city')?.toString() ?? '',
                  onChange: (v) => controller.setPrefs('pref_city', v),
                  options: ['No Preference', ...prefCities], placeholder: 'Any city', optional: true)
              : InputField(label: 'Preferred City', value: controller.getPref('pref_city')?.toString() ?? '',
                  onChange: (v) => controller.setPrefs('pref_city', v),
                  placeholder: 'e.g. Karachi, London', optional: true),
        ]),
        SizedBox(height: 16),

        // Religion
        StepCard(icon: Icons.star_outline, title: 'Religion', subtitle: 'Faith & practice preferences', variant: StepCardVariant.accent, children: [
          RangeSelect(label: 'Religion', value: prefReligion,
              onChange: (v) {
                controller.setPrefs('pref_religion', v);
                if (v != 'Muslim') controller.setPrefs('pref_sect', <String>[]);
                else if (prefSectList.isEmpty) controller.setPrefs('pref_sect', ['Sunni']);
              }, options: ['No Preference', ...religions], placeholder: 'No preference', optional: true),
          if (prefReligion == 'Muslim')
            MultiChips(label: 'Sect', value: prefSectList,
                onChange: (v) => controller.setPrefs('pref_sect', v),
                options: ['No Preference', ...sects], optional: true),
          RangeSelect(label: 'Practice Level', value: controller.getPref('pref_religious_practice_level')?.toString() ?? '',
              onChange: (v) => controller.setPrefs('pref_religious_practice_level', v),
              options: ['No Preference', ...practiceLvls], placeholder: 'No preference', optional: true),
        ]),
        SizedBox(height: 16),

        // Physical
        StepCard(icon: Icons.favorite_border, title: 'Physical', subtitle: 'Height & body type', variant: StepCardVariant.primary, children: [
          RangeRow(label: 'Height Range',
              minVal: controller.getPref('pref_height_min_inches')?.toString() ?? '60',
              maxVal: controller.getPref('pref_height_max_inches')?.toString() ?? '90',
              onMinChange: (v) => controller.setPrefs('pref_height_min_inches', v),
              onMaxChange: (v) => controller.setPrefs('pref_height_max_inches', v),
              minOpts: heightOpts, maxOpts: heightOpts, optional: true),
          MultiChips(label: 'Body Type', value: prefBodyTypeList,
              onChange: (v) => controller.setPrefs('pref_body_type', v),
              options: ['No Preference', ...bodyTypes], optional: true),
        ]),
        SizedBox(height: 16),

        // Education & Career
        StepCard(icon: Icons.work_outline, title: 'Education & Career', subtitle: 'Qualifications & income', variant: StepCardVariant.muted, children: [
          RangeSelect(label: 'Min Education', value: controller.getPref('pref_education')?.toString() ?? '',
              onChange: (v) => controller.setPrefs('pref_education', v),
              options: ['No Preference', ...education], placeholder: 'No preference', optional: true),
          MultiChips(label: 'Employment Type', value: prefEmpList,
              onChange: (v) => controller.setPrefs('pref_employment_type', v),
              options: ['No Preference', ...employment], optional: true),
          if (prefSalaries.isNotEmpty)
            RangeSelect(label: 'Monthly Income (min)${prefCurrency.isNotEmpty ? " ($prefCurrency)" : ""}',
                value: controller.getPref('pref_monthly_salary')?.toString() ?? '',
                onChange: (v) => controller.setPrefs('pref_monthly_salary', v),
                options: ['No Preference', ...prefSalaries], placeholder: 'No preference', optional: true),
        ]),
        SizedBox(height: 16),

        // Life Situation
        StepCard(icon: Icons.auto_awesome_outlined, title: 'Life Situation', subtitle: 'Marital status & relocation', variant: StepCardVariant.primary, children: [
          MultiChips(label: 'Partner Marital Status', value: prefMaritalList,
              onChange: (v) => controller.setPrefs('pref_marital_status', v),
              options: ['No Preference', ...marital], optional: true),
          if (showHasChildren)
            RangeSelect(label: 'Has Children', value: controller.getPref('pref_has_children')?.toString() ?? '',
                onChange: (v) => controller.setPrefs('pref_has_children', v),
                options: ['No Preference', ...hasChildren], placeholder: 'No preference', optional: true),
          ToggleGroup(label: 'Willing to Relocate',
              value: controller.getPref('pref_willing_to_relocate')?.toString() ?? 'No',
              onChange: (v) => controller.setPrefs('pref_willing_to_relocate', v),
              options: [ToggleOption(value: 'No Preference', label: 'Any'),
                ToggleOption(value: 'Yes', label: 'Yes'), ToggleOption(value: 'No', label: 'No')],
              optional: true),
        ]),
      ]);
    });
  }
}

// ─── Footer ──────────────────────────────────────────────────────────────────
class _Footer extends GetView<CompleteProfileController> {
  static const _stepLabels = [
    'Continue to Location','Continue to Religion','Continue to Physical',
    'Continue to Career','Continue to Lifestyle','Continue to Preferences','Save Preferences & Go Live'
  ];

  void _handleNext() {
    final step = controller.currentStep.value;
    final missing = controller.validateStep(step);
    if (missing.isNotEmpty) {
      Get.snackbar('Required Fields', 'Please fill in: ${missing.join(", ")}',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Color(0xFFFFE4E6), colorText: Color(0xFF7F1D1D),
          margin: EdgeInsets.all(16), borderRadius: 12);
      return;
    }
    if (step == CompleteProfileController.totalSteps) controller.submit();
    else controller.currentStep.value++;
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final step = controller.currentStep.value;
      final isLast = step == CompleteProfileController.totalSteps;
      final isSaving = controller.isSaving.value;

      return Container(
        padding: EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
        child: SafeArea(top: false, child: Column(mainAxisSize: MainAxisSize.min, children: [
          if (controller.errorMessage.value.isNotEmpty)
            Container(width: double.infinity, padding: EdgeInsets.all(12), margin: EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(color: Color(0xFFFFE4E6), borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Color(0xFFFECDD3))),
                child: Text(controller.errorMessage.value,
                    style: TextStyle(color: Color(0xFF7F1D1D), fontSize: 13))),
          GestureDetector(
            onTap: isSaving ? null : _handleNext,
            child: AnimatedContainer(
              duration: Duration(milliseconds: 200),
              width: double.infinity, padding: EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: isSaving ? null : LinearGradient(colors: [AppColors.primary, Color(0xFF2d7a5e)]),
                color: isSaving ? Colors.grey[400] : null,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 12, offset: Offset(0, 4))],
              ),
              child: Center(child: isSaving
                  ? Row(mainAxisSize: MainAxisSize.min, children: [
                      SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.white))),
                      SizedBox(width: 10),
                      Text('Saving your profile...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                    ])
                  : Row(mainAxisSize: MainAxisSize.min, children: [
                      if (isLast) ...[Icon(Icons.check, color: Colors.white, size: 18), SizedBox(width: 8)],
                      Text(isLast ? 'Save Preferences & Go Live' : _stepLabels[step - 1],
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                      if (!isLast) ...[SizedBox(width: 8), Icon(Icons.chevron_right, color: Colors.white, size: 18)],
                    ])),
            ),
          ),
        ])),
      );
    });
  }
}

// ─── Done Screen ─────────────────────────────────────────────────────────────
class _DoneScreen extends StatefulWidget {
  @override
  State<_DoneScreen> createState() => _DoneScreenState();
}

class _DoneScreenState extends State<_DoneScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _scale, _fade;

  @override
  void initState() {
    super.initState();
    _ac = AnimationController(vsync: this, duration: Duration(milliseconds: 700));
    _scale = Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: _ac, curve: Curves.elasticOut));
    _fade = Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: _ac, curve: Curves.easeOut));
    _ac.forward();
  }

  @override void dispose() { _ac.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(child: Center(child: Padding(padding: EdgeInsets.all(32),
        child: FadeTransition(opacity: _fade, child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          ScaleTransition(scale: _scale, child: Container(
            width: 96, height: 96,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [AppColors.primary, Color(0xFF2d7a5e)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.4), blurRadius: 24, offset: Offset(0, 8))],
            ),
            child: Icon(Icons.check_circle_outline, color: Colors.white, size: 48),
          )),
          SizedBox(height: 32),
          Text('Profile Complete!',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700,
                  color: AppColors.cardForeground, fontFamily: 'Playfair Display')),
          SizedBox(height: 16),
          Text('Congratulations! Your profile is complete. You are now live. Linking your guardian is recommended to access all features and improve your experience.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: AppColors.mutedForeground, height: 1.6)),
          SizedBox(height: 40),
          GestureDetector(
            onTap: () => Get.offAll(() => _HomePagePlaceholder()),
            child: Container(width: double.infinity, padding: EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [AppColors.primary, Color(0xFF2d7a5e)]),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 12, offset: Offset(0, 4))],
              ),
              child: Center(child: Text('View Matches', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16))),
            ),
          ),
        ])),
      ))),
    );
  }
}

class _HomePagePlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(body: Center(child: Text('Welcome!',
        style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: AppColors.primary))));
  }
}
