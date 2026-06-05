import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';

class ExploreService extends GetxService {
  final ApiClient _apiClient = Get.find<ApiClient>();

  // Get explore feed with filters
  Future<Map<String, dynamic>?> getExplore({
    String? gender,
    String? city,
    String? country,
    String? countries,
    int? minAge,
    int? maxAge,
    bool isVerified = false,
    bool isPremium = false,
    bool isOnline = false,
  }) async {
    final params = <String, String>{};
    if (gender != null && gender.isNotEmpty) params['gender'] = gender;
    if (city != null && city.isNotEmpty) params['city'] = city;
    if (country != null && country.isNotEmpty) params['country'] = country;
    if (countries != null && countries.isNotEmpty) params['countries'] = countries;
    if (minAge != null) params['minAge'] = minAge.toString();
    if (maxAge != null) params['maxAge'] = maxAge.toString();
    if (isVerified) params['isVerified'] = '1';
    if (isPremium) params['isPremium'] = '1';
    if (isOnline) params['isOnline'] = '1';

    return await _apiClient.get('/explore/get-explore', queryParameters: params);
  }

  // Get options (countries, religions, etc)
  Future<Map<String, dynamic>?> getOptions() async {
    return await _apiClient.get('/explore/options');
  }

  // Send interest (like)
  Future<Map<String, dynamic>?> sendInterest(int toUserId, {bool isSuperLike = false}) async {
    return await _apiClient.post('/interest/send-interest', data: {
      'interestId': toUserId,
      'isSuperLike': isSuperLike,
    });
  }

  // Send dislike (pass)
  Future<Map<String, dynamic>?> sendDislike(int targetUserId) async {
    return await _apiClient.post('/interest/dislike', data: {
      'interestId': targetUserId,
    });
  }

  // Save preferences
  Future<Map<String, dynamic>?> savePreferences(Map<String, dynamic> payload) async {
    return await _apiClient.post('/explore/save-preferences', data: payload);
  }
}
