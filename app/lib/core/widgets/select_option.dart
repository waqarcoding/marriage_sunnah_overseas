import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class SelectOption extends StatelessWidget {
  final String label;
  final String? value;
  final ValueChanged<String> onChange;
  final List<String> options;
  final String placeholder;
  final bool optional;
  final String? note;
  final bool customOption;

  const SelectOption({
    Key? key,
    required this.label,
    this.value,
    required this.onChange,
    required this.options,
    this.placeholder = 'Select...',
    this.optional = false,
    this.note,
    this.customOption = true,
  }) : super(key: key);

  // Breakpoint above which we treat the layout as "desktop".
  static const double _desktopBreakpoint = 700;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.foreground,
              ),
            ),
            if (optional)
              Text(
                ' (optional)',
                style: TextStyle(
                  fontSize: 11,
                  color: AppColors.mutedForeground,
                ),
              ),
          ],
        ),
        SizedBox(height: 6),
        GestureDetector(
          onTap: () => _openPicker(context),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 14, vertical: 13),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: value != null && value!.isNotEmpty
                    ? AppColors.primary.withOpacity(0.4)
                    : AppColors.border,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    value != null && value!.isNotEmpty ? value! : placeholder,
                    style: TextStyle(
                      fontSize: 14,
                      color: value != null && value!.isNotEmpty
                          ? AppColors.foreground
                          : AppColors.mutedForeground,
                    ),
                  ),
                ),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: AppColors.mutedForeground,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
        if (note != null) ...[
          SizedBox(height: 4),
          Text(
            note!,
            style: TextStyle(
              fontSize: 11,
              color: AppColors.mutedForeground,
            ),
          ),
        ],
      ],
    );
  }

  /// Decides whether to show the mobile bottom sheet or the desktop
  /// centered dialog, based on the current screen width.
  void _openPicker(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width >= _desktopBreakpoint) {
      _showCenterDialog(context);
    } else {
      _showBottomSheet(context);
    }
  }

  // Original mobile behavior — unchanged.
  void _showBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return _PickerContent(
          label: label,
          value: value,
          options: options,
          onChange: onChange,
          customOption: customOption,
          isDesktop: false,
          height: MediaQuery.of(context).size.height * 0.7,
        );
      },
    );
  }

  // Desktop behavior — a fixed-size dialog, explicitly centered on screen.
  void _showCenterDialog(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final dialogWidth = 480.0;
    final dialogHeight =
        screenSize.height * 0.75 > 600 ? 600.0 : screenSize.height * 0.75;

    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.4),
      builder: (ctx) {
        return Dialog(
          alignment: Alignment.center,
          backgroundColor: Colors.transparent,
          insetPadding: EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: SizedBox(
            width: dialogWidth,
            height: dialogHeight,
            child: _PickerContent(
              label: label,
              value: value,
              options: options,
              onChange: onChange,
              customOption: customOption,
              isDesktop: true,
              height: dialogHeight,
            ),
          ),
        );
      },
    );
  }
}

/// Shared picker UI (search + list + optional custom-entry field) used by
/// both the mobile bottom sheet and the desktop centered dialog.
class _PickerContent extends StatefulWidget {
  final String label;
  final String? value;
  final List<String> options;
  final ValueChanged<String> onChange;
  final bool customOption;
  final bool isDesktop;
  final double? height;

  const _PickerContent({
    Key? key,
    required this.label,
    required this.value,
    required this.options,
    required this.onChange,
    required this.isDesktop,
    this.customOption = false,
    this.height,
  }) : super(key: key);

  @override
  State<_PickerContent> createState() => _PickerContentState();
}

class _PickerContentState extends State<_PickerContent> {
  final TextEditingController searchCtrl = TextEditingController();
  final TextEditingController customCtrl = TextEditingController();
  late List<String> filtered;

  @override
  void initState() {
    super.initState();
    filtered = List.from(widget.options);
  }

  @override
  void dispose() {
    searchCtrl.dispose();
    customCtrl.dispose();
    super.dispose();
  }

  void _submitCustom() {
    final text = customCtrl.text.trim();
    if (text.isEmpty) return;
    widget.onChange(text);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final content = Column(
      children: [
        // Handle (mobile only)
        if (!widget.isDesktop)
          Container(
            margin: EdgeInsets.only(top: 12, bottom: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        // Title
        Padding(
          padding: EdgeInsets.symmetric(
            horizontal: 20,
            vertical: widget.isDesktop ? 16 : 8,
          ),
          child: Row(
            children: [
              Text(
                widget.label,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
              Spacer(),
              IconButton(
                icon: Icon(Icons.close, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
        // Search
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: TextField(
            controller: searchCtrl,
            autofocus: widget.isDesktop,
            onChanged: (q) {
              setState(() {
                filtered = widget.options
                    .where((o) => o.toLowerCase().contains(q.toLowerCase()))
                    .toList();
              });
            },
            decoration: InputDecoration(
              hintText: 'Search...',
              hintStyle: TextStyle(color: AppColors.mutedForeground),
              prefixIcon: Icon(Icons.search, size: 18),
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
          ),
        ),
        SizedBox(height: 4),
        // List
        Expanded(child: _buildList()),
        // Custom entry field, pinned at the bottom.
        if (widget.customOption) _buildCustomField(),
      ],
    );

    if (widget.isDesktop) {
      return Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 24,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: content,
      );
    }

    return Container(
      height: widget.height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: content,
    );
  }

  Widget _buildList() {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: filtered.length,
      itemBuilder: (ctx, i) {
        final opt = filtered[i];
        final isSelected = opt == widget.value;
        return ListTile(
          onTap: () {
            widget.onChange(opt);
            Navigator.pop(context);
          },
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          tileColor: isSelected ? AppColors.primary.withOpacity(0.08) : null,
          title: Text(
            opt,
            style: TextStyle(
              fontSize: 14,
              color: isSelected ? AppColors.primary : AppColors.foreground,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          trailing: isSelected
              ? Icon(Icons.check_circle, color: AppColors.primary, size: 18)
              : null,
        );
      },
    );
  }

  Widget _buildCustomField() {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 10, 16, widget.isDesktop ? 16 : 20),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: customCtrl,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _submitCustom(),
              decoration: InputDecoration(
                hintText: 'Add your own...',
                hintStyle: TextStyle(color: AppColors.mutedForeground),
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppColors.primary, width: 1.5),
                ),
              ),
            ),
          ),
          SizedBox(width: 8),
          ValueListenableBuilder<TextEditingValue>(
            valueListenable: customCtrl,
            builder: (ctx, val, _) {
              final enabled = val.text.trim().isNotEmpty;
              return IconButton(
                onPressed: enabled ? _submitCustom : null,
                icon: Icon(Icons.check_circle),
                color: enabled ? AppColors.primary : AppColors.mutedForeground,
                iconSize: 26,
              );
            },
          ),
        ],
      ),
    );
  }
}
