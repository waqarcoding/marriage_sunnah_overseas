import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import '../../../core/widgets/crop_screen.dart';
import '../../../data/providers/api_client.dart';

class GuardianProfileController extends GetxController {
  final ApiClient _api = Get.find<ApiClient>();
  final ImagePicker _picker = ImagePicker();

  // ── Form state ────────────────────────────────────────────
  final RxMap<String, dynamic> _form = <String, dynamic>{}.obs;

  dynamic getForm(String key) => _form[key];
  void setForm(String key, dynamic value) => _form[key] = value;

  // ── Photo state ───────────────────────────────────────────
  final RxString guardianPhotoUrl = ''.obs;
  final RxBool isPhotoUploading = false.obs;

  // ── Save state ────────────────────────────────────────────
  final RxBool isSaving = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadExistingGuardianData();
  }

  Future<void> _loadExistingGuardianData() async {
    try {
      final res = await _api.get('/guardian/profile');
      if (res != null && res['success'] == true && res['data'] != null) {
        final data = res['data'];
        setForm('guardian_name', data['name'] ?? '');
        setForm('relationship', data['relationship'] ?? '');
        setForm('guardian_gender', data['gender'] ?? '');
        setForm('phone', data['phone'] ?? '');
        guardianPhotoUrl.value = data['photo_url']?.toString() ?? '';
      }
    } catch (e) {
      print('[GuardianProfile] Load error: $e');
    }
  }

  // ── Photo pick + crop + upload ───────────────────────────────
  Future<void> pickAndUploadGuardianPhoto() async {
    final picked =
        await _picker.pickImage(source: ImageSource.gallery, imageQuality: 90);
    if (picked == null) return;

    Uint8List? croppedBytes;

    if (kIsWeb) {
      final imageBytes = await picked.readAsBytes();
      croppedBytes = await Get.to<Uint8List>(
        () => CropScreen(imageBytes: imageBytes),
      );
      if (croppedBytes == null) return;
    } else {
      final cropped = await ImageCropper().cropImage(
        sourcePath: picked.path,
        aspectRatio: const CropAspectRatio(ratioX: 1, ratioY: 1),
        compressQuality: 90,
        uiSettings: [
          AndroidUiSettings(
            toolbarTitle: 'Crop Photo',
            toolbarColor: const Color(0xFF1B4D3E),
            toolbarWidgetColor: Colors.white,
            initAspectRatio: CropAspectRatioPreset.square,
            lockAspectRatio: true,
          ),
          IOSUiSettings(
            title: 'Crop Photo',
            aspectRatioLockEnabled: true,
            aspectRatioPickerButtonHidden: true,
          ),
        ],
      );
      if (cropped == null) return;
      croppedBytes = await File(cropped.path).readAsBytes();
    }

    isPhotoUploading.value = true;

    final base64Str = base64Encode(croppedBytes);
    guardianPhotoUrl.value = 'data:image/jpeg;base64,$base64Str';

    try {
      final res = await uploadGuardianPhotoBytes(croppedBytes);
      if (res != null && res['success'] == true) {
        guardianPhotoUrl.value = res['imageUrl']?.toString() ?? '';
        print('✅ Guardian photo uploaded successfully');
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Upload failed',
            snackPosition: SnackPosition.BOTTOM);
        guardianPhotoUrl.value = '';
      }
    } catch (_) {
      Get.snackbar('Error', 'Upload failed',
          snackPosition: SnackPosition.BOTTOM);
      guardianPhotoUrl.value = '';
    } finally {
      isPhotoUploading.value = false;
    }
  }

  Future<Map<String, dynamic>?> uploadGuardianPhotoBytes(
          Uint8List bytes) async =>
      await _api.uploadBytes(
        '/guardian/upload-photo',
        {},
        {'image': bytes},
        {'image': 'guardian_photo.jpg'},
      );

  // ── Validation ────────────────────────────────────────────
  bool _validate() {
    if ((getForm('guardian_name') ?? '').toString().trim().isEmpty) {
      Get.snackbar('Missing Info', 'Please enter guardian\'s full name',
          snackPosition: SnackPosition.BOTTOM);
      return false;
    }
    if ((getForm('relationship') ?? '').toString().trim().isEmpty) {
      Get.snackbar('Missing Info', 'Please enter the relationship',
          snackPosition: SnackPosition.BOTTOM);
      return false;
    }
    if ((getForm('guardian_gender') ?? '').toString().trim().isEmpty) {
      Get.snackbar('Missing Info', 'Please select gender',
          snackPosition: SnackPosition.BOTTOM);
      return false;
    }
    return true;
  }

  // ── Save ──────────────────────────────────────────────────
  Future<void> saveGuardianProfile() async {
    if (!_validate()) return;

    isSaving.value = true;
    try {
      final res = await _api.post(
        '/profile/update-profile',
        data: {
          'name': getForm('guardian_name'),
          'gender': getForm('guardian_gender'),
          'phone': getForm('phone') ?? '',
        },
      );

      if (res != null && res['success'] == true) {
        Get.snackbar('Success', 'Guardian profile saved',
            snackPosition: SnackPosition.BOTTOM);
        Get.back();
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Failed to save profile',
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (_) {
      Get.snackbar('Error', 'Something went wrong',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isSaving.value = false;
    }
  }
}
