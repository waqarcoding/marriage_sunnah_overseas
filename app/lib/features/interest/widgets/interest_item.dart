import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:get/get.dart';
import '../../profile/pages/profile_detail_page.dart';

class InterestItem extends StatefulWidget {
  final Map<String, dynamic> interest;
  final Map<String, dynamic> profile;
  final List<String> images;
  final String activeTab;
  final VoidCallback onOpenProfile;
  final VoidCallback onStartChat;
  final Function(int id, String name) onAccept;
  final Function(int id, String name) onDecline;
  final bool isPro;
  final int index;

  const InterestItem({
    Key? key,
    required this.interest,
    required this.profile,
    required this.images,
    required this.activeTab,
    required this.onOpenProfile,
    required this.onStartChat,
    required this.onAccept,
    required this.onDecline,
    required this.isPro,
    required this.index,
  }) : super(key: key);

  @override
  State<InterestItem> createState() => _InterestItemState();
}

class _InterestItemState extends State<InterestItem>
    with SingleTickerProviderStateMixin {
  bool _showInfo = false;
  late AnimationController _ac;
  late Animation<double> _scale;

  bool get _isOnline {
    final d = widget.profile['last_seen'];
    if (d == null) return false;
    try {
      return DateTime.now().difference(DateTime.parse(d.toString())).inSeconds <
          3600;
    } catch (_) {
      return false;
    }
  }

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 80));
    _scale = Tween<double>(begin: 1.0, end: 1.02).animate(_ac);
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  Map<String, dynamic> get _statusConfig {
    switch (widget.interest['status']) {
      case 'accepted':
        return {
          'label': 'Connected',
          'dot': Color(0xFF4ADE80),
          'text': Color(0xFF166534),
          'bg': Color(0xFFDCFCE7),
          'border': Color(0xFF86EFAC)
        };
      case 'declined':
        return {
          'label': 'Declined',
          'dot': Color(0xFFF87171),
          'text': Color(0xFF7F1D1D),
          'bg': Color(0xFFFEE2E2),
          'border': Color(0xFFFCA5A5)
        };
      default:
        return {
          'label': 'Pending',
          'dot': Color(0xFFFBBF24),
          'text': Color(0xFF78350F),
          'bg': Color(0xFFFEF3C7),
          'border': Color(0xFFFDE68A)
        };
    }
  }

  bool get _showAcceptDecline =>
      widget.activeTab == 'Received' &&
      widget.interest['status'] == 'pending' &&
      widget.interest['both_users_approved'] == false;

  bool get _showStatusTracker {
    final i = widget.interest;
    return i['status'] == 'pending' &&
        !(i['both_users_approved'] == true &&
            i['both_guardians_approved'] == true);
  }

  @override
  Widget build(BuildContext context) {
    final sc = _statusConfig;
    final profile = widget.profile;
    final name = profile['name']?.toString() ?? '';
    final age = profile['age']?.toString();

    return GestureDetector(
      onTapDown: (_) => _ac.forward(),
      onTapUp: (_) {
        _ac.reverse();
        Get.to(
            () => ProfileDetailPage(
                profile: {...profile, 'images': widget.images}),
            transition: Transition.rightToLeft);
      },
      onTapCancel: () => _ac.reverse(),
      child: AnimatedBuilder(
        animation: _scale,
        builder: (_, child) =>
            Transform.scale(scale: _scale.value, child: child),
        child: Stack(
          children: [
            Column(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(20),
                      bottom: _showStatusTracker
                          ? Radius.zero
                          : Radius.circular(20),
                    ),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        // Photo
                        _buildPhoto(),

                        // Online badge
                        if (_isOnline)
                          Positioned(
                            top: 12,
                            left: 12,
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.6),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                    color: Colors.white.withOpacity(0.15)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 6,
                                    height: 6,
                                    decoration: BoxDecoration(
                                        color: Color(0xFF4ADE80),
                                        shape: BoxShape.circle),
                                  ),
                                  SizedBox(width: 5),
                                  Text('Online',
                                      style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.white)),
                                ],
                              ),
                            ),
                          ),

                        // Status pill
                        Positioned(
                          top: 12,
                          right: _showAcceptDecline ? 52 : 12,
                          child: Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: sc['bg'] as Color,
                              borderRadius: BorderRadius.circular(9),
                              border: Border.all(color: sc['border'] as Color),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                      color: sc['dot'] as Color,
                                      shape: BoxShape.circle),
                                ),
                                SizedBox(width: 4),
                                Text(
                                  sc['label'] as String,
                                  style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w700,
                                      color: sc['text'] as Color,
                                      letterSpacing: 0.04),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Accept/Decline buttons
                        if (_showAcceptDecline)
                          Positioned(
                            top: 12,
                            right: 12,
                            child: Column(
                              children: [
                                GestureDetector(
                                  onTap: () => widget.onAccept(
                                      widget.interest['id'] as int, name),
                                  child: Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: Color(0xFF1B4D3E),
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                            color: Color(0xFF1B4D3E)
                                                .withOpacity(0.35),
                                            blurRadius: 12,
                                            offset: Offset(0, 4))
                                      ],
                                    ),
                                    child: Icon(Icons.favorite,
                                        size: 18, color: Colors.white),
                                  ),
                                ),
                                SizedBox(height: 8),
                                GestureDetector(
                                  onTap: () => widget.onDecline(
                                      widget.interest['id'] as int, name),
                                  child: Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: Color(0xFFEF4444),
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                            color: Color(0xFFEF4444)
                                                .withOpacity(0.35),
                                            blurRadius: 12,
                                            offset: Offset(0, 4))
                                      ],
                                    ),
                                    child: Icon(Icons.close,
                                        size: 18, color: Colors.white),
                                  ),
                                ),
                              ],
                            ),
                          ),

                        // Gradient overlay
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            height: MediaQuery.of(context).size.width * 0.35,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  Colors.black.withOpacity(0.9)
                                ],
                              ),
                            ),
                          ),
                        ),

                        // Name + chat
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Padding(
                            padding: EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  age != null && age.isNotEmpty
                                      ? '$name, $age'
                                      : name,
                                  style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                      letterSpacing: -0.01),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (widget.interest['status'] == 'accepted')
                                  GestureDetector(
                                    onTap: widget.onStartChat,
                                    child: Container(
                                      margin: EdgeInsets.only(top: 8),
                                      padding:
                                          EdgeInsets.symmetric(vertical: 8),
                                      decoration: BoxDecoration(
                                        color: Color(0xFF1B4D3E),
                                        borderRadius: BorderRadius.circular(12),
                                        boxShadow: [
                                          BoxShadow(
                                              color: Color(0xFF1B4D3E)
                                                  .withOpacity(0.4),
                                              blurRadius: 12,
                                              offset: Offset(0, 4))
                                        ],
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Icon(Icons.chat_bubble_outline,
                                              size: 14, color: Colors.white),
                                          SizedBox(width: 6),
                                          Text('Chat',
                                              style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w600,
                                                  color: Colors.white)),
                                        ],
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Status tracker
                if (_showStatusTracker)
                  _StatusTracker(
                      interest: widget.interest, activeTab: widget.activeTab),
              ],
            ),
            if (_showInfo)
              _StatusInfoDialog(
                isOpen: true,
                onClose: () => setState(() => _showInfo = false),
                hasFromGuardian: widget.interest['from_guardian'] != null,
                hasToGuardian: widget.interest['to_guardian'] != null,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhoto() {
    final gender = widget.profile['gender']?.toString().toLowerCase() ?? '';
    final placeholder = gender == 'female'
        ? 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png'
        : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png';
    final url = widget.images.isNotEmpty ? widget.images.first : placeholder;

    return CachedNetworkImage(
      imageUrl: url,
      fit: BoxFit.cover,
      errorWidget: (_, __, ___) => Container(color: Color(0xFFF5F5F5)),
    );
  }
}

