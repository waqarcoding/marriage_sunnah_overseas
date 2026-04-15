class SubscriptionModel {
  final int id;
  final int userId;
  final String planName;
  final double price;
  final int durationDays;
  final DateTime startDate;
  final DateTime endDate;
  final String status;

  SubscriptionModel({
    required this.id,
    required this.userId,
    required this.planName,
    required this.price,
    required this.durationDays,
    required this.startDate,
    required this.endDate,
    required this.status,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionModel(
      id: json['id'],
      userId: json['user_id'],
      planName: json['plan_name'],
      price: (json['price'] as num).toDouble(),
      durationDays: json['duration_days'],
      startDate: DateTime.parse(json['start_date']),
      endDate: DateTime.parse(json['end_date']),
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "user_id": userId,
      "plan_name": planName,
      "price": price,
      "duration_days": durationDays,
      "start_date": startDate.toIso8601String(),
      "end_date": endDate.toIso8601String(),
      "status": status,
    };
  }
}
