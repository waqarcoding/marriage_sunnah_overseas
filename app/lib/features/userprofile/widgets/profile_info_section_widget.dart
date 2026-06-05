import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/user_profile_controller.dart';
import '../../../data/providers/api_client.dart';

class ProfileInfoSectionWidget extends StatefulWidget {
  const ProfileInfoSectionWidget({Key? key}) : super(key: key);

  @override
  State<ProfileInfoSectionWidget> createState() =>
      _ProfileInfoSectionWidgetState();
}

class _ProfileInfoSectionWidgetState extends State<ProfileInfoSectionWidget> {
  bool _editMode = false;
  late TextEditingController _bioCtrl;

  @override
  void initState() {
    super.initState();
    final ctrl = Get.find<UserProfileController>();
    _bioCtrl = TextEditingController(text: ctrl.formBio.value);
  }

  @override
  void dispose() {
    _bioCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.find<UserProfileController>();

    return Container(
      padding: EdgeInsets.all(24),
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Obx(() {
        final p = ctrl.profile.value?['profile'] ?? {};

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Name / Age / Gender ─────────────────────────────────────
            Text(
              [p['name'], p['age'] != null ? '${p['age']}' : null, p['gender']]
                  .whereType<String>()
                  .join(', '),
              style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1A1A1A)),
            ),
            SizedBox(height: 6),

            // Meta row
            Wrap(spacing: 10, children: [
              if (p['marital_status'] != null)
                _metaChip('Marital Status', p['marital_status']),
              if (p['nationality'] != null)
                _metaChip('Nationality', p['nationality']),
              if (p['religion'] != null) _metaChip('Religion', p['religion']),
            ]),
            SizedBox(height: 10),

            // Location
            if (ctrl.location.isNotEmpty)
              Row(
                children: [
                  Icon(Icons.location_on, size: 14, color: Color(0xFFEF4444)),
                  SizedBox(width: 4),
                  Text(ctrl.location,
                      style: TextStyle(fontSize: 13, color: Color(0xFF888888))),
                ],
              ),
            SizedBox(height: 10),

            // Profession + Education
            Wrap(spacing: 16, children: [
              Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.work_outline, size: 15, color: Color(0xFF3B82F6)),
                SizedBox(width: 8),
                Text(p['profession']?.toString() ?? '—',
                    style: TextStyle(fontSize: 13, color: Color(0xFF555555))),
              ]),
              Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.school_outlined, size: 15, color: Color(0xFFA855F7)),
                SizedBox(width: 8),
                Text(p['education']?.toString() ?? '—',
                    style: TextStyle(fontSize: 13, color: Color(0xFF555555))),
              ]),
            ]),

            Divider(height: 32, color: Color(0xFFF0F0F0)),

            // ── About Me ────────────────────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('About Me',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1A1A1A))),
                if (!_editMode)
                  _EditButton(onTap: () {
                    _bioCtrl.text = ctrl.formBio.value;
                    setState(() => _editMode = true);
                  })
                else
                  Row(children: [
                    _CancelButton(onTap: () {
                      _bioCtrl.text = ctrl.formBio.value;
                      setState(() => _editMode = false);
                    }),
                    SizedBox(width: 8),
                    Obx(() => _SaveButton(
                          saving: ctrl.isSavingAbout.value,
                          onTap: () async {
                            ctrl.formBio.value = _bioCtrl.text;
                            await ctrl.saveAbout();
                            setState(() => _editMode = false);
                          },
                        )),
                  ]),
              ],
            ),
            SizedBox(height: 10),

            if (_editMode)
              TextField(
                controller: _bioCtrl,
                maxLines: 4,
                style: TextStyle(fontSize: 13, color: Color(0xFF333333)),
                decoration: InputDecoration(
                  hintText: 'Tell others about yourself...',
                  hintStyle: TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)),
                  contentPadding: EdgeInsets.all(12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Color(0xFF1B4D3E)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        BorderSide(color: Color(0xFF1B4D3E), width: 1.5),
                  ),
                ),
              )
            else
              Obx(() => Text(
                    ctrl.formBio.value.isNotEmpty
                        ? ctrl.formBio.value
                        : 'No bio yet',
                    style: TextStyle(
                      fontSize: 13,
                      color: ctrl.formBio.value.isNotEmpty
                          ? Color(0xFF555555)
                          : Color(0xFFCCCCCC),
                      fontStyle: ctrl.formBio.value.isEmpty
                          ? FontStyle.italic
                          : FontStyle.normal,
                      height: 1.6,
                    ),
                  )),

            Divider(height: 32, color: Color(0xFFF0F0F0)),

            // ── Interests ───────────────────────────────────────────────
            Text('Interests',
                style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1A1A1A))),
            SizedBox(height: 10),

            if (_editMode)
              _InterestsEditor(
                interests: ctrl.interests.toList(),
                onChange: (v) => ctrl.interests.value = v,
              )
            else
              Obx(() {
                final list = ctrl.interests;
                if (list.isEmpty) {
                  return Text('No interests added',
                      style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFFCCCCCC),
                          fontStyle: FontStyle.italic));
                }
                return Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: list
                      .map((item) => Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 14, vertical: 5),
                            decoration: BoxDecoration(
                              color: Color(0xFF1B4D3E).withOpacity(0.08),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                  color: Color(0xFF1B4D3E).withOpacity(0.2)),
                            ),
                            child: Text(item,
                                style: TextStyle(
                                    fontSize: 13, color: Color(0xFF1B4D3E))),
                          ))
                      .toList(),
                );
              }),
          ],
        );
      }),
    );
  }

  Widget _metaChip(String label, dynamic value) {
    return RichText(
      text: TextSpan(
        style: TextStyle(fontSize: 13, color: Color(0xFF999999)),
        children: [
          TextSpan(text: '$label: '),
          TextSpan(
            text: value?.toString() ?? '',
            style: TextStyle(color: Color(0xFF1A1A1A)),
          ),
        ],
      ),
    );
  }
}

