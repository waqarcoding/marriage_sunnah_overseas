import 'dart:io';
import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';

class UserProfileService extends GetxService {
  final ApiClient _api = Get.find<ApiClient>();

  // ── GET /profile/get-current-user ─────────────────────────────────────────
  Future<Map<String, dynamic>?> getCurrentUser() async =>
      await _api.get('/profile/get-current-user');

  // ── PUT /profile/update-profile ───────────────────────────────────────────
  Future<Map<String, dynamic>?> updateProfile(
          Map<String, dynamic> data) async =>
      await _api.put('/profile/update-profile', data: data);

  // ── PUT /profile/update-about ─────────────────────────────────────────────
  Future<Map<String, dynamic>?> updateAboutInterest(
          Map<String, dynamic> data) async =>
      await _api.put('/profile/update-about', data: data);

  // ── POST /profile/upload-image ────────────────────────────────────────────
  Future<Map<String, dynamic>?> uploadImage(File file, int index) async =>
      await _api.upload(
        '/profile/upload-image',
        {'index': index.toString()},
        {'image': file.path},
      );

  // ── POST /profile/upload-video ────────────────────────────────────────────
  Future<Map<String, dynamic>?> uploadVideo(File file, int index) async =>
      await _api.upload(
        '/profile/upload-video',
        {'index': index.toString()},
        {'video': file.path},
      );

  // ── DELETE /profile/delete-image/:index ───────────────────────────────────
  Future<Map<String, dynamic>?> deleteImage(int index) async =>
      await _api.delete('/profile/delete-image/$index');

  // ── DELETE /profile/delete-video/:index ───────────────────────────────────
  Future<Map<String, dynamic>?> deleteVideo(int index) async =>
      await _api.delete('/profile/delete-video/$index');

  // ── Guardian ──────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getMyGuardian() async =>
      await _api.get('/guardian/my-guardian');

  Future<Map<String, dynamic>?> removeGuardian() async =>
      await _api.delete('/guardian/remove');

  Future<Map<String, dynamic>?> getMyPin() async =>
      await _api.get('/guardian/my-pin');

  Future<Map<String, dynamic>?> generatePin() async =>
      await _api.post('/guardian/generate-pin', data: {});
}
