import 'package:flutter/material.dart';

const _primary   = Color(0xFF1B4D3E);
const _secondary = Color(0xFFF0F5F3);

// ─── Section Card ─────────────────────────────────────────────────────────────
class SettingsSectionCard extends StatelessWidget {
  final String? title;
  final List<Widget> children;
  const SettingsSectionCard({Key? key, this.title, required this.children})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.fromLTRB(16, 0, 16, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: _primary.withOpacity(0.06), blurRadius: 8, offset: Offset(0, 1))],
        border: Border.all(color: _primary.withOpacity(0.07)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null)
            Padding(
              padding: EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: Text(title!.toUpperCase(),
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
                      color: Color(0xFF9CA3AF), letterSpacing: 0.08)),
            ),
          Padding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, 4),
            child: Column(children: children),
          ),
        ],
      ),
    );
  }
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
class ToggleRow extends StatelessWidget {
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final String label;
  final String? sublabel;
  final bool value;
  final ValueChanged<bool> onChange;
  final bool disabled;
  final String? disabledLabel;
  // isLast kept for API compat but unused in layout — border is always shown
  final bool isLast;

  const ToggleRow({
    Key? key,
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.label,
    this.sublabel,
    required this.value,
    required this.onChange,
    this.disabled = false,
    this.disabledLabel,
    this.isLast = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : Border(bottom: BorderSide(color: _primary.withOpacity(0.07))),
      ),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, size: 16, color: iconColor),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1A1A1A))),
                if (sublabel != null)
                  Text(sublabel!, style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF), height: 1.3)),
              ],
            ),
          ),
          SizedBox(width: 12),
          disabled
              ? Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(8)),
                  child: Text(disabledLabel ?? 'PRO',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF92400E))),
                )
              : _AnimatedToggle(value: value, onChange: onChange),
        ],
      ),
    );
  }
}

class _AnimatedToggle extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChange;
  const _AnimatedToggle({required this.value, required this.onChange});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChange(!value),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        width: 44, height: 24,
        decoration: BoxDecoration(
          color: value ? _primary : Color(0xFFE5E7EB),
          borderRadius: BorderRadius.circular(12),
        ),
        child: AnimatedAlign(
          duration: Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          alignment: value ? Alignment(0.7, 0) : Alignment(-0.7, 0),
          child: Container(
            width: 20, height: 20,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 4)],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Nav Row ──────────────────────────────────────────────────────────────────
class NavRow extends StatefulWidget {
  final IconData icon;
  final Color? iconBg;
  final Color? iconColor;
  final String label;
  final String? sublabel;
  final VoidCallback onTap;
  final bool danger;
  final String? badge;
  final bool isLast;

  const NavRow({
    Key? key,
    required this.icon,
    this.iconBg,
    this.iconColor,
    required this.label,
    this.sublabel,
    required this.onTap,
    this.danger = false,
    this.badge,
    this.isLast = false,
  }) : super(key: key);

  @override
  State<NavRow> createState() => _NavRowState();
}

class _NavRowState extends State<NavRow> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp:   (_) { setState(() => _pressed = false); widget.onTap(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 100),
        padding: EdgeInsets.symmetric(vertical: 14),
        decoration: widget.isLast
            ? BoxDecoration(color: _pressed ? _primary.withOpacity(0.04) : Colors.transparent)
            : BoxDecoration(
                color: _pressed ? _primary.withOpacity(0.04) : Colors.transparent,
                border: Border(bottom: BorderSide(color: _primary.withOpacity(0.07)))),
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(color: widget.iconBg ?? _secondary, borderRadius: BorderRadius.circular(12)),
              child: Icon(widget.icon, size: 16, color: widget.iconColor ?? _primary),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.label,
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500,
                          color: widget.danger ? Color(0xFFEF4444) : Color(0xFF1A1A1A))),
                  if (widget.sublabel != null)
                    Text(widget.sublabel!, style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF), height: 1.3)),
                ],
              ),
            ),
            if (widget.badge != null)
              Container(
                margin: EdgeInsets.only(right: 6),
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: _primary, borderRadius: BorderRadius.circular(10)),
                child: Text(widget.badge!,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
              ),
            Icon(Icons.chevron_right, size: 18, color: Color(0xFFD1D5DB)),
          ],
        ),
      ),
    );
  }
}

// ─── Sub-page sticky header ───────────────────────────────────────────────────
class SubPageHeader extends StatelessWidget {
  final String title;
  final VoidCallback onBack;
  final Widget? trailing;

  const SubPageHeader({Key? key, required this.title, required this.onBack, this.trailing})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: _primary.withOpacity(0.08))),
          ),
          child: Row(
            children: [
              GestureDetector(
                onTap: onBack,
                child: Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(color: _secondary, shape: BoxShape.circle),
                  child: Icon(Icons.chevron_left, size: 22, color: _primary),
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Text(title,
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: _primary)),
              ),
              if (trailing != null) trailing!,
            ],
          ),
        ),
      ),
    );
  }
}
