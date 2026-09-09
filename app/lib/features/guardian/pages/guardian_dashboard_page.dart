import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../controllers/guardian_dashboard_controller.dart';
import '../services/guardian_service.dart';

class GuardianDashboardPage extends StatelessWidget {
  const GuardianDashboardPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<GuardianService>()) {
      Get.put(GuardianService());
    }

    final ctrl = Get.put(GuardianDashboardController());

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────
            Padding(
                padding: EdgeInsets.fromLTRB(20, 24, 20, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Guardian Dashboard',
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF111827),
                          letterSpacing: -0.03 * 26,
                          height: 1.2,
                        )),
                    SizedBox(height: 4),
                    Text(
                      'Assalamu Alaikum, ${ctrl.userName} — review your ward\'s interests',
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF9CA3AF)),
                    ),
                  ],
                )),

            // ── Stats row ────────────────────────────────────────────────
            Obx(() => Padding(
                  padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
                  child: Row(
                    children: [
                      _StatCard(
                        label: 'Pending',
                        value: ctrl.pending.length,
                        gradient: LinearGradient(
                            colors: [Color(0xFFFEF3C7), Color(0xFFFDE68A)]),
                        accent: Color(0xFF92400E),
                        isActive: ctrl.activeTab.value == 'pending',
                        onTap: () => ctrl.activeTab.value = 'pending',
                      ),
                      SizedBox(width: 10),
                      _StatCard(
                        label: 'Approved',
                        value: ctrl.approved.length,
                        gradient: LinearGradient(
                            colors: [Color(0xFFD1FAE5), Color(0xFFA7F3D0)]),
                        accent: Color(0xFF065F46),
                        isActive: ctrl.activeTab.value == 'approved',
                        onTap: () => ctrl.activeTab.value = 'approved',
                      ),
                      SizedBox(width: 10),
                      _StatCard(
                        label: 'Rejected',
                        value: ctrl.rejected.length,
                        gradient: LinearGradient(
                            colors: [Color(0xFFFEE2E2), Color(0xFFFCA5A5)]),
                        accent: Color(0xFF991B1B),
                        isActive: ctrl.activeTab.value == 'rejected',
                        onTap: () => ctrl.activeTab.value = 'rejected',
                      ),
                    ],
                  ),
                )),

            // ── Tab pills ────────────────────────────────────────────────
            Obx(() {
              final tabs = [
                {
                  'id': 'pending',
                  'label': 'Pending',
                  'badge': ctrl.pending.length
                },
                {'id': 'all', 'label': 'All', 'badge': ctrl.all.length},
                {'id': 'approved', 'label': 'Approved', 'badge': 0},
                {'id': 'rejected', 'label': 'Rejected', 'badge': 0},
              ];
              return Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Color(0xFFEBEBEB),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: tabs.map((tab) {
                      final isActive = ctrl.activeTab.value == tab['id'];
                      final badge = (tab['badge'] as int?) ?? 0;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () =>
                              ctrl.activeTab.value = tab['id'] as String,
                          child: AnimatedContainer(
                            duration: Duration(milliseconds: 200),
                            padding: EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color:
                                  isActive ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: isActive
                                  ? [
                                      BoxShadow(
                                          color: Colors.black.withOpacity(0.08),
                                          blurRadius: 4)
                                    ]
                                  : [],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(tab['label'] as String,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: isActive
                                          ? Color(0xFF1B4D3E)
                                          : Color(0xFF9CA3AF),
                                    )),
                                if (badge > 0) ...[
                                  SizedBox(width: 4),
                                  Container(
                                    padding: EdgeInsets.symmetric(
                                        horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isActive
                                          ? Color(0xFF1B4D3E)
                                          : Color(0xFFD1D5DB),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      badge > 99 ? '99+' : '$badge',
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w700,
                                        color: isActive
                                            ? Colors.white
                                            : Color(0xFF6B7280),
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              );
            }),
            SizedBox(height: 12),

            // ── List ─────────────────────────────────────────────────────
            Expanded(
              child: Obx(() {
                if (ctrl.isLoading.value) {
                  return _LoadingSkeleton();
                }
                final list = ctrl.currentList;
                if (list.isEmpty) {
                  return _EmptyState(tab: ctrl.activeTab.value);
                }
                return ListView.builder(
                  padding: EdgeInsets.fromLTRB(20, 0, 20, 100),
                  itemCount: list.length,
                  itemBuilder: (_, i) => _InterestCard(
                    interest: list[i],
                    ctrl: ctrl,
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Stat card ────────────────────────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String label;
  final int value;
  final LinearGradient gradient;
  final Color accent;
  final bool isActive;
  final VoidCallback onTap;

  const _StatCard(
      {required this.label,
      required this.value,
      required this.gradient,
      required this.accent,
      required this.isActive,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: Duration(milliseconds: 200),
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: BorderRadius.circular(16),
            border: isActive
                ? Border.all(color: accent.withOpacity(0.3), width: 2)
                : null,
            boxShadow: [
              BoxShadow(
                  color: accent.withOpacity(0.25),
                  blurRadius: 10,
                  offset: Offset(0, 2))
            ],
          ),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('$value',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: accent,
                  letterSpacing: -0.04 * 28,
                  height: 1,
                )),
            SizedBox(height: 4),
            Text(label.toUpperCase(),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: accent.withOpacity(0.8),
                  letterSpacing: 0.5,
                )),
          ]),
        ),
      ),
    );
  }
}

// ─── Interest card ────────────────────────────────────────────────────────────
class _InterestCard extends StatelessWidget {
  final Map<String, dynamic> interest;
  final GuardianDashboardController ctrl;

  const _InterestCard({required this.interest, required this.ctrl});

  String? _avatar(Map p) {
    try {
      final imgs = p['images'];
      if (imgs == null) return null;
      final list = imgs is List ? imgs : (imgs as String).split(',');
      return list.isNotEmpty ? list.first.toString().trim() : null;
    } catch (_) {
      return null;
    }
  }

  String _formatDate(String? d) {
    if (d == null) return '';
    try {
      final dt = DateTime.parse(d);
      const months = [
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
      return '${months[dt.month - 1]} ${dt.day}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final sender =
        Map<String, dynamic>.from((interest['fromProfile'] ?? {}) as Map);
    final receiver =
        Map<String, dynamic>.from((interest['toProfile'] ?? {}) as Map);
    final id = interest['id'];
    final status = interest['status']?.toString() ?? 'pending';

    return Obx(() {
      final isApproving = ctrl.loadingAction.value == id.toString();
      final isRejecting = ctrl.loadingAction.value == 'rej_$id';
      final canAct = ctrl.activeTab.value == 'pending';

      return Container(
        margin: EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.10)),
          boxShadow: [
            BoxShadow(
                color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 12)
          ],
        ),
        child: Padding(
          padding: EdgeInsets.all(16),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            // Date + status
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text(_formatDate(interest['created_at']?.toString()),
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF9CA3AF),
                      letterSpacing: 0.5)),
              _StatusPill(status: status),
            ]),
            SizedBox(height: 12),

            // People row
            Row(children: [
              Expanded(
                  child: _PersonTile(profile: sender, avatar: _avatar(sender))),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: Color(0xFFEAF2EE),
                    shape: BoxShape.circle,
                    border:
                        Border.all(color: Color(0xFF1B4D3E).withOpacity(0.15)),
                  ),
                  child:
                      Icon(Icons.favorite, size: 13, color: Color(0xFF1B4D3E)),
                ),
              ),
              Expanded(
                  child: _PersonTile(
                      profile: receiver, avatar: _avatar(receiver))),
            ]),

            // Profession tags
            if (sender['profession'] != null ||
                receiver['profession'] != null) ...[
              SizedBox(height: 10),
              Wrap(spacing: 6, children: [
                if (sender['profession'] != null)
                  _ProfessionTag(text: sender['profession'].toString()),
                if (receiver['profession'] != null)
                  _ProfessionTag(text: receiver['profession'].toString()),
              ]),
            ],

            SizedBox(height: 12),

            // Action buttons
            if (canAct)
              Row(children: [
                Expanded(
                  child: GestureDetector(
                    onTap: isApproving || isRejecting
                        ? null
                        : () => ctrl.handleApprove(id),
                    child: AnimatedContainer(
                      duration: Duration(milliseconds: 150),
                      padding: EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                            colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)]),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                              color: Color(0xFF1B4D3E).withOpacity(0.25),
                              blurRadius: 8)
                        ],
                      ),
                      child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (isApproving)
                              SizedBox(
                                  width: 13,
                                  height: 13,
                                  child: CircularProgressIndicator(
                                      color: Colors.white, strokeWidth: 2))
                            else
                              Icon(Icons.check, size: 13, color: Colors.white),
                            SizedBox(width: 6),
                            Text('Approve',
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white)),
                          ]),
                    ),
                  ),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: GestureDetector(
                    onTap: isApproving || isRejecting
                        ? null
                        : () => ctrl.handleReject(id),
                    child: Container(
                      padding: EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Color(0xFFFCA5A5)),
                      ),
                      child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (isRejecting)
                              SizedBox(
                                  width: 13,
                                  height: 13,
                                  child: CircularProgressIndicator(
                                      color: Color(0xFFDC2626), strokeWidth: 2))
                            else
                              Icon(Icons.close,
                                  size: 13, color: Color(0xFFDC2626)),
                            SizedBox(width: 6),
                            Text('Reject',
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFFDC2626))),
                          ]),
                    ),
                  ),
                ),
              ])
            else if (status == 'approved' || status == 'accepted')
              _ResultBanner(approved: true)
            else if (status == 'rejected' || status == 'declined')
              _ResultBanner(approved: false),
          ]),
        ),
      );
    });
  }
}

