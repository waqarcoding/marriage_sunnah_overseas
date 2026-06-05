// lib/core/services/socket_service.dart
//
// Flutter port of SocketContext.jsx
// Uses socket_io_client ^2.0.3 — same events, same path, same auth
//
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

// ─── Badge / counter model (mirrors React state) ──────────────────────────────
class SocketBadges {
  final RxInt interestCount = 0.obs;
  final RxInt chatCount = 0.obs;
  final RxInt guardianCount = 0.obs;
  final RxInt credits = 0.obs;
}

// ─── Notification payload ─────────────────────────────────────────────────────
class SocketNotification {
  final String type;
  final String message;
  final Map<String, dynamic>? data;
  SocketNotification({required this.type, required this.message, this.data});
}

// ─── Socket Service (GetxService — lives for app lifetime) ────────────────────
class SocketService extends GetxService {
  // ── Public state ────────────────────────────────────────────────────────────
  final badges = SocketBadges();
  final connected = false.obs;
  final isTypingFrom = RxnString(); // userId that is currently typing

  // Notification stream — listen in controllers / pages
  final Rx<SocketNotification?> lastNotification =
      Rx<SocketNotification?>(null);

  // Online presence
  final onlineUsers = <String>{}.obs;

  // ── Private ──────────────────────────────────────────────────────────────────
  IO.Socket? _socket;
  String? _currentUserId;

  static const String _socketUrl =
      'https://marriage-sunnah-overseas-pdniv.ondigitalocean.app';
  static const String _socketPath = '/api/socket.io/';

  // ── Connect ──────────────────────────────────────────────────────────────────
  void connect(String userId) {
    if (_socket != null && _currentUserId == userId && _socket!.connected) {
      print('[Socket] ✅ Reusing existing connection for $userId');
      return;
    }

    disconnect(); // tear down old socket if user changed

    _currentUserId = userId;
    final token = GetStorage().read('jwtToken') ?? '';

    print(
        '[Socket] 🔌 Connecting → $_socketUrl  path=$_socketPath  uid=$userId');

    _socket = IO.io(
      _socketUrl,
      IO.OptionBuilder()
          .setPath(_socketPath)
          .setTransports(['polling', 'websocket'])
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(1000)
          .setReconnectionDelayMax(5000)
          .setTimeout(20000)
          .setAuth({'token': token})
          .disableAutoConnect()
          .build(),
    );

    _registerHandlers(userId);
    _socket!.connect();
  }

  // ── Disconnect ───────────────────────────────────────────────────────────────
  void disconnect() {
    if (_socket != null) {
      _socket!.clearListeners();
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
      _currentUserId = null;
      connected.value = false;
      print('[Socket] 🔌 Disconnected & disposed');
    }
  }

  // ── Emit helpers ─────────────────────────────────────────────────────────────
  void emitTyping(String toUserId) =>
      _emit('typing', {'to': toUserId, 'from': _currentUserId});
  void emitStopTyping(String toUserId) =>
      _emit('stop_typing', {'to': toUserId, 'from': _currentUserId});
  void emitJoin() => _emit('join', _currentUserId);

