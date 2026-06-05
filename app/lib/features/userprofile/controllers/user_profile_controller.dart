import 'dart:io';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:image_picker/image_picker.dart';
import '../services/user_profile_service.dart';

class UserProfileController extends GetxController {
  final UserProfileService _service = Get.find<UserProfileService>();
  final _picker = ImagePicker();

  // ── State ─────────────────────────────────────────────────────────────────
  var isLoading        = true.obs;
  var isSaving         = false.obs;
  var isSavingAbout    = false.obs;
  var uploadingIdx     = Rx<int?>(null);
  var uploadingVideoIdx = Rx<int?>(null);
  var showSuccess      = false.obs;

  // Profile data
  var profile   = Rx<Map<String, dynamic>?>(null);
  var counts    = <String, int>{}.obs;
  var photos    = <String>[].obs;
  var videos    = <String>[].obs;
  var interests = <String>[].obs;
  var isPremium = false.obs;

  // Guardian
  var guardian    = Rx<Map<String, dynamic>?>(null);
  var hasGuardian = false.obs;

  // Form
  var formName       = ''.obs;
  var formAge        = ''.obs;
  var formProfession = ''.obs;
  var formEducation  = ''.obs;
  var formBio        = ''.obs;

  String get location {
    final city    = profile.value?['profile']?['city']    ?? '';
    final country = profile.value?['profile']?['country'] ?? '';
    return [city, country].where((s) => s.isNotEmpty).join(', ');
  }

  @override
  void onInit() {
    super.onInit();
    fetchProfile();
    loadGuardian();
  }