class _PersonTile extends StatelessWidget {
  final Map<String, dynamic> profile;
  final String? avatar;
  const _PersonTile({required this.profile, this.avatar});

  @override
  Widget build(BuildContext context) {
    final name = profile['name']?.toString() ?? 'Unknown';
    final city = profile['city']?.toString() ?? '';
    return Column(children: [
      avatar != null && avatar!.isNotEmpty
          ? ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(avatar!,
                  width: 70,
                  height: 70,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _Initial(name: name)))
          : _Initial(name: name),
      SizedBox(height: 6),
      Text(name,
          style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1B4D3E)),
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis),
      if (city.isNotEmpty)
        Text(city,
            style: TextStyle(
                fontSize: 10,
                color: Color(0xFF9CA3AF),
                fontWeight: FontWeight.w500),
            textAlign: TextAlign.center),
    ]);
  }
}

class _Initial extends StatelessWidget {
  final String name;
  const _Initial({required this.name});

  @override
  Widget build(BuildContext context) => Container(
        width: 70,
        height: 70,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
              colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight),
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.12), blurRadius: 8)
          ],
        ),
        child: Center(
            child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: Color(0xFFFEF3C7)),
        )),
      );
}

class _ProfessionTag extends StatelessWidget {
  final String text;
  const _ProfessionTag({required this.text});

