// lib/features/guardian/controllers/link_guardian_controller.dart

import 'package:app/features/guardian/services/guardian_service.dart';
import 'package:app/data/models/guardian_model.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class LinkGuardianController extends GetxController {
  // ── State ──
  final loading = true.obs;
  final removing = false.obs;
  final copied = false.obs;
  final pin = Rx<String?>(null);
  final guardian = Rx<GuardianModel?>(null);
  final GuardianService _guardianService = Get.find<GuardianService>();
  @override
  void onInit() {
    super.onInit();
    _init();
  }

  // ── Boot: if user is guardian role, redirect ──
  void _init() {
    // Redirect if this user is a guardian (mirror JS role check)
    // final tokenData = AuthService.getTokenData();
    // if (tokenData?.role == 'guardian') { Get.offAllNamed('/guardian'); return; }
    loadGuardianStatus();
  }

  // ── Load current guardian or fall back to PIN ──
  Future<void> loadGuardianStatus() async {
    loading.value = true;
    final res = await _guardianService.getMyGuardian();
    if (res != null && res['success'] == true) {
      final data = res['data'];
      if (data != null && data['guardianUser'] != null) {
        final gUser = data['guardianUser'] as Map<String, dynamic>;
        final profile = (gUser['profile'] as Map<String, dynamic>?) ?? {};
        guardian.value = GuardianModel(
          id: data['guardian_id'] as int,
          name: data['guardian_name'] ?? 'Unknown',
          email: data['guardian_email'] ?? '',
          phone: data['guardian_phone'] ?? '',
          avatar: data['guardian_image'] ?? '',
          relationship: data['guardian_relationship'] ?? '',
          city: profile['city'] ?? '',
          country: profile['country'] ?? '',
          profession: profile['profession'] ?? '',
        );
        pin.value = null;
      } else {
        _loadPin();
      }
      loading.value = false;
    } else {
      _loadPin();
      loading.value = false;
    }
  }

  Future<void> _loadPin() async {
    final res = await _guardianService.getMyPin();
    if (res != null && res['success'] == true) {
      pin.value = res['data']?['pin'] as String;
    } else {}
  }

  // ── Generate a new PIN ──
  Future<void> generatePin() async {
    loading.value = true;
    final res = await _guardianService.generatePin();
    if (res != null && res['success'] == true) {
      pin.value = res['data']['pin'] as String;
      Get.snackbar('Success', 'New PIN generated!',
          snackPosition: SnackPosition.BOTTOM);
      loading.value = false;
    } else {
      Get.snackbar('Error', 'Failed to generate PIN',
          snackPosition: SnackPosition.BOTTOM);
      loading.value = false;
    }
  }

  // ── Copy PIN to clipboard ──
  void copyPin() {
    if (pin.value == null) return;
    Clipboard.setData(ClipboardData(text: pin.value!));
    copied.value = true;
    Get.snackbar('Copied', 'PIN copied!',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 2));
    Future.delayed(const Duration(seconds: 2), () => copied.value = false);
  }

  // ── Remove guardian ──
  Future<void> handleRemoveGuardian() async {
    removing.value = true;
    final res = await _guardianService.removeGuardian();
    if (res != null && res['success'] == true) {
      Get.snackbar('Done', 'Guardian removed!',
          snackPosition: SnackPosition.BOTTOM);
      guardian.value = null;
      removing.value = false;
      Get.back(); // close modal
      _loadPin();
    } else {
      Get.snackbar('Error', 'Failed to remove guardian',
          snackPosition: SnackPosition.BOTTOM);
      removing.value = false;
    }
  }

  // ── Navigate to chat ──
  void handleStartChat() {
    final g = guardian.value;
    if (g == null) {
      Get.snackbar('Error', 'Invalid guardian',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    Get.toNamed(
      '/individual/chats',
      parameters: {'receiver_id': '${g.id}'},
      arguments: {'receiver': g.toMap()},
    );
  }
}
