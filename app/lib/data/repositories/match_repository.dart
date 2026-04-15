import 'package:app/data/providers/api_client.dart';

class MatchRepository {
  final ApiClient apiClient;

  MatchRepository(this.apiClient);

  /// Fetch all potential matches
  Future<List<dynamic>> getMatches() async {
    final response = await apiClient.get('/match/potential');
    return response['matches'] ?? [];
  }

  /// Like a user
  Future<dynamic> likeUser(String userId) async {
    return await apiClient.post('/match/like', {"userId": userId});
  }

  /// Dislike a user
  Future<dynamic> dislikeUser(String userId) async {
    return await apiClient.post('/match/dislike', {"userId": userId});
  }

  /// Accept a match
  Future<dynamic> acceptMatch(String matchId) async {
    return await apiClient.post('/match/accept', {"matchId": matchId});
  }

  /// Reject a match
  Future<dynamic> rejectMatch(String matchId) async {
    return await apiClient.post('/match/reject', {"matchId": matchId});
  }
}
