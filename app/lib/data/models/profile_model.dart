import 'user_model.dart';
import 'guardian_model.dart';

class ProfileModel {
  final int? id;
  final int userId;
  final int? guardianId;
  final String name;
  final String? image;
  final String gender;
  final String dateOfBirth;
  final int age;
  final String maritalStatus;
  final String country;
  final String city;
  final String nationality;
  final String? education;
  final String? profession;
  final String? religiousPracticeLevel;
  final String? familyBackground;
  final String? bio;
  final List<String>? interests;

  // Optional nested relations
  final UserModel? user;
  final GuardianModel? guardian;

  final String? createdAt;
  final String? updatedAt;

  ProfileModel({
    this.id,
    required this.userId,
    this.guardianId,
    required this.name,
    this.image,
    required this.gender,
    required this.dateOfBirth,
    required this.age,
    required this.maritalStatus,
    required this.country,
    required this.city,
    required this.nationality,
    this.education,
    this.profession,
    this.religiousPracticeLevel,
    this.familyBackground,
    this.bio,
    this.interests,
    this.user,
    this.guardian,
    this.createdAt,
    this.updatedAt,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'],
      userId: json['user_id'],
      guardianId: json['guardian_id'],
      name: json['name'],
      image: json['image'],
      gender: json['gender'],
      dateOfBirth: json['date_of_birth'],
      age: json['age'],
      maritalStatus: json['marital_status'],
      country: json['country'],
      city: json['city'],
      nationality: json['nationality'],
      education: json['education'],
      profession: json['profession'],
      religiousPracticeLevel: json['religious_practice_level'],
      familyBackground: json['family_background'],
      bio: json['bio'],
      interests:
          json['interests'] != null ? List<String>.from(json['interests']) : [],
      user: json['user'] != null ? UserModel.fromJson(json['user']) : null,
      guardian:
          json['guardian'] != null
              ? GuardianModel.fromJson(json['guardian'])
              : null,
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'guardian_id': guardianId,
      'name': name,
      'image': image,
      'gender': gender,
      'date_of_birth': dateOfBirth,
      'age': age,
      'marital_status': maritalStatus,
      'country': country,
      'city': city,
      'nationality': nationality,
      'education': education,
      'profession': profession,
      'religious_practice_level': religiousPracticeLevel,
      'family_background': familyBackground,
      'bio': bio,
      'interests': interests ?? [],
      'user': user?.toJson(),
      'guardian': guardian?.toJson(),
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}
