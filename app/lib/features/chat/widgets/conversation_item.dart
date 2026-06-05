import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ConversationItem extends StatefulWidget {
  final Map<String, dynamic> conversation;
  final int index;
  final bool isActive;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const ConversationItem({
    Key? key,
    required this.conversation,
    this.index = 0,
    this.isActive = false,
    required this.onTap,
    required this.onDelete,
  }) : super(key: key);

  @override
  State<ConversationItem> createState() => _ConversationItemState();
}

class _ConversationItemState extends State<ConversationItem>
    with SingleTickerProviderStateMixin {
  bool _menuOpen = false;
  bool _showDeleteConfirm = false;
  late AnimationController _ac;
  late Animation<double> _fadeIn;

  Map<String, dynamic> get _conv => widget.conversation;
  String get _name => _conv['name']?.toString() ?? '';
  String? get _avatar {
    final a = _conv['avatar'];
    if (a == null) return null;
    if (a is String && a.isNotEmpty) return a;
    if (a is List && (a as List).isNotEmpty)
      return (a as List).first.toString();
    return null;
  }

  bool get _online => _conv['is_online'] == true || _conv['online'] == true;
  int get _unread => (_conv['unread'] ?? _conv['unread_count'] ?? 0) as int;
  String get _lastMsg =>
      _conv['lastMessage']?.toString() ??
      _conv['last_message']?.toString() ??
      'Start a conversation…';
  String get _time => _conv['time']?.toString() ?? '';
  String? get _age => _conv['age']?.toString();

  @override
  void initState() {
    super.initState();
    _ac = AnimationController(
        vsync: this, duration: Duration(milliseconds: 400 + widget.index * 40));
    _fadeIn = CurvedAnimation(parent: _ac, curve: Curves.easeOut);
    _ac.forward();
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeIn,
      child: Stack(
        children: [
          // Main row
          GestureDetector(
            onTap: () {
              setState(() => _menuOpen = false);
              widget.onTap();
            },
            child: AnimatedContainer(
              duration: Duration(milliseconds: 150),
              color: widget.isActive
                  ? Color(0xFF1B4D3E).withOpacity(0.06)
                  : Colors.transparent,
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Row(
                children: [
                  // Avatar
                  _Avatar(avatar: _avatar, name: _name, online: _online),
                  SizedBox(width: 12),

                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: RichText(
                                overflow: TextOverflow.ellipsis,
                                text: TextSpan(
                                  style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: Color(0xFF1B4D3E),
                                      letterSpacing: -0.005),
                                  children: [
                                    TextSpan(text: _name),
                                    if (_age != null)
                                      TextSpan(
                                          text: ', $_age',
                                          style: TextStyle(
                                              fontWeight: FontWeight.w400,
                                              color: Color(0xFF6B7280))),
                                  ],
                                ),
                              ),
                            ),
                            SizedBox(width: 8),
                            Text(_time,
                                style: TextStyle(
                                    fontSize: 11, color: Color(0xFF9CA3AF))),
                          ],
                        ),
                        SizedBox(height: 3),
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                _lastMsg,
                                overflow: TextOverflow.ellipsis,
                                maxLines: 1,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: _unread > 0
                                      ? FontWeight.w500
                                      : FontWeight.w400,
                                  color: _unread > 0
                                      ? Color(0xFF374151)
                                      : Color(0xFF9CA3AF),
                                  height: 1.4,
                                ),
                              ),
                            ),
                            if (_unread > 0) ...[
                              SizedBox(width: 6),
                              Container(
                                constraints: BoxConstraints(minWidth: 18),
                                height: 18,
                                padding: EdgeInsets.symmetric(horizontal: 5),
                                decoration: BoxDecoration(
                                  color: Color(0xFF1B4D3E),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: Text(
                                    _unread > 9 ? '9+' : '$_unread',
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 4),

                  // More button
                  GestureDetector(
                    onTap: () => setState(() => _menuOpen = !_menuOpen),
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: _menuOpen
                            ? Color(0xFF1B4D3E).withOpacity(0.06)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(Icons.more_vert,
                          size: 18, color: Color(0xFF9CA3AF)),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom divider
          Positioned(
            bottom: 0,
            left: 20,
            right: 20,
            child: Container(
                height: 0.5, color: Color(0xFF1B4D3E).withOpacity(0.06)),
          ),

          // Dropdown menu
          if (_menuOpen)
            Positioned(
              right: 16,
              top: 48,
              child: GestureDetector(
                onTap: () {},
                child: Material(
                  elevation: 8,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 160,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: Color(0xFF1B4D3E).withOpacity(0.08)),
                    ),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () {
                        setState(() {
                          _menuOpen = false;
                        });
                        Get.dialog(
                          _DeleteConfirmDialog(
                            conversation: _conv,
                            avatar: _avatar,
                            name: _name,
                            age: _age,
                            lastMsg: _lastMsg,
                            onCancel: () => Get.back(),
                            onConfirm: () {
                              Get.back();
                              widget.onDelete();
                            },
                          ),
                          barrierColor: Colors.black.withOpacity(0.4),
                          barrierDismissible: true,
                        );
                      },
                      child: Padding(
                        padding:
                            EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        child: Row(
                          children: [
                            Icon(Icons.delete_outline,
                                size: 16, color: Color(0xFFEF4444)),
                            SizedBox(width: 10),
                            Text('Delete chat',
                                style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFFEF4444))),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),

          // Delete confirm dialog
        ],
      ),
    );
  }
}

// ─── Avatar widget ────────────────────────────────────────────────────────────
class _Avatar extends StatelessWidget {
  final String? avatar;
  final String name;
  final bool online;
  const _Avatar({this.avatar, required this.name, required this.online});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: Color(0xFFF5F5F5),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: avatar != null && avatar!.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl: avatar!.startsWith('http')
                        ? avatar!
                        : 'http://10.0.2.2:5000${avatar!}',
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => _Initial(name: name),
                  )
                : _Initial(name: name),
          ),
        ),
        if (online)
          Positioned(
            bottom: -1,
            right: -1,
            child: Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: Color(0xFF10B981),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}

