import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/chat_service.dart';

class MessageController extends GetxController {
  final ChatService _service = Get.find<ChatService>();
  final String receiverId;
  final ScrollController scrollController = ScrollController();
  final TextEditingController textController = TextEditingController();

  MessageController({required this.receiverId});

  var messages = <Map<String, dynamic>>[].obs;
  var isSending = false.obs;
  var isTyping = false.obs;   // remote is typing
  var inputText = ''.obs;
  Timer? _typingTimer;

  String? get senderId {
    try {
      final user = GetStorage().read('user');
      if (user is Map) return user['id']?.toString();
      return null;
    } catch (_) { return null; }
  }

  @override
  void onInit() {
    super.onInit();
    fetchMessages();
  }

  @override
  void onClose() {
    _typingTimer?.cancel();
    scrollController.dispose();
    textController.dispose();
    super.onClose();
  }

  Future<void> fetchMessages() async {
    try {
      final res = await _service.getMessages(receiverId: receiverId);
      if (res != null && res['success'] == true) {
        final data = res['data'];
        if (data is List) {
          messages.value =
              data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
          _scrollToBottom();
        }
      }
    } catch (e) {
      print('fetchMessages error: $e');
    }
  }

  bool isMine(Map<String, dynamic> msg) =>
      msg['sender_id']?.toString() == senderId;

  bool showTimestamp(int idx) {
    if (idx == 0) return true;
    try {
      final curr = DateTime.parse(messages[idx]['created_at'].toString());
      final prev = DateTime.parse(messages[idx - 1]['created_at'].toString());
      return curr.difference(prev).inMinutes > 5;
    } catch (_) { return false; }
  }

  String formatTime(dynamic ts) {
    try {
      final dt = DateTime.parse(ts.toString()).toLocal();
      final h = dt.hour.toString().padLeft(2, '0');
      final m = dt.minute.toString().padLeft(2, '0');
      return '$h:$m';
    } catch (_) { return ''; }
  }

  // ─── Send ────────────────────────────────────────────────────────────────
  Future<void> sendMessage() async {
    final text = inputText.value.trim();
    if (text.isEmpty || isSending.value) return;

    final tempId = 'tmp_${DateTime.now().millisecondsSinceEpoch}';
    final optimistic = {
      'id': tempId,
      'sender_id': senderId,
      'receiver_id': receiverId,
      'message': text,
      'is_seen': false,
      'created_at': DateTime.now().toIso8601String(),
    };

    messages.add(optimistic);
    inputText.value = '';
    textController.clear();
    isSending.value = true;
    _scrollToBottom();

    try {
      final res = await _service.sendMessage(
          receiverId: receiverId, message: text);
      if (res != null && res['success'] == true && res['data'] != null) {
        final idx = messages.indexWhere((m) => m['id'] == tempId);
        if (idx != -1) {
          messages[idx] = Map<String, dynamic>.from(res['data'] as Map);
        }
      } else {
        messages.removeWhere((m) => m['id'] == tempId);
      }
    } catch (_) {
      messages.removeWhere((m) => m['id'] == tempId);
    } finally {
      isSending.value = false;
    }
  }

  // ─── Typing ──────────────────────────────────────────────────────────────
  Function(String)? onTypingEmit;   // set by page to emit socket event
  Function()? onStopTypingEmit;

  void onInputChanged(String val) {
    inputText.value = val;
    onTypingEmit?.call(val);
    _typingTimer?.cancel();
    _typingTimer = Timer(Duration(milliseconds: 1500), () {
      onStopTypingEmit?.call();
    });
  }

  // ─── Socket callbacks ─────────────────────────────────────────────────────
  void onSocketMessage(Map<String, dynamic> msg) {
    final fromId = msg['sender_id']?.toString();
    final toId = msg['receiver_id']?.toString();
    final isRelevant =
        (fromId == receiverId && toId == senderId) ||
        (fromId == senderId && toId == receiverId);
    if (!isRelevant) return;
    if (messages.any((m) => m['id']?.toString() == msg['id']?.toString())) return;
    messages.add(Map<String, dynamic>.from(msg));
    isTyping.value = false;
    _scrollToBottom();
  }

  void onSocketSeen() {
    for (var i = 0; i < messages.length; i++) {
      if (messages[i]['sender_id']?.toString() == senderId) {
        final updated = Map<String, dynamic>.from(messages[i]);
        updated['is_seen'] = true;
        messages[i] = updated;
      }
    }
  }

  void onSocketTyping(String fromId) {
    if (fromId == receiverId) isTyping.value = true;
  }

  void onSocketStopTyping(String fromId) {
    if (fromId == receiverId) isTyping.value = false;
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (scrollController.hasClients) {
        scrollController.animateTo(
          scrollController.position.maxScrollExtent,
          duration: Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }
}
