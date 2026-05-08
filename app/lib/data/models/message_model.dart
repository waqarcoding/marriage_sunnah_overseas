class MessageModel {
  final int id;
  final int senderId;
  final int receiverId;
  final String message;
  final int? interestId;
  final bool isSeen;

  final DateTime created_at;
  final DateTime updated_at;

  MessageModel({
    required this.id,
    required this.senderId,
    required this.receiverId,
    required this.message,
    this.interestId,
    required this.isSeen,
    required this.created_at,
    required this.updated_at,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id'],
      senderId: json['sender_id'],
      receiverId: json['receiver_id'],
      message: json['message'],
      interestId: json['interest_id'],
      isSeen: json['is_seen'] == 1 || json['is_seen'] == true,
      created_at: DateTime.parse(json['created_at']),
      updated_at: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sender_id': senderId,
      'receiver_id': receiverId,
      'message': message,
      'interest_id': interestId,
      'is_seen': isSeen,
      'created_at': created_at.toIso8601String(),
      'updated_at': updated_at.toIso8601String(),
    };
  }
}
