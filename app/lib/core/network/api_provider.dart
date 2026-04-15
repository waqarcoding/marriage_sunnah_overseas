import 'dart:convert';
import 'dart:io';
import 'dart:ui';
import 'package:app/features/auth/login_page.dart';
import 'package:app_component/core/core.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

/// 🔹 ApiProvider
/// Handles all HTTP requests (GET, POST, PUT) to your backend.
/// Logs requests/responses, parses JSON, and shows GetX toast on network errors.
class ApiProvider {
  final String baseUrl;

  ApiProvider({required this.baseUrl});

  Map<String, String> _headers({String? token}) {
    return {
      "Content-Type": "application/json",
      if (token != null) "Authorization": "Bearer $token",
    };
  }

  /// ---------------- GET ----------------
  Future<dynamic> get(String path, {String? token}) async {
    final fullUrl = '$baseUrl$path';
    print("🌐 GET Request: $fullUrl | token: $token");

    try {
      final response = await http.get(
        Uri.parse(fullUrl),
        headers: _headers(token: token),
      );

      print("⬅️ Response [${response.statusCode}]: ${response.body}");
      return _handleResponse(response);
    } on SocketException {
      _showErrorToast("Network error. Please check your internet.");
      rethrow;
    } catch (e) {
      rethrow;
    }
  }

  /// ---------------- POST ----------------
  Future<dynamic> post(
    String path,
    Map<String, dynamic> data, {
    String? token,
  }) async {
    final fullUrl = '$baseUrl$path';
    final jsonData = jsonEncode(data);
    print("🌐 POST Request: $fullUrl | token: $token | data: $jsonData");

    try {
      final response = await http.post(
        Uri.parse(fullUrl),
        headers: _headers(token: token),
        body: jsonData,
      );

      print("⬅️ Response [${response.statusCode}]: ${response.body}");
      return _handleResponse(response);
    } on SocketException {
      _showErrorToast("Network error. Please check your internet.");
      rethrow;
    } catch (e) {
      rethrow;
    }
  }

  /// ---------------- PUT ----------------
  Future<dynamic> put(
    String path,
    Map<String, dynamic> data, {
    String? token,
  }) async {
    final fullUrl = '$baseUrl$path';
    final jsonData = jsonEncode(data);
    print("🌐 PUT Request: $fullUrl | token: $token | data: $jsonData");

    try {
      final response = await http.put(
        Uri.parse(fullUrl),
        headers: _headers(token: token),
        body: jsonData,
      );

      print("⬅️ Response [${response.statusCode}]: ${response.body}");
      return _handleResponse(response);
    } on SocketException {
      _showErrorToast("Network error. Please check your internet.");
      rethrow;
    } catch (e) {
      rethrow;
    }
  }

  /// ---------------- Response Handler ----------------
  dynamic _handleResponse(http.Response response) {
    try {
      final body = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return body;
      } else {
        final errorMessage =
            body['message'] ?? body['error'] ?? "Error ${response.statusCode}";

        // ✅ Check for JWT expiration (401)
        if (response.statusCode == 401) {
          _handleTokenExpired();
        } else {
          _showErrorToast(errorMessage);
        }

        throw Exception(errorMessage);
      }
    } catch (e) {
      final msg = "Response parse error or invalid JSON: ${response.body}";
      _showErrorToast(msg);
      throw Exception(msg);
    }
  }

  void _handleTokenExpired() {
    // Clear token from storage (if using GetStorage or SharedPreferences)
    // Example using GetStorage:
    // final storage = GetStorage();
    // storage.remove('token');

    _showErrorToast("Session expired. Please log in again.");

    // Navigate to login screen
    // Replace LoginScreen() with your actual login page
    PageManager.fadeIn(() => LoginPage()); // or Get.offAll(LoginScreen())
  }

  /// ---------------- GetX Snackbar ----------------
  void _showErrorToast(String message) {
    Get.snackbar(
      "Error",
      message,
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFFEF5350),
      colorText: const Color(0xFFFFFFFF),
      duration: const Duration(seconds: 3),
    );
  }
}
