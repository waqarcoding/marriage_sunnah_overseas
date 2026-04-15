import 'package:app/data/repositories/match_repository.dart';
import 'package:app/features/match/match_repository.dart';

class MatchService {
  final MatchRepository repository;

  MatchService(this.repository);

  /// Fetch all potential matches
  Future<List<dynamic>> getMatches() async {
    return await repository.getMatches();
  }

  /// Like a user
  Future<dynamic> likeUser(String userId) async {
    return await repository.likeUser(userId);
  }

  /// Dislike a user
  Future<dynamic> dislikeUser(String userId) async {
    return await repository.dislikeUser(userId);
  }

  /// Accept a match
  Future<dynamic> acceptMatch(String matchId) async {
    return await repository.acceptMatch(matchId);
  }

  /// Reject a match
  Future<dynamic> rejectMatch(String matchId) async {
    return await repository.rejectMatch(matchId);
  }
}
