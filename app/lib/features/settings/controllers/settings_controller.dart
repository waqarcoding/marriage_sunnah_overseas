import '../../../core/services/socket_service.dart';
import '../../../core/services/push_notification_service.dart';
import '../../auth/pages/login_page.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/settings_service.dart';
import '../../../data/services/auth_service.dart';

class SettingsController extends GetxController {
  final UserSettingsService _service = Get.find<UserSettingsService>();

  var isLoading = true.obs;
  var isSaving = false.obs;
  var isPro = false.obs;
  var showDeleteModal = false.obs;

  var settings = {
    'is_show_last_seen': true,
    'is_blurred_images': false,
    'notifications': true,
    'email_updates': false,
  }.obs;

  Map<String, dynamic>? get userData {
    try {
      final u = GetStorage().read('user');
      if (u is Map) return Map<String, dynamic>.from(u);
      return null;
    } catch (_) {
      return null;
    }
  }

  String? get role => userData?['role']?.toString();
  bool get isGuardian => role == 'guardian';

  @override
  void onInit() {
    super.onInit();
    _load();
  }

  Future<void> _load() async {
    isLoading.value = true;
    try {
      final u = userData;
      isPro.value = u?['is_pro'] == true || u?['is_pro'] == 1;

      final authService = Get.find<AuthService>();
      final res = await authService.getCurrentUser();
      final p =
          res?['profile'] ?? res?['data']?['profile'] ?? res?['data'] ?? res;
      if (p is Map) {
        settings.value = {
          'is_show_last_seen': p['is_show_last_seen'] != null
              ? (p['is_show_last_seen'] == true || p['is_show_last_seen'] == 1)
              : true,
          'is_blurred_images': p['is_blurred_images'] != null
              ? (p['is_blurred_images'] == true || p['is_blurred_images'] == 1)
              : false,
          'notifications': p['notifications'] != null
              ? (p['notifications'] == true || p['notifications'] == 1)
              : true,
          'email_updates': p['email_updates'] != null
              ? (p['email_updates'] == true || p['email_updates'] == 1)
              : false,
        };
        isPro.value = p['is_pro'] == true || p['is_pro'] == 1;
      }
    } catch (e) {
      print('settings load error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> handleToggle(String key, bool val) async {
    final old = settings[key];
    settings[key] = val;
    isSaving.value = true;
    try {
      final res = await _service.updateSettings({key: val ? 1 : 0});
      if (res == null || res['success'] == false) {
        settings[key] = old!;
        Get.snackbar('Error', 'Failed to save',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        Get.snackbar('Saved', '',
            snackPosition: SnackPosition.BOTTOM,
            duration: Duration(milliseconds: 800));
      }
    } catch (_) {
      settings[key] = old!;
      Get.snackbar('Error', 'Failed to save',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isSaving.value = false;
    }
  }

  void logout() {
    try {
      Get.find<SocketService>().disconnect();
    } catch (_) {}
    try {
      Get.find<PushNotificationService>().removeToken();
    } catch (_) {}
    GetStorage().erase();
    Get.offAll(() => LoginPage());
  }

  Future<void> deleteAccount() async {
    try {
      final authService = Get.find<AuthService>();
      await authService.deleteAccount();
      logout();
    } catch (e) {
      Get.snackbar('Error', 'Failed to delete account',
          snackPosition: SnackPosition.BOTTOM);
    }
  }
}
