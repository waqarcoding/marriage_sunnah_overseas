import 'package:app/bottom_tabs.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'core/bindings/initial_binding.dart';
import 'core/theme/app_theme.dart';
import 'core/services/socket_service.dart';
import 'data/services/settings_service.dart';
import 'features/auth/pages/login_page.dart';
import 'features/auth/pages/otp_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Storage first
  await GetStorage.init();

  // 2. ApiClient must be awaited — every service calls Get.find<ApiClient>()
  await InitialBinding().initAsync();

  // 3. App-level settings (non-critical)
  try {
    if (!Get.isRegistered<SettingsService>()) {
      await Get.putAsync(() => SettingsService().init(), permanent: true);
    }
  } catch (e) {
    print('[Main] Settings init error: $e');
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget initialPage = const LoginPage();

    try {
      final storage = GetStorage();
      final loggedIn = storage.read('jwtToken') != null;
      final otpDone = storage.read('isOtpVerified') == true;
      final userId = storage.read('user')?['id']?.toString();

      if (loggedIn && otpDone) {
        // ✅ MainShell instead of ExplorePage — shows bottom nav
        initialPage = const BottomTabBar();
        if (userId != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            try {
              Get.find<SocketService>().connect(userId);
            } catch (_) {}
          });
        }
      } else if (loggedIn && !otpDone) {
        initialPage = const OtpPage();
      }
    } catch (e) {
      print('[Main] Auth check error: $e');
    }

    return GetMaterialApp(
      title: 'Marriage Sunnah',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: initialPage,
      defaultTransition: Transition.fadeIn,
    );
  }
}