// ─── Status Tracker ────────────────────────────────────────────────────────────
class _StatusTracker extends StatefulWidget {
  final Map<String, dynamic> interest;
  final String activeTab;
  const _StatusTracker({required this.interest, required this.activeTab});

  @override
  State<_StatusTracker> createState() => _StatusTrackerState();
}

class _StatusTrackerState extends State<_StatusTracker> {
  bool _showInfo = false;

  List<Map<String, dynamic>> get _steps {
    final i = widget.interest;
    final isReceived = widget.activeTab == 'Received';
    final hasFrom = i['from_guardian'] != null;
    final hasTo = i['to_guardian'] != null;

    final youAccepted = !isReceived
        ? true
        : (i['status'] == 'accepted' || i['both_users_approved'] == true);
    final youDeclined = i['status'] == 'declined';
    final otherApproved = !isReceived
        ? (i['status'] == 'accepted' || i['both_users_approved'] == true)
        : true;
    final otherDeclined = i['status'] == 'declined';

    final steps = <Map<String, dynamic>>[
      {
        'key': 'you',
        'label': 'You',
        'done': youAccepted,
        'active': !youAccepted && !youDeclined,
        'failed': youDeclined
      },
      {
        'key': 'other',
        'label': 'Other',
        'done': otherApproved,
        'active': youAccepted && !otherApproved && !otherDeclined,
        'failed': otherDeclined
      },
    ];

    final guardianLabel = isReceived
        ? (hasFrom ? "Guardian" : null)
        : (hasTo ? "Guardian" : null);
    if (guardianLabel != null) {
      final guardianStatus =
          isReceived ? i['from_guardian_status'] : i['to_guardian_status'];
      final gDone = guardianStatus == 'accepted';
      final gFailed = guardianStatus == 'declined';
      final prevDone = youAccepted && otherApproved;
      steps.add({
        'key': 'guardian',
        'label': guardianLabel,
        'done': gDone,
        'active': prevDone && !gDone && !gFailed,
        'failed': gFailed
      });
    }

    return steps;
  }

