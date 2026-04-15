import 'package:app/data/providers/api_client.dart';

class ProfileRepository {
  final ApiClient apiClient;

  ProfileRepository(this.apiClient);

  /// Get current user profile
  Future<dynamic> getProfile(String userid) async {
    return await apiClient.post('/profile/me', {'user_id': userid});
  }

  /// Update profile
  Future<dynamic> updateProfile(Map<String, dynamic> data) async {
    return await apiClient.put('/profile/me', data);
  }

  /// Upload profile picture
  Future<dynamic> uploadProfilePicture(String filePath) async {
    // Example using multipart if needed
    // For simplicity, just sending path in JSON
    return await apiClient.post('/profile/upload-photo', {
      "filePath": filePath,
    });
  }
}
