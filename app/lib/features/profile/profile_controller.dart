import 'package:app/data/services/profile_service.dart';
import 'package:get/get.dart';

class ProfileController extends GetxController {
  final ProfileService profileService;

  ProfileController(this.profileService);

  /// Loading state
  var isLoading = false.obs;

  /// User profile data
  var profile = {}.obs;

  /// Error messages
  var errorMessage = ''.obs;

  /// Fetch profile from API
  Future<void> fetchProfile() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final data = await profileService.getProfile();
      profile.value = data;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  /// Update profile info
  Future<void> updateProfile(Map<String, dynamic> data) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final updated = await profileService.updateProfile(data);
      profile.value = updated;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  /// Upload profile picture
  Future<void> uploadProfilePicture(String filePath) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final updated = await profileService.uploadProfilePicture(filePath);
      profile.value = updated;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }
}