Widget _metaText(String label, dynamic value) => RichText(
      text: TextSpan(
        style: TextStyle(fontSize: 13, color: Color(0xFF999999)),
        children: [
          TextSpan(text: '$label: '),
          TextSpan(
              text: value?.toString() ?? '',
              style: TextStyle(color: Color(0xFF1A1A1A))),
        ],
      ),
    );

class _EditButton extends StatelessWidget {
  final VoidCallback onTap;
  const _EditButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          border: Border.all(color: Color(0xFF1B4D3E), width: 1.5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.edit, size: 12, color: Color(0xFF1B4D3E)),
          SizedBox(width: 5),
          Text('Edit',
              style: TextStyle(fontSize: 12, color: Color(0xFF1B4D3E))),
        ]),
      ),
    );
  }
}

class _CancelButton extends StatelessWidget {
  final VoidCallback onTap;
  const _CancelButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          border: Border.all(color: Color(0xFFE0E0E0), width: 1.5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.close, size: 12, color: Color(0xFF555555)),
          SizedBox(width: 4),
          Text('Cancel',
              style: TextStyle(fontSize: 12, color: Color(0xFF555555))),
        ]),
      ),
    );
  }
}

class _SaveButton extends StatelessWidget {
  final bool saving;
  final VoidCallback onTap;
  const _SaveButton({required this.saving, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: saving ? null : onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: saving ? Color(0xFFCCCCCC) : Color(0xFF1B4D3E),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          if (saving)
            SizedBox(
                width: 12,
                height: 12,
                child: CircularProgressIndicator(
                    color: Colors.white, strokeWidth: 2))
          else
            Icon(Icons.check, size: 12, color: Colors.white),
          SizedBox(width: 4),
          Text(saving ? 'Saving...' : 'Save',
              style: TextStyle(
                  fontSize: 12,
                  color: saving ? Color(0xFF888888) : Colors.white)),
        ]),
      ),
    );
  }
}

