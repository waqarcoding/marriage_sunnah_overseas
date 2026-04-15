import 'package:app/data/repositories/auth_repository.dart';

class AuthService {
  final AuthRepository repository;

  AuthService(this.repository);

  /// ---------------- LOGIN ----------------
  Future<dynamic> login(String email, String password) async {
    return await repository.login(email, password);
  }

  /// ---------------- REGISTER ----------------
  Future<dynamic> register(Map<String, dynamic> data) async {
    return await repository.register(data);
  }

  /// ---------------- LOGOUT ----------------
  Future<dynamic> logout() async {
    return await repository.logout();
  }

  /// ---------------- FORGOT PASSWORD ----------------
  Future<dynamic> forgotPassword(String email) async {
    return await repository.forgotPassword(email);
  }

  /// ---------------- RESET PASSWORD ----------------
  Future<dynamic> resetPassword(String token, String newPassword) async {
    return await repository.resetPassword(token, newPassword);
  }

  /// ---------------- VERIFY OTP ----------------
  Future<dynamic> verifyOtp(int userid, String otp) async {
    return await repository.verifyOtp(userid, otp);
  }

  /// ---------------- RESEND OTP ----------------
  Future<dynamic> resendOtp(String userid, String email) async {
    return await repository.resendOtp(userid, email);
  }

  completeProfile(Map<String, dynamic> data) async {
    return await repository.register(data);
  }
}