  @override
  Widget build(BuildContext context) {
    final steps = _steps;
    final doneCount = steps.where((s) => s['done'] == true).length;
    final progressPct =
        steps.length > 1 ? (doneCount - 1) / (steps.length - 1) : 0.0;

    return Container(
      padding: EdgeInsets.fromLTRB(12, 10, 12, 12),
      decoration: BoxDecoration(
        color: Color(0xFFFAFAF9),
        border:
            Border(top: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.07))),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Text('APPROVAL PROGRESS',
                  style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.07,
                      color: Colors.grey[400])),
              SizedBox(width: 6),
              GestureDetector(
                onTap: () => setState(() => _showInfo = !_showInfo),
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                      color: Color(0xFF1B4D3E).withOpacity(0.1),
                      shape: BoxShape.circle),
                  child: Icon(Icons.info_outline,
                      size: 10, color: Color(0xFF1B4D3E)),
                ),
              ),
            ],
          ),
          SizedBox(height: 8),
          Stack(
            children: [
              // Track
              Positioned(
                top: 11,
                left: 12,
                right: 12,
                child: Container(height: 2, color: Colors.grey[200]),
              ),
              // Progress
              Positioned(
                top: 11,
                left: 12,
                child: Container(
                  height: 2,
                  width: (MediaQuery.of(context).size.width - 80) *
                      progressPct.clamp(0.0, 1.0),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                        colors: [Color(0xFF10B981), Color(0xFF1B4D3E)]),
                  ),
                ),
              ),
              // Dots
              Row(
                children: steps
                    .map((step) => Expanded(
                          child: Column(
                            children: [
                              _StepDot(
                                  done: step['done'] as bool,
                                  active: step['active'] as bool,
                                  failed: step['failed'] as bool),
                              SizedBox(height: 4),
                              Text(
                                step['label'] as String,
                                style: TextStyle(
                                  fontSize: 7,
                                  fontWeight: step['done'] == true
                                      ? FontWeight.w700
                                      : FontWeight.w500,
                                  color: step['failed'] == true
                                      ? Color(0xFFF87171)
                                      : step['done'] == true
                                          ? Color(0xFF059669)
                                          : step['active'] == true
                                              ? Color(0xFFD97706)
                                              : Colors.grey[400],
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StepDot extends StatefulWidget {
  final bool done, active, failed;
  const _StepDot(
      {required this.done, required this.active, required this.failed});

  @override
  State<_StepDot> createState() => _StepDotState();
}

class _StepDotState extends State<_StepDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 1500))
          ..repeat(reverse: true);
    _pulse = Tween<double>(begin: 1.0, end: 1.3).animate(_ac);
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Color bg = widget.failed
        ? Color(0xFFFEF2F2)
        : widget.done
            ? Color(0xFFF0FDF4)
            : widget.active
                ? Color(0xFFFEFCE8)
                : Color(0xFFF5F5F5);
    final Color border = widget.failed
        ? Color(0xFFF87171)
        : widget.done
            ? Color(0xFF4ADE80)
            : widget.active
                ? Color(0xFFFBBF24)
                : Colors.grey[300]!;

    if (widget.active) {
      return AnimatedBuilder(
        animation: _pulse,
        builder: (_, child) =>
            Transform.scale(scale: _pulse.value, child: child),
        child: Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
              color: bg,
              shape: BoxShape.circle,
              border: Border.all(color: border, width: 2)),
          child: Center(
              child: Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                      color: Color(0xFFFBBF24), shape: BoxShape.circle))),
        ),
      );
    }

    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
          color: bg,
          shape: BoxShape.circle,
          border: Border.all(color: border, width: 2)),
      child: Center(
        child: widget.failed
            ? Icon(Icons.close, size: 12, color: Color(0xFFF87171))
            : widget.done
                ? Icon(Icons.check, size: 12, color: Color(0xFF4ADE80))
                : Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                        color: Colors.grey[300], shape: BoxShape.circle)),
      ),
    );
  }
}

// ─── Status Info Dialog ─────────────────────────────────────────────────────────
class _StatusInfoDialog extends StatelessWidget {
  final bool isOpen;
  final VoidCallback onClose;
  final bool hasFromGuardian;
  final bool hasToGuardian;

