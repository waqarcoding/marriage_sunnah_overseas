import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';

class InterestService extends GetxService {
  final ApiClient _apiClient = Get.find<ApiClient>();

  Future<Map<String, dynamic>?> getAllInterests() async {
    return await _apiClient.get('/interest/get-interests');
  }

  Future<Map<String, dynamic>?> accept(int interestId) async {
    return await _apiClient.post('/interest/accept-interest', data: {'interestId': interestId});
  }

  Future<Map<String, dynamic>?> decline(int interestId) async {
    return await _apiClient.post('/interest/decline-interest', data: {'interestId': interestId});
  }

  Future<Map<String, dynamic>?> cancel(int interestId) async {
    return await _apiClient.post('/interest/cancel-interest', data: {'interestId': interestId});
  }

  Future<Map<String, dynamic>?> pendingCount() async {
    return await _apiClient.get('/interest/pending-count');
  }
}