// ─── Interests Editor ─────────────────────────────────────────────────────────
class _InterestsEditor extends StatefulWidget {
  final List<String> interests;
  final ValueChanged<List<String>> onChange;

  const _InterestsEditor({required this.interests, required this.onChange});

  @override
  State<_InterestsEditor> createState() => _InterestsEditorState();
}

class _InterestsEditorState extends State<_InterestsEditor> {
  final _ctrl = TextEditingController();
  List<String> _options = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadOptions();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _loadOptions() async {
    try {
      final api = Get.find<ApiClient>();
      final res = await api.get('/explore/options');
      final list = res?['interests'] ?? res?['data']?['interests'] ?? [];
      setState(() {
        _options = (list as List).map((e) => e.toString()).take(30).toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  void _toggle(String item) {
    final list = List<String>.from(widget.interests);
    if (list.contains(item))
      list.remove(item);
    else
      list.add(item);
    widget.onChange(list);
  }

  void _addCustom() {
    var v = _ctrl.text.trim();
    if (v.isEmpty) return;
    v = v
        .split(' ')
        .map((w) => w.isEmpty ? w : w[0].toUpperCase() + w.substring(1))
        .join(' ');
    if (widget.interests.contains(v)) return;
    widget.onChange([...widget.interests, v]);
    _ctrl.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Selected chips
      if (widget.interests.isNotEmpty) ...[
        Wrap(
            spacing: 8,
            runSpacing: 8,
            children: widget.interests
                .map((item) => Container(
                      padding: EdgeInsets.fromLTRB(10, 4, 6, 4),
                      decoration: BoxDecoration(
                        color: Color(0xFF1B4D3E),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Text(item,
                            style:
                                TextStyle(fontSize: 13, color: Colors.white)),
                        SizedBox(width: 4),
                        GestureDetector(
                          onTap: () => widget.onChange(widget.interests
                              .where((i) => i != item)
                              .toList()),
                          child:
                              Icon(Icons.close, size: 11, color: Colors.white),
                        ),
                      ]),
                    ))
                .toList()),
        SizedBox(height: 12),
      ],

      // Suggestions
      if (_loading)
        Text('Loading suggestions...',
            style: TextStyle(fontSize: 12, color: Color(0xFFAAAAAA)))
      else if (_options.isNotEmpty) ...[
        Text('SUGGESTIONS',
            style: TextStyle(
                fontSize: 11,
                color: Color(0xFFAAAAAA),
                letterSpacing: 0.5,
                fontWeight: FontWeight.w600)),
        SizedBox(height: 6),
        Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _options.map((item) {
              final selected = widget.interests.contains(item);
              return GestureDetector(
                onTap: () => _toggle(item),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: selected ? Color(0xFFF0F5F3) : Color(0xFFFAFAFA),
                    border: Border.all(
                        color: selected ? Color(0xFF1B4D3E) : Color(0xFFE0E0E0),
                        width: 1.5),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    if (selected) ...[
                      Icon(Icons.check, size: 11, color: Color(0xFF1B4D3E)),
                      SizedBox(width: 4),
                    ],
                    Text(item,
                        style: TextStyle(
                            fontSize: 13,
                            color: selected
                                ? Color(0xFF1B4D3E)
                                : Color(0xFF555555))),
                  ]),
                ),
              );
            }).toList()),
        SizedBox(height: 12),
      ],

      // Custom input
      Row(children: [
        Expanded(
          child: TextField(
            controller: _ctrl,
            onSubmitted: (_) => _addCustom(),
            decoration: InputDecoration(
              hintText: 'Add custom interest...',
              hintStyle: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Color(0xFF1B4D3E)),
              ),
              isDense: true,
            ),
          ),
        ),
        SizedBox(width: 8),
        GestureDetector(
          onTap: _addCustom,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Color(0xFF1B4D3E),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text('Add',
                style: TextStyle(fontSize: 12, color: Colors.white)),
          ),
        ),
      ]),
    ]);
  }
}
