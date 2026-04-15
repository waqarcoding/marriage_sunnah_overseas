import 'package:app/data/repositories/profile_repository.dart';
import 'package:app/data/services/storage_service.dart';

class ProfileService {
  final ProfileRepository repository;

  ProfileService(this.repository);

  /// Fetch current user profile
  Future<dynamic> getProfile() async {
    final userId = await StorageService.getUserId();
    return await repository.getProfile(userId.toString());
  }

  /// Update profile info
  Future<dynamic> updateProfile(Map<String, dynamic> data) async {
    return await repository.updateProfile(data);
  }

  /// Upload profile picture
  Future<dynamic> uploadProfilePicture(String filePath) async {
    return await repository.uploadProfilePicture(filePath);
  }
}
