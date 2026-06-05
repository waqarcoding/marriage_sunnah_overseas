import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/explore_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/select_option.dart';

class FilterModal extends StatefulWidget {
  final VoidCallback onClose;

  const FilterModal({Key? key, required this.onClose}) : super(key: key);

  @override
  State<FilterModal> createState() => _FilterModalState();
}

class _FilterModalState extends State<FilterModal>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _scale;
  late Animation<double> _fade;
  final ExploreController ctrl = Get.find<ExploreController>();

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 200));
    _scale = Tween<double>(begin: 0.95, end: 1.0)
        .animate(CurvedAnimation(parent: _ac, curve: Curves.easeOut));
    _fade = Tween<double>(begin: 0.0, end: 1.0).animate(_ac);
    _ac.forward();
    ctrl.loadFilterOptions();
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  String _inchesToLabel(int inches) {
    final ft = inches ~/ 12;
    final inch = inches % 12;
    return "$ft'$inch\"";
  }

  void _saveAndClose() {
    ctrl.saveFilters(() {
      if (!mounted) return;
      Get.back();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: FadeTransition(
        opacity: _fade,
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(15),
            child: ScaleTransition(
              scale: _scale,
              child: Container(
                constraints: BoxConstraints(
                    maxWidth: 448,
                    maxHeight: MediaQuery.of(context).size.height * 0.88),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black.withOpacity(0.18),
                        blurRadius: 40,
                        offset: Offset(0, 8))
                  ],
                ),
                child: Stack(
                  children: [
                    // ── Main content ─────────────────────────────────────
                    Column(
                      children: [
                        _buildHeader(),
                        Expanded(
                          child: Obx(() {
                            if (ctrl.filterOptsLoading.value) {
                              return _buildLoader();
                            }
                            return _buildBody();
                          }),
                        ),
                        Obx(() => ctrl.filterOptsLoading.value
                            ? SizedBox.shrink()
                            : _buildFooter()),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.fromLTRB(24, 20, 24, 16),
      decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: Color(0xFFF3F4F6)))),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.tune, size: 16, color: AppColors.primary),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Partner Preferences',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF111827))),
                Text('Refine your match criteria',
                    style: TextStyle(fontSize: 12, color: Colors.grey[400])),
              ],
            ),
          ),
          GestureDetector(
            onTap: widget.onClose,
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                  color: Colors.grey[100], shape: BoxShape.circle),
              child: Icon(Icons.close, size: 16, color: Colors.grey[500]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoader() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 40,
            height: 40,
            child: CircularProgressIndicator(
                color: AppColors.primary, strokeWidth: 3),
          ),
          SizedBox(height: 16),
          Text('Loading your preferences…',
              style: TextStyle(fontSize: 14, color: Colors.grey[500])),
        ],
      ),
    );
  }

  Widget _buildBody() {
    final opts = ctrl.filterOpts.value;
    final countries = opts?.countries ?? [];
    final flags = opts?.countryFlags ?? {};
    final countryData = opts?.countryData ?? {};
    final curCountry = ctrl.filterCountry.value;
    final curCountryData =
        curCountry.isNotEmpty && countryData.containsKey(curCountry)
            ? Map<String, dynamic>.from(countryData[curCountry])
            : <String, dynamic>{};
    final cities = curCountryData['cities'] is List
        ? (curCountryData['cities'] as List).map((e) => e.toString()).toList()
        : <String>[];
    final allNats = opts?.allNationalities ?? [];
    final nats = curCountryData['nationalities'] is List
        ? (curCountryData['nationalities'] as List)
            .map((e) => e.toString())
            .toList()
        : allNats;
    final currencies = curCountryData['currency']?.toString() ?? '';
    final salaries = curCountryData['monthly_salaries'] is List
        ? (curCountryData['monthly_salaries'] as List)
            .map((e) => e.toString())
            .toList()
        : <String>[];

    final countryOpts = countries.map((c) => '${flags[c] ?? "🌍"} $c').toList();

    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: Obx(() => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // BASIC
              _SectionLabel(label: 'Basic'),
              SizedBox(height: 12),

              // Age range
              _RangeField(
                label: 'Age Range',
                values: ctrl.ageRange,
                min: 18,
                max: 70,
                onChanged: (v) => ctrl.ageRange.value = v,
                displayFn: (v) => '$v',
              ),
              SizedBox(height: 16),

              // Height range
              _RangeField(
                label: 'Height',
                values: ctrl.heightRange,
                min: 60,
                max: 90,
                onChanged: (v) => ctrl.heightRange.value = v,
                displayFn: _inchesToLabel,
              ),
              SizedBox(height: 16),

              SelectOption(
                label: 'Marital Status',
                value: ctrl.filterMaritalStatus.value,
                onChange: (v) => ctrl.filterMaritalStatus.value = v,
                options: opts?.maritalStatuses ?? [],
                placeholder: 'No preference',
              ),
              SizedBox(height: 16),

              SelectOption(
                label: 'Has Children',
                value: ctrl.filterHasChildren.value,
                onChange: (v) => ctrl.filterHasChildren.value = v,
                options: opts?.hasChildren ?? [],
                placeholder: 'No preference',
              ),
              SizedBox(height: 16),

              SelectOption(
                label: 'Body Type',
                value: ctrl.filterBodyType.value,
                onChange: (v) => ctrl.filterBodyType.value = v,
                options: opts?.bodyTypes ?? [],
                placeholder: 'No preference',
              ),
              SizedBox(height: 20),

              // LOCATION
              _SectionLabel(label: 'Location'),
              SizedBox(height: 12),

              SelectOption(
                label: 'Country',
                value: ctrl.filterCountry.value.isNotEmpty
                    ? countryOpts.firstWhereOrNull(
                            (c) => c.contains(ctrl.filterCountry.value)) ??
                        ctrl.filterCountry.value
                    : '',
                onChange: (v) {
                  final country =
                      v.contains(' ') ? v.substring(v.indexOf(' ') + 1) : v;
                  ctrl.filterCountry.value = country;
                  ctrl.filterCity.value = '';
                  ctrl.filterMonthlySalary.value = '';
                },
                options: countryOpts,
                placeholder: 'Any country',
                customOption: true,
              ),
              SizedBox(height: 16),

              if (ctrl.filterCountry.value.isNotEmpty && cities.isNotEmpty) ...[
                SelectOption(
                  label: 'City',
                  value: ctrl.filterCity.value,
                  onChange: (v) => ctrl.filterCity.value = v,
                  options: cities,
                  placeholder: 'Any city',
                  customOption: true,
                ),
                SizedBox(height: 16),
              ],

              SelectOption(
                label: 'Nationality',
                value: ctrl.filterNationality.value,
                onChange: (v) => ctrl.filterNationality.value = v,
                options: nats,
                placeholder: 'Any nationality',
                customOption: true,
              ),
              SizedBox(height: 16),

              // Willing to relocate toggle
              _ToggleCard(
                title: 'Willing to Relocate',
                subtitle: 'Include profiles open to relocating',
                value: ctrl.filterWillingToRelocate.value,
                onChange: (v) => ctrl.filterWillingToRelocate.value = v,
              ),
              SizedBox(height: 20),

              // RELIGION
              _SectionLabel(label: 'Religion & Background'),
              SizedBox(height: 12),

              SelectOption(
                label: 'Religion',
                value: ctrl.filterReligion.value,
                onChange: (v) {
                  ctrl.filterReligion.value = v;
                  ctrl.filterSect.value = '';
                },
                options: opts?.religions ?? [],
                placeholder: 'No preference',
              ),
              SizedBox(height: 16),

              SelectOption(
                label: 'Sect',
                value: ctrl.filterSect.value,
                onChange: (v) => ctrl.filterSect.value = v,
                options: opts?.sects ?? [],
                placeholder: 'Any sect',
                customOption: true,
              ),
              SizedBox(height: 16),

              SelectOption(
                label: 'Religious Practice Level',
                value: ctrl.filterPracticeLevel.value,
                onChange: (v) => ctrl.filterPracticeLevel.value = v,
                options: opts?.practiceLevels ?? [],
                placeholder: 'No preference',
              ),
              SizedBox(height: 16),

              SelectOption(
                label: 'Ethnicity / Caste',
                value: ctrl.filterEthnicity.value,
                onChange: (v) => ctrl.filterEthnicity.value = v,
                options: opts?.castes ?? [],
                placeholder: 'Any ethnicity',
                customOption: true,
              ),
              SizedBox(height: 16),

              SelectOption(
                label: 'Mother Tongue',
                value: ctrl.filterMotherTongue.value,
                onChange: (v) => ctrl.filterMotherTongue.value = v,
                options: opts?.allMotherTongues ?? [],
                placeholder: 'No preference',
                customOption: true,
              ),
              SizedBox(height: 20),

              // CAREER
              _SectionLabel(label: 'Career & Education'),
              SizedBox(height: 12),

              SelectOption(
                label: 'Education Level',
                value: ctrl.filterEducation.value,
                onChange: (v) => ctrl.filterEducation.value = v,
                options: opts?.educationLevels ?? [],
                placeholder: 'No preference',
              ),
              SizedBox(height: 16),

              SelectOption(
                label: 'Profession',
                value: ctrl.filterProfession.value,
                onChange: (v) => ctrl.filterProfession.value = v,
                options: opts?.professions ?? [],
                placeholder: 'Any profession',
                customOption: true,
              ),
              SizedBox(height: 16),

              SelectOption(
                label: 'Employment Type',
                value: ctrl.filterEmploymentType.value,
                onChange: (v) => ctrl.filterEmploymentType.value = v,
                options: opts?.employmentTypes ?? [],
                placeholder: 'No preference',
              ),
              SizedBox(height: 16),

              if (ctrl.filterCountry.value.isNotEmpty &&
                  salaries.isNotEmpty) ...[
                SelectOption(
                  label:
                      'Monthly Salary${currencies.isNotEmpty ? " ($currencies)" : ""}',
                  value: ctrl.filterMonthlySalary.value,
                  onChange: (v) => ctrl.filterMonthlySalary.value = v,
                  options: salaries,
                  placeholder: 'Any salary',
                ),
                SizedBox(height: 16),
              ],

              if (ctrl.filterSaveError.value.isNotEmpty)
                Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Color(0xFFFECACA), width: 1.5),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.close, size: 16, color: Color(0xFFDC2626)),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(ctrl.filterSaveError.value,
                            style: TextStyle(
                                fontSize: 13,
                                color: Color(0xFFDC2626),
                                fontWeight: FontWeight.w500)),
                      ),
                    ],
                  ),
                ),
            ],
          )),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
          border: Border(top: BorderSide(color: Color(0xFFF3F4F6)))),
      child: Obx(() => Row(
            children: [
              GestureDetector(
                onTap: ctrl.resetFilters,
                child: Text('Reset all',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey[400])),
              ),
              Spacer(),
              GestureDetector(
                onTap: widget.onClose,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(16)),
                  child: Text('Cancel',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF4B5563))),
                ),
              ),
              SizedBox(width: 8),
              GestureDetector(
                onTap: ctrl.isSavingFilters.value ? null : _saveAndClose,
                child: AnimatedContainer(
                  duration: Duration(milliseconds: 200),
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                  decoration: BoxDecoration(
                    color: ctrl.isSavingFilters.value
                        ? AppColors.primary.withOpacity(0.75)
                        : AppColors.primary,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (ctrl.isSavingFilters.value) ...[
                        SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2),
                        ),
                        SizedBox(width: 8),
                        Text('Saving…',
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.white)),
                      ] else
                        Text('Save Preferences',
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ],
          )),
    );
  }
}

