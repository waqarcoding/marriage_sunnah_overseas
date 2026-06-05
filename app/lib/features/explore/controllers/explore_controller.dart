import 'dart:ui';

import 'package:get/get.dart';
import '../services/explore_service.dart';
import '../../../data/models/options_model.dart';

class ExploreController extends GetxController {
  final ExploreService _exploreService = Get.find<ExploreService>();

  // ─── State ───────────────────────────────────────────────────────────────
  var profiles = <Map<String, dynamic>>[].obs;
  var currentIndex = 0.obs;
  var isLoading = true.obs;
  var isRefreshing = false.obs;
  var direction = 0.obs; // 1=right, -1=left
  var activeFilters = <String>['All'].obs;
  var search = ''.obs;
  var showFilters = false.obs;
  var errorMessage = ''.obs;

  // Filter modal state
  var filterOpts = Rxn<OptionsModel>();
  var filterOptsLoading = false.obs;

  // Filter form state
  var ageRange = <int>[18, 55].obs;
  var heightRange = <int>[60, 90].obs;
  var filterGender = ''.obs;
  var filterCountry = ''.obs;
  var filterCity = ''.obs;
  var filterNationality = ''.obs;
  var filterMaritalStatus = ''.obs;
  var filterHasChildren = ''.obs;
  var filterBodyType = ''.obs;
  var filterWillingToRelocate = false.obs;
  var filterReligion = ''.obs;
  var filterSect = ''.obs;
  var filterPracticeLevel = ''.obs;
  var filterEthnicity = ''.obs;
  var filterMotherTongue = ''.obs;
  var filterEducation = ''.obs;
  var filterProfession = ''.obs;
  var filterEmploymentType = ''.obs;
  var filterMonthlySalary = ''.obs;
  var isSavingFilters = false.obs;
  var filterSaveError = ''.obs;

  static const filterChips = [
    'All',
    'Online',
    'Premium',
    'Verified',
    'UAE',
    'UK',
    'USA',
    'Saudi Arabia',
    'Qatar',
    'Pakistan'
  ];

  static const countryChips = [
    'Pakistan',
    'UAE',
    'UK',
    'USA',
    'Saudi Arabia',
    'Qatar'
  ];

  @override
  void onInit() {
    super.onInit();
    fetchProfiles();
    ever(activeFilters, (_) => fetchProfiles(isRefresh: true));
  }

