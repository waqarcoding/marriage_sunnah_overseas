import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/schedule_meeting_controller.dart';
import '../services/meeting_service.dart';

/// Call this to open the schedule meeting sheet:
/// ScheduleMeetingSheet.show(matchId: '123', receiverInfo: {'name': 'Sara'});
class ScheduleMeetingSheet {
  static void show({
    required dynamic matchId,
    required Map<String, dynamic> receiverInfo,
    VoidCallback? onSuccess,
  }) {
    if (!Get.isRegistered<MeetingService>()) {
      Get.put(MeetingService(), permanent: true);
    }
    final ctrl = Get.put(ScheduleMeetingController(), tag: 'schedule');
    ctrl.initDefaults();

    Get.dialog(
      Material(
        type: MaterialType.transparency,
        child: _ScheduleMeetingDialog(
          matchId: matchId,
          receiverInfo: receiverInfo,
          ctrl: ctrl,
          onSuccess: onSuccess,
        ),
      ),
      barrierColor: Colors.black.withOpacity(0.55),
      barrierDismissible: true,
    );
  }
}

class _ScheduleMeetingDialog extends StatelessWidget {
  final dynamic matchId;
  final Map<String, dynamic> receiverInfo;
  final ScheduleMeetingController ctrl;
  final VoidCallback? onSuccess;

  const _ScheduleMeetingDialog({
    required this.matchId,
    required this.receiverInfo,
    required this.ctrl,
    this.onSuccess,
  });

