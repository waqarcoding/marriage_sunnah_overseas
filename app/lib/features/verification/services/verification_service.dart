import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';

class VerificationService extends GetxService {
  final ApiClient _api = Get.find<ApiClient>();

  /// Uploads front and back verification photos to `/profile/upload-idcard`.
  ///
  /// [frontPath] and [backPath] are local file paths captured by the
  /// device camera.
  Future<Map<String, dynamic>?> uploadLivenessPhoto(
          String frontPath, String backPath) async =>
      await _api.upload(
        '/profile/upload-idcard',
        {},
        {'front_id': frontPath, 'back_id': backPath},
      );

  // ── Get current user to check verification status ─────────────────────────
  Future<Map<String, dynamic>?> getCurrentUser() async =>
      await _api.get('/profile/get-current-user');
}
