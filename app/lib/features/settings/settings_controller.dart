import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsController extends GetxController {
  var isFirstRun = true.obs;
  var isDark = true.obs;
  var soundEffects = false.obs;
  var language = "English (US)".obs;
  var aiModel = "black-forest-labs/flux-schnell".obs;
  List<String> aiModelList = [
    "black-forest-labs/flux-schnell",
    "black-forest-labs/flux-dev"
  ];
  var creativity = "Balanced".obs;
  var filters = "Auto-enhance enabled".obs;
  var locale = const Locale('en', 'US').obs;
  late SharedPreferences _prefs;

  final List<AppLanguage> languages = [
    AppLanguage("English (US)", const Locale('en', 'US')),
    AppLanguage("German", const Locale('de', 'DE')),
    AppLanguage("Spanish", const Locale('es', 'ES')),
    AppLanguage("Japanese", const Locale('ja', 'JP')),
    AppLanguage("Chinese", const Locale('zh', 'CN')),
    AppLanguage("Urdu", const Locale('ur', 'PK')),
    AppLanguage("Hindi", const Locale('hi', 'IN')),
    AppLanguage("Arabic", const Locale('ar', 'SA')),
  ];

  @override
  void onInit() {
    super.onInit();
    _loadSettings();
  }

  @override
  void onReady() {
    super.onReady();
    init();
  }

  Future<void> _loadSettings() async {
    _prefs = await SharedPreferences.getInstance();

    isDark.value = _prefs.getBool('isDark') ?? true;
    soundEffects.value = _prefs.getBool('soundEffects') ?? false;
    language.value = _prefs.getString('language') ?? "English (US)";
    aiModel.value =
        _prefs.getString('aiModel') ?? "black-forest-labs/flux-schnell";
    creativity.value = _prefs.getString('creativity') ?? "Balanced";
    filters.value = _prefs.getString('filters') ?? "Auto-enhance enabled";

    locale.value = _mapLanguageToLocale(language.value);
    Get.updateLocale(locale.value);

    checkFirstRun();
  }

  Future<bool> checkFirstRun() async {
    final prefs = await SharedPreferences.getInstance();
    bool? alreadyRun = prefs.getBool('isFirstRun');

    if (alreadyRun == null || alreadyRun == true) {
      isFirstRun.value = true;
      await prefs.setBool('isFirstRun', false);
      Get.changeThemeMode(ThemeMode.dark);
    } else {
      isFirstRun.value = false;
    }

    return isFirstRun.value;
  }

  Locale _mapLanguageToLocale(String lang) {
    switch (lang) {
      case "Urdu": return const Locale('ur', 'PK');
      case "Arabic": return const Locale('ar', 'SA');
      case "Hindi": return const Locale('hi', 'IN');
      case "Spanish": return const Locale('es', 'ES');
      case "Japanese": return const Locale('ja', 'JP');
      case "Chinese": return const Locale('zh', 'CN');
      case "German": return const Locale('de', 'DE');
      default: return const Locale('en', 'US');
    }
  }

  void setDarkMode(bool value) async {
    isDark.value = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDark', value);
    Get.changeThemeMode(value ? ThemeMode.dark : ThemeMode.light);
  }

  void setSoundEffects(bool value) {
    soundEffects.value = value;
    _prefs.setBool('soundEffects', value);
  }

  void setLanguage(String selected) {
    final lang = languages.firstWhere((l) => l.name == selected);

    language.value = lang.name;
    locale.value = lang.locale;
    Get.updateLocale(lang.locale);

    _prefs.setString('language', lang.name);
  }

  void setAIModel(String value) {
    aiModel.value = value;
    _prefs.setString('aiModel', value);
  }

  void setCreativity(String value) {
    creativity.value = value;
    _prefs.setString('creativity', value);
  }

  void setFilters(String value) {
    filters.value = value;
    _prefs.setString('filters', value);
  }

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _loadSettings();
  }
}

class AppLanguage {
  final String name;
  final Locale locale;
  AppLanguage(this.name, this.locale);
}