  @override
  Widget build(BuildContext context) {
    final name = receiverInfo['name']?.toString() ?? 'them';

    return Center(
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 32),
        constraints: BoxConstraints(
          maxWidth: 640,
          maxHeight: MediaQuery.of(context).size.height * 0.9,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 64,
                offset: Offset(0, 24)),
          ],
        ),
        child: Column(children: [
          // ── Green header ──────────────────────────────────────────────
          Container(
            padding: EdgeInsets.fromLTRB(24, 16, 16, 16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF1B4D3E), Color(0xFF2d7a63)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight),
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(14)),
                child: Icon(Icons.calendar_today, size: 24, color: Colors.white),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Schedule Meeting',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700,
                          color: Colors.white)),
                  Text('with $name',
                      style: TextStyle(fontSize: 13,
                          color: Colors.white.withOpacity(0.75))),
                ]),
              ),
              GestureDetector(
                onTap: () => Get.back(),
                child: Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12)),
                  child: Icon(Icons.close, size: 20, color: Colors.white)),
              ),
            ]),
          ),

          // ── Scrollable form ───────────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(24),
              child: Obx(() => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  // Date & Time
                  _SectionLabel(icon: Icons.calendar_today, label: 'Date & Time'),
                  SizedBox(height: 8),
                  _DateTimeField(ctrl: ctrl),
                  SizedBox(height: 20),

                  // Duration
                  _SectionLabel(icon: Icons.access_time, label: 'Duration'),
                  SizedBox(height: 8),
                  _DurationDropdown(ctrl: ctrl),
                  SizedBox(height: 20),

                  // Meeting type
                  _SectionLabel(icon: Icons.people, label: 'Meeting Type'),
                  SizedBox(height: 8),
                  _MeetingTypeGrid(ctrl: ctrl),
                  SizedBox(height: 20),

                  // Location (in-person only)
                  if (ctrl.meetingType.value == 'in_person') ...[
                    _SectionLabel(icon: Icons.location_on, label: 'Location Name'),
                    SizedBox(height: 8),
                    _GreenTextField(
                      hint: 'e.g., Starbucks Downtown',
                      onChanged: (v) => ctrl.locationName.value = v,
                    ),
                    SizedBox(height: 12),
                    _SectionLabel(icon: null, label: 'Address'),
                    SizedBox(height: 8),
                    _GreenTextField(
                      hint: 'Full address',
                      onChanged: (v) => ctrl.locationAddress.value = v,
                    ),
                    SizedBox(height: 20),
                  ],

                  // Optional attendees
                  _SectionLabel(icon: Icons.people, label: 'Optional Attendees'),
                  SizedBox(height: 8),
                  _AttendeeOption(
                    title: 'Include my guardian',
                    desc: 'Your guardian will attend the meeting',
                    value: ctrl.includeMyGuardian.value,
                    onChange: (v) => ctrl.includeMyGuardian.value = v,
                  ),
                  SizedBox(height: 10),
                  _AttendeeOption(
                    title: 'Request their guardian',
                    desc: 'Ask for their guardian to attend',
                    value: ctrl.requestTheirGuardian.value,
                    onChange: (v) => ctrl.requestTheirGuardian.value = v,
                  ),
                  SizedBox(height: 10),
                  _AttendeeOption(
                    title: 'Request platform moderator',
                    desc: 'Platform team member will join as observer',
                    value: ctrl.requestPlatformTeam.value,
                    onChange: (v) => ctrl.requestPlatformTeam.value = v,
                  ),
                  SizedBox(height: 20),

                  // Agenda
                  _SectionLabel(
                      icon: Icons.description_outlined,
                      label: 'Agenda (Optional)'),
                  SizedBox(height: 8),
                  _GreenTextField(
                    hint: 'What would you like to discuss?',
                    maxLines: 3,
                    onChanged: (v) => ctrl.agenda.value = v,
                  ),
                  SizedBox(height: 20),

                  // Info banner
                  Container(
                    padding: EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Color(0xFFEFF6FF),
                      border: Border.all(color: Color(0xFFBFDBFE), width: 2),
                      borderRadius: BorderRadius.circular(14)),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.info_outline, size: 20,
                            color: Color(0xFF2563EB)),
                        SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Meeting invitation will be sent',
                                  style: TextStyle(fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF1E3A5F))),
                              SizedBox(height: 4),
                              Text(
                                'The other person will receive an invitation and can confirm or propose a different time.',
                                style: TextStyle(fontSize: 12,
                                    color: Color(0xFF1D4ED8), height: 1.4)),
                            ]),
                        ),
                      ]),
                  ),
                ],
              )),
            ),
          ),

          // ── Footer buttons ────────────────────────────────────────────
          Container(
            padding: EdgeInsets.fromLTRB(24, 12, 24, 24),
            decoration: BoxDecoration(
              border: Border(
                  top: BorderSide(color: Color(0xFFF3F4F6))),
            ),
            child: Obx(() => Row(children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => Get.back(),
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      border: Border.all(color: Color(0xFFE5E7EB), width: 2),
                      borderRadius: BorderRadius.circular(14)),
                    child: Center(
                      child: Text('Cancel',
                          style: TextStyle(fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF374151)))),
                  ),
                )),
              SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: (ctrl.isLoading.value ||
                          ctrl.meetingDatetime.value.isEmpty)
                      ? null
                      : () async {
                          final ok = await ctrl.submit(matchId);
                          if (ok) {
                            Get.back();
                            onSuccess?.call();
                          }
                        },
                  child: AnimatedOpacity(
                    opacity: (ctrl.isLoading.value ||
                            ctrl.meetingDatetime.value.isEmpty)
                        ? 0.5
                        : 1.0,
                    duration: Duration(milliseconds: 200),
                    child: Container(
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF1B4D3E), Color(0xFF2d7a63)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight),
                        borderRadius: BorderRadius.circular(14)),
                      child: Center(
                        child: ctrl.isLoading.value
                            ? SizedBox(width: 20, height: 20,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2))
                            : Text('Send Invitation',
                                style: TextStyle(fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white))),
                    ),
                  )),
              ),
            ])),
          ),
        ]),
      ),
    );
  }
}

