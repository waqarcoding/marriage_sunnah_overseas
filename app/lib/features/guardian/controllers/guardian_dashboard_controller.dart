import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/guardian_service.dart';
import '../../../core/services/socket_service.dart';

class GuardianDashboardController extends GetxController {
  final GuardianService _service = Get.find<GuardianService>();

  var isLoading     = true.obs;
  var loadingAction = Rx<String?>(null);
  var activeTab     = 'pending'.obs;

  var pending  = <Map<String, dynamic>>[].obs;
  var all      = <Map<String, dynamic>>[].obs;
  var approved = <Map<String, dynamic>>[].obs;
  var rejected = <Map<String, dynamic>>[].obs;

  String get userName {
    try {
      final u = GetStorage().read('user');
      return u?['name']?.toString().split(' ').first ?? 'Guardian';
    } catch (_) { return 'Guardian'; }
  }

  @override
  void onInit() {
    super.onInit();
    loadAll();
    _listenSocket();
  }

  Future<void> loadAll() async {
    isLoading.value = true;
    try {
      final res = await _service.getPendingInterests();
      final data = res?['data'] ?? {};
      pending.value  = _toList(data['pending']);
      all.value      = _toList(data['all']);
      approved.value = _toList(data['approved']);
      rejected.value = _toList(data['rejected']);
    } catch (e) {
      Get.snackbar('Error', 'Failed to load interests',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  void _listenSocket() {
    try {
      final socket = Get.find<SocketService>();
      ever(socket.lastNotification, (notif) {
        if (notif == null) return;
        const reload = [
          'interest_received', 'interest_accepted', 'interest_declined',
          'guardian_approved', 'guardian_rejected', 'guardian_new_interest',
        ];
        if (reload.contains(notif.type)) loadAll();
      });
    } catch (_) {}
  }

  List<Map<String, dynamic>> get currentList {
    switch (activeTab.value) {
      case 'pending':  return pending;
      case 'all':      return all;
      case 'approved': return approved;
      case 'rejected': return rejected;
      default:         return pending;
    }
  }

  // ── Approve (optimistic) ──────────────────────────────────────────────────
  Future<void> handleApprove(dynamic interestId) async {
    loadingAction.value = interestId.toString();

    // Optimistic update
    final item = pending.firstWhereOrNull((i) => i['id'] == interestId);
    if (item != null) {
      pending.remove(item);
      approved.insert(0, {...item, 'status': 'approved'});
      all.value = all.map((i) =>
          i['id'] == interestId ? {...i, 'status': 'approved'} : i).toList();
    }

    try {
      final res = await _service.approveInterest(interestId);
      if (res?['success'] == true) {
        Get.snackbar('✅', 'Interest approved!',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Failed to approve',
            snackPosition: SnackPosition.BOTTOM);
      }
      loadAll(); // confirm with server
    } catch (_) {
      Get.snackbar('Error', 'Failed to approve',
          snackPosition: SnackPosition.BOTTOM);
      loadAll();
    } finally {
      loadingAction.value = null;
    }
  }

  // ── Reject (optimistic) ───────────────────────────────────────────────────
  Future<void> handleReject(dynamic interestId) async {
    loadingAction.value = 'rej_$interestId';

    final item = pending.firstWhereOrNull((i) => i['id'] == interestId);
    if (item != null) {
      pending.remove(item);
      rejected.insert(0, {...item, 'status': 'rejected'});
      all.value = all.map((i) =>
          i['id'] == interestId ? {...i, 'status': 'rejected'} : i).toList();
    }

    try {
      final res = await _service.rejectInterest(interestId);
      if (res?['success'] == true) {
        Get.snackbar('Done', 'Interest rejected',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Failed to reject',
            snackPosition: SnackPosition.BOTTOM);
      }
      loadAll();
    } catch (_) {
      Get.snackbar('Error', 'Failed to reject',
          snackPosition: SnackPosition.BOTTOM);
      loadAll();
    } finally {
      loadingAction.value = null;
    }
  }

  List<Map<String, dynamic>> _toList(dynamic val) {
    if (val == null) return [];
    if (val is List) return val.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    return [];
  }
}
