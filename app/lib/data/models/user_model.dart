class UserModel {
  final int id;
  final String email;
  final String name;
  final String? phone;
  final String role;
  final String? gender;
  final String? avatarUrl;
  final bool isVerified;
  final bool isPro;
  final int credits;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    required this.role,
    this.gender,
    this.avatarUrl,
    this.isVerified = false,
    this.isPro = false,
    this.credits = 0,
    this.createdAt,
    this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'individual',
      gender: json['gender'],
      avatarUrl: json['avatar_url'],
      isVerified: json['is_verified'] == 1 || json['is_verified'] == true,
      isPro: json['is_pro'] == 1 || json['is_pro'] == true,
      credits: json['credits'] ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'role': role,
      'gender': gender,
      'avatar_url': avatarUrl,
      'is_verified': isVerified,
      'is_pro': isPro,
      'credits': credits,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}