// ─── Date & Time field ────────────────────────────────────────────────────────
class _DateTimeField extends StatelessWidget {
  final ScheduleMeetingController ctrl;
  const _DateTimeField({required this.ctrl});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final now = DateTime.now();
        final date = await showDatePicker(
          context: context,
          initialDate: now.add(Duration(days: 1)),
          firstDate: now,
          lastDate: now.add(Duration(days: 365)),
          builder: (ctx, child) => Theme(
            data: Theme.of(ctx).copyWith(
              colorScheme: ColorScheme.light(primary: Color(0xFF1B4D3E))),
            child: child!),
        );
        if (date == null) return;
        final time = await showTimePicker(
          context: context,
          initialTime: TimeOfDay(hour: 18, minute: 0),
          builder: (ctx, child) => Theme(
            data: Theme.of(ctx).copyWith(
              colorScheme: ColorScheme.light(primary: Color(0xFF1B4D3E))),
            child: child!),
        );
        if (time == null) return;
        final dt = DateTime(
            date.year, date.month, date.day, time.hour, time.minute);
        ctrl.meetingDatetime.value =
            '${dt.year}-${dt.month.toString().padLeft(2, '0')}-'
            '${dt.day.toString().padLeft(2, '0')}T'
            '${dt.hour.toString().padLeft(2, '0')}:'
            '${dt.minute.toString().padLeft(2, '0')}';
      },
      child: Obx(() {
        final val = ctrl.meetingDatetime.value;
        String display = 'Tap to select date & time';
        if (val.isNotEmpty) {
          try {
            final dt = DateTime.parse(val).toLocal();
            const mo = ['Jan','Feb','Mar','Apr','May','Jun',
                        'Jul','Aug','Sep','Oct','Nov','Dec'];
            final h = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
            final m = dt.minute.toString().padLeft(2, '0');
            final ap = dt.hour < 12 ? 'AM' : 'PM';
            display = '${mo[dt.month-1]} ${dt.day}, ${dt.year}  •  $h:$m $ap';
          } catch (_) { display = val; }
        }
        return Container(
          height: 48,
          padding: EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            border: Border.all(
                color: val.isNotEmpty ? Color(0xFF1B4D3E) : Color(0xFFE5E7EB),
                width: 2),
            borderRadius: BorderRadius.circular(14)),
          child: Row(children: [
            Icon(Icons.calendar_today, size: 16,
                color: val.isNotEmpty ? Color(0xFF1B4D3E) : Color(0xFF9CA3AF)),
            SizedBox(width: 10),
            Text(display,
                style: TextStyle(fontSize: 14,
                    color: val.isNotEmpty
                        ? Color(0xFF111827)
                        : Color(0xFF9CA3AF))),
          ]),
        );
      }),
    );
  }
}

// ─── Duration dropdown ────────────────────────────────────────────────────────
class _DurationDropdown extends StatelessWidget {
  final ScheduleMeetingController ctrl;
  const _DurationDropdown({required this.ctrl});

  static const _options = [
    {'value': 30,  'label': '30 minutes'},
    {'value': 60,  'label': '1 hour'},
    {'value': 90,  'label': '1.5 hours'},
    {'value': 120, 'label': '2 hours'},
  ];

  @override
  Widget build(BuildContext context) {
    return Obx(() => Container(
      height: 48,
      padding: EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        border: Border.all(color: Color(0xFFE5E7EB), width: 2),
        borderRadius: BorderRadius.circular(14)),
      child: DropdownButton<int>(
        value: ctrl.durationMinutes.value,
        isExpanded: true,
        underline: SizedBox(),
        onChanged: (v) => ctrl.durationMinutes.value = v!,
        items: _options.map((o) => DropdownMenuItem<int>(
          value: o['value'] as int,
          child: Text(o['label'] as String,
              style: TextStyle(fontSize: 14, color: Color(0xFF111827))))).toList(),
      ),
    ));
  }
}

// ─── Meeting type grid ────────────────────────────────────────────────────────
class _MeetingTypeGrid extends StatelessWidget {
  final ScheduleMeetingController ctrl;
  const _MeetingTypeGrid({required this.ctrl});

  static const _types = [
    {'value': 'video_call', 'emoji': '🎥', 'label': 'Video Call',    'desc': 'Jitsi Meet'},
    {'value': 'phone',      'emoji': '📞', 'label': 'Voice Call',    'desc': 'Voice only'},
    {'value': 'in_person',  'emoji': '🤝', 'label': 'In Person',     'desc': 'Physical meeting'},
  ];

