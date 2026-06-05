import 'package:app/core/widgets/islamic_page_header.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../controllers/chat_controller.dart';
import '../controllers/message_controller.dart';
import '../services/chat_service.dart';
import '../widgets/conversation_item.dart';
import '../widgets/chat_widgets.dart';

class ChatPage extends StatelessWidget {
  final String? initialReceiverId;
  final Map<String, dynamic>? initialReceiverInfo;

  const ChatPage({
    Key? key,
    this.initialReceiverId,
    this.initialReceiverInfo,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // ChatService is permanent — safe to put again (GetX deduplicates)
    if (!Get.isRegistered<ChatService>()) {
      Get.put(ChatService(), permanent: true);
    }
    final ctrl = Get.put(ChatController());

    if (initialReceiverId != null && ctrl.selectedReceiverId.value == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ctrl.selectedReceiverId.value = initialReceiverId;
        ctrl.selectedReceiverInfo.value = initialReceiverInfo;
      });
    }

    return _ChatView();
  }
}

// ─── Shell ────────────────────────────────────────────────────────────────────
class _ChatView extends GetView<ChatController> {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (ctx, constraints) {
      final isMobile = constraints.maxWidth < 768;
      return Obx(() {
        final hasChat = controller.selectedReceiverId.value != null;

        if (isMobile) {
          return hasChat
              ? _MessageView(
                  key: ValueKey(controller.selectedReceiverId.value),
                  receiverId: controller.selectedReceiverId.value!,
                  receiverInfo: controller.selectedReceiverInfo.value,
                  onBack: controller.closeConversation,
                )
              : _ConversationListPanel();
        }

        // Tablet / desktop — two-panel
        return Row(children: [
          Container(
            width: 360,
            decoration: BoxDecoration(
              border: Border(
                  right:
                      BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.08))),
            ),
            child: _ConversationListPanel(),
          ),
          Expanded(
            child: hasChat
                ? _MessageView(
                    key: ValueKey(controller.selectedReceiverId.value),
                    receiverId: controller.selectedReceiverId.value!,
                    receiverInfo: controller.selectedReceiverInfo.value,
                    onBack: controller.closeConversation,
                  )
                : _EmptyMessageState(),
          ),
        ]);
      });
    });
  }
}

// ─── Conversations list ───────────────────────────────────────────────────────
class _ConversationListPanel extends GetView<ChatController> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header
        IslamicPageHeader(
          title: 'Chats',
          subtitle: 'Your halal conversations and connections',
          icon: Icon(Icons.chat_bubble_outline, color: Colors.white, size: 18),
        ),
        // List
        Expanded(
          child: Obx(() {
            if (controller.isLoadingConvs.value) {
              return ConversationSkeleton(count: 6);
            }
            if (controller.conversations.isEmpty) {
              return _EmptyConversations();
            }
            return ListView.builder(
              itemCount: controller.conversations.length,
              itemBuilder: (ctx, i) {
                final conv = controller.conversations[i];
                final isActive = controller.selectedReceiverId.value ==
                    conv['other_user_id']?.toString();
                return ConversationItem(
                  conversation: conv,
                  index: i,
                  isActive: isActive,
                  onTap: () => controller.openConversation(conv),
                  onDelete: () => controller.deleteConversation(conv),
                );
              },
            );
          }),
        ),
      ],
    );
  }
}

// ─── Message view ─────────────────────────────────────────────────────────────
class _MessageView extends StatefulWidget {
  final String receiverId;
  final Map<String, dynamic>? receiverInfo;
  final VoidCallback onBack;

  const _MessageView({
    Key? key,
    required this.receiverId,
    this.receiverInfo,
    required this.onBack,
  }) : super(key: key);

  @override
  State<_MessageView> createState() => _MessageViewState();
}

class _MessageViewState extends State<_MessageView> {
  late MessageController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = Get.put(
      MessageController(receiverId: widget.receiverId),
      tag: widget.receiverId,
    );
  }

  @override
  void dispose() {
    Get.delete<MessageController>(tag: widget.receiverId);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Scaffold with NO appBar — header is manual so we control padding
    return Scaffold(
      backgroundColor: Color(0xFFF5F5F3),
      // ✅ resizeToAvoidBottomInset keeps input above keyboard
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────────────────────────
            Obx(() => ChatHeader(
                  receiverInfo: widget.receiverInfo,
                  // ✅ Read reactive value inside Obx
                  isTyping: _ctrl.isTyping.value,
                  connected: true,
                  onBack: widget.onBack,
                )),

            // ── Messages ─────────────────────────────────────────────────────
            Expanded(
              child: Obx(() {
                final count =
                    _ctrl.messages.length + (_ctrl.isTyping.value ? 1 : 0);
                return ListView.builder(
                  controller: _ctrl.scrollController,
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  itemCount: count,
                  itemBuilder: (ctx, i) {
                    if (i == _ctrl.messages.length) {
                      return TypingIndicator();
                    }
                    final msg = _ctrl.messages[i];
                    return MessageBubble(
                      msg: msg,
                      isMine: _ctrl.isMine(msg),
                      formatTime: _ctrl.formatTime,
                      showTimestamp: _ctrl.showTimestamp(i),
                    );
                  },
                );
              }),
            ),

            // ── Input ────────────────────────────────────────────────────────
            MessageInput(
              controller: _ctrl.textController,
              onChanged: _ctrl.onInputChanged,
              onSend: _ctrl.sendMessage,
              // ✅ Obx only around the sending state — not whole widget
              sending: false,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Empty states ─────────────────────────────────────────────────────────────
class _EmptyMessageState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Color(0xFFF5F5F3),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: Color(0xFFF0F5F3),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(child: Text('💬', style: TextStyle(fontSize: 28))),
            ),
            SizedBox(height: 12),
            Text(
              'Select a conversation to start chatting',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF6B7280)),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyConversations extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0xFF1B4D3E).withOpacity(0.06),
                    Color(0xFF1B4D3E).withOpacity(0.12)
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.1)),
              ),
              child: Icon(Icons.chat_bubble_outline,
                  size: 36, color: Color(0xFF1B4D3E).withOpacity(0.5)),
            ),
            SizedBox(height: 20),
            Text('No conversations yet',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1B4D3E),
                    letterSpacing: -0.01)),
            SizedBox(height: 8),
            Text(
              'Accept an interest to start chatting with someone.',
              style:
                  TextStyle(fontSize: 13, color: Colors.grey[400], height: 1.5),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
