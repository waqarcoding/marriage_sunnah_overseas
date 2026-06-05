class ProfileModel {
  final int? id;
  final int? individualId;
  final int? guardianId;
  final String? name;
  final String? gender;
  final String? dateOfBirth;
  final int? age;
  final String? maritalStatus;
  final String? phone;
  final String? country;
  final String? city;
  final String? nationality;
  final String? religion;
  final String? sect;
  final String? religiousPracticeLevel;
  final String? caste;
  final String? motherTongue;
  final int? heightInches;
  final String? bodyType;
  final String? education;
  final String? profession;
  final String? employmentType;
  final String? monthlySalary;
  final String? bio;
  final String? familyBackground;
  final dynamic interests;
  final int? hasChildren;
  final int? noOfChildren;
  final int? willingToRelocate;
  final String? relationship;
  final int? contactHidden;
  final int? isGuardianRequired;
  final String? fatherOccupation;
  final String? motherOccupation;
  final int? brothers;
  final int? sisters;
  final dynamic images;
  final String? avatarUrl;
  final double? latitude;
  final double? longitude;
  final int? isProfileCompleted;
  final int? photosBlurred;
  final String? frontidUrl;
  final String? backidUrl;
  final bool? isVerified;
  final bool? isPro;

  ProfileModel({
    this.id,
    this.individualId,
    this.guardianId,
    this.name,
    this.gender,
    this.dateOfBirth,
    this.age,
    this.maritalStatus,
    this.phone,
    this.country,
    this.city,
    this.nationality,
    this.religion,
    this.sect,
    this.religiousPracticeLevel,
    this.caste,
    this.motherTongue,
    this.heightInches,
    this.bodyType,
    this.education,
    this.profession,
    this.employmentType,
    this.monthlySalary,
    this.bio,
    this.familyBackground,
    this.interests,
    this.hasChildren,
    this.noOfChildren,
    this.willingToRelocate,
    this.relationship,
    this.contactHidden,
    this.isGuardianRequired,
    this.fatherOccupation,
    this.motherOccupation,
    this.brothers,
    this.sisters,
    this.images,
    this.avatarUrl,
    this.latitude,
    this.longitude,
    this.isProfileCompleted,
    this.photosBlurred,
    this.frontidUrl,
    this.backidUrl,
    this.isVerified,
    this.isPro,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'],
      individualId: json['individual_id'],
      guardianId: json['guardian_id'],
      name: json['name']?.toString(),
      gender: json['gender']?.toString(),
      dateOfBirth: json['date_of_birth']?.toString()?.split('T')?.first,
      age: json['age'] is int ? json['age'] : int.tryParse(json['age']?.toString() ?? ''),
      maritalStatus: json['marital_status']?.toString(),
      phone: json['phone']?.toString(),
      country: json['country']?.toString(),
      city: json['city']?.toString(),
      nationality: json['nationality']?.toString(),
      religion: json['religion']?.toString(),
      sect: json['sect']?.toString(),
      religiousPracticeLevel: json['religious_practice_level']?.toString(),
      caste: json['caste']?.toString(),
      motherTongue: json['mother_tongue']?.toString(),
      heightInches: json['height_inches'] is int ? json['height_inches'] : int.tryParse(json['height_inches']?.toString() ?? ''),
      bodyType: json['body_type']?.toString(),
      education: json['education']?.toString(),
      profession: json['profession']?.toString(),
      employmentType: json['employment_type']?.toString(),
      monthlySalary: json['monthly_salary']?.toString(),
      bio: json['bio']?.toString(),
      familyBackground: json['family_background']?.toString(),
      interests: json['interests'],
      hasChildren: json['has_children'] is int ? json['has_children'] : int.tryParse(json['has_children']?.toString() ?? ''),
      noOfChildren: json['no_of_children'] is int ? json['no_of_children'] : int.tryParse(json['no_of_children']?.toString() ?? ''),
      willingToRelocate: json['willing_to_relocate'] is int ? json['willing_to_relocate'] : int.tryParse(json['willing_to_relocate']?.toString() ?? ''),
      relationship: json['relationship']?.toString(),
      contactHidden: json['contact_hidden'] is int ? json['contact_hidden'] : int.tryParse(json['contact_hidden']?.toString() ?? ''),
      isGuardianRequired: json['is_guardian_required'] is int ? json['is_guardian_required'] : int.tryParse(json['is_guardian_required']?.toString() ?? ''),
      fatherOccupation: json['father_occupation']?.toString(),
      motherOccupation: json['mother_occupation']?.toString(),
      brothers: json['brothers'] is int ? json['brothers'] : int.tryParse(json['brothers']?.toString() ?? ''),
      sisters: json['sisters'] is int ? json['sisters'] : int.tryParse(json['sisters']?.toString() ?? ''),
      images: json['images'],
      avatarUrl: json['avatar_url']?.toString(),
      latitude: json['latitude'] is double ? json['latitude'] : double.tryParse(json['latitude']?.toString() ?? ''),
      longitude: json['longitude'] is double ? json['longitude'] : double.tryParse(json['longitude']?.toString() ?? ''),
      isProfileCompleted: json['is_profile_completed'] is int ? json['is_profile_completed'] : int.tryParse(json['is_profile_completed']?.toString() ?? ''),
      photosBlurred: json['photos_blurred'] is int ? json['photos_blurred'] : int.tryParse(json['photos_blurred']?.toString() ?? ''),
      frontidUrl: json['frontid_url']?.toString(),
      backidUrl: json['backid_url']?.toString(),
      isVerified: json['is_verified'] == true || json['is_verified'] == 1,
      isPro: json['is_pro'] == true || json['is_pro'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'individual_id': individualId,
      'name': name,
      'gender': gender,
      'date_of_birth': dateOfBirth,
      'age': age,
      'marital_status': maritalStatus,
      'phone': phone,
      'country': country,
      'city': city,
      'nationality': nationality,
      'religion': religion,
      'sect': sect,
      'religious_practice_level': religiousPracticeLevel,
      'caste': caste,
      'mother_tongue': motherTongue,
      'height_inches': heightInches,
      'body_type': bodyType,
      'education': education,
      'profession': profession,
      'employment_type': employmentType,
      'monthly_salary': monthlySalary,
      'bio': bio,
      'family_background': familyBackground,
      'interests': interests,
      'has_children': hasChildren,
      'no_of_children': noOfChildren,
      'willing_to_relocate': willingToRelocate,
      'relationship': relationship,
      'contact_hidden': contactHidden,
      'is_guardian_required': isGuardianRequired,
      'father_occupation': fatherOccupation,
      'mother_occupation': motherOccupation,
      'brothers': brothers,
      'sisters': sisters,
      'latitude': latitude,
      'longitude': longitude,
      'is_profile_completed': isProfileCompleted,
      'photos_blurred': photosBlurred,
    };
  }

  List<String> getImages() {
    if (images == null) return [];
    if (images is List) {
      return (images as List).map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
    }
    try {
      final parsed = images.toString();
      if (parsed.startsWith('[')) {
        return parsed
            .replaceAll('[', '')
            .replaceAll(']', '')
            .replaceAll('"', '')
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList();
      }
    } catch (_) {}
    return [];
  }
}
