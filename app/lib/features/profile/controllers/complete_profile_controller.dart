import 'package:get/get.dart';
import 'package:geolocator/geolocator.dart';
import '../../../data/models/options_model.dart';
import '../../../data/providers/api_client.dart';
import '../services/profile_service.dart';

class CompleteProfileController extends GetxController {
  final ProfileService _profileService = Get.find<ProfileService>();

  // Loading states
  var isLoading = false.obs;
  var isSaving = false.obs;
  var optsLoading = true.obs;
  var isDone = false.obs;
  var currentStep = 1.obs;
  var errorMessage = ''.obs;

  static const int totalSteps = 7;

  // Options
  var opts = Rxn<OptionsModel>();

  // ─── Form state ───────────────────────────────────────────────────────────
  var form = <String, dynamic>{
    'photos': <String>[],
    'photos_blurred': false,
    'name': '',
    'gender': '',
    'date_of_birth': '',
    'marital_status': '',
    'has_children': '',
    'no_of_children': '',
    'phone': '',
    'country': 'Pakistan',
    'city': '',
    'nationality': '',
    'contact_hidden': '1',
    'latitude': null,
    'longitude': null,
    'religion': 'Muslim',
    'sect': 'Sunni',
    'religious_practice_level': '',
    'caste': '',
    'mother_tongue': '',
    'family_background': '',
    'father_occupation': '',
    'mother_occupation': 'Housewife',
    'brothers': '',
    'sisters': '',
    'height_inches': '68',
    'body_type': '',
    'education': '',
    'profession': '',
    'employment_type': '',
    'monthly_salary': '',
    'bio': '',
    'interests': <String>[],
    'willing_to_relocate': 'Maybe',
    'relationship': '',
    'is_guardian_required': '1',
    'profile_for': 'self',
  }.obs;

  // ─── Prefs state ─────────────────────────────────────────────────────────
  var prefs = <String, dynamic>{
    'pref_gender': '',
    'pref_age_min': '18',
    'pref_age_max': '60',
    'pref_marital_status': <String>[],
    'pref_nationality': <String>[],
    'pref_country': 'Pakistan',
    'pref_city': '',
    'pref_religion': 'Muslim',
    'pref_sect': <String>['Sunni'],
    'pref_religious_practice_level': '',
    'pref_height_min_inches': '60',
    'pref_height_max_inches': '90',
    'pref_body_type': <String>['Average'],
    'pref_caste': <String>[],
    'pref_mother_tongue': <String>[],
    'pref_education': '',
    'pref_employment_type': <String>[],
    'pref_monthly_salary': '',
    'pref_has_children': '',
    'pref_willing_to_relocate': 'No',
  }.obs;

  @override
  void onInit() {
    super.onInit();
    loadOptions();
    loadProfile();
  }

  void setForm(String key, dynamic value) {
    form[key] = value;
    form.refresh();
  }

  void setPrefs(String key, dynamic value) {
    prefs[key] = value;
    prefs.refresh();
  }

  dynamic getForm(String key) => form[key];
  dynamic getPref(String key) => prefs[key];

  // ─── Load options from API ────────────────────────────────────────────────
  Future<void> loadOptions() async {
    optsLoading.value = true;
    try {
      final data = await _profileService.getOptions();
      if (data != null) {
        opts.value = data;
        _applyDefaults(data);
        _applyPreferenceDefaults(data);
      }
    } catch (e) {
      print('Options load error: $e');
    } finally {
      optsLoading.value = false;
    }
  }

