import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

// ─── Message Bubble ───────────────────────────────────────────────────────────
class MessageBubble extends StatelessWidget {
  final Map<String, dynamic> msg;
  final bool isMine;
  final String Function(dynamic) formatTime;
  final bool showTimestamp;

  const MessageBubble({
    Key? key,
    required this.msg,
    required this.isMine,
    required this.formatTime,
    this.showTimestamp = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final text = msg['message']?.toString() ?? '';
    final time = formatTime(msg['created_at']);
    final isSeen = msg['is_seen'] == true;
    final isPending = msg['id']?.toString().startsWith('tmp_') ?? false;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Timestamp divider
        if (showTimestamp)
          Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Row(
              children: [
                Expanded(
                    child: Container(
                        height: 0.5,
                        color: Color(0xFF1B4D3E).withOpacity(0.08))),
                SizedBox(width: 12),
                Text(time,
                    style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFF9CA3AF),
                        fontWeight: FontWeight.w500)),
                SizedBox(width: 12),
                Expanded(
                    child: Container(
                        height: 0.5,
                        color: Color(0xFF1B4D3E).withOpacity(0.08))),
              ],
            ),
          ),

        // Bubble
        Padding(
          padding: EdgeInsets.only(
            top: 2,
            bottom: 2,
            left: isMine ? 60 : 0,
            right: isMine ? 0 : 60,
          ),
          child: Row(
            mainAxisAlignment:
                isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Flexible(
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isMine ? Color(0xFF1B4D3E) : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(18),
                      topRight: Radius.circular(18),
                      bottomLeft:
                          isMine ? Radius.circular(18) : Radius.circular(4),
                      bottomRight:
                          isMine ? Radius.circular(4) : Radius.circular(18),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isMine
                            ? Color(0xFF1B4D3E).withOpacity(0.2)
                            : Colors.black.withOpacity(0.06),
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: isMine
                        ? CrossAxisAlignment.end
                        : CrossAxisAlignment.start,
                    children: [
                      Text(
                        text,
                        style: TextStyle(
                          fontSize: 14,
                          color: isMine ? Colors.white : Color(0xFF1F2937),
                          height: 1.45,
                        ),
                      ),
                      SizedBox(height: 4),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            showTimestamp ? '' : time,
                            style: TextStyle(
                              fontSize: 10,
                              color: isMine
                                  ? Colors.white.withOpacity(0.6)
                                  : Color(0xFF9CA3AF),
                            ),
                          ),
                          if (isMine) ...[
                            SizedBox(width: 4),
                            isPending
                                ? SizedBox(
                                    width: 10,
                                    height: 10,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 1.5,
                                        color: Colors.white.withOpacity(0.6)),
                                  )
                                : Icon(
                                    isSeen ? Icons.done_all : Icons.done,
                                    size: 13,
                                    color: isSeen
                                        ? Color(0xFF60EFBC)
                                        : Colors.white.withOpacity(0.6),
                                  ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
class TypingIndicator extends StatefulWidget {
  const TypingIndicator({Key? key}) : super(key: key);

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _anims;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
        3,
        (i) => AnimationController(
            vsync: this, duration: Duration(milliseconds: 600))
          ..repeat(
              reverse: true, period: Duration(milliseconds: 900 + i * 150)));
    _anims = _controllers
        .map((c) => Tween<double>(begin: 0, end: -6)
            .animate(CurvedAnimation(parent: c, curve: Curves.easeInOut)))
        .toList();
    for (var i = 0; i < _controllers.length; i++) {
      Future.delayed(Duration(milliseconds: i * 150), () {
        if (mounted) _controllers[i].repeat(reverse: true);
      });
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: 4, bottom: 4),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(18),
              ),
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 8,
                    offset: Offset(0, 2))
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(
                3,
                (i) => AnimatedBuilder(
                  animation: _anims[i],
                  builder: (_, __) => Transform.translate(
                    offset: Offset(0, _anims[i].value),
                    child: Container(
                      width: 7,
                      height: 7,
                      margin: EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: Color(0xFF9CA3AF),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Chat Header ──────────────────────────────────────────────────────────────
class ChatHeader extends StatelessWidget {
  final Map<String, dynamic>? receiverInfo;
  final bool isTyping;
  final bool connected;
  final VoidCallback onBack;
  final VoidCallback? onViewProfile;

  const ChatHeader({
    Key? key,
    this.receiverInfo,
    this.isTyping = false,
    this.connected = false,
    required this.onBack,
    this.onViewProfile,
  }) : super(key: key);

  String? get _avatar {
    final a = receiverInfo?['avatar'];
    if (a == null) return null;
    if (a is String && a.isNotEmpty) return a;
    if (a is List && (a as List).isNotEmpty)
      return (a as List).first.toString();
    return null;
  }

  bool get _online =>
      receiverInfo?['online'] == true || receiverInfo?['is_online'] == true;

  @override
  Widget build(BuildContext context) {
    final name = receiverInfo?['name']?.toString() ?? '';

    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 8,
        bottom: 12,
        left: 8,
        right: 16,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
            bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.08))),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 4,
              offset: Offset(0, 1))
        ],
      ),
      child: Row(
        children: [
          // Back button
          GestureDetector(
            onTap: onBack,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Color(0xFFF0F5F3),
                borderRadius: BorderRadius.circular(12),
              ),
              child:
                  Icon(Icons.chevron_left, color: Color(0xFF1B4D3E), size: 22),
            ),
          ),
          SizedBox(width: 10),

          // Avatar
          GestureDetector(
            onTap: onViewProfile,
            child: Stack(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: Color(0xFFF0F5F3),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: _avatar != null && _avatar!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: _avatar!.startsWith('http')
                                ? _avatar!
                                : 'http://10.0.2.2:5000$_avatar',
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) =>
                                _HeaderInitial(name: name),
                          )
                        : _HeaderInitial(name: name),
                  ),
                ),
                if (_online)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          SizedBox(width: 12),

          // Name + status
          Expanded(
            child: GestureDetector(
              onTap: onViewProfile,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1B4D3E),
                        letterSpacing: -0.01),
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 2),
                  AnimatedSwitcher(
                    duration: Duration(milliseconds: 200),
                    child: isTyping
                        ? Text('typing…',
                            key: ValueKey('typing'),
                            style: TextStyle(
                                fontSize: 12,
                                color: Color(0xFF10B981),
                                fontStyle: FontStyle.italic))
                        : Text(_online ? 'Active now' : 'Offline',
                            key: ValueKey('status'),
                            style: TextStyle(
                                fontSize: 12,
                                color: _online
                                    ? Color(0xFF10B981)
                                    : Color(0xFF9CA3AF))),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeaderInitial extends StatelessWidget {
  final String name;
  const _HeaderInitial({required this.name});

  @override
  Widget build(BuildContext context) => Container(
        color: Color(0xFFF0F5F3),
        child: Center(
          child: Text(
            name.isNotEmpty ? name[0].toUpperCase() : '?',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Color(0xFF9CA3AF)),
          ),
        ),
      );
}

