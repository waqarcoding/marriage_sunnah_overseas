// lib/features/guardian/models/guardian_model.dart

class GuardianModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String avatar;
  final String relationship;
  final String city;
  final String country;
  final String profession;

  const GuardianModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatar,
    required this.relationship,
    required this.city,
    required this.country,
    required this.profession,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'avatar': avatar,
      };
}
