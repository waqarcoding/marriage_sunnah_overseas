class GuardianModel {
  final int id;
  final int guardianId;
  final int profileId;

  final String name;
  final String? image;
  final String? relationship;

  final bool contactHidden;
  final bool isVerified;

  final DateTime created_at;
  final DateTime updated_at;

  GuardianModel({
    required this.id,
    required this.guardianId,
    required this.profileId,
    required this.name,
    this.image,
    this.relationship,
    required this.contactHidden,
    required this.isVerified,
    required this.created_at,
    required this.updated_at,
  });

  factory GuardianModel.fromJson(Map<String, dynamic> json) {
    return GuardianModel(
      id: json['id'],
      guardianId: json['guardian_id'],
      profileId: json['profile_id'],
      name: json['name'],
      image: json['image'],
      relationship: json['relationship'],
      contactHidden:
          json['contact_hidden'] == 1 || json['contact_hidden'] == true,
      isVerified: json['is_verified'] == 1 || json['is_verified'] == true,
      created_at: DateTime.parse(json['created_at']),
      updated_at: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'guardian_id': guardianId,
      'profile_id': profileId,
      'name': name,
      'image': image,
      'relationship': relationship,
      'contact_hidden': contactHidden,
      'is_verified': isVerified,
      'created_at': created_at.toIso8601String(),
      'updated_at': updated_at.toIso8601String(),
    };
  }
}
