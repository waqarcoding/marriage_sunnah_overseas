import 'package:app/data/services/auth_service.dart';
import 'package:app/data/services/storage_service.dart';
import 'package:app/features/auth/otp_page.dart';
import 'package:app/features/home/home_page.dart';
import 'package:get/get.dart';

class AuthController extends GetxController {
  final AuthService authService;

  AuthController(this.authService);

  // Loading state
  var isLoading = false.obs;

  // User info (after login/register)
  var user = {}.obs;

  // Error messages
  var errorMessage = ''.obs;

  /// ---------------- LOGIN ----------------
  Future<void> login(String email, String password) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      // Always send login request
      final response = await authService.login(email, password);
      // ✅ Access user ID
      int userId = response['user']['id'];
      print("User ID: $userId");

      // ✅ Access token
      final token = response['token'];
      print("Token: $token");

      await StorageService.setJwtToken(token);
      await StorageService.setUserId(userId);

      // Navigate to OTP page
      Get.to(() => OtpPage(email: email, userId: userId));

      print("OTP sent to: $email");
    } catch (e) {
      errorMessage.value = e.toString();
      print("Login error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// ---------------- REGISTER ----------------
  Future<void> register(Map<String, dynamic> data) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final response = await authService.register(data);

      if (response['success'] == true || response['user'] != null) {
        // Store token if returned
        if (response['token'] != null) {
          print("JWT Token: ${response['token']}");
        }

        // Update user
        user.value = response['user'] ?? response;
        print("Registration successful: $user");
      } else {
        // Registration failed, show message from API if any
        errorMessage.value = response['message'] ?? 'Registration failed';
        print("Register failed: ${errorMessage.value}");
      }
    } catch (e) {
      errorMessage.value = e.toString();
      print("Register error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// ---------------- VERIFY OTP ----------------
  Future<void> verifyOtp(int userId, String otp) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final response = await authService.verifyOtp(userId, otp);

      // Store token if returned
      if (response['token'] != null) {
        print("JWT Token: ${response['token']}");
        // Optionally save token in ApiClient or local storage
      }

      // Store user
      user.value = response['user'] ?? {};

      // Navigate to HomePage
      Get.offAll(() => HomePage());
    } catch (e) {
      errorMessage.value = e.toString();
      print("OTP verification error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// ---------------- RESEND OTP ----------------
  Future<void> resendOtp(String userid, String email) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final response = await authService.resendOtp(userid, email);
      print("OTP resent to: $userid");
    } catch (e) {
      errorMessage.value = e.toString();
      print("Resend OTP error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// ---------------- LOGOUT ----------------
  Future<void> logout() async {
    try {
      isLoading.value = true;
      await authService.logout();
      user.value = {};
      print("Logout successful");
    } catch (e) {
      print("Logout error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// ---------------- FORGOT PASSWORD ----------------
  Future<void> forgotPassword(String email) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final response = await authService.forgotPassword(email);
      print("Forgot password response: $response");
    } catch (e) {
      errorMessage.value = e.toString();
      print("Forgot password error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// ---------------- RESET PASSWORD ----------------
  Future<void> resetPassword(String token, String newPassword) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final response = await authService.resetPassword(token, newPassword);
      print("Reset password response: $response");
    } catch (e) {
      errorMessage.value = e.toString();
      print("Reset password error: $e");
    } finally {
      isLoading.value = false;
    }
  }
}
