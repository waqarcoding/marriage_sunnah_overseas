import 'package:app/bottom_tabs.dart';
import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:app/features/auth/pages/welcome_page.dart';
import 'package:app/features/auth/services/auth_service.dart';
import 'package:app/features/profile/widgets/profile_progress_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'core/bindings/initial_binding.dart';
import 'core/services/socket_service.dart';
import 'core/theme/app_theme.dart';
import 'data/services/settings_service.dart';
import 'features/auth/pages/otp_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  //Required For Continue With Google Sign in method
  await GoogleSignIn.instance.initialize(
    serverClientId:
        '1017969673235-d4r3u8hikquj19ojia8j7i4mp3186e63.apps.googleusercontent.com',
  );

  // Initialize GetStorage
  await GetStorage.init();

  // Initialize all dependencies
  await InitialBinding().initAsync();

  // Initialize SettingsService Get Values from Backend For configuration used in app
  try {
    if (!Get.isRegistered<SettingsService>()) {
      await Get.putAsync(() => SettingsService().init(), permanent: true);
    }
  } catch (e) {
    debugPrint('[Main] Settings init error: $e');
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    Widget initialPage = const WellcomePage();

    try {
      final storage = GetStorage();

      final bool loggedIn = storage.read('jwtToken') != null;
      final bool otpDone = storage.read('isOtpVerified') == true;
      final String? userId = storage.read('user')?['id']?.toString();

      if (loggedIn) {
        //Check Profile Completed or not
        final AuthController authController = Get.find<AuthController>();

        //Socket Connection
        if (userId != null) {
          authController.checkProfile(context);
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (Get.isRegistered<SocketService>()) {
              Get.find<SocketService>().connect(userId);
            }
          });
        }
      }
    } catch (e) {
      debugPrint('[Main] Auth check error: $e');
    }

    return ScreenUtilInit(
      designSize: const Size(390, 844),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (_, child) {
        return GetMaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Marriage Sunnah',
          theme: AppTheme.lightTheme,
          defaultTransition: Transition.fadeIn,
          home: initialPage,
        );
      },
    );
  }
}