  void _applyDefaults(OptionsModel data) {
    final pakData = data.getCountryData('Pakistan');
    final cities = pakData['cities'] is List ? pakData['cities'] as List : [];
    final defaultCity = cities.contains('Islamabad')
        ? 'Islamabad'
        : cities.isNotEmpty
            ? cities.first.toString()
            : '';
    final nats = data.getNationalities('Pakistan');
    final defaultNat = nats.isNotEmpty ? nats.first : 'Pakistani';
    final tongues = data.getMotherTongues('Pakistan');
    final defaultTongue = tongues.contains('Punjabi')
        ? 'Punjabi'
        : tongues.isNotEmpty
            ? tongues.first
            : '';

    final practiceLvls = data.practiceLevels;
    final defaultPractice = practiceLvls.length > 2
        ? practiceLvls[2]
        : practiceLvls.isNotEmpty
            ? practiceLvls.first
            : 'Moderately Religious';

    final bodyTypes = data.bodyTypes;
    final defaultBodyType = bodyTypes.contains('Average')
        ? 'Average'
        : bodyTypes.length > 2
            ? bodyTypes[2]
            : '';

    final education = data.educationLevels;
    final defaultEdu = education.contains('Intermediate')
        ? 'Intermediate'
        : education.length > 4
            ? education[4]
            : education.isNotEmpty
                ? education.first
                : '';

    final employment = data.employmentTypes;
    final defaultEmp = employment.contains('Private')
        ? 'Private'
        : employment.length > 1
            ? employment[1]
            : employment.isNotEmpty
                ? employment.first
                : '';

    final marital = data.maritalStatuses;

    final fbList = data.getFamilyBackgrounds('Muslim');
    final relList = data.getRelationshipOptions('Muslim');

    if (form['city'] == null || form['city'].toString().isEmpty) setForm('city', defaultCity);
    if (form['nationality'] == null || form['nationality'].toString().isEmpty) setForm('nationality', defaultNat);
    if (form['mother_tongue'] == null || form['mother_tongue'].toString().isEmpty) setForm('mother_tongue', defaultTongue);
    if (form['religious_practice_level'] == null || form['religious_practice_level'].toString().isEmpty) setForm('religious_practice_level', defaultPractice);
    if (form['body_type'] == null || form['body_type'].toString().isEmpty) setForm('body_type', defaultBodyType);
    if (form['education'] == null || form['education'].toString().isEmpty) setForm('education', defaultEdu);
    if (form['employment_type'] == null || form['employment_type'].toString().isEmpty) setForm('employment_type', defaultEmp);
    if (form['marital_status'] == null || form['marital_status'].toString().isEmpty) {
      setForm('marital_status', marital.isNotEmpty ? marital.first : '');
    }
    if (form['family_background'] == null || form['family_background'].toString().isEmpty) {
      setForm('family_background', _random(fbList));
    }
    if (form['relationship'] == null || form['relationship'].toString().isEmpty) {
      setForm('relationship', _random(relList));
    }
  }

  void _applyPreferenceDefaults(OptionsModel data) {
    final edu = data.educationLevels;
    final defaultEdu = edu.contains('Intermediate')
        ? 'Intermediate'
        : edu.length > 4
            ? edu[4]
            : edu.isNotEmpty
                ? edu.first
                : '';
    final hasChild = data.hasChildren;
    final pakCities = data.getCities('Pakistan');

    if (prefs['pref_education'] == null || prefs['pref_education'].toString().isEmpty) {
      setPrefs('pref_education', defaultEdu);
    }
    if (prefs['pref_has_children'] == null || prefs['pref_has_children'].toString().isEmpty) {
      setPrefs('pref_has_children', hasChild.isNotEmpty ? hasChild.first : '');
    }
    if (prefs['pref_city'] == null || prefs['pref_city'].toString().isEmpty) {
      setPrefs('pref_city', pakCities.isNotEmpty ? pakCities.first : '');
    }
  }

  String _random(List<String> list) {
    if (list.isEmpty) return '';
    list.shuffle();
    return list.first;
  }

