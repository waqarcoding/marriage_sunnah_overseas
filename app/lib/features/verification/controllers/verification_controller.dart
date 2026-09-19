import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/verification_service.dart';

enum VerificationStatus { loading, submit, pending, verified }

class VerificationController extends GetxController {
  final VerificationService _service = Get.find<VerificationService>();

  var status = VerificationStatus.loading.obs;
  var userName = 'User'.obs;
  var userImage = Rx<String?>(null);
  var frontIdUrl = Rx<String?>(null);
  var backIdUrl = Rx<String?>(null);

  // Upload state
  var frontFile = Rx<String?>(null); // local file path
  var backFile = Rx<String?>(null);
  var frontPreview = Rx<String?>(null); // local path for preview
  var backPreview = Rx<String?>(null);
  var isSubmitting = false.obs;
  var errorMsg = Rx<String?>(null);

  @override
  void onInit() {
    super.onInit();
    loadProfile();
  }

  Future<void> loadProfile() async {
    status.value = VerificationStatus.loading;
    try {
      final res = await _service.getCurrentUser();
      final profile = res?['data'] ?? res ?? {};

      final isVerified =
          profile['is_verified'] == true || profile['is_verified'] == 1;
      final hasFront = profile['frontid_url'] != null &&
          profile['frontid_url'].toString().isNotEmpty;
      final hasBack = profile['backid_url'] != null &&
          profile['backid_url'].toString().isNotEmpty;

      userName.value = profile['name']?.toString() ?? 'User';
      userImage.value = profile['avatar_url']?.toString();
      frontIdUrl.value = profile['frontid_url']?.toString();
      backIdUrl.value = profile['backid_url']?.toString();

      if (isVerified) {
        status.value = VerificationStatus.verified;
      } else if (hasFront && hasBack) {
        status.value = VerificationStatus.pending;
      } else {
        status.value = VerificationStatus.submit;
      }
    } catch (e) {
      status.value = VerificationStatus.submit;
    }
  }

  void setFrontFile(String path) {
    frontFile.value = path;
    frontPreview.value = path;
    errorMsg.value = null;
  }

  void setBackFile(String path) {
    backFile.value = path;
    backPreview.value = path;
    errorMsg.value = null;
  }

  bool get canSubmit =>
      frontFile.value != null && backFile.value != null && !isSubmitting.value;

  Future<void> submit() async {
    if (!canSubmit) return;
    if (frontFile.value == null || backFile.value == null) {
      errorMsg.value = 'Please upload both front and back images';
      return;
    }

    isSubmitting.value = true;
    errorMsg.value = null;

    try {
      final res =
          await _service.uploadLivenessPhoto(frontFile.value!, backFile.value!);
      if (res?['success'] == true || res != null) {
        // Move to pending
        frontIdUrl.value = frontPreview.value;
        backIdUrl.value = backPreview.value;
        status.value = VerificationStatus.pending;
        frontFile.value = null;
        backFile.value = null;
      } else {
        errorMsg.value = res?['message'] ?? 'Upload failed. Please try again.';
      }
    } catch (e) {
      errorMsg.value =
          'Upload failed. Please check your connection and try again.';
    } finally {
      isSubmitting.value = false;
    }
  }

  void skip() => Get.back();

  void goBack() {
    final role = GetStorage().read('user')?['role']?.toString() ?? '';
    if (role == 'guardian') {
      Get.toNamed('/guardian/settings');
    } else {
      Get.back();
    }
  }
}
