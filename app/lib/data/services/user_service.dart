import 'package:app/data/repositories/user_repository.dart';

class UserService {
  final UserRepository repository;

  UserService(this.repository);

  // ================= AUTH =================
  Future<dynamic> login(String email, String password) async {
    return await repository.login(email, password);
  }

  Future<dynamic> register(Map<String, dynamic> data) async {
    return await repository.register(data);
  }

  // ================= PROFILE =================
  Future<dynamic> getProfile() async {
    return await repository.getProfile();
  }

  Future<dynamic> updateProfile(Map<String, dynamic> data) async {
    return await repository.updateProfile(data);
  }

  // ================= MATCH =================
  Future<dynamic> getDiscoverFeed() async {
    return await repository.getDiscoverFeed();
  }

  Future<dynamic> likeUser(String userId) async {
    return await repository.likeUser(userId);
  }

  Future<dynamic> getMatches() async {
    return await repository.getMatches();
  }

  // ================= CHAT =================
  Future<dynamic> getChats() async {
    return await repository.getChats();
  }

  Future<dynamic> sendMessage(String matchId, String message) async {
    return await repository.sendMessage(matchId, message);
  }

  // ================= SUBSCRIPTION =================
  Future<dynamic> getPlans() async {
    return await repository.getPlans();
  }

  Future<dynamic> buyPlan(String planId) async {
    return await repository.buyPlan(planId);
  }

  Future<dynamic> getCurrentSubscription() async {
    return await repository.getCurrentSubscription();
  }

  Future<dynamic> cancelSubscription() async {
    return await repository.cancelSubscription();
  }

  Future<dynamic> getSubscriptionHistory() async {
    return await repository.getSubscriptionHistory();
  }
}
