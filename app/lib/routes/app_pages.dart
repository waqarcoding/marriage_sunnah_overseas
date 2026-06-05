import 'package:get/get.dart';
import 'app_routes.dart';
import '../features/auth/pages/login_page.dart';
import '../features/auth/pages/otp_page.dart';
import '../features/auth/controllers/auth_controller.dart';

class AppPages {
  static final routes = [
    // Auth Routes
    GetPage(
      name: AppRoutes.login,
      page: () => LoginPage(),
      binding: BindingsBuilder(() {
        Get.lazyPut<AuthController>(() => AuthController());
      }),
    ),
    
    GetPage(
      name: AppRoutes.otp,
      page: () => OtpPage(),
      binding: BindingsBuilder(() {
        Get.lazyPut<AuthController>(() => AuthController());
      }),
    ),
    
    // Add more routes as you create pages
    // GetPage(
    //   name: AppRoutes.register,
    //   page: () => RegisterPage(),
    //   binding: AuthBinding(),
    // ),
    
    // GetPage(
    //   name: AppRoutes.home,
    //   page: () => HomePage(),
    // ),
  ];
}