  // ── Fetch profile ─────────────────────────────────────────────────────────
  Future<void> fetchProfile() async {
    isLoading.value = true;
    try {
      final res = await _service.getCurrentUser();
      if (res == null) return;

      counts.value = {
        'likes_received': _toInt(res['counts']?['likes_received']),
        'matches':        _toInt(res['counts']?['matches']),
        'likes_sent':     _toInt(res['counts']?['likes_sent']),
      };

      final p = res['profile'] ?? res;
      profile.value = res;

      photos.value  = _parseJsonList(p['images']);
      videos.value  = _parseJsonList(p['videos']);
      interests.value = _parseJsonList(p['interests']);

      // Check premium from storage
      final stored = GetStorage().read('user');
      isPremium.value = stored?['is_pro'] == true || stored?['is_pro'] == 1;

      formName.value       = p['name']?.toString()       ?? '';
      formAge.value        = p['age']?.toString()        ?? '';
      formProfession.value = p['profession']?.toString() ?? '';
      formEducation.value  = p['education']?.toString()  ?? '';
      formBio.value        = p['bio']?.toString()        ?? '';

    } catch (e) {
      print('fetchProfile error: $e');
      Get.snackbar('Error', 'Failed to load profile',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Load guardian ─────────────────────────────────────────────────────────
  Future<void> loadGuardian() async {
    try {
      final res = await _service.getMyGuardian();
      final data = res?['data'];
      if (data != null && data['guardianUser'] != null) {
        guardian.value  = data;
        hasGuardian.value = true;
      } else {
        hasGuardian.value = false;
      }
    } catch (_) {
      hasGuardian.value = false;
    }
  }

  // ── Save about + interests ────────────────────────────────────────────────
  Future<void> saveAbout() async {
    isSavingAbout.value = true;
    try {
      await _service.updateAboutInterest({
        'bio':       formBio.value,
        'interests': _jsonList(interests),
      });
      Get.snackbar('Saved', 'Profile updated!',
          snackPosition: SnackPosition.BOTTOM);
    } catch (_) {
      Get.snackbar('Error', 'Failed to save changes',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isSavingAbout.value = false;
    }
  }

  // ── Upload photo ──────────────────────────────────────────────────────────
  Future<void> pickAndUploadPhoto(int idx) async {
    final picked = await _picker.pickImage(
        source: ImageSource.gallery, imageQuality: 90);
    if (picked == null) return;

    uploadingIdx.value = idx;
    // Insert placeholder
    final temp = picked.path;
    if (idx < photos.length) {
      photos[idx] = temp;
    } else {
      photos.add(temp);
    }

    try {
      final res = await _service.uploadImage(File(picked.path), idx);
      if (res != null && res['success'] == true) {
        final url = res['imageUrl']?.toString() ?? '';
        if (idx < photos.length) {
          photos[idx] = url;
        } else {
          photos.add(url);
        }
        Get.snackbar('✅', 'Photo uploaded! (5 credits deducted)',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Upload failed',
            snackPosition: SnackPosition.BOTTOM);
        if (idx < photos.length) photos.removeAt(idx);
      }
    } catch (_) {
      Get.snackbar('Error', 'Upload failed',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      uploadingIdx.value = null;
    }
  }

  Future<void> deletePhoto(int idx) async {
    try {
      await _service.deleteImage(idx);
      photos.removeAt(idx);
      Get.snackbar('Deleted', 'Photo deleted',
          snackPosition: SnackPosition.BOTTOM);
    } catch (_) {
      Get.snackbar('Error', 'Failed to delete photo',
          snackPosition: SnackPosition.BOTTOM);
    }
  }

  Future<void> reorderPhotos(List<String> newOrder) async {
    photos.value = newOrder;
    try {
      await _service.updateProfile({'images': _jsonList(newOrder)});
    } catch (_) {
      fetchProfile();
    }
  }

  // ── Upload video ──────────────────────────────────────────────────────────
  Future<void> pickAndUploadVideo(int idx) async {
    if (!isPremium.value) {
      Get.toNamed('/subscription');
      return;
    }
    final picked =
        await _picker.pickVideo(source: ImageSource.gallery);
    if (picked == null) return;

    uploadingVideoIdx.value = idx;
    try {
      final res = await _service.uploadVideo(File(picked.path), idx);
      if (res != null && res['success'] == true) {
        final updatedVideos = _parseJsonList(res['videos']);
        if (updatedVideos.isNotEmpty) {
          videos.value = updatedVideos;
        }
        Get.snackbar('✅', 'Video uploaded! (20 credits deducted)',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Upload failed',
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (_) {
      Get.snackbar('Error', 'Video upload failed',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      uploadingVideoIdx.value = null;
    }
  }

  Future<void> deleteVideo(int idx) async {
    try {
      await _service.deleteVideo(idx);
      videos.removeAt(idx);
      Get.snackbar('Deleted', 'Video deleted',
          snackPosition: SnackPosition.BOTTOM);
    } catch (_) {
      Get.snackbar('Error', 'Failed to delete video',
          snackPosition: SnackPosition.BOTTOM);
    }
  }

  // ── Remove guardian ───────────────────────────────────────────────────────
  Future<void> removeGuardian() async {
    try {
      await _service.removeGuardian();
      guardian.value    = null;
      hasGuardian.value = false;
      Get.snackbar('Done', 'Guardian removed',
          snackPosition: SnackPosition.BOTTOM);
      await loadGuardian();
    } catch (_) {
      Get.snackbar('Error', 'Failed to remove guardian',
          snackPosition: SnackPosition.BOTTOM);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  List<String> _parseJsonList(dynamic val) {
    if (val == null) return [];
    if (val is List) return val.map((e) => e.toString()).where((s) => s.isNotEmpty).toList();
    if (val is String) {
      try {
        final parsed = val.replaceAll('[', '').replaceAll(']', '')
            .replaceAll('"', '').split(',').map((s) => s.trim())
            .where((s) => s.isNotEmpty).toList();
        return parsed;
      } catch (_) { return []; }
    }
    return [];
  }

  String _jsonList(List<String> list) =>
      '[${list.map((s) => '"$s"').join(',')}]';

  int _toInt(dynamic v) => int.tryParse(v?.toString() ?? '0') ?? 0;
}
