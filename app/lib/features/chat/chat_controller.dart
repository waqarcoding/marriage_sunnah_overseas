import 'package:app/data/services/chat_service.dart';
import 'package:get/get.dart';

class ChatController extends GetxController {
  final ChatService chatService;

  ChatController(this.chatService);

  /// List of chat threads
  var chats = <dynamic>[].obs;

  /// Selected chat messages
  var messages = <dynamic>[].obs;

  /// Loading states
  var isLoadingChats = false.obs;
  var isLoadingMessages = false.obs;

  /// Error messages
  var errorMessage = ''.obs;

  /// Fetch all chat threads
  Future<void> fetchChats() async {
    try {
      isLoadingChats.value = true;
      errorMessage.value = '';
      final data = await chatService.getChats();
      chats.value = data;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoadingChats.value = false;
    }
  }

  /// Fetch messages for a specific chat
  Future<void> fetchMessages(String chatId) async {
    try {
      isLoadingMessages.value = true;
      errorMessage.value = '';
      final data = await chatService.getMessages(chatId);
      messages.value = data;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoadingMessages.value = false;
    }
  }

  /// Send a message
  Future<void> sendMessage(String chatId, String text) async {
    if (text.trim().isEmpty) return;

    try {
      final message = await chatService.sendMessage(chatId, text);
      messages.add(message); // Add new message to list
    } catch (e) {
      errorMessage.value = e.toString();
    }
  }
}