  // ─── Fetch profiles ──────────────────────────────────────────────────────
  Future<void> fetchProfiles({bool isRefresh = false}) async {
    if (isRefresh) {
      isRefreshing.value = true;
    } else {
      isLoading.value = true;
    }
    errorMessage.value = '';

    try {
      final filters = _buildFilters();
      final res = await _exploreService.getExplore(
        gender: filters['gender'],
        city: filters['city'],
        country: filters['country'],
        countries: filters['countries'],
        minAge: filters['minAge'] != null
            ? int.tryParse(filters['minAge'].toString())
            : null,
        maxAge: filters['maxAge'] != null
            ? int.tryParse(filters['maxAge'].toString())
            : null,
        isVerified: filters['isVerified'] == true,
        isPremium: filters['isPremium'] == true,
        isOnline: filters['isOnline'] == true,
      );

      if (res != null) {
        final rawProfiles = res['profiles'] ?? res['data']?['profiles'] ?? [];
        final List<Map<String, dynamic>> users = (rawProfiles as List).map((p) {
          final map = Map<String, dynamic>.from(p);
          if (!map.containsKey('individual') && map.containsKey('user')) {
            map['individual'] = map['user'];
          }
          return map;
        }).toList();

        profiles.value = users;
        currentIndex.value = 0;
      }
    } catch (e) {
      errorMessage.value = 'Failed to load profiles';
      print('Fetch profiles error: $e');
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  }

  Map<String, dynamic> _buildFilters() {
    final filters = <String, dynamic>{};
    if (!activeFilters.contains('All')) {
      if (activeFilters.contains('Verified')) filters['isVerified'] = true;
      if (activeFilters.contains('Premium')) filters['isPremium'] = true;
      if (activeFilters.contains('Online')) filters['isOnline'] = true;

      final selectedCountries =
          activeFilters.where((f) => countryChips.contains(f)).toList();
      if (selectedCountries.isNotEmpty) {
        filters['countries'] = selectedCountries.join(',');
      }
    }
    filters['minAge'] = ageRange[0];
    filters['maxAge'] = ageRange[1];
    if (filterCity.value.isNotEmpty) filters['city'] = filterCity.value;
    if (filterGender.value == 'Men') filters['gender'] = 'male';
    if (filterGender.value == 'Women') filters['gender'] = 'female';
    return filters;
  }

  // ─── Filter chips ────────────────────────────────────────────────────────
  void toggleFilter(String f) {
    if (f == 'All') {
      activeFilters.value = ['All'];
      return;
    }
    final current =
        List<String>.from(activeFilters).where((x) => x != 'All').toList();
    if (current.contains(f)) {
      current.remove(f);
    } else {
      current.add(f);
    }
    activeFilters.value = current.isEmpty ? ['All'] : current;
  }

  // ─── Filtered profiles list ──────────────────────────────────────────────
  List<Map<String, dynamic>> get filteredProfiles {
    if (search.value.isEmpty) return profiles;
    final q = search.value.toLowerCase();
    return profiles.where((p) {
      final name = p['name']?.toString().toLowerCase() ?? '';
      final city = p['city']?.toString().toLowerCase() ?? '';
      return name.contains(q) || city.contains(q);
    }).toList();
  }

  Map<String, dynamic>? get currentProfile {
    final list = filteredProfiles;
    if (currentIndex.value >= list.length) return null;
    return list[currentIndex.value];
  }

  bool get hasProfiles => profiles.isNotEmpty;
  bool get isEmpty =>
      !isLoading.value && !isRefreshing.value && profiles.isEmpty;

  // ─── Navigation ──────────────────────────────────────────────────────────
  void advance(int dir) {
    direction.value = dir;
    Future.delayed(Duration(milliseconds: 280), () {
      currentIndex.value++;
      direction.value = 0;
    });
  }

  // ─── Actions ─────────────────────────────────────────────────────────────
  Future<bool> handleLike() async {
    final profile = currentProfile;
    if (profile == null) return false;
    final id = profile['individual_id'];
    if (id == null) return false;

    final result = await _exploreService.sendInterest(id as int);
    if (result != null && result['success'] == true) {
      Get.snackbar(
        'Interest Sent! 💌',
        'Interest sent to ${profile['name']}',
        snackPosition: SnackPosition.BOTTOM,
        duration: Duration(seconds: 2),
      );
      advance(1);
      return true;
    } else {
      final msg = result?['message'] ?? 'Failed to send interest';
      Get.snackbar('Error', msg, snackPosition: SnackPosition.BOTTOM);
      return false;
    }
  }

  Future<bool> handlePass() async {
    final profile = currentProfile;
    if (profile == null) return false;
    final id = profile['individual_id'];
    if (id == null) return false;

    final result = await _exploreService.sendDislike(id as int);
    if (result != null && result['success'] == true) {
      advance(-1);
      return true;
    }
    return false;
  }

  Future<bool> handleSuperLike() async {
    final profile = currentProfile;
    if (profile == null) return false;
    final id = profile['individual_id'];
    if (id == null) return false;

    final result =
        await _exploreService.sendInterest(id as int, isSuperLike: true);
    if (result != null && result['success'] == true) {
      Get.snackbar(
        'Super Like! ⭐',
        'Super like sent!',
        snackPosition: SnackPosition.BOTTOM,
        duration: Duration(seconds: 2),
      );
      advance(1);
      return true;
    } else {
      final msg = result?['message'] ?? 'Failed to send super like';
      Get.snackbar('Error', msg, snackPosition: SnackPosition.BOTTOM);
      return false;
    }
  }

  // ─── Filter modal ────────────────────────────────────────────────────────
  Future<void> loadFilterOptions() async {
    filterOptsLoading.value = true;
    try {
      final res = await _exploreService.getOptions();
      if (res != null && res['success'] == true) {
        filterOpts.value = OptionsModel.fromJson(res);
        _applyExistingPrefs(res['preferences']);
      }
    } catch (e) {
      print('Filter options error: $e');
    } finally {
      filterOptsLoading.value = false;
    }
  }

  void _applyExistingPrefs(dynamic prefs) {
    if (prefs == null) return;
    if (prefs['pref_gender'] != null) filterGender.value = prefs['pref_gender'];
    if (prefs['pref_age_min'] != null && prefs['pref_age_max'] != null) {
      ageRange.value = [
        int.tryParse(prefs['pref_age_min'].toString()) ?? 18,
        int.tryParse(prefs['pref_age_max'].toString()) ?? 55,
      ];
    }
    if (prefs['pref_height_min_inches'] != null &&
        prefs['pref_height_max_inches'] != null) {
      heightRange.value = [
        int.tryParse(prefs['pref_height_min_inches'].toString()) ?? 60,
        int.tryParse(prefs['pref_height_max_inches'].toString()) ?? 90,
      ];
    }
    if (prefs['pref_religion'] != null)
      filterReligion.value = prefs['pref_religion'];
    if (prefs['pref_sect'] != null)
      filterSect.value = _firstOf(prefs['pref_sect']);
    if (prefs['pref_religious_practice_level'] != null)
      filterPracticeLevel.value = prefs['pref_religious_practice_level'];
    if (prefs['pref_education'] != null)
      filterEducation.value = prefs['pref_education'];
    if (prefs['pref_has_children'] != null)
      filterHasChildren.value = prefs['pref_has_children'];
    if (prefs['pref_willing_to_relocate'] != null)
      filterWillingToRelocate.value = prefs['pref_willing_to_relocate'] == 1 ||
          prefs['pref_willing_to_relocate'] == true;
    if (prefs['pref_marital_status'] != null)
      filterMaritalStatus.value = _firstOf(prefs['pref_marital_status']);
    if (prefs['pref_nationality'] != null)
      filterNationality.value = _firstOf(prefs['pref_nationality']);
    if (prefs['pref_body_type'] != null)
      filterBodyType.value = _firstOf(prefs['pref_body_type']);
    if (prefs['pref_caste'] != null)
      filterEthnicity.value = _firstOf(prefs['pref_caste']);
    if (prefs['pref_mother_tongue'] != null)
      filterMotherTongue.value = _firstOf(prefs['pref_mother_tongue']);
    if (prefs['pref_employment_type'] != null)
      filterEmploymentType.value = _firstOf(prefs['pref_employment_type']);
    if (prefs['pref_monthly_salary'] != null)
      filterMonthlySalary.value = prefs['pref_monthly_salary'];
    if (prefs['pref_city'] != null) filterCity.value = prefs['pref_city'];
    final savedCountry = _firstOf(prefs['pref_country']);
    if (savedCountry.isNotEmpty) filterCountry.value = savedCountry;
  }

  String _firstOf(dynamic val) {
    if (val == null) return '';
    if (val is List && val.isNotEmpty) return val.first.toString();
    return val.toString();
  }

  void resetFilters() {
    ageRange.value = [18, 35];
    heightRange.value = [60, 90];
    filterGender.value = '';
    filterCountry.value = '';
    filterCity.value = '';
    filterNationality.value = '';
    filterMaritalStatus.value = '';
    filterHasChildren.value = '';
    filterBodyType.value = '';
    filterWillingToRelocate.value = false;
    filterReligion.value = '';
    filterSect.value = '';
    filterPracticeLevel.value = '';
    filterEthnicity.value = '';
    filterMotherTongue.value = '';
    filterEducation.value = '';
    filterProfession.value = '';
    filterEmploymentType.value = '';
    filterMonthlySalary.value = '';
    filterSaveError.value = '';
  }

  Future<void> saveFilters(VoidCallback onClose) async {
    isSavingFilters.value = true;
    filterSaveError.value = '';

    try {
      final payload = {
        'pref_gender':
            filterGender.value.isNotEmpty ? filterGender.value : null,
        'pref_age_min': ageRange[0],
        'pref_age_max': ageRange[1],
        'pref_height_min_inches': heightRange[0],
        'pref_height_max_inches': heightRange[1],
        'pref_country':
            filterCountry.value.isNotEmpty ? filterCountry.value : null,
        'pref_city': filterCity.value.isNotEmpty ? filterCity.value : null,
        'pref_nationality':
            filterNationality.value.isNotEmpty ? filterNationality.value : null,
        'pref_marital_status': filterMaritalStatus.value.isNotEmpty
            ? filterMaritalStatus.value
            : null,
        'pref_has_children':
            filterHasChildren.value.isNotEmpty ? filterHasChildren.value : null,
        'pref_body_type':
            filterBodyType.value.isNotEmpty ? filterBodyType.value : null,
        'pref_willing_to_relocate': filterWillingToRelocate.value ? 1 : 0,
        'pref_religion':
            filterReligion.value.isNotEmpty ? filterReligion.value : null,
        'pref_sect': filterSect.value.isNotEmpty ? filterSect.value : null,
        'pref_religious_practice_level': filterPracticeLevel.value.isNotEmpty
            ? filterPracticeLevel.value
            : null,
        'pref_caste':
            filterEthnicity.value.isNotEmpty ? filterEthnicity.value : null,
        'pref_mother_tongue': filterMotherTongue.value.isNotEmpty
            ? filterMotherTongue.value
            : null,
        'pref_education':
            filterEducation.value.isNotEmpty ? filterEducation.value : null,
        'pref_employment_type': filterEmploymentType.value.isNotEmpty
            ? filterEmploymentType.value
            : null,
        'pref_monthly_salary': filterMonthlySalary.value.isNotEmpty
            ? filterMonthlySalary.value
            : null,
        'pref_profession':
            filterProfession.value.isNotEmpty ? filterProfession.value : null,
      };

      final result = await _exploreService.savePreferences(payload);
      if (result != null && result['success'] == true) {
        onClose();
        fetchProfiles(isRefresh: true);
        Get.snackbar('Saved!', 'Preferences saved successfully',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        filterSaveError.value =
            result?['message'] ?? 'Failed to save preferences';
      }
    } catch (e) {
      filterSaveError.value = 'Failed to save preferences. Please try again.';
    } finally {
      isSavingFilters.value = false;
    }
  }
}
