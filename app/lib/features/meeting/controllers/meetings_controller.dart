import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/meeting_service.dart';

class MeetingsController extends GetxController {
  final MeetingService _service = Get.find<MeetingService>();

  var isLoading  = true.obs;
  var meetings   = <Map<String, dynamic>>[].obs;

  int get currentUserId {
    try {
      final u = GetStorage().read('user');
      return int.tryParse(u?['id']?.toString() ?? '0') ?? 0;
    } catch (_) { return 0; }
  }

  @override
  void onInit() {
    super.onInit();
    loadMeetings();
  }

  Future<void> loadMeetings() async {
    isLoading.value = true;
    try {
      final res = await _service.getMyMeetings(status: 'all');
      if (res?['success'] == true) {
        final now = DateTime.now();
        final list = (res!['data'] as List? ?? [])
            .map((e) => Map<String, dynamic>.from(e as Map))
            .where((m) {
              // Filter out expired meetings (same as React)
              try {
                final dt  = DateTime.parse(m['meeting_datetime'].toString());
                final dur = int.tryParse(m['duration_minutes']?.toString() ?? '60') ?? 60;
                final end = dt.add(Duration(minutes: dur));
                return end.isAfter(now);
              } catch (_) { return true; }
            })
            .toList();
        meetings.value = list;
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to load meetings',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> confirmMeeting(dynamic meetingId) async {
    try {
      final res = await _service.confirmMeeting(meetingId);
      if (res?['success'] == true) {
        Get.snackbar('✅', res?['message'] ?? 'Meeting confirmed',
            snackPosition: SnackPosition.BOTTOM);
        loadMeetings();
      }
    } catch (_) {
      Get.snackbar('Error', 'Failed to confirm meeting',
          snackPosition: SnackPosition.BOTTOM);
    }
  }

  Future<void> cancelMeeting(dynamic meetingId, String reason) async {
    try {
      final res = await _service.cancelMeeting(meetingId, reason);
      if (res?['success'] == true) {
        Get.snackbar('Done', 'Meeting cancelled',
            snackPosition: SnackPosition.BOTTOM);
        loadMeetings();
      }
    } catch (_) {
      Get.snackbar('Error', 'Failed to cancel meeting',
          snackPosition: SnackPosition.BOTTOM);
    }
  }
}
