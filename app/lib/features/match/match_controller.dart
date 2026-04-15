import 'package:app/data/services/match_service.dart';
import 'package:get/get.dart';

class MatchController extends GetxController {
  final MatchService matchService;

  MatchController(this.matchService);

  /// Loading state
  var isLoading = false.obs;

  /// List of potential matches
  var matches = <dynamic>[].obs;

  /// Error message
  var errorMessage = ''.obs;

  /// Fetch potential matches
  Future<void> fetchMatches() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final data = await matchService.getMatches();
      matches.value = data;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  /// Like a user
  Future<void> likeUser(String userId) async {
    try {
      await matchService.likeUser(userId);
      matches.removeWhere((m) => m['id'] == userId);
    } catch (e) {
      errorMessage.value = e.toString();
    }
  }

  /// Dislike a user
  Future<void> dislikeUser(String userId) async {
    try {
      await matchService.dislikeUser(userId);
      matches.removeWhere((m) => m['id'] == userId);
    } catch (e) {
      errorMessage.value = e.toString();
    }
  }

  /// Accept match
  Future<void> acceptMatch(String matchId) async {
    try {
      await matchService.acceptMatch(matchId);
    } catch (e) {
      errorMessage.value = e.toString();
    }
  }

  /// Reject match
  Future<void> rejectMatch(String matchId) async {
    try {
      await matchService.rejectMatch(matchId);
    } catch (e) {
      errorMessage.value = e.toString();
    }
  }
}
