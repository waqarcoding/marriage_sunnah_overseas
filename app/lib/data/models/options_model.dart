class OptionsModel {
  final List<String> countries;
  final Map<String, String> countryFlags;
  final Map<String, dynamic> countryData;
  final List<String> allCountries;
  final List<String> allNationalities;
  final List<String> allMotherTongues;
  final List<String> religions;
  final List<String> sects;
  final List<String> castes;
  final List<String> maritalStatuses;
  final List<String> educationLevels;
  final List<String> bodyTypes;
  final List<String> employmentTypes;
  final List<String> hasChildren;
  final List<String> practiceLevels;
  final List<String> willingToRelocate;
  final List<String> interests;
  final List<String> professions;
  final Map<String, dynamic> monthlySalary;
  final Map<String, dynamic> familyBackgrounds;
  final Map<String, dynamic> aboutMe;
  final Map<String, dynamic> relationshipOptions;
  final Map<String, dynamic>? preferences;

  OptionsModel({
    this.countries = const [],
    this.countryFlags = const {},
    this.countryData = const {},
    this.allCountries = const [],
    this.allNationalities = const [],
    this.allMotherTongues = const [],
    this.religions = const [],
    this.sects = const [],
    this.castes = const [],
    this.maritalStatuses = const [],
    this.educationLevels = const [],
    this.bodyTypes = const [],
    this.employmentTypes = const [],
    this.hasChildren = const [],
    this.practiceLevels = const [],
    this.willingToRelocate = const [],
    this.interests = const [],
    this.professions = const [],
    this.monthlySalary = const {},
    this.familyBackgrounds = const {},
    this.aboutMe = const {},
    this.relationshipOptions = const {},
    this.preferences,
  });

  factory OptionsModel.fromJson(Map<String, dynamic> json) {
    List<String> parseList(dynamic val) {
      if (val == null) return [];
      if (val is List) return val.map((e) => e.toString()).toList();
      return [];
    }

    Map<String, String> parseStringMap(dynamic val) {
      if (val == null) return {};
      if (val is Map) return val.map((k, v) => MapEntry(k.toString(), v.toString()));
      return {};
    }

    Map<String, dynamic> parseDynMap(dynamic val) {
      if (val == null) return {};
      if (val is Map) return Map<String, dynamic>.from(val);
      return {};
    }

    return OptionsModel(
      countries: parseList(json['countries']),
      countryFlags: parseStringMap(json['country_flags']),
      countryData: parseDynMap(json['country_data']),
      allCountries: parseList(json['all_countries']),
      allNationalities: parseList(json['all_nationalities']),
      allMotherTongues: parseList(json['all_mother_tongues']),
      religions: parseList(json['religions']),
      sects: parseList(json['sects']),
      castes: parseList(json['castes']),
      maritalStatuses: parseList(json['marital_statuses']),
      educationLevels: parseList(json['education_levels']),
      bodyTypes: parseList(json['body_types']),
      employmentTypes: parseList(json['employment_types']),
      hasChildren: parseList(json['has_children']),
      practiceLevels: parseList(json['practice_levels']),
      willingToRelocate: parseList(json['willing_to_relocate']),
      interests: parseList(json['interests']),
      professions: parseList(json['professions']),
      monthlySalary: parseDynMap(json['monthly_salary']),
      familyBackgrounds: parseDynMap(json['family_backgrounds']),
      aboutMe: parseDynMap(json['about_me']),
      relationshipOptions: parseDynMap(json['relationship_options']),
      preferences: json['preferences'] != null
          ? Map<String, dynamic>.from(json['preferences'])
          : null,
    );
  }

  Map<String, dynamic> getCountryData(String country) {
    if (countryData.containsKey(country)) {
      return Map<String, dynamic>.from(countryData[country]);
    }
    return {};
  }

  List<String> getCities(String country) {
    final data = getCountryData(country);
    final cities = data['cities'];
    if (cities is List) return cities.map((e) => e.toString()).toList();
    return [];
  }

  List<String> getNationalities(String country) {
    final data = getCountryData(country);
    final nats = data['nationalities'];
    if (nats is List) return nats.map((e) => e.toString()).toList();
    return allNationalities;
  }

  List<String> getMotherTongues(String country) {
    final data = getCountryData(country);
    final tongues = data['mother_tongues'];
    if (tongues is List) return tongues.map((e) => e.toString()).toList();
    return allMotherTongues;
  }

  List<String> getMonthlySalaries(String country) {
    final data = getCountryData(country);
    final salaries = data['monthly_salaries'];
    if (salaries is List) return salaries.map((e) => e.toString()).toList();
    return [];
  }

  String getCurrency(String country) {
    final data = getCountryData(country);
    return data['currency']?.toString() ?? '';
  }

  String getFlag(String country) {
    return countryFlags[country] ?? '🌍';
  }

  List<String> getRelationshipOptions(String religion) {
    final key = religion.toLowerCase() == 'muslim' ? 'muslim' : 'other';
    final opts = relationshipOptions[key];
    if (opts is List) return opts.map((e) => e.toString()).toList();
    return [];
  }

  List<String> getFamilyBackgrounds(String religion) {
    final key = religion.toLowerCase() == 'muslim' ? 'muslim' : 'other';
    final opts = familyBackgrounds[key];
    if (opts is List) return opts.map((e) => e.toString()).toList();
    return [];
  }

  List<String> getAboutMe(String religion, String profession) {
    final key = religion.toLowerCase() == 'muslim' ? 'muslim' : 'other';
    final byRel = aboutMe[key];
    if (byRel is Map) {
      final byProf = byRel[profession] ?? byRel['default'];
      if (byProf is List) return byProf.map((e) => e.toString()).toList();
    }
    return [];
  }
}
