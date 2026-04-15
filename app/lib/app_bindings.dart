import 'package:app/core/values/constants.dart';
import 'package:app/data/providers/api_client.dart';
import 'package:app/data/repositories/auth_repository.dart';
import 'package:app/data/repositories/chat_repository.dart';
import 'package:app/data/repositories/match_repository.dart';
import 'package:app/data/repositories/profile_repository.dart';
import 'package:app/data/services/auth_service.dart';
import 'package:app/data/services/chat_service.dart';
import 'package:app/data/services/match_service.dart';
import 'package:app/data/services/profile_service.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/chat/chat_controller.dart';
import 'package:app/features/match/match_controller.dart';
import 'package:app/features/profile/profile_controller.dart';
import 'package:get/get.dart';

class AppBinding extends Bindings {
  @override
  void dependencies() {
    /// 🔹 Api Client (Permanent - global)
    Get.put<ApiClient>(ApiClient(baseUrl: Constants.BASE_URL), permanent: true);

    /// 🔹 Repositories
    Get.lazyPut<AuthRepository>(
      () => AuthRepository(Get.find<ApiClient>()),
      fenix: true,
    );
    Get.lazyPut<ProfileRepository>(
      () => ProfileRepository(Get.find<ApiClient>()),
      fenix: true,
    );
    Get.lazyPut<MatchRepository>(
      () => MatchRepository(Get.find<ApiClient>()),
      fenix: true,
    );
    Get.lazyPut<ChatRepository>(
      () => ChatRepository(Get.find<ApiClient>()),
      fenix: true,
    );

    Get.lazyPut<ChatRepository>(
      () => ChatRepository(Get.find<ApiClient>()),
      fenix: true,
    );

    /// 🔹 Services
    Get.lazyPut<AuthService>(
      () => AuthService(Get.find<AuthRepository>()),
      fenix: true,
    );
    Get.lazyPut<ProfileService>(
      () => ProfileService(Get.find<ProfileRepository>()),
      fenix: true,
    );
    Get.lazyPut<MatchService>(
      () => MatchService(Get.find<MatchRepository>()),
      fenix: true,
    );
    Get.lazyPut<ChatService>(
      () => ChatService(Get.find<ChatRepository>()),
      fenix: true,
    );

    Get.lazyPut<ChatService>(
      () => ChatService(Get.find<ChatRepository>()),
      fenix: true,
    );

    /// 🔹 Controllers
    Get.lazyPut<AuthController>(
      () => AuthController(Get.find<AuthService>()),
      fenix: true,
    );
    Get.lazyPut<ProfileController>(
      () => ProfileController(Get.find<ProfileService>()),
      fenix: true,
    );
    Get.lazyPut<MatchController>(
      () => MatchController(Get.find<MatchService>()),
      fenix: true,
    );

    Get.lazyPut<ChatController>(
      () => ChatController(Get.find<ChatService>()),
      fenix: true,
    );
  }
}