// ─── Section label ─────────────────────────────────────────────────────────────
class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Divider(color: Color(0xFF1B4D3E).withOpacity(0.1))),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 8),
          child: Text(
            label.toUpperCase(),
            style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
                color: AppColors.primary),
          ),
        ),
        Expanded(child: Divider(color: Color(0xFF1B4D3E).withOpacity(0.1))),
      ],
    );
  }
}

// ─── Range field ───────────────────────────────────────────────────────────────
class _RangeField extends StatelessWidget {
  final String label;
  final RxList<int> values;
  final int min, max;
  final ValueChanged<List<int>> onChanged;
  final String Function(int) displayFn;

  const _RangeField({
    required this.label,
    required this.values,
    required this.min,
    required this.max,
    required this.onChanged,
    required this.displayFn,
  });

  @override
  Widget build(BuildContext context) {
    return Obx(() => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(label.toUpperCase(),
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey[500],
                        letterSpacing: 0.8)),
                Spacer(),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${displayFn(values[0])} – ${displayFn(values[1])}',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            // Min slider
            Row(
              children: [
                Text('Min',
                    style: TextStyle(fontSize: 11, color: Colors.grey[400])),
                Expanded(
                  child: SliderTheme(
                    data: SliderThemeData(
                      thumbColor: AppColors.primary,
                      activeTrackColor: AppColors.primary,
                      inactiveTrackColor: Colors.grey[200],
                      thumbShape: RoundSliderThumbShape(enabledThumbRadius: 10),
                      overlayShape: RoundSliderOverlayShape(overlayRadius: 16),
                    ),
                    child: Slider(
                      value: values[0].toDouble(),
                      min: min.toDouble(),
                      max: max.toDouble(),
                      onChanged: (v) {
                        if (v < values[1]) onChanged([v.round(), values[1]]);
                      },
                    ),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Text('Max',
                    style: TextStyle(fontSize: 11, color: Colors.grey[400])),
                Expanded(
                  child: SliderTheme(
                    data: SliderThemeData(
                      thumbColor: AppColors.primary,
                      activeTrackColor: AppColors.primary,
                      inactiveTrackColor: Colors.grey[200],
                      thumbShape: RoundSliderThumbShape(enabledThumbRadius: 10),
                      overlayShape: RoundSliderOverlayShape(overlayRadius: 16),
                    ),
                    child: Slider(
                      value: values[1].toDouble(),
                      min: min.toDouble(),
                      max: max.toDouble(),
                      onChanged: (v) {
                        if (v > values[0]) onChanged([values[0], v.round()]);
                      },
                    ),
                  ),
                ),
              ],
            ),
          ],
        ));
  }
}

// ─── Toggle card ────────────────────────────────────────────────────────────────
class _ToggleCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChange;

  const _ToggleCard({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChange,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChange(!value),
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[100]!),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF111827))),
                  SizedBox(height: 2),
                  Text(subtitle,
                      style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                ],
              ),
            ),
            AnimatedContainer(
              duration: Duration(milliseconds: 200),
              width: 44,
              height: 24,
              decoration: BoxDecoration(
                color: value ? AppColors.primary : Colors.grey[300],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Stack(
                children: [
                  AnimatedPositioned(
                    duration: Duration(milliseconds: 200),
                    left: value ? 22 : 2,
                    top: 2,
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                                color: Colors.black.withOpacity(0.15),
                                blurRadius: 4)
                          ]),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
