class MatchModel {
  final int id;
  final int user1;
  final int user2;
  final DateTime created_at;
  final DateTime updated_at;

  MatchModel({
    required this.id,
    required this.user1,
    required this.user2,
    required this.created_at,
    required this.updated_at,
  });

  factory MatchModel.fromJson(Map<String, dynamic> json) {
    return MatchModel(
      id: json['id'],
      user1: json['user1'],
      user2: json['user2'],
      created_at: DateTime.parse(json['created_at']),
      updated_at: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user1': user1,
      'user2': user2,
      'created_at': created_at.toIso8601String(),
      'updated_at': updated_at.toIso8601String(),
    };
  }
}