  @override
  Widget build(BuildContext context) => Container(
        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: Color(0xFFF0F5F3),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.1)),
        ),
        child: Text(text,
            style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1B4D3E))),
      );
}

class _StatusPill extends StatelessWidget {
  final String status;
  const _StatusPill({required this.status});

  @override
  Widget build(BuildContext context) {
    final map = {
      'pending': {
        'bg': Color(0xFFFEF3C7),
        'color': Color(0xFF92400E),
        'border': Color(0xFFFDE68A),
        'label': 'Pending',
        'icon': Icons.access_time
      },
      'accepted': {
        'bg': Color(0xFFD1FAE5),
        'color': Color(0xFF065F46),
        'border': Color(0xFFA7F3D0),
        'label': 'Accepted',
        'icon': Icons.check
      },
      'approved': {
        'bg': Color(0xFFD1FAE5),
        'color': Color(0xFF065F46),
        'border': Color(0xFFA7F3D0),
        'label': 'Approved',
        'icon': Icons.check
      },
      'declined': {
        'bg': Color(0xFFFEE2E2),
        'color': Color(0xFF991B1B),
        'border': Color(0xFFFCA5A5),
        'label': 'Declined',
        'icon': Icons.close
      },
      'rejected': {
        'bg': Color(0xFFFEE2E2),
        'color': Color(0xFF991B1B),
        'border': Color(0xFFFCA5A5),
        'label': 'Rejected',
        'icon': Icons.close
      },
    };
    final s = map[status] ?? map['pending']!;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: s['bg'] as Color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: (s['border'] as Color).withOpacity(0.5)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(s['icon'] as IconData, size: 11, color: s['color'] as Color),
        SizedBox(width: 4),
        Text((s['label'] as String).toUpperCase(),
            style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                color: s['color'] as Color,
                letterSpacing: 0.2)),
      ]),
    );
  }
}

