import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/interest_service.dart';

class InterestController extends GetxController {
  final InterestService _service = Get.find<InterestService>();

  var isLoading = true.obs;
  var isPro = false.obs;
  var activeTab = 'Sent'.obs; // 'Sent' | 'Received'

  var tabData = <String, List<Map<String, dynamic>>>{
    'sent': [],
    'received': [],
    'matches': [],
    'rejected': [],
  }.obs;

  // Dialog state
  var dialog = Rxn<Map<String, dynamic>>();
  var cancelConfirm = Rxn<Map<String, dynamic>>();

  int? get currentUserId {
    try {
      final storage = GetStorage();
      final userData = storage.read('user');
      if (userData is Map) return userData['id'];
      return null;
    } catch (_) { return null; }
  }

  @override
  void onInit() {
    super.onInit();
    _loadProStatus();
    fetchData();
  }

  void _loadProStatus() {
    try {
      final storage = GetStorage();
      final user = storage.read('user');
      isPro.value = user?['is_pro'] == true || user?['is_pro'] == 1;
    } catch (_) {}
  }

  Future<void> fetchData() async {
    isLoading.value = true;
    try {
      final res = await _service.getAllInterests();
      if (res != null && res['success'] == true) {
        final data = res['data'] ?? {};
        tabData.value = {
          'sent': _toList(data['sent']),
          'received': _toList(data['received']),
          'matches': _toList(data['matches']),
          'rejected': _toList(data['rejected']),
        };
      }
    } catch (e) {
      print('fetchData error: $e');
      Get.snackbar('Error', 'Failed to load interests', snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  List<Map<String, dynamic>> _toList(dynamic v) {
    if (v == null) return [];
    if (v is List) return v.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    return [];
  }

  // ─── Tab data ─────────────────────────────────────────────────────────────
  List<Map<String, dynamic>> get sentAll {
    final uid = currentUserId;
    return [
      ...tabData['sent'] ?? [],
      ...(tabData['matches'] ?? []).where((i) => i['from_user'] == uid),
      ...(tabData['rejected'] ?? []).where((i) => i['from_user'] == uid),
    ];
  }

  List<Map<String, dynamic>> get receivedAll {
    final uid = currentUserId;
    return [
      ...tabData['received'] ?? [],
      ...(tabData['matches'] ?? []).where((i) => i['from_user'] != uid),
      ...(tabData['rejected'] ?? []).where((i) => i['from_user'] != uid),
    ];
  }

  List<Map<String, dynamic>> get interests => activeTab.value == 'Sent' ? sentAll : receivedAll;
  int get sentCount => sentAll.length;
  int get receivedCount => receivedAll.length;

  // ─── Tab switch ───────────────────────────────────────────────────────────
  void selectTab(String tab) {
    if (tab == 'Received' && !isPro.value) return;
    activeTab.value = tab;
  }

  // ─── Accept / Decline ─────────────────────────────────────────────────────
  void openAcceptDialog(Map<String, dynamic> interest, String name) {
    dialog.value = {'type': 'accept', 'interestId': interest['id'], 'name': name, 'interest': interest};
  }

  void openDeclineDialog(Map<String, dynamic> interest, String name) {
    dialog.value = {'type': 'decline', 'interestId': interest['id'], 'name': name, 'interest': interest};
  }

  Future<void> confirmDialog() async {
    final d = dialog.value;
    if (d == null) return;
    dialog.value = null;

    final type = d['type'] as String;
    final interestId = d['interestId'];
    final interest = Map<String, dynamic>.from(d['interest'] as Map);

    // Optimistic update
    if (type == 'accept') {
      tabData.value = {
        ...tabData,
        'received': (tabData['received'] ?? []).where((i) => i['id'] != interestId).toList(),
        'matches': [interest, ...(tabData['matches'] ?? [])],
      };
    } else {
      tabData.value = {
        ...tabData,
        'received': (tabData['received'] ?? []).where((i) => i['id'] != interestId).toList(),
        'rejected': [{...interest, 'status': 'declined'}, ...(tabData['rejected'] ?? [])],
      };
    }

    try {
      if (type == 'accept') {
        await _service.accept(interestId as int);
        Get.snackbar('Accepted! 🎉', 'Interest accepted successfully', snackPosition: SnackPosition.BOTTOM);
      } else {
        await _service.decline(interestId as int);
        Get.snackbar('Declined', 'Interest declined', snackPosition: SnackPosition.BOTTOM);
      }
      fetchData(); // silent refresh
    } catch (e) {
      Get.snackbar('Error', 'Action failed', snackPosition: SnackPosition.BOTTOM);
      fetchData(); // rollback
    }
  }

  // ─── Cancel ───────────────────────────────────────────────────────────────
  void openCancelConfirm(Map<String, dynamic> interest) {
    final profile = interest['toProfile'] ?? {};
    final images = _parseImages(profile['images']);
    cancelConfirm.value = {
      'id': interest['id'],
      'name': profile['name'] ?? '',
      'image': images.isNotEmpty ? images.first : null,
    };
  }

  Future<void> confirmCancel() async {
    final cc = cancelConfirm.value;
    if (cc == null) return;
    cancelConfirm.value = null;
    try {
      final res = await _service.cancel(cc['id'] as int);
      if (res != null && res['success'] == true) {
        Get.snackbar('Cancelled', 'Interest cancelled', snackPosition: SnackPosition.BOTTOM);
        fetchData();
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to cancel interest', snackPosition: SnackPosition.BOTTOM);
    }
  }

  List<String> _parseImages(dynamic v) {
    if (v == null) return [];
    if (v is List) return v.map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
    try {
      final s = v.toString();
      return s.replaceAll('[', '').replaceAll(']', '').replaceAll('"', '')
          .split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    } catch (_) { return []; }
  }
}
