import 'package:app/bottom_tabs.dart';
import 'package:flutter/material.dart';

import '../../../core/services/socket_service.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../../data/services/auth_service.dart';
import '../pages/otp_page.dart';
import '../pages/login_page.dart';
import '../../profile/pages/complete_profile_page.dart';
import '../../explore/pages/explore_page.dart';

class AuthController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();

  var isLoading = false.obs;
  var errorMessage = ''.obs;
  var successMessage = ''.obs;

  // Login
  Future<void> login(String email, String password) async {
    try {
      errorMessage.value = '';
      isLoading.value = true;

      final response = await _authService.login(email, password);

      print('🎯 Controller received: $response');

      if (response != null && response['success'] == true) {
        Get.off(() => OtpPage());
      } else {
        errorMessage.value = response?['error'] ??
            response?['message'] ??
            'Login failed. Please try again.';
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: ${e.toString()}';
    } finally {
      isLoading.value = false;
    }
  }

  // Register
  Future<void> register(
      Map<String, String> fields, Map<String, String> files) async {
    try {
      errorMessage.value = '';
      isLoading.value = true;

      final response = await _authService.register(fields, files);

      if (response != null && response['success'] == true) {
        Get.off(() => OtpPage());
        Get.snackbar(
            'Success', response['message'] ?? 'Registration successful!',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        errorMessage.value = response?['error'] ??
            response?['message'] ??
            'Registration failed. Please try again.';
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: ${e.toString()}';
    } finally {
      isLoading.value = false;
    }
  }

  // Verify OTP → navigate to CompleteProfile
  Future<void> verifyOtp(String otp) async {
    try {
      errorMessage.value = '';
      isLoading.value = true;

      final success = await _authService.verifyOtp(otp);

      if (success) {
        // ✅ Connect socket on login
        try {
          final uid = GetStorage().read('user')?['id']?.toString();
          if (uid != null) Get.find<SocketService>().connect(uid);
        } catch (_) {}
        Get.offAll(() => BottomTabBar());
        Get.snackbar('Success', 'OTP verified successfully!',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        errorMessage.value = 'Invalid or expired OTP';
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: ${e.toString()}';
    } finally {
      isLoading.value = false;
    }
  }

  // Resend OTP
  Future<void> resendOtp() async {
    try {
      errorMessage.value = '';
      isLoading.value = true;

      final success = await _authService.sendOtp();

      if (success) {
        Get.snackbar('Success', 'OTP sent successfully!',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        errorMessage.value = 'Failed to send OTP';
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: ${e.toString()}';
    } finally {
      isLoading.value = false;
    }
  }

  // Forgot Password
  Future<bool> forgotPassword(String email) async {
    try {
      errorMessage.value = '';
      successMessage.value = '';
      isLoading.value = true;

      final success = await _authService.sendOtpByEmail(email);

      if (success) {
        successMessage.value = 'OTP sent to your email!';
        Get.snackbar('Success', 'OTP sent to your email!',
            snackPosition: SnackPosition.BOTTOM);
        return true;
      } else {
        errorMessage.value = 'No account found with this email';
        return false;
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: ${e.toString()}';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Reset Password
  Future<void> resetPassword(
      String email, String otp, String newPassword) async {
    try {
      errorMessage.value = '';
      isLoading.value = true;

      final success =
          await _authService.forgotPasswordReset(email, otp, newPassword);

      if (success) {
        Get.snackbar('Success', 'Password reset successfully!',
            snackPosition: SnackPosition.BOTTOM);
        Get.offAll(() => LoginPage());
      } else {
        errorMessage.value = 'Invalid OTP or reset failed';
      }
    } catch (e) {
      errorMessage.value = 'An error occurred: ${e.toString()}';
    } finally {
      isLoading.value = false;
    }
  }

  void clearError() => errorMessage.value = '';
  void clearSuccess() => successMessage.value = '';
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    return const Center(child: Text("Welcome!"));
  }
}