class _ResultBanner extends StatelessWidget {
  final bool approved;
  const _ResultBanner({required this.approved});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: approved ? Color(0xFFF0FDF4) : Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(12),
        border:
            Border.all(color: approved ? Color(0xFFBBF7D0) : Color(0xFFFECACA)),
      ),
      child: Row(children: [
        Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
                color: approved ? Color(0xFF16A34A) : Color(0xFFDC2626),
                shape: BoxShape.circle),
            child: Icon(approved ? Icons.check : Icons.close,
                size: 11, color: Colors.white)),
        SizedBox(width: 8),
        Text(
            approved ? 'You approved this match' : 'You rejected this interest',
            style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: approved ? Color(0xFF15803D) : Color(0xFFB91C1C))),
      ]),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String tab;
  const _EmptyState({required this.tab});

  @override
  Widget build(BuildContext context) {
    final config = {
      'pending': {
        'title': 'All caught up',
        'sub': 'No interests are awaiting your review right now.'
      },
      'all': {
        'title': 'No interests yet',
        'sub': 'Interests involving your wards will appear here.'
      },
      'approved': {
        'title': 'Nothing approved yet',
        'sub': 'Interests you approve will be listed here.'
      },
      'rejected': {
        'title': 'Nothing rejected',
        'sub': 'Interests you decline will be listed here.'
      },
    };
    final c = config[tab] ?? config['pending']!;
    return Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                  color: Color(0xFFEAF2EE),
                  borderRadius: BorderRadius.circular(24)),
              child: Icon(Icons.auto_awesome,
                  size: 36, color: Color(0xFF1B4D3E).withOpacity(0.55))),
          SizedBox(height: 16),
          Text(c['title']!,
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1B4D3E))),
          SizedBox(height: 6),
          Text(c['sub']!,
              style: TextStyle(
                  fontSize: 13, color: Color(0xFF9CA3AF), height: 1.5),
              textAlign: TextAlign.center),
        ]),
      ),
    );
  }
}

class _LoadingSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: EdgeInsets.fromLTRB(20, 0, 20, 100),
      itemCount: 4,
      itemBuilder: (_, __) => Container(
        margin: EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.08))),
        child: Column(children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            _Shimmer(width: 60, height: 12),
            _Shimmer(width: 60, height: 20, radius: 10),
          ]),
          SizedBox(height: 12),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            _Shimmer(width: 56, height: 56, radius: 12),
            SizedBox(width: 20),
            _Shimmer(width: 28, height: 28, radius: 14),
            SizedBox(width: 20),
            _Shimmer(width: 56, height: 56, radius: 12),
          ]),
          SizedBox(height: 12),
          Row(children: [
            Expanded(child: _Shimmer(height: 36, radius: 12)),
            SizedBox(width: 8),
            Expanded(child: _Shimmer(height: 36, radius: 12)),
          ]),
        ]),
      ),
    );
  }
}

class _Shimmer extends StatelessWidget {
  final double? width, height;
  final double radius;
  const _Shimmer({this.width, this.height = 12, this.radius = 8});

  @override
  Widget build(BuildContext context) => Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
            color: Color(0xFFE5E7EB),
            borderRadius: BorderRadius.circular(radius)),
      );
}