  @override
  Widget build(BuildContext context) {
    return Obx(() => Row(children: _types.map((t) {
      final isActive = ctrl.meetingType.value == t['value'];
      return Expanded(
        child: GestureDetector(
          onTap: () => ctrl.meetingType.value = t['value'] as String,
          child: AnimatedContainer(
            duration: Duration(milliseconds: 150),
            margin: EdgeInsets.only(right: t['value'] == 'in_person' ? 0 : 10),
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border.all(
                  color: isActive ? Color(0xFF1B4D3E) : Color(0xFFE5E7EB),
                  width: 2),
              borderRadius: BorderRadius.circular(14),
              color: isActive ? Color(0xFFF0FDF4) : Colors.white),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${t['emoji']} ${t['label']}',
                    style: TextStyle(fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF111827))),
                SizedBox(height: 2),
                Text(t['desc'] as String,
                    style: TextStyle(fontSize: 11,
                        color: Color(0xFF9CA3AF))),
              ]),
          ),
        ));
    }).toList()));
  }
}

// ─── Attendee option ──────────────────────────────────────────────────────────
class _AttendeeOption extends StatelessWidget {
  final String title, desc;
  final bool value;
  final ValueChanged<bool> onChange;

  const _AttendeeOption({
    required this.title, required this.desc,
    required this.value, required this.onChange,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChange(!value),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 150),
        padding: EdgeInsets.all(14),
        decoration: BoxDecoration(
          border: Border.all(
              color: value ? Color(0xFF1B4D3E) : Color(0xFFE5E7EB),
              width: 2),
          borderRadius: BorderRadius.circular(14),
          color: value ? Color(0xFFF0FDF4) : Colors.white),
        child: Row(children: [
          // Custom checkbox
          AnimatedContainer(
            duration: Duration(milliseconds: 150),
            width: 20, height: 20,
            decoration: BoxDecoration(
              color: value ? Color(0xFF1B4D3E) : Colors.white,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                  color: value ? Color(0xFF1B4D3E) : Color(0xFFD1D5DB),
                  width: 2)),
            child: value
                ? Icon(Icons.check, size: 14, color: Colors.white)
                : SizedBox(),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF111827))),
                Text(desc,
                    style: TextStyle(fontSize: 11,
                        color: Color(0xFF9CA3AF))),
              ])),
        ]),
      ),
    );
  }
}

// ─── Section label ────────────────────────────────────────────────────────────
class _SectionLabel extends StatelessWidget {
  final IconData? icon;
  final String label;
  const _SectionLabel({this.icon, required this.label});

  @override
  Widget build(BuildContext context) => Row(children: [
    if (icon != null) ...[
      Icon(icon, size: 16, color: Color(0xFF1B4D3E)),
      SizedBox(width: 8),
    ],
    Text(label,
        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600,
            color: Color(0xFF374151))),
  ]);
}

// ─── Green text field ─────────────────────────────────────────────────────────
class _GreenTextField extends StatefulWidget {
  final String hint;
  final int maxLines;
  final ValueChanged<String> onChanged;

  const _GreenTextField(
      {required this.hint, this.maxLines = 1, required this.onChanged});

  @override
  State<_GreenTextField> createState() => _GreenTextFieldState();
}

class _GreenTextFieldState extends State<_GreenTextField> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onFocusChange: (f) => setState(() => _focused = f),
      child: TextField(
        maxLines: widget.maxLines,
        onChanged: widget.onChanged,
        style: TextStyle(fontSize: 14, color: Color(0xFF111827)),
        decoration: InputDecoration(
          hintText: widget.hint,
          hintStyle: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF)),
          contentPadding:
              EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Color(0xFFE5E7EB), width: 2)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Color(0xFFE5E7EB), width: 2)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Color(0xFF1B4D3E), width: 2)),
        ),
      ),
    );
  }
}