  const _StatusInfoDialog({
    required this.isOpen,
    required this.onClose,
    required this.hasFromGuardian,
    required this.hasToGuardian,
  });

  @override
  Widget build(BuildContext context) {
    if (!isOpen) return SizedBox.shrink();

    final steps = [
      {
        'icon': Icons.favorite_border,
        'title': 'Mutual Interest',
        'desc':
            'Both you and the other person need to accept the interest request to move forward.',
        'color': Color(0xFFEC4899),
        'bg': Color(0xFFFCE7F3)
      },
      if (hasFromGuardian)
        {
          'icon': Icons.shield_outlined,
          'title': 'Guardian Approval',
          'desc': "Their guardian reviews and approves the match.",
          'color': Color(0xFF7C3AED),
          'bg': Color(0xFFEDE9FE)
        },
      if (hasToGuardian)
        {
          'icon': Icons.shield_outlined,
          'title': 'Your Guardian Approval',
          'desc': "Your guardian reviews and approves the match.",
          'color': Color(0xFF7C3AED),
          'bg': Color(0xFFEDE9FE)
        },
      {
        'icon': Icons.star_outline,
        'title': 'Connected!',
        'desc': 'Once everyone approves, you can start chatting.',
        'color': Color(0xFF059669),
        'bg': Color(0xFFD1FAE5)
      },
    ];

    return Positioned.fill(
      child: GestureDetector(
        onTap: onClose,
        child: Container(
          color: Colors.black.withOpacity(0.5),
          child: Center(
            child: GestureDetector(
              onTap: () {},
              child: Container(
                margin: EdgeInsets.all(20),
                constraints: BoxConstraints(maxWidth: 480),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                          color: Colors.black.withOpacity(0.16), blurRadius: 32)
                    ]),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header
                    Container(
                      padding: EdgeInsets.fromLTRB(24, 24, 24, 20),
                      decoration: BoxDecoration(
                        color: Color(0xFFEAF2EE),
                        borderRadius:
                            BorderRadius.vertical(top: Radius.circular(20)),
                        border: Border(
                            bottom: BorderSide(
                                color: Color(0xFF1B4D3E).withOpacity(0.08))),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('How It Works',
                                    style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF1B4D3E))),
                                SizedBox(height: 4),
                                Text('Your journey from interest to connection',
                                    style: TextStyle(
                                        fontSize: 13, color: Colors.grey[500])),
                              ],
                            ),
                          ),
                          GestureDetector(
                            onTap: onClose,
                            child: Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                      color:
                                          Color(0xFF1B4D3E).withOpacity(0.12))),
                              child: Icon(Icons.close,
                                  size: 18, color: Colors.grey[500]),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Steps
                    Padding(
                      padding: EdgeInsets.fromLTRB(24, 24, 24, 0),
                      child: Column(
                        children: List.generate(steps.length, (i) {
                          final s = steps[i];
                          return Padding(
                            padding: EdgeInsets.only(
                                bottom: i < steps.length - 1 ? 24 : 0),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: s['bg'] as Color,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                        color: (s['color'] as Color)
                                            .withOpacity(0.2),
                                        width: 2),
                                  ),
                                  child: Icon(s['icon'] as IconData,
                                      size: 22, color: s['color'] as Color),
                                ),
                                SizedBox(width: 18),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(s['title'] as String,
                                              style: TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w600,
                                                  color: Color(0xFF1B4D3E))),
                                          SizedBox(width: 8),
                                          Container(
                                            padding: EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                                color: s['bg'] as Color,
                                                borderRadius:
                                                    BorderRadius.circular(8)),
                                            child: Text('Step ${i + 1}',
                                                style: TextStyle(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.w700,
                                                    color: s['color'] as Color,
                                                    letterSpacing: 0.05)),
                                          ),
                                        ],
                                      ),
                                      SizedBox(height: 4),
                                      Text(s['desc'] as String,
                                          style: TextStyle(
                                              fontSize: 13,
                                              color: Colors.grey[500],
                                              height: 1.5)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ),
                    ),
                    // Footer
                    Container(
                      padding: EdgeInsets.all(18),
                      margin: EdgeInsets.only(top: 20),
                      decoration: BoxDecoration(
                        color: Color(0xFFFAFAF9),
                        border: Border(
                            top: BorderSide(
                                color: Color(0xFF1B4D3E).withOpacity(0.07))),
                        borderRadius:
                            BorderRadius.vertical(bottom: Radius.circular(20)),
                      ),
                      child: Center(
                        child: Text(
                            'All parties must approve before you can connect',
                            style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: Colors.grey[400])),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