class _Initial extends StatelessWidget {
  final String name;
  const _Initial({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Color(0xFFF0F5F3),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w500,
              color: Color(0xFF9CA3AF)),
        ),
      ),
    );
  }
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────
class _DeleteConfirmDialog extends StatelessWidget {
  final Map<String, dynamic> conversation;
  final String? avatar;
  final String name;
  final String? age;
  final String lastMsg;
  final VoidCallback onCancel;
  final VoidCallback onConfirm;

  const _DeleteConfirmDialog({
    required this.conversation,
    this.avatar,
    required this.name,
    this.age,
    required this.lastMsg,
    required this.onCancel,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: GestureDetector(
        onTap: () {},
        child: Container(
          margin: EdgeInsets.all(20),
          constraints: BoxConstraints(maxWidth: 420),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withOpacity(0.16),
                  blurRadius: 32,
                  offset: Offset(0, 8))
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Red header
              Container(
                padding: EdgeInsets.fromLTRB(24, 24, 24, 20),
                decoration: BoxDecoration(
                  color: Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                          color: Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(16)),
                      child: Icon(Icons.delete_outline,
                          size: 24, color: Color(0xFFEF4444)),
                    ),
                    SizedBox(height: 12),
                    Text('Delete conversation?',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF1B4D3E),
                            letterSpacing: -0.01)),
                    SizedBox(height: 6),
                    RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF6B7280),
                            height: 1.5),
                        children: [
                          TextSpan(text: 'Your chat with '),
                          TextSpan(
                              text: name,
                              style: TextStyle(
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF374151))),
                          TextSpan(text: ' will be permanently deleted.'),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Preview
              Container(
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom:
                        BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.08)),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Color(0xFFF5F5F5),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: avatar != null && avatar!.isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: avatar!.startsWith('http')
                                    ? avatar!
                                    : 'http://10.0.2.2:5000$avatar',
                                fit: BoxFit.cover,
                                errorWidget: (_, __, ___) =>
                                    _Initial(name: name))
                            : _Initial(name: name),
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            age != null ? '$name, $age' : name,
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFF1B4D3E)),
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 2),
                          Text(lastMsg,
                              style: TextStyle(
                                  fontSize: 12, color: Color(0xFF9CA3AF)),
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Buttons
              Padding(
                padding: EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: onCancel,
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 11),
                          decoration: BoxDecoration(
                              color: Color(0xFFF5F5F5),
                              borderRadius: BorderRadius.circular(12)),
                          child: Center(
                              child: Text('Cancel',
                                  style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: Color(0xFF374151)))),
                        ),
                      ),
                    ),
                    SizedBox(width: 10),
                    Expanded(
                      child: GestureDetector(
                        onTap: onConfirm,
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 11),
                          decoration: BoxDecoration(
                              color: Color(0xFFEF4444),
                              borderRadius: BorderRadius.circular(12)),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.delete_outline,
                                  size: 16, color: Colors.white),
                              SizedBox(width: 8),
                              Text('Delete',
                                  style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: Colors.white)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
