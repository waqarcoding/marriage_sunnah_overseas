import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';

class GuardianService extends GetxService {
  final ApiClient _api = Get.find<ApiClient>();

  // ── Ward (Individual) methods ─────────────────────────────────────────────
  Future<Map<String, dynamic>?> generatePin() async =>
      await _api.post('/guardian/generate-pin', data: {});

  Future<Map<String, dynamic>?> getMyPin() async =>
      await _api.get('/guardian/my-pin');

  Future<Map<String, dynamic>?> getMyGuardian() async =>
      await _api.get('/guardian/my-guardian');

  Future<Map<String, dynamic>?> removeGuardian() async =>
      await _api.delete('/guardian/remove');

  // ── Guardian methods ──────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> verifyPin(String pin) async =>
      await _api.post('/guardian/verify-pin', data: {'pin': pin});

  Future<Map<String, dynamic>?> linkWithPin(
          String pin, String relationship) async =>
      await _api.post('/guardian/link-with-pin',
          data: {'pin': pin, 'relationship': relationship});

  Future<Map<String, dynamic>?> getMyWards() async =>
      await _api.get('/guardian/guardian-my-wards');

  Future<Map<String, dynamic>?> removeWard(dynamic individualId) async =>
      await _api.post('/guardian/guardian-remove-ward',
          data: {'wardId': individualId});

  // ── Interest approval ─────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getPendingInterests() async =>
      await _api.get('/guardian/guardian-pending-interests');

  Future<Map<String, dynamic>?> approveInterest(dynamic interestId) async =>
      await _api.post('/guardian/guardian-approve-interest',
          data: {'interestId': interestId});

  Future<Map<String, dynamic>?> rejectInterest(dynamic interestId) async =>
      await _api.post('/guardian/guardian-reject-interest',
          data: {'interestId': interestId});

  Future<Map<String, dynamic>?> getGuardianPendingCount() async =>
      await _api.get('/guardian/guardian-pending-count');
}
