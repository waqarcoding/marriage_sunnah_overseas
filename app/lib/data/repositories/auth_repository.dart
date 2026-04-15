import 'package:app/data/providers/api_client.dart';

class AuthRepository {
  final ApiClient apiClient;

  AuthRepository(this.apiClient);

  /// Login user
  Future<dynamic> login(String email, String password) async {
    return await apiClient.post("/auth/login", {
      "email": email,
      "password": password,
    }, useToken: false);
  }

  /// Register user
  Future<dynamic> register(Map<String, dynamic> data) async {
    return await apiClient.post("/auth/register", data, useToken: false);
  }

  /// Logout user (if backend supports)
  Future<dynamic> logout() async {
    return await apiClient.post("/auth/logout", {});
  }

  /// Forgot password
  Future<dynamic> forgotPassword(String email) async {
    return await apiClient.post("/auth/forgot-password", {"email": email});
  }

  /// Reset password
  Future<dynamic> resetPassword(String token, String newPassword) async {
    return await apiClient.post("/auth/reset-password", {
      "token": token,
      "password": newPassword,
    });
  }

  // auth_repository.dart
  Future<dynamic> verifyOtp(int userid, String otp) async {
    return await apiClient.post("/auth/verify-otp", {
      "userid": userid,
      "otp": otp,
    });
  }

  Future<dynamic> resendOtp(String userid, String email) async {
    return await apiClient.post("/auth/resend-otp", {
      "userid": userid,
      "email": email,
    });
  }
}
