import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../../data/providers/api_client.dart';
import '../../../core/services/socket_service.dart';

// ─── Controller ───────────────────────────────────────────────────────────────
class NotificationsController extends GetxController {
  final ApiClient _api = Get.find<ApiClient>();

  var notifications = <Map<String, dynamic>>[].obs;
  var isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    _init();
    _listenSocket();
  }

  Future<void> _init() async {
    await fetchNotifications();
    // markAllAsSeen is commented out in React — keep same
  }

  Future<void> fetchNotifications() async {
    isLoading.value = true;
    try {
      final res = await _api.get('/notifications');
      if (res != null) {
        final data = res['data'] ?? res;
        if (data is List) {
          notifications.value =
              data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        }
      }
    } catch (e) {
      print('fetchNotifications error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> markAsRead(dynamic id) async {
    try {
      await _api.post('/notifications/$id/read', data: {});
      final idx = notifications.indexWhere((n) => n['id'] == id);
      if (idx != -1) {
        final updated = Map<String, dynamic>.from(notifications[idx]);
        updated['is_read'] = true;
        notifications[idx] = updated;
      }
    } catch (e) {
      print('markAsRead error: $e');
    }
  }

  void handleClick(Map<String, dynamic> n) {
    markAsRead(n['id']);
  }

  void _listenSocket() {
    try {
      final socket = Get.find<SocketService>();
      ever(socket.lastNotification, (notif) {
        if (notif != null) {
          notifications.insert(0, {
            'id': DateTime.now().millisecondsSinceEpoch,
            'type': notif.type,
            'title': _titleFor(notif.type),
            'message': notif.message,
            'is_read': false,
            'created_at': DateTime.now().toIso8601String(),
            'data': notif.data ?? {},
          });
        }
      });
    } catch (_) {}
  }

  String _titleFor(String type) {
    switch (type) {
      case 'new_message':
        return 'New Message';
      case 'interest_received':
        return 'New Interest';
      case 'interest_accepted':
        return 'Interest Accepted';
      case 'interest_declined':
        return 'Interest Declined';
      case 'new_match':
        return 'New Match';
      case 'guardian_approved':
        return 'Guardian Approved';
      case 'guardian_rejected':
        return 'Guardian Rejected';
      default:
        return 'Notification';
    }
  }

  int get unreadCount =>
      notifications.where((n) => n['is_read'] != true).length;

  List<Map<String, dynamic>> get todayNotifs {
    final today = DateTime.now();
    return notifications.where((n) {
      try {
        final d = DateTime.parse(n['created_at'].toString());
        return d.year == today.year &&
            d.month == today.month &&
            d.day == today.day;
      } catch (_) {
        return false;
      }
    }).toList();
  }

  List<Map<String, dynamic>> get earlierNotifs {
    final today = DateTime.now();
    return notifications.where((n) {
      try {
        final d = DateTime.parse(n['created_at'].toString());
        return !(d.year == today.year &&
            d.month == today.month &&
            d.day == today.day);
      } catch (_) {
        return true;
      }
    }).toList();
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
class NotificationsPage extends StatelessWidget {
  const NotificationsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.put(NotificationsController());
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          _Header(ctrl: ctrl),
          Expanded(
            child: Obx(() {
              if (ctrl.isLoading.value) {
                return Center(
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: Color(0xFF1B4D3E),
                  ),
                );
              }
              if (ctrl.notifications.isEmpty) {
                return _EmptyState();
              }
              return _NotifList(ctrl: ctrl);
            }),
          ),
        ],
      ),
    );
  }
}

