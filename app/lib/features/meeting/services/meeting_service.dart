import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';

class MeetingService extends GetxService {
  final ApiClient _api = Get.find<ApiClient>();

  // ── User endpoints ─────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> proposeMeeting(
          Map<String, dynamic> data) async =>
      await _api.post('/meetings/propose', data: data);

  Future<Map<String, dynamic>?> confirmMeeting(dynamic meetingId) async =>
      await _api.post('/meetings/$meetingId/confirm', data: {});

  Future<Map<String, dynamic>?> getMyMeetings({String status = 'all'}) async =>
      await _api.get('/meetings/my-meetings?status=$status');

  Future<Map<String, dynamic>?> getMeetingDetails(dynamic meetingId) async =>
      await _api.get('/meetings/$meetingId');

  Future<Map<String, dynamic>?> cancelMeeting(
          dynamic meetingId, String reason) async =>
      await _api.post('/meetings/$meetingId/cancel', data: {'reason': reason});

  Future<Map<String, dynamic>?> rescheduleMeeting(
          dynamic meetingId, String newDatetime, int? newDuration) async =>
      await _api.post('/meetings/$meetingId/reschedule',
          data: {'new_datetime': newDatetime, 'new_duration': newDuration});

  // ── Admin endpoints ────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getAllMeetings(
          Map<String, dynamic> filters) async =>
      await _api.get(
          '/admin/meetings'); // await _api.get('/admin/meetings', queryParams: filters);

  Future<Map<String, dynamic>?> getStats() async =>
      await _api.get('/admin/meetings/stats');

  Future<Map<String, dynamic>?> updateStatus(dynamic meetingId, String status,
          {String? adminNotes}) async =>
      await _api.patch('/admin/meetings/$meetingId/status',
          data: {'status': status, 'admin_notes': adminNotes});

  Future<Map<String, dynamic>?> deleteMeeting(dynamic meetingId) async =>
      await _api.delete('/admin/meetings/$meetingId');
}
