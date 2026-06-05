import 'dart:convert';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../providers/api_client.dart';
import '../models/user_model.dart';

class AuthService extends GetxService {
  final ApiClient _apiClient = Get.find<ApiClient>();
  final GetStorage _storage = GetStorage();

  final Rx<UserModel?> currentUser = Rx<UserModel?>(null);
  final RxBool isLoading = false.obs;

  bool get isLoggedIn    => _storage.read('isLoggedIn')   ?? false;
  bool get isOtpVerified => _storage.read('isOtpVerified') ?? false;

  String? get userRole => getTokenData()?['role']?.toString();
  int?    get userId   => getTokenData()?['id'] as int?;

  @override
  void onInit() {
    super.onInit();
    _loadUser();
  }

  void _loadUser() {
    final userData = _storage.read('user');
    if (userData != null) currentUser.value = UserModel.fromJson(userData);
  }

  // ── Register ───────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> register(
      Map<String, String> fields, Map<String, String> files) async {
    try {
      isLoading.value = true;
      final data = await _apiClient.upload('/auth/register', fields, files);
      if (data != null && data['success'] == true) {
        _storage.write('isLoggedIn', true);
        _storage.write('jwtToken', data['token']);
        _storage.write('authData', data);
        if (data['user'] != null) {
          _storage.write('user', data['user']);
          currentUser.value = UserModel.fromJson(data['user']);
        }
      }
      return data;
    } catch (e) {
      print('Register error: $e');
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      isLoading.value = true;
      final data = await _apiClient.post('/auth/login',
          data: {'email': email, 'password': password});
      if (data != null && data['success'] == true) {
        _storage.write('isLoggedIn', true);
        _storage.write('authData', data);
        _storage.write('jwtToken', data['token']);
        if (data['user'] != null) {
          _storage.write('user', data['user']);
          currentUser.value = UserModel.fromJson(data['user']);
        }
      }
      return data;
    } catch (e) {
      print('Login error: $e');
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  Future<bool> verifyOtp(String otp) async {
    try {
      isLoading.value = true;
      final data = await _apiClient.post('/auth/verify-otp', data: {'otp': otp});
      if (data != null && data['success'] == true) {
        _storage.write('isOtpVerified', true);
        return true;
      }
      return false;
    } catch (e) {
      print('Verify OTP error: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // ── Send OTP ───────────────────────────────────────────────────────────────
  Future<bool> sendOtp() async {
    try {
      isLoading.value = true;
      final data = await _apiClient.post('/auth/send-otp');
      return data != null && data['success'] == true;
    } catch (e) {
      print('Send OTP error: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> sendOtpByEmail(String email) async {
    try {
      isLoading.value = true;
      final data = await _apiClient.post('/auth/send-otp-byemail',
          data: {'email': email});
      return data != null && data['success'] == true;
    } catch (e) {
      print('Send OTP email error: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> forgotPasswordReset(
      String email, String otp, String newPassword) async {
    try {
      isLoading.value = true;
      final data = await _apiClient.post('/auth/forgot-password-reset',
          data: {'email': email, 'otp': otp, 'newPassword': newPassword});
      return data != null && data['success'] == true;
    } catch (e) {
      print('Forgot password error: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> changePassword(String oldPassword, String newPassword) async {
    try {
      isLoading.value = true;
      final data = await _apiClient.post('/auth/change-password',
          data: {'oldPassword': oldPassword, 'newPassword': newPassword});
      return data != null && data['success'] == true;
    } catch (e) {
      print('Change password error: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // ── getCurrentUser ─────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getCurrentUser() async {
    return await _apiClient.get('/profile/get-current-user');
  }

  // ── deleteAccount ──────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> deleteAccount() async {
    return await _apiClient.delete('/profile/delete-account');
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  void logout() {
    _storage.remove('isLoggedIn');
    _storage.remove('authData');
    _storage.remove('jwtToken');
    _storage.remove('isOtpVerified');
    _storage.remove('user');
    currentUser.value = null;
  }

  // ── JWT decode ─────────────────────────────────────────────────────────────
  Map<String, dynamic>? getTokenData() {
    try {
      final token = _storage.read('jwtToken') as String?;
      if (token == null) return null;
      final parts = token.split('.');
      if (parts.length != 3) return null;
      var payload = parts[1].replaceAll('-', '+').replaceAll('_', '/');
      while (payload.length % 4 != 0) payload += '=';
      return jsonDecode(utf8.decode(base64Decode(payload)));
    } catch (_) {
      return null;
    }
  }

  bool isGuardian()   => userRole == 'guardian';
  bool isIndividual() => userRole == 'individual';
  bool isAdmin()      => userRole == 'admin' || userRole == 'staff';
}
