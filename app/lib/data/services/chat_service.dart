import 'package:app/data/repositories/chat_repository.dart';

class ChatService {
  final ChatRepository repository;

  ChatService(this.repository);

  /// Get all chats
  Future<dynamic> getChats() async {
    return await repository.getChats();
  }

  /// Get messages for a specific chat
  Future<dynamic> getMessages(String chatId) async {
    return await repository.getMessages(chatId);
  }

  /// Send a message
  Future<dynamic> sendMessage(String chatId, String message) async {
    return await repository.sendMessage(chatId, message);
  }

  /// Mark chat as read
  Future<dynamic> markAsRead(String chatId) async {
    return await repository.markAsRead(chatId);
  }
}
