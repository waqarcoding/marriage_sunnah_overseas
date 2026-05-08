import 'package:app/data/models/Interest_model.dart';

import 'profile_model.dart';
import 'guardian_model.dart';
import 'match_model.dart';

class UserModel {
  final int? id;
  final String email;
  final String mobile;
  final String? passwordHash;
  final String role;
  final bool? isOnline;
  final bool? isSuspended;
  final bool? isDeleted;
  final bool? isVerified;
  final bool? isPremium;
  final String? created_at;
  final String? updated_at;

  // Nested relations
  final ProfileModel? profile;
  final List<ProfileModel>? managedProfiles;
  final List<GuardianModel>? guardians;
  final List<MatchModel>? matchesAsUser1;
  final List<MatchModel>? matchesAsUser2;
  final List<InterestModel>? sentInterests;
  final List<InterestModel>? receivedInterests;

  UserModel({
    this.id,
    required this.email,
    required this.mobile,
    this.passwordHash,
    required this.role,
    this.isOnline,
    this.isSuspended,
    this.isDeleted,
    this.isVerified,
    this.isPremium,
    this.created_at,
    this.updated_at,
    this.profile,
    this.managedProfiles,
    this.guardians,
    this.matchesAsUser1,
    this.matchesAsUser2,
    this.sentInterests,
    this.receivedInterests,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'],
      mobile: json['mobile'],
      passwordHash: json['password_hash'],
      role: json['role'],
      isOnline: json['is_online'] == 1,
      isSuspended: json['is_suspended'] == 1,
      isDeleted: json['is_deleted'] == 1,
      isVerified: json['is_verified'] == 1,
      isPremium: json['is_pro'] == 1,
      created_at: json['created_at'],
      updated_at: json['updated_at'],

      // Nested relations
      profile:
          json['profile'] != null
              ? ProfileModel.fromJson(json['profile'])
              : null,
      managedProfiles:
          json['managedProfiles'] != null
              ? List<ProfileModel>.from(
                json['managedProfiles'].map((x) => ProfileModel.fromJson(x)),
              )
              : [],
      guardians:
          json['guardians'] != null
              ? List<GuardianModel>.from(
                json['guardians'].map((x) => GuardianModel.fromJson(x)),
              )
              : [],
      matchesAsUser1:
          json['matchesAsUser1'] != null
              ? List<MatchModel>.from(
                json['matchesAsUser1'].map((x) => MatchModel.fromJson(x)),
              )
              : [],
      matchesAsUser2:
          json['matchesAsUser2'] != null
              ? List<MatchModel>.from(
                json['matchesAsUser2'].map((x) => MatchModel.fromJson(x)),
              )
              : [],
      sentInterests:
          json['sentInterests'] != null
              ? List<InterestModel>.from(
                json['sentInterests'].map((x) => InterestModel.fromJson(x)),
              )
              : [],
      receivedInterests:
          json['receivedInterests'] != null
              ? List<InterestModel>.from(
                json['receivedInterests'].map((x) => InterestModel.fromJson(x)),
              )
              : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'mobile': mobile,
      'password_hash': passwordHash,
      'role': role,
      'is_online': isOnline,
      'is_suspended': isSuspended,
      'is_deleted': isDeleted,
      'is_verified': isVerified,
      'is_pro': isPremium,
      'created_at': created_at,
      'updated_at': updated_at,
      'profile': profile?.toJson(),
      'managedProfiles': managedProfiles?.map((x) => x.toJson()).toList() ?? [],
      'guardians': guardians?.map((x) => x.toJson()).toList() ?? [],
      'matchesAsUser1': matchesAsUser1?.map((x) => x.toJson()).toList() ?? [],
      'matchesAsUser2': matchesAsUser2?.map((x) => x.toJson()).toList() ?? [],
      'sentInterests': sentInterests?.map((x) => x.toJson()).toList() ?? [],
      'receivedInterests':
          receivedInterests?.map((x) => x.toJson()).toList() ?? [],
    };
  }
}
