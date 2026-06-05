import 'package:flutter/material.dart';

class AppTextArea extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? hintText;
  final String? value;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final bool enabled;
  final int maxLines;
  final int? maxLength;
  final bool optional;

  const AppTextArea({
    Key? key,
    this.label,
    this.hint,
    this.hintText,
    this.value,
    this.controller,
    this.onChanged,
    this.enabled = true,
    this.maxLines = 3,
    this.maxLength,
    this.optional = false,
  }) : super(key: key);

  @override
  State<AppTextArea> createState() => _AppTextAreaState();
}

class _AppTextAreaState extends State<AppTextArea> {
  late final TextEditingController _ctrl;
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    // Use provided controller or create an internal one seeded with value
    _ctrl =
        widget.controller ?? TextEditingController(text: widget.value ?? '');
  }

  @override
  void didUpdateWidget(covariant AppTextArea oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Keep internal controller in sync when value changes externally
    if (widget.controller == null &&
        widget.value != null &&
        widget.value != _ctrl.text) {
      _ctrl.text = widget.value!;
      _ctrl.selection = TextSelection.collapsed(offset: _ctrl.text.length);
    }
  }

  @override
  void dispose() {
    // Only dispose if we own the controller (no external one was passed)
    if (widget.controller == null) _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label row
        if (widget.label != null) ...[
          Row(
            children: [
              Text(
                widget.label!,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF374151),
                ),
              ),
              if (widget.optional)
                Text(
                  '  (optional)',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: Color(0xFF9CA3AF),
                  ),
                ),
            ],
          ),
          SizedBox(height: 6),
        ],

        // Text field
        Focus(
          onFocusChange: (focused) => setState(() => _focused = focused),
          child: AnimatedContainer(
            duration: Duration(milliseconds: 150),
            decoration: BoxDecoration(
              color: widget.enabled ? Colors.white : Color(0xFFF9FAFB),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _focused
                    ? Color(0xFF1B4D3E)
                    : Color(0xFF1B4D3E).withOpacity(0.15),
                width: _focused ? 1.5 : 1.0,
              ),
              boxShadow: _focused
                  ? [
                      BoxShadow(
                        color: Color(0xFF1B4D3E).withOpacity(0.08),
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      )
                    ]
                  : [],
            ),
            child: TextField(
              controller: _ctrl,
              onChanged: widget.onChanged,
              enabled: widget.enabled,
              maxLines: widget.maxLines,
              maxLength: widget.maxLength,
              style: TextStyle(
                fontSize: 14,
                color: widget.enabled ? Color(0xFF1F2937) : Color(0xFF9CA3AF),
                height: 1.5,
              ),
              decoration: InputDecoration(
                hintText: widget.hintText ?? widget.hint,
                hintStyle: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF9CA3AF),
                  height: 1.5,
                ),
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: InputBorder.none,
                isDense: true,
                counterStyle: TextStyle(
                  fontSize: 11,
                  color: Color(0xFF9CA3AF),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