// ─── Header ───────────────────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  final NotificationsController ctrl;
  const _Header({required this.ctrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: Container(
          padding: EdgeInsets.fromLTRB(20, 16, 20, 14),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.08)),
            ),
          ),
          child: Obx(() => Row(
                children: [
                  // Back button
                  GestureDetector(
                    onTap: () => Get.back(),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Color(0xFFF0F5F3),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.chevron_left,
                          color: Color(0xFF1B4D3E), size: 22),
                    ),
                  ),
                  SizedBox(width: 12),

                  // Title + subtitle
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Notifications',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF1A1A1A),
                              letterSpacing: -0.03 * 26,
                              height: 1.2,
                            )),
                        Text(
                          ctrl.unreadCount > 0
                              ? '${ctrl.unreadCount} unread'
                              : 'All caught up',
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF6B7280)),
                        ),
                      ],
                    ),
                  ),

                  // Unread badge
                  if (ctrl.unreadCount > 0)
                    Container(
                      padding:
                          EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Color(0xFF1B4D3E),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${ctrl.unreadCount}',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Colors.white),
                      ),
                    ),
                ],
              )),
        ),
      ),
    );
  }
}

// ─── Notification list ────────────────────────────────────────────────────────
class _NotifList extends StatelessWidget {
  final NotificationsController ctrl;
  const _NotifList({required this.ctrl});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final today = ctrl.todayNotifs;
      final earlier = ctrl.earlierNotifs;

      return ListView(
        padding: EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          if (today.isNotEmpty) ...[
            _SectionLabel(label: 'Today'),
            ...today.map((n) => _NotifCard(n: n, ctrl: ctrl)),
          ],
          if (earlier.isNotEmpty) ...[
            if (today.isNotEmpty) SizedBox(height: 12),
            _SectionLabel(label: 'Earlier'),
            ...earlier.map((n) => _NotifCard(n: n, ctrl: ctrl)),
          ],
        ],
      );
    });
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(4, 8, 4, 8),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.1,
          color: Color(0xFF9CA3AF),
        ),
      ),
    );
  }
}

// ─── Notification card ────────────────────────────────────────────────────────
class _NotifCard extends StatefulWidget {
  final Map<String, dynamic> n;
  final NotificationsController ctrl;
  const _NotifCard({required this.n, required this.ctrl});

  @override
  State<_NotifCard> createState() => _NotifCardState();
}

class _NotifCardState extends State<_NotifCard> {
  bool _hovered = false;

  Map<String, dynamic> get _cfg =>
      _iconConfig[widget.n['type']] ?? _iconConfig['default']!;

  bool get _isRead => widget.n['is_read'] == true;

  String? get _avatar => widget.n['data']?['sender_image']?.toString();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _hovered = true),
      onTapUp: (_) {
        setState(() => _hovered = false);
        widget.ctrl.handleClick(widget.n);
      },
      onTapCancel: () => setState(() => _hovered = false),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 150),
        margin: EdgeInsets.only(bottom: 8),
        padding: EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _isRead
              ? (_hovered ? Color(0xFFF9FAFB) : Colors.white)
              : (_hovered ? Color(0xFFE6FAF4) : Color(0xFFF0FDF8)),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _isRead ? Color(0xFFE5E7EB) : Color(0xFFD1FAE5),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar / icon
            _AvatarOrIcon(
              avatar: _avatar,
              cfg: _cfg,
              senderName: widget.n['data']?['sender_name']?.toString() ?? '',
            ),
            SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          widget.n['title']?.toString() ?? '',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1A1A1A),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (!_isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: Color(0xFF1B4D3E),
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 3),
                  Text(
                    widget.n['message']?.toString() ?? '',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(0xFF6B7280),
                      height: 1.4,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    _formatTime(widget.n['created_at']?.toString()),
                    style: TextStyle(
                      fontSize: 11,
                      color: Color(0xFF9CA3AF),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(String? ts) {
    if (ts == null) return '';
    try {
      final diff = DateTime.now().difference(DateTime.parse(ts)).inSeconds;
      if (diff < 60) return 'just now';
      if (diff < 3600) return '${diff ~/ 60}m ago';
      if (diff < 86400) return '${diff ~/ 3600}h ago';
      if (diff < 172800) return 'Yesterday';
      final d = DateTime.parse(ts);
      return '${_months[d.month - 1]} ${d.day}';
    } catch (_) {
      return '';
    }
  }

  static const _months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
}

// ─── Avatar or icon ───────────────────────────────────────────────────────────
class _AvatarOrIcon extends StatelessWidget {
  final String? avatar;
  final Map<String, dynamic> cfg;
  final String senderName;
  const _AvatarOrIcon(
      {required this.avatar, required this.cfg, required this.senderName});

  @override
  Widget build(BuildContext context) {
    if (avatar != null && avatar!.isNotEmpty) {
      return Stack(
        clipBehavior: Clip.none,
        children: [
          ClipOval(
            child: Image.network(
              avatar!,
              width: 40,
              height: 40,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _FallbackAvatar(
                name: senderName,
                bg: cfg['color'] as Color,
              ),
            ),
          ),
          // Type icon badge
          Positioned(
            bottom: -3,
            right: -3,
            child: Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: cfg['bg'] as Color,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
              child: Center(
                child: Icon(
                  cfg['icon'] as IconData,
                  size: 9,
                  color: cfg['color'] as Color,
                ),
              ),
            ),
          ),
        ],
      );
    }

    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: cfg['bg'] as Color,
        shape: BoxShape.circle,
      ),
      child:
          Icon(cfg['icon'] as IconData, size: 18, color: cfg['color'] as Color),
    );
  }
}

