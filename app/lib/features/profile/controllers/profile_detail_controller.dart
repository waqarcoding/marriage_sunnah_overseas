import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/profile_service.dart';
import '../../../data/providers/api_client.dart';

class ProfileDetailController extends GetxController {
  final ProfileService _profileService = Get.find<ProfileService>();

  var isLoading = true.obs;
  var myProfile = Rxn<Map<String, dynamic>>();
  var compatibilityPair = Rxn<Map<String, dynamic>>();
  var matchPct = Rxn<int>();
  var currentUserRole = Rxn<String>();
  var isPro = false.obs;

  // Contact reveal state
  var phoneRevealed = false.obs;
  var emailRevealed = false.obs;
  var revealedPhone = Rxn<String>();
  var revealedEmail = Rxn<String>();
  var isUnlocking = false.obs;
  var creditsRemaining = Rxn<int>();
  var unlimitedReveals = false.obs;
  var showRevealDialog = false.obs;
  var pendingRevealType = Rxn<String>();

  // Approval status
  var approvalStatus = <String, dynamic>{
    'interestExists': false,
    'interestAccepted': false,
    'guardiansInvolved': false,
    'guardiansApproved': false,
  }.obs;

  final Map<String, int> creditCost = {
    'phone': 500,
    'email': 500,
    'both': 1000,
  };

  Future<void> init(Map<String, dynamic> profile) async {
    isLoading.value = true;
    try {
      final profileRes = await _profileService.getCurrentUser();
      final p = profileRes?['profile'] ?? profileRes?['data']?['profile'] ?? profileRes?['data'] ?? profileRes;
      final role = p?['role']?.toString();
      currentUserRole.value = role;
      myProfile.value = p;
      isPro.value = p?['is_pro'] == true || p?['is_pro'] == 1;

      compatibilityPair.value = {
        'myWard': p,
        'otherPerson': profile,
      };

      matchPct.value = _calcMatch(p, profile);

      // Check contact reveal status and credits
      final targetId = profile['individual_id'];
      if (targetId != null) {
        await _checkApprovalStatus(targetId);
      }
      await _fetchRevealStats();
    } catch (e) {
      print('ProfileDetail init error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  int? _calcMatch(Map<String, dynamic>? a, Map<String, dynamic>? b) {
    if (a == null || b == null) return null;
    final fields = ['religion', 'sect', 'country', 'marital_status', 'religious_practice_level'];
    double score = 0;
    int total = fields.length;
    for (final k in fields) {
      if (a[k] == null || b[k] == null) { total--; continue; }
      if (a[k].toString().toLowerCase() == b[k].toString().toLowerCase()) score++;
    }
    for (final k in ['has_children', 'willing_to_relocate']) {
      if (a[k] != null && b[k] != null) {
        total++;
        if (a[k] == b[k]) score++;
      }
    }
    // interests
    final ai = _parseList(a['interests']);
    final bi = _parseList(b['interests']);
    if (ai.isNotEmpty && bi.isNotEmpty) {
      total++;
      final overlap = ai.where((i) => bi.contains(i)).length;
      score += (overlap / ai.length).clamp(0.0, 1.0);
    }
    return total > 0 ? (score / total * 100).round() : null;
  }

  List<String> _parseList(dynamic v) {
    if (v == null) return [];
    if (v is List) return v.map((e) => e.toString()).toList();
    try {
      final s = v.toString();
      return s.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    } catch (_) { return []; }
  }

  Future<void> _checkApprovalStatus(dynamic targetId) async {
    try {
      final apiClient = Get.find<ApiClient>();
      final res = await apiClient.get('/profile/contact-reveal-status/$targetId');
      if (res != null && res['data'] != null) {
        final data = res['data'];
        approvalStatus.value = {
          'interestExists': data['interestExists'] ?? false,
          'interestAccepted': data['interestAccepted'] ?? false,
          'guardiansInvolved': data['guardiansInvolved'] ?? false,
          'guardiansApproved': data['guardiansApproved'] ?? false,
        };
        if (data['isRevealed'] == true) {
          final revealType = data['revealType']?.toString() ?? '';
          if (revealType == 'phone' || revealType == 'both') phoneRevealed.value = true;
          if (revealType == 'email' || revealType == 'both') emailRevealed.value = true;
        }
      }
    } catch (e) {
      print('checkApprovalStatus error: $e');
    }
  }

  Future<void> _fetchRevealStats() async {
    try {
      final apiClient = Get.find<ApiClient>();
      final res = await apiClient.get('/profile/contact-reveal-stats');
      if (res != null && res['data'] != null) {
        creditsRemaining.value = res['data']['creditsRemaining'];
        unlimitedReveals.value = res['data']['unlimitedReveals'] ?? false;
      }
    } catch (e) {
      print('fetchRevealStats error: $e');
    }
  }

  bool isFullyApproved() {
    if (approvalStatus['interestExists'] != true) return false;
    if (approvalStatus['interestAccepted'] != true) return false;
    if (approvalStatus['guardiansInvolved'] == true && approvalStatus['guardiansApproved'] != true) return false;
    return true;
  }

  void openRevealDialog(String type) {
    pendingRevealType.value = type;
    showRevealDialog.value = true;
  }

  Future<void> confirmReveal(dynamic targetId) async {
    showRevealDialog.value = false;
    await _unlockContact(pendingRevealType.value ?? 'phone', targetId);
  }

  Future<void> _unlockContact(String type, dynamic targetId) async {
    if (isUnlocking.value) return;
    isUnlocking.value = true;
    try {
      final apiClient = Get.find<ApiClient>();
      final res = await apiClient.post('/profile/reveal-contact/$targetId', data: {'revealType': type});
      if (res != null && res['success'] == true) {
        if (type == 'phone' || type == 'both') {
          phoneRevealed.value = true;
          revealedPhone.value = res['data']?['contactInfo']?['phone'];
        }
        if (type == 'email' || type == 'both') {
          emailRevealed.value = true;
          revealedEmail.value = res['data']?['contactInfo']?['email'];
        }
        if (res['data']?['creditsRemaining'] != null) {
          creditsRemaining.value = res['data']['creditsRemaining'];
        }
        Get.snackbar('Unlocked!', 'Contact revealed successfully', snackPosition: SnackPosition.BOTTOM);
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Failed to unlock', snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to unlock contact', snackPosition: SnackPosition.BOTTOM);
    } finally {
      isUnlocking.value = false;
    }
  }
}
