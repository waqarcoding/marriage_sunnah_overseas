import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/chat_service.dart';

class ChatController extends GetxController {
  final ChatService _service = Get.find<ChatService>();

  var isLoadingConvs = true.obs;
  var conversations = <Map<String, dynamic>>[].obs;
  var selectedReceiverId = Rxn<String>();
  var selectedReceiverInfo = Rxn<Map<String, dynamic>>();

  // ─── current user id from token ─────────────────────────────────────────
  String? get currentUserId {
    try {
      final storage = GetStorage();
      final user = storage.read('user');
      if (user is Map) return user['id']?.toString();
      return null;
    } catch (_) { return null; }
  }

  @override
  void onInit() {
    super.onInit();
    fetchConversations();
  }

  Future<void> fetchConversations() async {
    isLoadingConvs.value = true;
    try {
      final res = await _service.getConversationUsers();
      if (res != null && res['success'] == true) {
        final data = res['data'];
        if (data is List) {
          conversations.value = data
              .map((e) => Map<String, dynamic>.from(e as Map))
              .toList();
        }
      }
    } catch (e) {
      print('fetchConversations error: $e');
    } finally {
      isLoadingConvs.value = false;
    }
  }

  void openConversation(Map<String, dynamic> conv) {
    final info = {
      'id': conv['other_user_id'],
      'name': conv['name'],
      'avatar': conv['avatar'],
      'online': conv['is_online'] ?? conv['online'] ?? false,
      'is_blurred_images': conv['is_blurred_images'],
    };
    selectedReceiverId.value = conv['other_user_id']?.toString();
    selectedReceiverInfo.value = info;

    // Mark as read locally
    final idx = conversations.indexWhere(
        (c) => c['other_user_id']?.toString() == selectedReceiverId.value);
    if (idx != -1) {
      final updated = Map<String, dynamic>.from(conversations[idx]);
      updated['unread'] = 0;
      conversations[idx] = updated;
    }
  }

  void closeConversation() {
    selectedReceiverId.value = null;
    selectedReceiverInfo.value = null;
  }

  Future<void> deleteConversation(Map<String, dynamic> conv) async {
    // Optimistic
    conversations.removeWhere(
        (c) => c['id']?.toString() == conv['id']?.toString());
    if (selectedReceiverId.value?.toString() ==
        conv['other_user_id']?.toString()) {
      closeConversation();
    }
    try {
      await _service.deleteConversation(conv['id']);
    } catch (e) {
      // Rollback
      conversations.insert(0, conv);
    }
  }

  /// Called by socket when a new message arrives — refresh list
  void onNewMessageSocket(Map<String, dynamic> msg) {
    fetchConversations();
  }

  /// Update online status from socket
  void setOnline(String userId, bool online) {
    final idx = conversations.indexWhere(
        (c) => c['other_user_id']?.toString() == userId);
    if (idx != -1) {
      final updated = Map<String, dynamic>.from(conversations[idx]);
      updated['is_online'] = online;
      conversations[idx] = updated;
    }
  }
}
