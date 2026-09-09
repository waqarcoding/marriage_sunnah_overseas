import 'package:get/get.dart';
import '../services/meeting_service.dart';

class ScheduleMeetingController extends GetxController {
  final MeetingService _service = Get.find<MeetingService>();

  var isLoading = false.obs;

  // Form state
  var meetingDatetime      = ''.obs;
  var durationMinutes      = 60.obs;
  var timezone             = 'Asia/Karachi'.obs;
  var meetingType          = 'video_call'.obs;
  var includeMyGuardian    = false.obs;
  var requestTheirGuardian = false.obs;
  var requestPlatformTeam  = false.obs;
  var platformTeamRole     = 'moderator'.obs;
  var agenda               = ''.obs;
  var locationName         = ''.obs;
  var locationAddress      = ''.obs;

  void initDefaults() {
    final tomorrow = DateTime.now().add(Duration(days: 1));
    final dt = DateTime(tomorrow.year, tomorrow.month, tomorrow.day, 18, 0);
    // Format as yyyy-MM-ddTHH:mm
    meetingDatetime.value =
        '${dt.year.toString().padLeft(4, '0')}-'
        '${dt.month.toString().padLeft(2, '0')}-'
        '${dt.day.toString().padLeft(2, '0')}T'
        '${dt.hour.toString().padLeft(2, '0')}:'
        '${dt.minute.toString().padLeft(2, '0')}';
  }

  void reset() {
    meetingDatetime.value      = '';
    durationMinutes.value      = 60;
    meetingType.value          = 'video_call';
    includeMyGuardian.value    = false;
    requestTheirGuardian.value = false;
    requestPlatformTeam.value  = false;
    agenda.value               = '';
    locationName.value         = '';
    locationAddress.value      = '';
  }

  Future<bool> submit(dynamic matchId) async {
    if (matchId == null) {
      Get.snackbar('Error', 'Match ID is missing',
          snackPosition: SnackPosition.BOTTOM);
      return false;
    }
    if (meetingDatetime.value.isEmpty) {
      Get.snackbar('Error', 'Please select a date and time',
          snackPosition: SnackPosition.BOTTOM);
      return false;
    }

    isLoading.value = true;
    try {
      final res = await _service.proposeMeeting({
        'match_id':               matchId,
        'meeting_datetime':       meetingDatetime.value,
        'duration_minutes':       durationMinutes.value,
        'timezone':               timezone.value,
        'meeting_type':           meetingType.value,
        'include_my_guardian':    includeMyGuardian.value,
        'request_their_guardian': requestTheirGuardian.value,
        'request_platform_team':  requestPlatformTeam.value,
        'platform_team_role':     platformTeamRole.value,
        'agenda':                 agenda.value,
        'location_name':          locationName.value,
        'location_address':       locationAddress.value,
      });

      if (res?['success'] == true) {
        Get.snackbar('✅', 'Meeting invitation sent!',
            snackPosition: SnackPosition.BOTTOM);
        reset();
        return true;
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Failed to schedule meeting',
            snackPosition: SnackPosition.BOTTOM);
        return false;
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to schedule meeting',
          snackPosition: SnackPosition.BOTTOM);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}
