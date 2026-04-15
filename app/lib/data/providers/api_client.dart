import 'package:app/core/network/api_provider.dart';
import 'package:app/data/services/storage_service.dart';

//Asign JWT TOKEN
class ApiClient {
  final ApiProvider _provider;
  final String _baseUrl;

  /// Constructor to accept baseUrl
  ApiClient({required String baseUrl})
    : _provider = ApiProvider(baseUrl: baseUrl),
      _baseUrl = baseUrl;

  /// GET request
  Future<dynamic> get(String path, {bool useToken = true}) async {
    String? token;
    if (useToken) {
      token = await StorageService.getJwtToken();
    }

    return _provider.get(path, token: token);
  }

  /// POST request
  Future<dynamic> post(
    String path,
    Map<String, dynamic> data, {
    bool useToken = true,
  }) async {
    String? token;
    if (useToken) {
      token = await StorageService.getJwtToken();
    }

    return _provider.post(path, data, token: token);
  }

  /// PUT request
  Future<dynamic> put(
    String path,
    Map<String, dynamic> data, {
    bool useToken = true,
  }) async {
    String? token;
    if (useToken) {
      token = await StorageService.getJwtToken();
    }

    return _provider.put(path, data, token: token);
  }
}