class _FallbackAvatar extends StatelessWidget {
  final String name;
  final Color bg;
  const _FallbackAvatar({required this.name, required this.bg});

  @override
  Widget build(BuildContext context) => Container(
        width: 40,
        height: 40,
        color: bg.withOpacity(0.2),
        child: Center(
          child: Text(
            name.isNotEmpty ? name[0].toUpperCase() : 'U',
            style:
                TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: bg),
          ),
        ),
      );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: Color(0xFFF0F5F3),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.notifications_outlined,
                  size: 24, color: Color(0xFF9CA3AF)),
            ),
            SizedBox(height: 12),
            Text('No notifications yet',
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1A1A1A))),
            SizedBox(height: 4),
            Text(
              "We'll let you know when something arrives.",
              style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Icon config ──────────────────────────────────────────────────────────────
const _iconConfig = <String, Map<String, dynamic>>{
  'new_message': {
    'bg': Color(0xFFE1F5EE),
    'color': Color(0xFF0F6E56),
    'icon': Icons.chat_bubble_outline,
  },
  'interest_received': {
    'bg': Color(0xFFFBEAF0),
    'color': Color(0xFF993556),
    'icon': Icons.favorite_outline,
  },
  'interest_accepted': {
    'bg': Color(0xFFE1F5EE),
    'color': Color(0xFF0F6E56),
    'icon': Icons.favorite,
  },
  'interest_declined': {
    'bg': Color(0xFFFCEBEB),
    'color': Color(0xFFA32D2D),
    'icon': Icons.heart_broken_outlined,
  },
  'new_match': {
    'bg': Color(0xFFE6F1FB),
    'color': Color(0xFF185FA5),
    'icon': Icons.people_outline,
  },
  'guardian_approved': {
    'bg': Color(0xFFEAF3DE),
    'color': Color(0xFF3B6D11),
    'icon': Icons.check,
  },
  'guardian_rejected': {
    'bg': Color(0xFFFCEBEB),
    'color': Color(0xFFA32D2D),
    'icon': Icons.close,
  },
  'guardian_assigned': {
    'bg': Color(0xFFFAF5FF),
    'color': Color(0xFF7C3AED),
    'icon': Icons.shield_outlined,
  },
  'default': {
    'bg': Color(0xFFF1EFE8),
    'color': Color(0xFF5F5E5A),
    'icon': Icons.info_outline,
  },
};