// ─── Message Input ────────────────────────────────────────────────────────────
class MessageInput extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final VoidCallback onSend;
  final bool sending;

  const MessageInput({
    Key? key,
    required this.controller,
    required this.onChanged,
    required this.onSend,
    this.sending = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom + 12,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        border:
            Border(top: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.08))),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Text field
          Expanded(
            child: Container(
              constraints: BoxConstraints(minHeight: 44, maxHeight: 120),
              decoration: BoxDecoration(
                color: Color(0xFFF5F5F3),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.08)),
              ),
              child: TextField(
                controller: controller,
                onChanged: onChanged,
                maxLines: null,
                keyboardType: TextInputType.multiline,
                textInputAction: TextInputAction.newline,
                style: TextStyle(fontSize: 15, color: Color(0xFF1F2937)),
                decoration: InputDecoration(
                  hintText: 'Type a message…',
                  hintStyle: TextStyle(color: Color(0xFF9CA3AF), fontSize: 15),
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: InputBorder.none,
                  isDense: true,
                ),
              ),
            ),
          ),
          SizedBox(width: 10),

          // Send button
          GestureDetector(
            onTap: sending ? null : onSend,
            child: AnimatedContainer(
              duration: Duration(milliseconds: 200),
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: sending
                    ? Color(0xFF1B4D3E).withOpacity(0.5)
                    : Color(0xFF1B4D3E),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Color(0xFF1B4D3E).withOpacity(0.3),
                    blurRadius: 8,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: sending
                  ? Padding(
                      padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : Icon(Icons.send_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Conversation Skeleton ────────────────────────────────────────────────────
class ConversationSkeleton extends StatefulWidget {
  final int count;
  const ConversationSkeleton({Key? key, this.count = 6}) : super(key: key);

  @override
  State<ConversationSkeleton> createState() => _ConversationSkeletonState();
}

class _ConversationSkeletonState extends State<ConversationSkeleton>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 1000))
          ..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.4, end: 1.0).animate(_ac);
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        widget.count,
        (i) => AnimatedBuilder(
          animation: _anim,
          builder: (_, __) => Opacity(
            opacity: _anim.value,
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                border: Border(
                    bottom:
                        BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.06))),
              ),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Color(0xFF1B4D3E).withOpacity(0.06),
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                            height: 14,
                            width: 120,
                            decoration: BoxDecoration(
                                color: Color(0xFF1B4D3E).withOpacity(0.06),
                                borderRadius: BorderRadius.circular(7))),
                        SizedBox(height: 8),
                        Container(
                            height: 12,
                            width: double.infinity,
                            decoration: BoxDecoration(
                                color: Color(0xFF1B4D3E).withOpacity(0.04),
                                borderRadius: BorderRadius.circular(6))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
