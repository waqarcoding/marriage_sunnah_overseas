class DislikeModel {
  final int id;
  final int userId;
  final int targetUserId;
  final DateTime createdAt;
  final DateTime updatedAt;

  DislikeModel({
    required this.id,
    required this.userId,
    required this.targetUserId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DislikeModel.fromJson(Map<String, dynamic> json) {
    return DislikeModel(
      id: json['id'],
      userId: json['user_id'],
      targetUserId: json['target_user_id'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'target_user_id': targetUserId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