  // ─── Load existing profile ────────────────────────────────────────────────
  Future<void> loadProfile() async {
    try {
      final res = await _profileService.getCurrentUser();
      if (res == null) return;
      final p = res['profile'] ?? res['data'] ?? res;
      if (p == null) return;

      if (p['name'] != null) setForm('name', p['name'].toString());
      if (p['gender'] != null) setForm('gender', p['gender'].toString());
      if (p['date_of_birth'] != null) {
        setForm('date_of_birth', p['date_of_birth'].toString().split('T').first);
      }
      if (p['marital_status'] != null) setForm('marital_status', p['marital_status'].toString());
      if (p['phone'] != null) setForm('phone', p['phone'].toString());
      if (p['country'] != null) setForm('country', p['country'].toString());
      if (p['city'] != null) setForm('city', p['city'].toString());
      if (p['nationality'] != null) setForm('nationality', p['nationality'].toString());
      if (p['religion'] != null) setForm('religion', p['religion'].toString());
      if (p['sect'] != null) setForm('sect', p['sect'].toString());
      if (p['religious_practice_level'] != null) setForm('religious_practice_level', p['religious_practice_level'].toString());
      if (p['caste'] != null) setForm('caste', p['caste'].toString());
      if (p['mother_tongue'] != null) setForm('mother_tongue', p['mother_tongue'].toString());
      if (p['height_inches'] != null) setForm('height_inches', p['height_inches'].toString());
      if (p['body_type'] != null) setForm('body_type', p['body_type'].toString());
      if (p['education'] != null) setForm('education', p['education'].toString());
      if (p['profession'] != null) setForm('profession', p['profession'].toString());
      if (p['employment_type'] != null) setForm('employment_type', p['employment_type'].toString());
      if (p['monthly_salary'] != null) setForm('monthly_salary', p['monthly_salary'].toString());
      if (p['bio'] != null) setForm('bio', p['bio'].toString());
      if (p['family_background'] != null) setForm('family_background', p['family_background'].toString());
      if (p['father_occupation'] != null) setForm('father_occupation', p['father_occupation'].toString());
      if (p['mother_occupation'] != null) setForm('mother_occupation', p['mother_occupation'].toString());
      if (p['brothers'] != null) setForm('brothers', p['brothers'].toString());
      if (p['sisters'] != null) setForm('sisters', p['sisters'].toString());
      if (p['relationship'] != null) setForm('relationship', p['relationship'].toString());
      if (p['contact_hidden'] != null) setForm('contact_hidden', p['contact_hidden'].toString());

      // has_children
      final hc = p['has_children'];
      if (hc != null) setForm('has_children', hc == 1 || hc == true ? 'Has Children' : 'No Children');

      // willing_to_relocate
      final wtr = p['willing_to_relocate'];
      if (wtr != null) {
        setForm('willing_to_relocate', wtr == 1 ? 'Yes' : wtr == 0 ? 'No' : 'Maybe');
      }

      // interests
      if (p['interests'] != null) {
        dynamic ints = p['interests'];
        if (ints is String && ints.isNotEmpty) {
          try {
            ints = ints.split(',').map((e) => e.trim()).toList();
          } catch (_) {}
        }
        if (ints is List) setForm('interests', ints.map((e) => e.toString()).toList());
      }

      // images
      if (p['images'] != null) {
        dynamic imgs = p['images'];
        List<String> imgList = [];
        if (imgs is List) {
          imgList = imgs.map((e) => e.toString()).toList();
        } else if (imgs is String && imgs.isNotEmpty) {
          imgList = imgs
              .replaceAll('[', '')
              .replaceAll(']', '')
              .replaceAll('"', '')
              .split(',')
              .map((e) => e.trim())
              .where((e) => e.isNotEmpty)
              .toList();
        }
        setForm('photos', imgList);
      }
    } catch (e) {
      print('Load profile error: $e');
    }
  }

  // ─── Country change ───────────────────────────────────────────────────────
  void handleCountryChange(String country) {
    if (opts.value == null) return;
    final cd = opts.value!;
    final cities = cd.getCities(country);
    final nats = cd.getNationalities(country);
    final tongues = cd.getMotherTongues(country);
    final salaries = cd.getMonthlySalaries(country);

    setForm('country', country);
    setForm('city', cities.isNotEmpty ? cities.first : '');
    setForm('nationality', nats.isNotEmpty ? nats.first : '');
    final defaultTongue = tongues.contains('Punjabi')
        ? 'Punjabi'
        : tongues.isNotEmpty
            ? tongues.first
            : '';
    setForm('mother_tongue', defaultTongue);
    setForm('monthly_salary',
        salaries.length > 1 ? salaries[1] : salaries.isNotEmpty ? salaries.first : '');
  }

  void handlePrefCountryChange(String country) {
    if (opts.value == null) return;
    final cities = opts.value!.getCities(country);
    setPrefs('pref_country', country);
    setPrefs('pref_city', cities.isNotEmpty ? cities.first : '');
    setPrefs('pref_monthly_salary', '');
  }

