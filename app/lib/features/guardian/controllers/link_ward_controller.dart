import 'package:get/get.dart';
import '../services/guardian_service.dart';

const kRelationships = [
  'Father', 'Mother', 'Brother', 'Sister',
  'Uncle', 'Aunt', 'Grandfather', 'Grandmother',
  'Guardian', 'Other',
];

class LinkWardController extends GetxController {
  final GuardianService _service = Get.find<GuardianService>();

  var view         = 'loading'.obs; // loading | linked | not-linked
  var wards        = <Map<String, dynamic>>[].obs;
  var step         = 1.obs;         // 1=enter pin, 2=confirm, 3=success
  var pin          = ''.obs;
  var relationship = 'Guardian'.obs;
  var wardDetails  = Rx<Map<String, dynamic>?>(null);
  var isLoading    = false.obs;
  var isRemoving   = false.obs;
  var showAddNew   = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadWards();
  }

  Future<void> loadWards() async {
    view.value = 'loading';
    try {
      final res = await _service.getMyWards();
      final data = res?['data'];
      if (data is List && data.isNotEmpty) {
        wards.value = data.map((g) {
          final profile = g['individualProfile'] ?? {};
          return <String, dynamic>{
            'id':           g['individual_id'],
            'name':         profile['name']        ?? 'Unknown Ward',
            'email':        profile['email']        ?? '',
            'phone':        profile['phone']        ?? g['guardian_phone'] ?? '',
            'avatar':       profile['avatar']       ?? profile['image']    ?? g['guardian_image'] ?? '',
            'age':          profile['age']          ?? '',
            'gender':       profile['gender']       ?? '',
            'city':         profile['city']         ?? '',
            'country':      profile['country']      ?? '',
            'relationship': g['guardian_relationship'] ?? 'Guardian',
          };
        }).toList();
        view.value = 'linked';
        showAddNew.value = false;
      } else {
        wards.value = [];
        view.value = 'not-linked';
      }
    } catch (_) {
      view.value = 'not-linked';
    }
  }

  Future<void> verifyPin() async {
    if (pin.value.length != 6) {
      Get.snackbar('Error', 'Please enter a 6-digit PIN',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    isLoading.value = true;
    try {
      final res = await _service.verifyPin(pin.value);
      if (res?['success'] == true) {
        wardDetails.value = Map<String, dynamic>.from(res!['data'] as Map);
        step.value = 2;
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Invalid PIN',
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (_) {
      Get.snackbar('Error', 'Failed to verify PIN',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> confirmLink() async {
    isLoading.value = true;
    try {
      final res = await _service.linkWithPin(pin.value, relationship.value);
      if (res?['success'] == true) {
        step.value = 3;
        await Future.delayed(Duration(seconds: 2));
        step.value = 1;
        pin.value = '';
        wardDetails.value = null;
        showAddNew.value = false;
        loadWards();
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Failed to link',
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (_) {
      Get.snackbar('Error', 'Failed to link ward',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> removeWard(dynamic individualId) async {
    isRemoving.value = true;
    try {
      final res = await _service.removeWard(individualId);
      if (res?['success'] == true) {
        Get.snackbar('Done', 'Ward removed',
            snackPosition: SnackPosition.BOTTOM);
        loadWards();
      } else {
        Get.snackbar('Error', res?['message'] ?? 'Failed to remove',
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (_) {
      Get.snackbar('Error', 'Failed to remove ward',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isRemoving.value = false;
    }
  }

  void reset() {
    step.value = 1;
    pin.value = '';
    wardDetails.value = null;
  }
}
