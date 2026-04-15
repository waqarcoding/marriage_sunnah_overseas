import 'package:app/data/providers/api_client.dart';

class ChatRepository {
  final ApiClient apiClient;

  ChatRepository(this.apiClient);

  /// Get all chats for current user
  Future<dynamic> getChats() async {
    return await apiClient.get("/chat");
  }

  /// Get messages for a specific match or chat
  Future<dynamic> getMessages(String chatId) async {
    return await apiClient.get("/chat/$chatId/messages");
  }

  /// Send a message
  Future<dynamic> sendMessage(String chatId, String message) async {
    return await apiClient.post("/chat/send", {
      "chatId": chatId,
      "message": message,
    });
  }

  /// Mark messages as read (optional)
  Future<dynamic> markAsRead(String chatId) async {
    return await apiClient.post("/chat/$chatId/read", {});
  }
}
