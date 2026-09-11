import 'package:app/bottom_tabs.dart';
import 'package:app/data/providers/api_client.dart';
import 'package:app/data/services/settings_service.dart';
import 'package:app/features/auth/pages/auth_sheet.dart';
import 'package:app/features/auth/pages/welcome_page.dart';
import 'package:app/features/auth/widgets/join_as_bottom_sheet.dart';
import 'package:app/features/guardian/pages/link_ward_page.dart';
import 'package:app/features/guardian/services/guardian_service.dart';
import 'package:app/features/profile/services/profile_service.dart';
import 'package:app/features/profile/widgets/profile_progress_widget.dart';
import 'package:app/features/userguardian/link_guardian_page.dart';
import 'package:app/features/userprofile/services/user_profile_service.dart';
import 'package:app/features/verification/pages/verification_page.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../../core/services/socket_service.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/auth_service.dart';
import '../pages/otp_page.dart';
import '../pages/email_login_page.dart';
import '../../profile/pages/complete_profile_page.dart';
import '../../explore/pages/explore_page.dart';

class AuthController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();

  var isLoading = false.obs;
  var errorMessage = ''.obs;
  var successMessage = ''.obs;

  SettingsService settingsService =
      SettingsService(); //use in checkprofile method
  @override
  void onInit() {
    super.onInit();
  }

  Future<void> login({
    required String email,
    required String password,
    required BuildContext context,
    required Function(String msg) onFailed,
  }) async {
    logout(); //clear previous data
    try {
      errorMessage.value = '';
      isLoading.value = true;

      final response = await _authService.login(email, password);

      print('🎯 Controller received: $response');

      if (response != null && response['success'] == true) {
        final AuthController authController = Get.find<AuthController>();
        authController.checkProfile(context);
      } else {
        errorMessage.value = response?['error'] ??
            response?['message'] ??
            'Login failed. Please try again.';
        onFailed(errorMessage.value);
      }
    } catch (e) {
      onFailed(errorMessage.value);
      errorMessage.value = 'An error occurred: ${e.toString()}';
    } finally {
      isLoading.value = false;
    }
  }

// Google Login
  Future<void> googleLogin({
    required Function(String msg) onFailed,
    required BuildContext context,
  }) async {
    logout(); //clear previous data
    try {
      errorMessage.value = '';
      isLoading.value = true;

      final GoogleSignInAccount googleUser =
          await GoogleSignIn.instance.authenticate();

      print('👤 Google account: ${googleUser.email}');

      final GoogleSignInAuthentication googleAuth = googleUser.authentication;

      final String? idToken = googleAuth.idToken;

      if (idToken == null || idToken.isEmpty) {
        errorMessage.value = 'Unable to get Google ID token';
        onFailed(errorMessage.value);
        return;
      }

      print('🔐 Google ID token received');

      final response = await _authService.googleLogin(idToken);

      print('🎯 Google Controller received: $response');

      if (response != null && response['success'] == true) {
        final AuthController authController = Get.find<AuthController>();
        authController.checkProfile(context);
      } else {
        errorMessage.value = response?['error'] ??
            response?['message'] ??
            'Google login failed. Please try again.';

        onFailed(errorMessage.value);
      }
    } on GoogleSignInException catch (e) {
      print('❌ Google Sign-In: ${e.code} - ${e.description}');

      if (e.code == GoogleSignInExceptionCode.canceled) {
        // User closed/cancelled the Google account picker.
        return;
      }

      errorMessage.value = e.description ?? 'Google Sign-In failed';

      onFailed(errorMessage.value);
    } catch (e) {
      print('❌ Google login error: $e');

      errorMessage.value = 'An error occurred: ${e.toString()}';

      onFailed(errorMessage.value);
    } finally {
      isLoading.value = false;
    }
  }

  void logout() {
    AuthService authService = AuthService();
    authService.logout();
  }

  // Register
  Future<void> register(
      Map<String, String> fields, Map<String, String> files) async {
    logout(); //clear previous data
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
  Future<void> verifyOtp(String otp, BuildContext context) async {
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
        final AuthController authController = Get.find<AuthController>();
        authController.checkProfile(context);
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
        Get.offAll(() => WellcomePage());
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

  void checkProfile(BuildContext context) {
    ProfileProgressController profileProgressController =
        Get.find<ProfileProgressController>();
    profileProgressController.checkProfile(context);
  }
}
