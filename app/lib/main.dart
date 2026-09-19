import 'package:app/splash.dart';
import 'package:app_component/widgets/image_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:video_player/video_player.dart';

import 'core/theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // runApp fires immediately — the SplashScreen paints on the very first
  // frame, and all heavy async setup (Google Sign-In, storage, services,
  // auth check) happens inside SplashScreen's initState afterward.
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: ScreenUtil.defaultSize,
      minTextAdapt: true,
      splitScreenMode: false,
      builder: (_, child) {
        return GetMaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Marriage Sunnah',
          theme: AppTheme.lightTheme(context),
          defaultTransition: Transition.fadeIn,
          home: SplashScreen(),
        );
      },
    );
  }
}
