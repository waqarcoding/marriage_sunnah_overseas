import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../controllers/meetings_controller.dart';
import '../services/meeting_service.dart';

class MyMeetingsPage extends StatelessWidget {
  const MyMeetingsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<MeetingService>()) {
      Get.put(MeetingService(), permanent: true);
    }
    final ctrl = Get.put(MeetingsController());

    return Scaffold(
      backgroundColor: Color(0xFFF9FAFB),
      body: Column(
        children: [
          // ── Fixed header ─────────────────────────────────────────────
          Container(
            color: Colors.white,
            child: SafeArea(
              bottom: false,
              child: Container(
                padding: EdgeInsets.fromLTRB(16, 12, 20, 16),
                decoration: BoxDecoration(
                  border: Border(
                      bottom: BorderSide(color: Color(0xFFF3F4F6))),
                ),
                child: Row(children: [
                  // Back button
                  GestureDetector(
                    onTap: () => Get.back(),
                    child: Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFFF3F4F6)),
                      child: Icon(Icons.arrow_back,
                          size: 20, color: Color(0xFF374151)),
                    ),
                  ),
                  SizedBox(width: 16),
                  Column(crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('My Meetings',
                          style: TextStyle(fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF111827))),
                      Text('View your scheduled meetings',
                          style: TextStyle(fontSize: 13,
                              color: Color(0xFF6B7280))),
                    ]),
                ]),
              ),
            ),
          ),

          // ── Scrollable content ───────────────────────────────────────
          Expanded(
            child: Obx(() {
              if (ctrl.isLoading.value) return _LoadingView();
              if (ctrl.meetings.isEmpty) return _EmptyView();
              return ListView.builder(
                padding: EdgeInsets.all(16),
                itemCount: ctrl.meetings.length,
                itemBuilder: (_, i) => _MeetingCard(
                  meeting: ctrl.meetings[i],
                  currentUserId: ctrl.currentUserId,
                  ctrl: ctrl,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

// ─── Meeting card ─────────────────────────────────────────────────────────────
class _MeetingCard extends StatelessWidget {
  final Map<String, dynamic> meeting;
  final int currentUserId;
  final MeetingsController ctrl;

  const _MeetingCard({
    required this.meeting,
    required this.currentUserId,
    required this.ctrl,
  });

  Map<String, dynamic> get _otherUser {
    final isUser1 = meeting['user1_id'] == currentUserId;
    final u = isUser1 ? meeting['user2'] : meeting['user1'];
    return u is Map ? Map<String, dynamic>.from(u) : {};
  }

  Map<String, String> _formatDateTime(String? d) {
    if (d == null) return {'date': '—', 'time': '—'};
    try {
      final dt = DateTime.parse(d).toLocal();
      const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const mo = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
      final date =
          '${wd[dt.weekday - 1]}, ${mo[dt.month - 1]} ${dt.day}, ${dt.year}';
      final h = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final m = dt.minute.toString().padLeft(2, '0');
      final ap = dt.hour < 12 ? 'AM' : 'PM';
      return {'date': date, 'time': '$h:$m $ap'};
    } catch (_) { return {'date': d, 'time': ''}; }
  }

  IconData get _typeIcon {
    switch (meeting['meeting_type']?.toString()) {
      case 'video_call': return Icons.videocam;
      case 'phone':      return Icons.phone;
      case 'in_person':  return Icons.location_on;
      default:           return Icons.calendar_today;
    }
  }

  String get _typeLabel {
    switch (meeting['meeting_type']?.toString()) {
      case 'video_call': return 'Video Call';
      case 'phone':      return 'Voice Call';
      case 'in_person':  return 'In Person';
      default:           return 'Meeting';
    }
  }

  @override
  Widget build(BuildContext context) {
    final other    = _otherUser;
    final status   = meeting['status']?.toString() ?? 'proposed';
    final dt       = _formatDateTime(meeting['meeting_datetime']?.toString());
    final dur      = meeting['duration_minutes'] ?? 60;
    final agenda   = meeting['agenda']?.toString() ?? '';
    final link     = meeting['meeting_link']?.toString() ?? '';
    final otherName = other['name']?.toString() ?? 'Someone';
    final avatar    = other['avatar_url']?.toString() ?? '';

    final hasGuardians = meeting['user1_guardian_attending'] == true ||
        meeting['user2_guardian_attending'] == true;
    final hasPlatform  = meeting['platform_team_attending'] == true;

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Color(0xFFF3F4F6), width: 2),
        boxShadow: [BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12, offset: Offset(0, 4))],
      ),
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header: avatar + name + status ──────────────────────
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(children: [
                  // Avatar
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      gradient: LinearGradient(
                        colors: [Color(0xFF1B4D3E), Color(0xFF2d7a63)],
                        begin: Alignment.topLeft, end: Alignment.bottomRight),
                    ),
                    child: avatar.isNotEmpty
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(14),
                            child: Image.network(avatar, fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) =>
                                    _Initial(name: otherName)))
                        : _Initial(name: otherName),
                  ),
                  SizedBox(width: 12),
                  Column(crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Meeting with $otherName',
                          style: TextStyle(fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF111827))),
                      Text('#${meeting['id']}',
                          style: TextStyle(fontSize: 11,
                              color: Color(0xFF9CA3AF))),
                    ]),
                ]),
                _StatusBadge(status: status),
              ]),
            SizedBox(height: 16),

            // ── Date & time row ──────────────────────────────────────
            Row(children: [
              Expanded(child: _InfoChip(
                  icon: Icons.calendar_today,
                  text: dt['date'] ?? '')),
              SizedBox(width: 12),
              Expanded(child: _InfoChip(
                  icon: Icons.access_time,
                  text: '${dt['time']} ($dur min)')),
            ]),
            SizedBox(height: 10),

            // ── Meeting type ─────────────────────────────────────────
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(12)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(_typeIcon, size: 16, color: Color(0xFF1B4D3E)),
                SizedBox(width: 6),
                Text(_typeLabel,
                    style: TextStyle(fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF111827))),
              ]),
            ),

            // ── Optional attendees ───────────────────────────────────
            if (hasGuardians || hasPlatform) ...[
              SizedBox(height: 12),
              Text('Optional Attendees:',
                  style: TextStyle(fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF6B7280))),
              SizedBox(height: 6),
              Wrap(spacing: 6, runSpacing: 6, children: [
                if (meeting['user1_guardian_attending'] == true)
                  _AttendeeChip(label: 'Guardian (User 1)',
                      bg: Color(0xFFFFF7ED), color: Color(0xFFB45309)),
                if (meeting['user2_guardian_attending'] == true)
                  _AttendeeChip(label: 'Guardian (User 2)',
                      bg: Color(0xFFFFF7ED), color: Color(0xFFB45309)),
                if (hasPlatform)
                  _AttendeeChip(label: 'Platform Moderator',
                      bg: Color(0xFFEFF6FF), color: Color(0xFF1D4ED8)),
              ]),
            ],

            // ── Agenda ───────────────────────────────────────────────
            if (agenda.isNotEmpty) ...[
              SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(12)),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Agenda:',
                          style: TextStyle(fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF6B7280))),
                      SizedBox(height: 4),
                      Text(agenda,
                          style: TextStyle(fontSize: 13,
                              color: Color(0xFF374151))),
                    ]),
              ),
            ],

            // ── Actions ──────────────────────────────────────────────
            SizedBox(height: 14),

            if (link.isNotEmpty)
              GestureDetector(
                onTap: () => launchUrl(Uri.parse(link),
                    mode: LaunchMode.externalApplication),
                child: Container(
                  width: double.infinity,
                  padding: EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF1B4D3E), Color(0xFF2d7a63)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [BoxShadow(
                        color: Color(0xFF1B4D3E).withOpacity(0.25),
                        blurRadius: 10, offset: Offset(0, 4))],
                  ),
                  child: Row(mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.videocam, size: 18, color: Colors.white),
                      SizedBox(width: 8),
                      Text('Join Meeting',
                          style: TextStyle(fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Colors.white)),
                      SizedBox(width: 6),
                      Icon(Icons.open_in_new, size: 14, color: Colors.white),
                    ]),
                ),
              ),

            // Confirm / Cancel buttons (only for proposed meetings)
            if (status == 'proposed') ...[
              SizedBox(height: 10),
              Row(children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => ctrl.confirmMeeting(meeting['id']),
                    child: Container(
                      padding: EdgeInsets.symmetric(vertical: 11),
                      decoration: BoxDecoration(
                        color: Color(0xFFD1FAE5),
                        borderRadius: BorderRadius.circular(12)),
                      child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check, size: 15,
                                color: Color(0xFF065F46)),
                            SizedBox(width: 6),
                            Text('Confirm',
                                style: TextStyle(fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF065F46))),
                          ]),
                    ),
                  ),
                ),
                SizedBox(width: 10),
                Expanded(
                  child: GestureDetector(
                    onTap: () => _showCancelDialog(context, meeting['id']),
                    child: Container(
                      padding: EdgeInsets.symmetric(vertical: 11),
                      decoration: BoxDecoration(
                        color: Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(12)),
                      child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.close, size: 15,
                                color: Color(0xFF991B1B)),
                            SizedBox(width: 6),
                            Text('Cancel',
                                style: TextStyle(fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF991B1B))),
                          ]),
                    ),
                  ),
                ),
              ]),
            ],
          ]),
      ),
    );
  }

  void _showCancelDialog(BuildContext ctx, dynamic meetingId) {
    final reasonCtrl = TextEditingController();
    Get.dialog(
      Material(
        type: MaterialType.transparency,
        child: Center(
          child: Container(
            margin: EdgeInsets.all(24),
            padding: EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [BoxShadow(
                  color: Colors.black.withOpacity(0.15), blurRadius: 30)]),
            child: Column(mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Cancel Meeting?',
                    style: TextStyle(fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF111827))),
                SizedBox(height: 8),
                Text('Reason for cancellation (optional):',
                    style: TextStyle(fontSize: 13,
                        color: Color(0xFF6B7280))),
                SizedBox(height: 12),
                TextField(
                  controller: reasonCtrl,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'Enter reason...',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                    contentPadding: EdgeInsets.all(12)),
                ),
                SizedBox(height: 16),
                Row(children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => Get.back(),
                      child: Container(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Color(0xFFE5E7EB)),
                          borderRadius: BorderRadius.circular(12)),
                        child: Center(child: Text('Keep It',
                            style: TextStyle(fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF374151))))),
                    )),
                  SizedBox(width: 10),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        Get.back();
                        ctrl.cancelMeeting(meetingId, reasonCtrl.text);
                      },
                      child: Container(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: Color(0xFFEF4444),
                          borderRadius: BorderRadius.circular(12)),
                        child: Center(child: Text('Cancel Meeting',
                            style: TextStyle(fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.white))))),
                  ),
                ]),
              ]),
          ),
        ),
      ),
      barrierColor: Colors.black.withOpacity(0.5),
    );
  }
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────
class _Initial extends StatelessWidget {
  final String name;
  const _Initial({required this.name});

