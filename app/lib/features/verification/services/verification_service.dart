import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';

class VerificationService extends GetxService {
  final ApiClient _api = Get.find<ApiClient>();

  // ── Upload ID card (front + back) ──────────────────────────────────────────
  Future<Map<String, dynamic>?> uploadIdCard(
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