  void _emit(String event, dynamic data) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit(event, data);
    }
  }

  // ── Register all event handlers ───────────────────────────────────────────────
  void _registerHandlers(String userId) {
    final s = _socket!;

    // ── Connection lifecycle ─────────────────────────────────────────────────
    s.onConnect((_) {
      print('[Socket] ✅ Connected  id=${s.id}');
      connected.value = true;
      s.emit('join', userId); // join personal room
    });

    s.onDisconnect((reason) {
      print('[Socket] 🔌 Disconnected: $reason');
      connected.value = false;
    });

    s.onConnectError((err) {
      print('[Socket] ❌ Connect error: $err');
    });

    s.on('reconnect', (attempt) {
      print('[Socket] 🔄 Reconnected after $attempt attempts');
    });

    s.on('reconnect_failed', (_) {
      print('[Socket] ❌ Reconnect failed after max attempts');
    });

    // ── 🔔 Main notification handler ─────────────────────────────────────────
    s.on('notification', (raw) {
      final n = _parseMap(raw);
      final type = n['type']?.toString() ?? '';
      final message = n['message']?.toString() ?? '';
      final data = n['data'] as Map<String, dynamic>?;

      print('[Socket] 🔔 notification  type=$type  msg=$message');

      // Update badges
      switch (type) {
        case 'interest_received':
          badges.interestCount.value++;
          break;
        case 'interest_accepted':
        case 'interest_declined':
        case 'interest_cancelled':
          // no badge delta needed — UX handled via notification toast
          break;
        case 'guardian_new_interest':
          badges.guardianCount.value++;
          break;
        case 'new_match':
          break;
        case 'new_message':
          badges.chatCount.value++;
          break;
        case 'guardian_approved':
          if (badges.guardianCount.value > 0) badges.guardianCount.value--;
          break;
        case 'guardian_rejected':
        case 'guardian_assigned':
        case 'guardian_removed':
        case 'ward_added':
        case 'ward_removed':
          break;
        default:
          print('[Socket] ⚠️ Unhandled notification type: $type');
      }

      // Broadcast to listeners
      lastNotification.value = SocketNotification(
        type: type,
        message: message,
        data: data,
      );
    });

    // ── 🔢 Counter updates ────────────────────────────────────────────────────
    s.on('interest_count', (raw) {
      final count = _parseInt(_parseMap(raw)['count']);
      print('[Socket] 📊 interest_count=$count');
      badges.interestCount.value = count;
    });

    s.on('guardian_pending_count', (raw) {
      final count = _parseInt(_parseMap(raw)['count']);
      print('[Socket] 📊 guardian_count=$count');
      badges.guardianCount.value = count;
    });

    s.on('chat_count_update', (raw) {
      final count = _parseInt(_parseMap(raw)['count']);
      print('[Socket] 📊 chat_count=$count');
      badges.chatCount.value = count;
    });

    s.on('credit_update', (raw) {
      final amount = _parseInt(_parseMap(raw)['credits']);
      print('[Socket] 💰 credits=$amount');
      badges.credits.value = amount;
    });

    // ── 💬 Chat real-time ─────────────────────────────────────────────────────
    s.on('new_message', (raw) {
      final msg = _parseMap(raw);
      print('[Socket] 📨 new_message from=${msg['sender_id']}');
      // MessageController listens to this in the chat page
      lastNotification.value = SocketNotification(
        type: 'new_message',
        message: msg['message']?.toString() ?? '',
        data: Map<String, dynamic>.from(msg),
      );
    });

    s.on('typing', (raw) {
      final from = _parseMap(raw)['from']?.toString();
      print('[Socket] ✍️ typing from=$from');
      isTypingFrom.value = from;
    });

    s.on('stop_typing', (raw) {
      final from = _parseMap(raw)['from']?.toString();
      print('[Socket] ✋ stop_typing from=$from');
      if (isTypingFrom.value == from) isTypingFrom.value = null;
    });

    s.on('messages_seen', (_) {
      print('[Socket] 👁 messages_seen');
      lastNotification.value =
          SocketNotification(type: 'messages_seen', message: '');
    });

    // ── 🟢 Online presence ────────────────────────────────────────────────────
    s.on('user_online', (uid) {
      final id = uid?.toString() ?? '';
      print('[Socket] 🟢 user_online $id');
      onlineUsers.add(id);
    });

    s.on('user_offline', (uid) {
      final id = uid?.toString() ?? '';
      print('[Socket] ⚫ user_offline $id');
      onlineUsers.remove(id);
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  Map<String, dynamic> _parseMap(dynamic raw) {
    if (raw == null) return {};
    if (raw is Map) return Map<String, dynamic>.from(raw);
    return {};
  }

  int _parseInt(dynamic v) {
    if (v == null) return 0;
    return int.tryParse(v.toString()) ?? 0;
  }

  bool isOnline(String userId) => onlineUsers.contains(userId);

  @override
  void onClose() {
    disconnect();
    super.onClose();
  }
}
