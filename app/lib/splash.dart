import 'package:app/bottom_tabs.dart';
import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:app/features/auth/pages/welcome_page.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'core/bindings/initial_binding.dart';
import 'core/services/socket_service.dart';
import 'data/services/settings_service.dart';

/// Shown the instant the app opens. Runs all app bootstrap work
/// (Google Sign-In, storage, service registration, auth check) in the
/// background, then navigates to the correct starting page once ready.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Don't await inside initState directly — fire and forget so the
    // first frame (this splash UI) paints immediately.
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    // ── Google Sign-In init — wrapped so web/mobile don't crash silently ──
    try {
      if (kIsWeb) {
        await GoogleSignIn.instance.initialize();
      } else {
        await GoogleSignIn.instance.initialize(
          serverClientId:
              '1017969673235-1njaqdcusd703etaprns3nujn1j3n73o.apps.googleusercontent.com',
        );
      }
    } catch (e) {
      debugPrint('[Splash] Google Sign-In init error: $e');
    }

    // ── Local storage + core service registration ──
    try {
      await GetStorage.init();
      await InitialBinding().initAsync();
    } catch (e) {
      debugPrint('[Splash] InitialBinding error: $e');
    }

    // ── Settings service (separate from InitialBinding's own services) ──

    // ── Mobile-only system UI setup ──
    if (!kIsWeb) {
      SystemChrome.setSystemUIOverlayStyle(
        const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
          systemNavigationBarColor: Colors.white,
          systemNavigationBarIconBrightness: Brightness.dark,
          systemNavigationBarDividerColor: Colors.transparent,
        ),
      );
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
      ]);
    }

    // ── Decide starting page ──
    Widget nextPage = const WellcomePage();
    try {
      final storage = GetStorage();
      final bool loggedIn = storage.read('jwtToken') != null;
      final String? userId = storage.read('user')?['id']?.toString();

      if (loggedIn) {
        final AuthController authController = Get.find<AuthController>();

        if (userId != null) {
          authController.checkProfile(context);
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (Get.isRegistered<SocketService>()) {
              Get.find<SocketService>().connect(userId);
            }
          });
        }
        nextPage = const BottomTabBar();
      }
    } catch (e) {
      debugPrint('[Splash] Auth check error: $e');
    }

    if (!mounted) return;

    // Replace the splash so it can't be navigated back to.
    Get.offAll(() => nextPage, transition: Transition.fadeIn);
  }

  @override
  Widget build(BuildContext context) {
    // Keep this visually identical (or very close) to the static
    // HTML splash in web/index.html, so there's no flash/mismatch
    // between the pre-Flutter splash and this one taking over.
    return const Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SizedBox(
          width: 96,
          height: 96,
          child: Image(
            image: AssetImage('assets/images/logo.png'),
          ),
        ),
      ),
    );
  }
}