  @override
  Widget build(BuildContext context) => Center(child: Text(
    name.isNotEmpty ? name[0].toUpperCase() : 'M',
    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700,
        color: Colors.white)));
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoChip({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) => Row(children: [
    Icon(icon, size: 16, color: Color(0xFF1B4D3E)),
    SizedBox(width: 6),
    Expanded(child: Text(text,
        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
            color: Color(0xFF111827)),
        overflow: TextOverflow.ellipsis)),
  ]);
}

class _AttendeeChip extends StatelessWidget {
  final String label;
  final Color bg, color;
  const _AttendeeChip(
      {required this.label, required this.bg, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
        color: bg, borderRadius: BorderRadius.circular(8)),
    child: Text(label,
        style: TextStyle(fontSize: 11, color: color,
            fontWeight: FontWeight.w600)),
  );
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final map = {
      'proposed':   {'bg': Color(0xFFFEF9C3), 'color': Color(0xFF854D0E), 'icon': Icons.access_time},
      'confirmed':  {'bg': Color(0xFFDCFCE7), 'color': Color(0xFF166534), 'icon': Icons.check},
      'cancelled':  {'bg': Color(0xFFFEE2E2), 'color': Color(0xFF991B1B), 'icon': Icons.close},
      'completed':  {'bg': Color(0xFFF3F4F6), 'color': Color(0xFF374151), 'icon': Icons.check},
      'in_progress':{'bg': Color(0xFFDCFCE7), 'color': Color(0xFF166534), 'icon': Icons.play_arrow},
    };
    final s = map[status] ?? map['proposed']!;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
          color: s['bg'] as Color,
          borderRadius: BorderRadius.circular(10)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(s['icon'] as IconData, size: 12, color: s['color'] as Color),
        SizedBox(width: 4),
        Text(status.capitalizeFirst ?? status,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                color: s['color'] as Color)),
      ]),
    );
  }
}

class _LoadingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      CircularProgressIndicator(color: Color(0xFF1B4D3E), strokeWidth: 2.5),
      SizedBox(height: 16),
      Text('Loading meetings...',
          style: TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
    ]));
}

class _EmptyView extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(
    child: Container(
      margin: EdgeInsets.all(24),
      padding: EdgeInsets.all(48),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(24)),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.calendar_today, size: 64, color: Color(0xFFD1D5DB)),
        SizedBox(height: 16),
        Text('No upcoming meetings',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700,
                color: Color(0xFF111827))),
        SizedBox(height: 8),
        Text('Your scheduled meetings will appear here',
            style: TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
            textAlign: TextAlign.center),
      ]),
    ));
}
