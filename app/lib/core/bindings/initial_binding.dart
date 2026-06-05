import 'package:app/features/userprofile/services/user_profile_service.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../data/providers/api_client.dart';
import '../../data/services/auth_service.dart';
import '../../core/services/socket_service.dart';
import '../../features/profile/services/profile_service.dart';
import '../../features/explore/services/explore_service.dart';
import '../../features/interest/services/interest_service.dart';
import '../../features/chat/services/chat_service.dart';
import '../../features/settings/services/settings_service.dart';

class InitialBinding extends Bindings {
  // ── Called from main() with await — guarantees ApiClient is ready first ──
  Future<void> initAsync() async {
    // 1. Storage (may already be registered from GetStorage.init())
    if (!Get.isRegistered<GetStorage>()) {
      Get.put(GetStorage(), permanent: true);
    }

    // 2. ApiClient — MUST be awaited; every service calls Get.find<ApiClient>()
    if (!Get.isRegistered<ApiClient>()) {
      await Get.putAsync<ApiClient>(() => ApiClient().init(), permanent: true);
    }

    // 3. Everything else can be registered synchronously now that ApiClient exists
    _registerServices();
  }

  // ── Standard GetX binding entry point (used by GetMaterialApp bindings:) ──
  @override
  void dependencies() {
    // When called synchronously (e.g. from GetMaterialApp.initialBinding),
    // ApiClient must already be registered — initAsync() covers that.
    if (!Get.isRegistered<ApiClient>()) {
      throw StateError(
        'Call InitialBinding().initAsync() from main() before runApp().',
      );
    }
    _registerServices();
  }

  void _registerServices() {
    void reg<T extends GetxService>(T service) {
      if (!Get.isRegistered<T>()) Get.put<T>(service, permanent: true);
    }

    reg(AuthService());
    reg(SocketService());
    reg(ProfileService());
    reg(ExploreService());
    reg(InterestService());
    reg(ChatService());
    reg(UserSettingsService());
    reg(UserProfileService());
  }
}
