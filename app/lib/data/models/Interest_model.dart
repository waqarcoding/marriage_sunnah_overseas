import 'user_model.dart';

class InterestModel {
  final int? id;
  final String? status;
  final bool? guardianApproved;
  final int fromUserId;
  final int toUserId;
  final bool? isMutual;
  final String? created_at;
  final String? updated_at;

  // Nested relations
  final UserModel? fromUser;
  final UserModel? toUser;

  InterestModel({
    this.id,
    this.status,
    this.guardianApproved,
    required this.fromUserId,
    required this.toUserId,
    this.isMutual,
    this.created_at,
    this.updated_at,
    this.fromUser,
    this.toUser,
  });

  factory InterestModel.fromJson(Map<String, dynamic> json) {
    return InterestModel(
      id: json['id'],
      status: json['status'],
      guardianApproved: json['guardian_approved'] == 1,
      fromUserId: json['from_user'],
      toUserId: json['to_user'],
      isMutual: json['is_mutual'] == 1,
      created_at: json['created_at'],
      updated_at: json['updated_at'],
      fromUser:
          json['fromUser'] != null
              ? UserModel.fromJson(json['fromUser'])
              : null,
      toUser:
          json['toUser'] != null ? UserModel.fromJson(json['toUser']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'status': status,
      'guardian_approved': guardianApproved,
      'from_user': fromUserId,
      'to_user': toUserId,
      'is_mutual': isMutual,
      'created_at': created_at,
      'updated_at': updated_at,
      'fromUser': fromUser?.toJson(),
      'toUser': toUser?.toJson(),
    };
  }
}
