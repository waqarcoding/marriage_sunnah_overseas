import 'package:get/get.dart';
import '../../../data/providers/api_client.dart';

class ChatService extends GetxService {
  final ApiClient _api = Get.find<ApiClient>();

  // ── GET /chat/conversation-users ──────────────────────────────────────────
  // Returns list of users the current user has chatted with + last message,
  // unread count, and online status.
  Future<Map<String, dynamic>?> getConversationUsers() async {
    return await _api.get('/chat/conversation-users');
  }

  // ── GET /chat/get-messages?receiver_id=X ──────────────────────────────────
  // Returns all messages between current user and receiver. Also marks
  // unseen messages as seen on the backend.
  Future<Map<String, dynamic>?> getMessages(
      {required String receiverId}) async {
    return await _api.get(
      '/chat/get-messages',
      queryParameters: {'receiver_id': receiverId},
    );
  }

  // ── POST /chat/send-message ───────────────────────────────────────────────
  // Sends a message. Backend validates interest is accepted before saving.
  // interestId is optional — omit for guardian messages.
  Future<Map<String, dynamic>?> sendMessage({
    required String receiverId,
    required String message,
    String? interestId,
  }) async {
    return await _api.post('/chat/send-message', data: {
      'receiver_id': receiverId,
      'message': message,
      if (interestId != null) 'interest_id': interestId,
    });
  }

  // ── POST /chat/add-conversation ───────────────────────────────────────────
  // Creates a conversation entry between two users. Called when opening
  // a chat for the first time from the Interest page.
  Future<Map<String, dynamic>?> addConversation(String receiverId) async {
    return await _api
        .post('/chat/add-conversation', data: {'receiver_id': receiverId});
  }

  // ── DELETE /chat/conversation/:id ─────────────────────────────────────────
  // Soft-deletes all messages in the conversation for the current user.
  // Messages are not deleted for the other user.
  Future<Map<String, dynamic>?> deleteConversation(
      dynamic conversationId) async {
    return await _api.delete('/chat/conversation/$conversationId');
  }

  // ── GET /chat/unread-count ────────────────────────────────────────────────
  // Returns total unseen message count for the current user.
  // Used to update the bottom nav badge on app start.
  Future<Map<String, dynamic>?> getUnreadCount() async {
    return await _api.get('/chat/unread-count');
  }

  // ── POST /chat/unread-count/clear ─────────────────────────────────────────
  // Marks all messages as seen for the current user.
  // Called when the user opens the chat list.
  Future<Map<String, dynamic>?> clearUnreadCount() async {
    return await _api.post('/chat/unread-count/clear', data: {});
  }

  // ── GET /chat/conversation/:receiverId ────────────────────────────────────
  // Returns conversation details including match_id.
  // Used by chat header to show "Schedule Meeting" button.
  Future<Map<String, dynamic>?> getConversationDetails(
      String receiverId) async {
    return await _api.get('/chat/conversation/$receiverId');
  }
}
