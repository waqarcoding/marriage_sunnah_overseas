import 'package:app/features/chat/chat_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ChatListPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.find<ChatController>();

    return Scaffold(
      appBar: AppBar(title: const Text("Chats")),
      body: Obx(
        () => ListView.builder(
          itemCount: controller.chats.length,
          itemBuilder: (_, i) {
            final chat = controller.chats[i];
            return ListTile(
              title: Text(chat['name'] ?? "Chat"),
              onTap: () => Get.toNamed("/chat", arguments: chat['_id']),
            );
          },
        ),
      ),
    );
  }
}
