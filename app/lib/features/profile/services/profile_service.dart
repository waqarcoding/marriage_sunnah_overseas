import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';
import '../../../data/models/options_model.dart';

class ProfileService extends GetxService {
  final ApiClient _apiClient = Get.find<ApiClient>();

  Future<Map<String, dynamic>?> getCurrentUser() async {
    return await _apiClient.get('/profile/get-current-user');
  }

  Future<Map<String, dynamic>?> updateProfile(Map<String, dynamic> data) async {
    return await _apiClient.put('/profile/update-profile', data: data);
  }

  Future<Map<String, dynamic>?> updatePrefs(Map<String, dynamic> data) async {
    return await _apiClient.put('/profile/update-prefs', data: data);
  }

  Future<OptionsModel?> getOptions() async {
    final response = await _apiClient.get('/explore/options');
    if (response != null && response['success'] == true) {
      return OptionsModel.fromJson(response);
    }
    return null;
  }

  Future<Map<String, dynamic>?> uploadImage(String filePath, int index) async {
    return await _apiClient.upload(
      '/profile/upload-image',
      {'index': index.toString()},
      {'image': filePath},
    );
  }
}
