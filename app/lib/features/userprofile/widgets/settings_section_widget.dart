import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SettingsSectionWidget extends StatelessWidget {
  const SettingsSectionWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final items = [
      {
        'icon':  Icons.settings,
        'label': 'Settings & Privacy',
        'color': Color(0xFF6B7280),
        'bg':    Color(0xFFF3F4F6),
        'route': '/settings',
      },
      {
        'icon':  Icons.verified_user_outlined,
        'label': 'Get Verified',
        'color': Color(0xFF3B82F6),
        'bg':    Color(0xFFDBEAFE),
        'route': '/verification',
      },
      {
        'icon':  Icons.favorite,
        'label': 'Upgrade to Premium',
        'color': Color(0xFFEF4444),
        'bg':    Color(0xFFFCE7F3),
        'route': '/subscription',
      },
    ];

    return Container(
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: items.map((item) {
          final isLast = item == items.last;
          return _SettingsRow(
            icon:    item['icon'] as IconData,
            label:   item['label'] as String,
            color:   item['color'] as Color,
            bg:      item['bg']    as Color,
            route:   item['route'] as String,
            isLast:  isLast,
          );
        }).toList(),
      ),
    );
  }
}

class _SettingsRow extends StatefulWidget {
  final IconData icon;
  final String label, route;
  final Color color, bg;
  final bool isLast;

  const _SettingsRow({
    required this.icon, required this.label, required this.color,
    required this.bg, required this.route, required this.isLast,
  });

  @override
  State<_SettingsRow> createState() => _SettingsRowState();
}

class _SettingsRowState extends State<_SettingsRow> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp:   (_) { setState(() => _pressed = false); Get.toNamed(widget.route); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 100),
        color: _pressed ? Color(0xFFF9FAFB) : Colors.transparent,
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        decoration: widget.isLast
            ? null
            : BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0xFFF9FAFB)),
                )),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(color: widget.bg, shape: BoxShape.circle),
                child: Icon(widget.icon, size: 16, color: widget.color),
              ),
              SizedBox(width: 12),
              Text(widget.label,
                  style: TextStyle(fontSize: 13, color: Color(0xFF374151))),
            ]),
            Icon(Icons.chevron_right, size: 16, color: Color(0xFF9CA3AF)),
          ],
        ),
      ),
    );
  }
}
