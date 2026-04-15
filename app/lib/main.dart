import 'package:app/core/values/constants.dart';
import 'package:app/data/services/storage_service.dart';
import 'package:app/features/onboarding/onboarding_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:app/features/splash/splash_page.dart';
import 'package:app/app_bindings.dart';
import 'package:app/theme/app_theme.dart';
import 'features/home/home_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  bool isLoggedIn = await StorageService.isLoggedIn();
  runApp(MyApp(isLoggedIn: isLoggedIn));
}

class MyApp extends StatelessWidget {
  final bool isLoggedIn;

  const MyApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      initialBinding: AppBinding(),
      debugShowCheckedModeBanner: false,
      title: 'Sample',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.light,

      home: SplashWidget(
        duration: 0,
        backgroundColor: Colors.white10,
        title: "",
        titleStyle: const TextStyle(color: Colors.black, fontSize: 23),
        subtitle: Constants.appSubtitle,
        subtitleStyle: const TextStyle(color: Colors.black38, fontSize: 18),
        // ✅ Conditional Page
        entryWidget: isLoggedIn ? HomePage() : OnboardingPage(),
        icon: Image.asset(
          "assets/images/splashicon.png",
          height: 300,
          width: 300,
        ),
      ),
    );
  }
}
