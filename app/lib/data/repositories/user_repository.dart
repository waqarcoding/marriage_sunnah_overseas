import 'package:app/data/providers/api_client.dart';

class UserRepository {
  final ApiClient apiClient;

  UserRepository(this.apiClient);

  // ================= AUTH =================
  Future<dynamic> login(String email, String password) async {
    return await apiClient.post("/auth/login", {
      "email": email,
      "password": password,
    });
  }

  Future<dynamic> register(Map<String, dynamic> data) async {
    return await apiClient.post("/auth/register", data);
  }

  // ================= PROFILE =================
  Future<dynamic> getProfile() async {
    return await apiClient.get("/profile/me");
  }

  Future<dynamic> updateProfile(Map<String, dynamic> data) async {
    return await apiClient.put("/profile/update", data);
  }

  // ================= MATCH =================
  Future<dynamic> getDiscoverFeed() async {
    return await apiClient.get("/match/feed");
  }

  Future<dynamic> likeUser(String userId) async {
    return await apiClient.post("/match/like/$userId", {});
  }

  Future<dynamic> getMatches() async {
    return await apiClient.get("/match/list");
  }

  // ================= CHAT =================
  Future<dynamic> getChats() async {
    return await apiClient.get("/chat");
  }

  Future<dynamic> sendMessage(String matchId, String message) async {
    return await apiClient.post("/chat/send", {
      "matchId": matchId,
      "message": message,
    });
  }

  // ================= SUBSCRIPTION =================
  Future<dynamic> getPlans() async {
    return await apiClient.get("/subscription/plans");
  }

  Future<dynamic> buyPlan(String planId) async {
    return await apiClient.post("/subscription/subscribe", {"planId": planId});
  }

  Future<dynamic> getCurrentSubscription() async {
    return await apiClient.get("/subscription/current");
  }

  Future<dynamic> cancelSubscription() async {
    return await apiClient.post("/subscription/cancel", {});
  }

  Future<dynamic> getSubscriptionHistory() async {
    return await apiClient.get("/subscription/history");
  }
}
