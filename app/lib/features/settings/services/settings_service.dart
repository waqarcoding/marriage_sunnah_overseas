import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';

class UserSettingsService extends GetxService {
  final ApiClient _api = Get.find<ApiClient>();

  Future<Map<String, dynamic>?> updateSettings(
      Map<String, dynamic> data) async {
    final result = await _api.patch('/profile/settings', data: data);
    if (result is Map<String, dynamic>?) return result;
    return null;
  }

  Future<Map<String, dynamic>?> changePassword(
      Map<String, dynamic> data) async {
    final result = await _api.put('/profile/change-password', data: data);
    if (result is Map<String, dynamic>?) return result;
    return null;
  }

  Future<Map<String, dynamic>?> getMySubscriptions() async {
    final result = await _api.get('/subscription/my');
    if (result is Map<String, dynamic>?) return result;
    return null;
  }

  Future<Map<String, dynamic>?> getMyReferrals(dynamic userId) async {
    final result = await _api.get('/referrals/referrer/$userId/details');
    if (result is Map<String, dynamic>?) return result;
    return null;
  }

  Future<Map<String, dynamic>?> getMyReferrer(dynamic userId) async {
    final result = await _api.get('/referrals/user/$userId/referrer/details');
    if (result is Map<String, dynamic>?) return result;
    return null;
  }

  Future<Map<String, dynamic>?> getPlans() async {
    final result = await _api.get('/subscription/plans');
    if (result is Map<String, dynamic>?) return result;
    return null;
  }

  Future<Map<String, dynamic>?> createPaymentSession(
      Map<String, dynamic> data) async {
    final result =
        await _api.post('/subscription/create-checkout-session', data: data);
    if (result is Map<String, dynamic>?) return result;
    return null;
  }

  Future<Map<String, dynamic>?> restorePurchases(
      Map<String, dynamic> data) async {
    final result =
        await _api.post('/subscription/restore-purchases', data: data);
    if (result is Map<String, dynamic>?) return result;
    return null;
  }
}
