import 'dart:convert';
import 'dart:io';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:http/http.dart' as http;

class ApiClient extends GetxService {
  final GetStorage _storage = GetStorage();

  // Base URL - change this to your server URL
  static const String baseUrl = 'http://localhost:5000/api';

  DateTime _lastPing = DateTime.now();

  Future<ApiClient> init() async {
    return this;
  }

  // Build headers with JWT token
  Map<String, String> _headers({bool isJson = true}) {
    final Map<String, String> headers = {};

    if (isJson) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }

    final token = _storage.read('jwtToken');
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  // Ping last seen every minute
  void _pingLastSeen() {
    final now = DateTime.now();
    if (now.difference(_lastPing).inSeconds < 60) return;

    _lastPing = now;

    final fullUrl = '$baseUrl/profile/last-seen';
    http.get(Uri.parse(fullUrl), headers: _headers()).catchError((e) {
      print('[API] Last seen ping failed');
    });
  }

  // Handle token expired
  Future<void> _handleTokenExpired() async {
    print('[API] Session expired');

    _storage.remove('jwtToken');
    _storage.remove('isLoggedIn');
    _storage.remove('authData');
    _storage.remove('isOtpVerified');
    _storage.remove('user');

    Get.snackbar(
      'Session Expired',
      'Please log in again',
      snackPosition: SnackPosition.BOTTOM,
      duration: Duration(seconds: 3),
    );

    // Use Get.offAll instead of Get.offAllNamed
    await Future.delayed(Duration(milliseconds: 100));
    // Don't navigate here - let the controller handle it
  }

  // Handle response
  dynamic _handleResponse(http.Response response, String endpoint) {
    print('[API] ⬅️ ${response.statusCode} $endpoint');

    try {
      final body = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        _pingLastSeen();
        return body;
      } else {
        // ✅ FIX: Return error response instead of throwing
        print('[API] ❌ Error: ${body.toString()}');

        // Handle 401 Unauthorized (token expired)
        if (response.statusCode == 401 &&
            body['error'] != 'Wrong password' &&
            body['error'] != 'Email not found') {
          _handleTokenExpired();
        }

        // Return the error response to the service/controller
        return body;
      }
    } catch (e) {
      print('[API] Parse error: $e');
      return {'error': 'Failed to parse response'};
    }
  }

  // GET request
  Future<dynamic> get(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
  }) async {
    final fullUrl = '$baseUrl$endpoint';

    print('[API] 🌐 GET $fullUrl');

    try {
      Uri uri = Uri.parse(fullUrl);
      if (queryParameters != null) {
        uri = uri.replace(queryParameters: queryParameters);
      }

      final response = await http.get(uri, headers: _headers());

      return _handleResponse(response, endpoint);
    } on SocketException {
      print('[API] Network Error');
      return {'error': 'Please check your internet connection'};
    } catch (e) {
      print('[API] GET Error: $e');
      return {'error': 'An unexpected error occurred'};
    }
  }

  // POST request
  Future<dynamic> post(String endpoint, {Map<String, dynamic>? data}) async {
    final fullUrl = '$baseUrl$endpoint';
    final jsonData = data != null ? jsonEncode(data) : null;

    print('[API] 🌐 POST $fullUrl');
    if (jsonData != null) {
      print('[API] 📤 Body: $jsonData');
    }

    try {
      final response = await http.post(
        Uri.parse(fullUrl),
        headers: _headers(),
        body: jsonData,
      );

      return _handleResponse(response, endpoint);
    } on SocketException {
      print('[API] Network Error');
      return {'error': 'Please check your internet connection'};
    } catch (e) {
      print('[API] POST Error: $e');
      return {'error': 'An unexpected error occurred'};
    }
  }

  // PUT request
  Future<dynamic> put(String endpoint, {Map<String, dynamic>? data}) async {
    final fullUrl = '$baseUrl$endpoint';
    final jsonData = data != null ? jsonEncode(data) : null;

    print('[API] 🌐 PUT $fullUrl');
    if (jsonData != null) {
      print('[API] 📤 Body: $jsonData');
    }

    try {
      final response = await http.put(
        Uri.parse(fullUrl),
        headers: _headers(),
        body: jsonData,
      );

      return _handleResponse(response, endpoint);
    } on SocketException {
      print('[API] Network Error');
      return {'error': 'Please check your internet connection'};
    } catch (e) {
      print('[API] PUT Error: $e');
      return {'error': 'An unexpected error occurred'};
    }
  }

  // PATCH request
  Future<dynamic> patch(String endpoint, {Map<String, dynamic>? data}) async {
    final fullUrl = '$baseUrl$endpoint';
    final jsonData = data != null ? jsonEncode(data) : null;

    print('[API] 🌐 PATCH $fullUrl');

    try {
      final response = await http.patch(
        Uri.parse(fullUrl),
        headers: _headers(),
        body: jsonData,
      );

      return _handleResponse(response, endpoint);
    } on SocketException {
      print('[API] Network Error');
      return {'error': 'Please check your internet connection'};
    } catch (e) {
      print('[API] PATCH Error: $e');
      return {'error': 'An unexpected error occurred'};
    }
  }

  // DELETE request
  Future<dynamic> delete(String endpoint, {Map<String, dynamic>? data}) async {
    final fullUrl = '$baseUrl$endpoint';

    print('[API] 🌐 DELETE $fullUrl');

    try {
      final response = await http.delete(
        Uri.parse(fullUrl),
        headers: _headers(),
        body: data != null ? jsonEncode(data) : null,
      );

      return _handleResponse(response, endpoint);
    } on SocketException {
      print('[API] Network Error');
      return {'error': 'Please check your internet connection'};
    } catch (e) {
      print('[API] DELETE Error: $e');
      return {'error': 'An unexpected error occurred'};
    }
  }

  // Upload file (multipart/form-data)
  Future<dynamic> upload(
    String endpoint,
    Map<String, String> fields,
    Map<String, String> files,
  ) async {
    final fullUrl = '$baseUrl$endpoint';

    print('[API] 🌐 UPLOAD $fullUrl');

    try {
      final request = http.MultipartRequest('POST', Uri.parse(fullUrl));

      final token = _storage.read('jwtToken');
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      request.fields.addAll(fields);

      for (var entry in files.entries) {
        request.files.add(
          await http.MultipartFile.fromPath(entry.key, entry.value),
        );
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      return _handleResponse(response, endpoint);
    } on SocketException {
      print('[API] Network Error');
      return {'error': 'Please check your internet connection'};
    } catch (e) {
      print('[API] UPLOAD Error: $e');
      return {'error': 'An unexpected error occurred'};
    }
  }

  // Check token validity
  bool checkToken() {
    final token = _storage.read('jwtToken');
    if (token == null) return false;

    try {
      final parts = token.split('.');
      if (parts.length != 3) return false;

      String payload = parts[1];
      payload = payload.replaceAll('-', '+').replaceAll('_', '/');

      while (payload.length % 4 != 0) {
        payload += '=';
      }

      final decoded = jsonDecode(utf8.decode(base64Decode(payload)));

      final exp = decoded['exp'] as int;
      final expDate = DateTime.fromMillisecondsSinceEpoch(exp * 1000);

      if (expDate.isBefore(DateTime.now())) {
        _handleTokenExpired();
        return false;
      }

      return true;
    } catch (e) {
      _handleTokenExpired();
      return false;
    }
  }
}
