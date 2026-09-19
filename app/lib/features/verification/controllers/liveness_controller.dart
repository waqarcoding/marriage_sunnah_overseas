import 'dart:developer';

import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:app/features/intro/profile_progress_widget.dart';
import 'package:app/features/verification/services/verification_service.dart';
import 'package:app/features/verification/widgets/face_scan_controller.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:permission_handler/permission_handler.dart';

class LivenessController extends GetxController with WidgetsBindingObserver {
  final VerificationService _verificationService =
      Get.find<VerificationService>();

  // ── State ────────────────────────────────────────────────────────────────
  final RxBool hasCameraPermission = false.obs;
  final RxBool isCheckingPermission = true.obs;
  final RxBool isUploading = false.obs;
  final RxBool isVerified = false.obs;
  final RxString errorMessage = ''.obs;

  // The active face scanner. Rebuilt (via _startScan) on first permission
  // grant and on every retry — FaceScanController owns a live camera stream
  // that's simpler to recreate cleanly than to reset in place.
  FaceScanController? _faceScan;
  FaceScanController? get faceScan => _faceScan;

  // Bumped every time _faceScan is replaced, so the view's Obx knows to
  // rebuild and re-attach its AnimatedBuilder to the new instance.
  final RxInt scanGeneration = 0.obs;

  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addObserver(this);
    _checkPermission();
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    _faceScan?.dispose();
    super.onClose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Backgrounding with a live camera stream leaks resources on Android.
    final camera = _faceScan?.camera;
    if (camera == null || !camera.value.isInitialized) return;
    if (state == AppLifecycleState.inactive ||
        state == AppLifecycleState.paused) {
      camera.pausePreview();
    } else if (state == AppLifecycleState.resumed) {
      camera.resumePreview();
    }
  }

  Future<void> _checkPermission() async {
    isCheckingPermission.value = true;
    final status = await Permission.camera.status;
    hasCameraPermission.value = status.isGranted;
    isCheckingPermission.value = false;

    if (hasCameraPermission.value) {
      _startScan();
    }
  }

  Future<void> requestCameraPermission() async {
    isCheckingPermission.value = true;
    final status = await Permission.camera.request();
    hasCameraPermission.value = status.isGranted;
    isCheckingPermission.value = false;

    if (!status.isGranted) {
      errorMessage.value = 'Camera permission is required to verify liveness.';
      return;
    }

    _startScan();
  }

  void _startScan() {
    _faceScan?.dispose();
    errorMessage.value = '';
    _faceScan = FaceScanController(
      onCaptured: (file) => _handleCaptured(file),
    );
    scanGeneration.value++;
    _faceScan!.init();
  }

  Future<void> _handleCaptured(XFile file) async {
    await _uploadResult(file.path);
  }

  Future<void> _uploadResult(String imagePath) async {
    isUploading.value = true;
    errorMessage.value = '';
    try {
      final response =
          await _verificationService.uploadLivenessPhoto(imagePath, imagePath);

      if (response == null || response['success'] != true) {
        errorMessage.value = response?['message']?.toString() ??
            'Upload failed. Please try again.';
        isVerified.value = false;
        return;
      }
      ProfileProgressController profileProgressController =
          Get.find<ProfileProgressController>();
      profileProgressController.fetchData();

      isVerified.value = true;
      log('✅ Liveness verified and uploaded: $imagePath');
    } catch (e) {
      errorMessage.value = 'Upload failed: $e';
      isVerified.value = false;
    } finally {
      isUploading.value = false;
    }
  }

  void reset() {
    isVerified.value = false;
    errorMessage.value = '';
    if (hasCameraPermission.value) {
      _startScan();
    }
  }
}
