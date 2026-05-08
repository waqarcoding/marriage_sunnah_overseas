class DislikeModel {
  final int id;
  final int userId;
  final int targetUserId;
  final DateTime created_at;
  final DateTime updated_at;

  DislikeModel({
    required this.id,
    required this.userId,
    required this.targetUserId,
    required this.created_at,
    required this.updated_at,
  });

  factory DislikeModel.fromJson(Map<String, dynamic> json) {
    return DislikeModel(
      id: json['id'],
      userId: json['user_id'],
      targetUserId: json['target_user_id'],
      created_at: DateTime.parse(json['created_at']),
      updated_at: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'target_user_id': targetUserId,
      'created_at': created_at.toIso8601String(),
      'updated_at': updated_at.toIso8601String(),
    };
  }
}