  // ─── Age calculation ──────────────────────────────────────────────────────
  int? calcAge(String? dob) {
    if (dob == null || dob.isEmpty) return null;
    try {
      final b = DateTime.parse(dob);
      final now = DateTime.now();
      int age = now.year - b.year;
      if (now.month < b.month ||
          (now.month == b.month && now.day < b.day)) age--;
      return age > 0 ? age : null;
    } catch (_) {
      return null;
    }
  }

  // ─── Location ─────────────────────────────────────────────────────────────
  Future<void> requestLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        Get.snackbar('Location', 'Location services are disabled',
            snackPosition: SnackPosition.BOTTOM);
        return;
      }
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          Get.snackbar('Location', 'Location permission denied',
              snackPosition: SnackPosition.BOTTOM);
          return;
        }
      }
      if (permission == LocationPermission.deniedForever) {
        Get.snackbar('Location', 'Location permission permanently denied',
            snackPosition: SnackPosition.BOTTOM);
        return;
      }
      final position = await Geolocator.getCurrentPosition();
      setForm('latitude', position.latitude);
      setForm('longitude', position.longitude);
      Get.snackbar('Location', 'Location captured successfully',
          snackPosition: SnackPosition.BOTTOM);
    } catch (e) {
      Get.snackbar('Location', 'Failed to get location: $e',
          snackPosition: SnackPosition.BOTTOM);
    }
  }

  // ─── Random helpers ───────────────────────────────────────────────────────
  void randomizeFamilyBackground() {
    if (opts.value == null) return;
    final religion = form['religion']?.toString() ?? 'Muslim';
    final list = opts.value!.getFamilyBackgrounds(religion);
    setForm('family_background', _random(list));
  }

  void randomizeRelationship() {
    if (opts.value == null) return;
    final religion = form['religion']?.toString() ?? 'Muslim';
    final list = opts.value!.getRelationshipOptions(religion);
    setForm('relationship', _random(list));
  }

  void randomizeBio() {
    if (opts.value == null) return;
    final religion = form['religion']?.toString() ?? 'Muslim';
    final profession = form['profession']?.toString() ?? '';
    final list = opts.value!.getAboutMe(religion, profession);
    setForm('bio', _random(list));
  }

  // ─── Validation ───────────────────────────────────────────────────────────
  List<String> validateStep(int step) {
    final missing = <String>[];
    if (step == 1) {
      if (form['date_of_birth'] == null || form['date_of_birth'].toString().isEmpty) missing.add('Date of Birth');
      if (form['marital_status'] == null || form['marital_status'].toString().isEmpty) missing.add('Marital Status');
    }
    if (step == 2) {
      if (form['country'] == null || form['country'].toString().isEmpty) missing.add('Country');
      if (form['city'] == null || form['city'].toString().isEmpty) missing.add('City');
      if (form['nationality'] == null || form['nationality'].toString().isEmpty) missing.add('Nationality');
    }
    if (step == 3) {
      if (form['religion'] == null || form['religion'].toString().isEmpty) missing.add('Religion');
      if (form['religious_practice_level'] == null || form['religious_practice_level'].toString().isEmpty) missing.add('Practice Level');
      if (form['father_occupation'] == null || form['father_occupation'].toString().isEmpty) missing.add("Father's Occupation");
      if (form['brothers'] == null || form['brothers'].toString().isEmpty) missing.add('No. of Brothers');
      if (form['sisters'] == null || form['sisters'].toString().isEmpty) missing.add('No. of Sisters');
    }
    if (step == 4) {
      if (form['height_inches'] == null || form['height_inches'].toString().isEmpty) missing.add('Height');
      if (form['body_type'] == null || form['body_type'].toString().isEmpty) missing.add('Body Type');
    }
    if (step == 5) {
      if (form['education'] == null || form['education'].toString().isEmpty) missing.add('Education Level');
      if (form['profession'] == null || form['profession'].toString().isEmpty) missing.add('Profession');
      if (form['employment_type'] == null || form['employment_type'].toString().isEmpty) missing.add('Employment Type');
    }
    if (step == 6) {
      if (form['bio'] == null || form['bio'].toString().isEmpty) missing.add('About Me');
      if (form['relationship'] == null || form['relationship'].toString().isEmpty) missing.add('Relationship Intent');
    }
    return missing;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  Future<void> submit() async {
    isSaving.value = true;
    errorMessage.value = '';

    try {
      final hc = form['has_children'];
      final wtr = form['willing_to_relocate'];
      final ints = form['interests'];
      String interestsStr = '';
      if (ints is List) interestsStr = ints.join(',');

      final profileData = <String, dynamic>{
        'name': form['name'],
        'gender': form['gender'],
        'date_of_birth': form['date_of_birth'],
        'age': calcAge(form['date_of_birth']?.toString()),
        'marital_status': form['marital_status'],
        'phone': form['phone'],
        'country': form['country'],
        'city': form['city'],
        'nationality': form['nationality'],
        'religion': form['religion'],
        'sect': form['sect'],
        'religious_practice_level': form['religious_practice_level'],
        'caste': form['caste'],
        'mother_tongue': form['mother_tongue'],
        'height_inches': form['height_inches'],
        'body_type': form['body_type'],
        'education': form['education'],
        'profession': form['profession'],
        'employment_type': form['employment_type'],
        'monthly_salary': form['monthly_salary'],
        'bio': form['bio'],
        'family_background': form['family_background'],
        'interests': interestsStr,
        'has_children': hc == 'Has Children' ? 1 : 0,
        'willing_to_relocate': wtr == 'Yes' ? 1 : wtr == 'No' ? 0 : null,
        'relationship': form['relationship'],
        'contact_hidden': int.tryParse(form['contact_hidden']?.toString() ?? '0') ?? 0,
        'is_guardian_required': int.tryParse(form['is_guardian_required']?.toString() ?? '1') ?? 1,
        'father_occupation': form['father_occupation'],
        'mother_occupation': form['mother_occupation'],
        'brothers': int.tryParse(form['brothers']?.toString() ?? '0') ?? 0,
        'sisters': int.tryParse(form['sisters']?.toString() ?? '0') ?? 0,
        'latitude': form['latitude'],
        'longitude': form['longitude'],
        'is_profile_completed': 1,
        'photos_blurred': form['photos_blurred'] == true ? 1 : 0,
      };

      final response = await _profileService.updateProfile(profileData);

      if (response != null && response['success'] == true) {
        // Save preferences
        final hasPrefs = prefs['pref_gender'] != '' ||
            prefs['pref_religion'] != '' ||
            prefs['pref_age_min'] != '';

        if (hasPrefs) {
          final prefData = <String, dynamic>{
            'pref_gender': prefs['pref_gender'],
            'pref_age_min': prefs['pref_age_min'],
            'pref_age_max': prefs['pref_age_max'],
            'pref_marital_status': prefs['pref_marital_status'],
            'pref_nationality': prefs['pref_nationality'],
            'pref_country': prefs['pref_country'],
            'pref_city': prefs['pref_city'],
            'pref_religion': prefs['pref_religion'],
            'pref_sect': prefs['pref_sect'],
            'pref_religious_practice_level': prefs['pref_religious_practice_level'],
            'pref_height_min_inches': prefs['pref_height_min_inches'],
            'pref_height_max_inches': prefs['pref_height_max_inches'],
            'pref_body_type': prefs['pref_body_type'],
            'pref_education': prefs['pref_education'],
            'pref_employment_type': prefs['pref_employment_type'],
            'pref_monthly_salary': prefs['pref_monthly_salary'],
            'pref_has_children': prefs['pref_has_children'],
            'pref_willing_to_relocate': prefs['pref_willing_to_relocate'] == 'Yes'
                ? 1
                : prefs['pref_willing_to_relocate'] == 'No'
                    ? 0
                    : null,
          };
          await _profileService.updatePrefs(prefData);
        }

        isDone.value = true;
      } else {
        errorMessage.value =
            response?['error'] ?? response?['message'] ?? 'Failed to save profile';
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: ${e.toString()}';
    } finally {
      isSaving.value = false;
    }
  }

  // ─── Height helpers ───────────────────────────────────────────────────────
  static String inchesToFtIn(int inches) {
    final ft = inches ~/ 12;
    final inch = inches % 12;
    return "$ft'$inch\"";
  }

  static List<Map<String, String>> heightOptions() {
    return List.generate(31, (i) {
      final inches = 60 + i;
      return {
        'value': inches.toString(),
        'label': '${inchesToFtIn(inches)} (${inches}")',
      };
    });
  }

  static List<String> ageOptions() {
    return List.generate(43, (i) => (18 + i).toString());
  }
}
