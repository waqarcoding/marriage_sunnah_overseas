import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../data/providers/api_client.dart';

class GuardianProfilePage extends StatefulWidget {
  const GuardianProfilePage({Key? key}) : super(key: key);

  @override
  State<GuardianProfilePage> createState() => _GuardianProfilePageState();
}

class _GuardianProfilePageState extends State<GuardianProfilePage> {
  final ApiClient _api = Get.find<ApiClient>();
  final _picker = ImagePicker();

  bool _loading = true;
  bool _saving = false;
  bool _editMode = false;
  bool _uploadingAvatar = false;

  Map<String, dynamic>? _profile;
  String _avatar = '';

  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _city = TextEditingController();
  final _country = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _city.dispose();
    _country.dispose();
    super.dispose();
  }

  Future<void> _fetchProfile() async {
    setState(() => _loading = true);
    try {
      final res = await _api.get('/profile/get-current-user');
      final p = res?['profile'] ??
          res?['data']?['profile'] ??
          res?['data'] ??
          res ??
          {};
      setState(() {
        _profile = Map<String, dynamic>.from(p as Map);
        _name.text = p['name']?.toString() ?? '';
        _phone.text = p['phone']?.toString() ?? '';
        _city.text = p['city']?.toString() ?? '';
        _country.text = p['country']?.toString() ?? '';

        // Parse avatar
        try {
          final imgs = p['images'];
          if (imgs is List && imgs.isNotEmpty) {
            _avatar = imgs.first.toString();
          } else if (imgs is String) {
            final parts = imgs
                .replaceAll('[', '')
                .replaceAll(']', '')
                .replaceAll('"', '')
                .split(',');
            _avatar = parts.first.trim();
          }
        } catch (_) {}
      });
    } catch (e) {
      Get.snackbar('Error', 'Failed to load profile',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    if (_name.text.trim().isEmpty) {
      Get.snackbar('Error', 'Name is required',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    setState(() => _saving = true);
    try {
      await _api.put('/profile/update-profile', data: {
        'name': _name.text,
        'phone': _phone.text,
        'city': _city.text,
        'country': _country.text,
      });
      setState(() => _editMode = false);
      Get.snackbar('✅', 'Profile updated!',
          snackPosition: SnackPosition.BOTTOM);
    } catch (_) {
      Get.snackbar('Error', 'Failed to save',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      setState(() => _saving = false);
    }
  }

  void _cancelEdit() {
    if (_profile != null) {
      _name.text = _profile!['name']?.toString() ?? '';
      _phone.text = _profile!['phone']?.toString() ?? '';
      _city.text = _profile!['city']?.toString() ?? '';
      _country.text = _profile!['country']?.toString() ?? '';
    }
    setState(() => _editMode = false);
  }

  Future<void> _pickAvatar() async {
    final picked =
        await _picker.pickImage(source: ImageSource.gallery, imageQuality: 90);
    if (picked == null) return;

    setState(() => _uploadingAvatar = true);
    try {
      final res = await _api.upload(
        '/profile/upload-image',
        {'index': '0'},
        {'image': picked.path},
      );
      if (res?['success'] == true) {
        setState(() => _avatar = res!['imageUrl']?.toString() ?? '');
        Get.snackbar('✅', 'Photo updated!',
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (_) {
      Get.snackbar('Error', 'Upload failed',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      setState(() => _uploadingAvatar = false);
    }
  }

  void _logout() {
    GetStorage().erase();
    Get.offAllNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return _LoadingView();

    final initial = (_name.text.isNotEmpty ? _name.text[0] : 'G').toUpperCase();
    final locationStr =
        [_city.text, _country.text].where((s) => s.isNotEmpty).join(', ');

    return Scaffold(
      backgroundColor: Color(0xFFF3F4F6),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.only(bottom: 40),
          child: Column(
            children: [
              // ── Header ─────────────────────────────────────────────────
              Padding(
                padding: EdgeInsets.fromLTRB(20, 20, 20, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('My Profile',
                              style: TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF111827),
                                  letterSpacing: -0.5)),
                          Text(
                              _editMode
                                  ? 'Editing your details'
                                  : 'Manage your information',
                              style: TextStyle(
                                  fontSize: 13, color: Color(0xFF9CA3AF))),
                        ]),

                    // Edit / Save / Cancel buttons
                    if (!_editMode)
                      _GreenBtn(
                        icon: Icons.edit,
                        label: 'Edit',
                        onTap: () => setState(() => _editMode = true),
                      )
                    else
                      Row(children: [
                        GestureDetector(
                          onTap: _cancelEdit,
                          child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color: Color(0xFFE5E7EB), width: 1.5)),
                              child: Icon(Icons.close,
                                  size: 16, color: Color(0xFF6B7280))),
                        ),
                        SizedBox(width: 8),
                        _GreenBtn(
                          icon: _saving ? null : Icons.check,
                          label: _saving ? 'Saving' : 'Save',
                          onTap: _saving ? null : _save,
                          loading: _saving,
                        ),
                      ]),
                  ],
                ),
              ),

              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Column(children: [
                  // ── Identity card ────────────────────────────────────────
                  Container(
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                              color: Colors.black.withOpacity(0.06),
                              blurRadius: 20)
                        ]),
                    child: Column(children: [
                      // Green header strip
                      Container(
                        height: 120,
                        decoration: BoxDecoration(
                            gradient: LinearGradient(
                                colors: [Color(0xFF1B4D3E), Color(0xFF145236)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight),
                            borderRadius: BorderRadius.vertical(
                                top: Radius.circular(24))),
                        child: Align(
                          alignment: Alignment.topLeft,
                          child: Padding(
                            padding: EdgeInsets.all(12),
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20)),
                              child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.shield_outlined,
                                        size: 10, color: Color(0xFFFEF3C7)),
                                    SizedBox(width: 4),
                                    Text('Guardian',
                                        style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                            color: Color(0xFFFEF3C7))),
                                  ]),
                            ),
                          ),
                        ),
                      ),

                      Padding(
                        padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
                        child: Column(children: [
                          // Avatar overlapping header
                          Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Stack(children: [
                                  GestureDetector(
                                    onTap: _pickAvatar,
                                    child: Container(
                                      width: 96,
                                      height: 96,
                                      margin: EdgeInsets.only(top: -48),
                                      decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                              color: Colors.white, width: 4),
                                          boxShadow: [
                                            BoxShadow(
                                                color: Colors.black
                                                    .withOpacity(0.12),
                                                blurRadius: 20)
                                          ],
                                          color: Color(0xFFE5E7EB)),
                                      child: ClipOval(
                                        child: _avatar.isNotEmpty
                                            ? Image.network(_avatar,
                                                fit: BoxFit.cover,
                                                errorBuilder: (_, __, ___) =>
                                                    _Initial(initial: initial))
                                            : _Initial(initial: initial),
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                      bottom: 0,
                                      right: 0,
                                      child: GestureDetector(
                                        onTap: _pickAvatar,
                                        child: Container(
                                            width: 32,
                                            height: 32,
                                            decoration: BoxDecoration(
                                                color: Color(0xFF1B4D3E),
                                                shape: BoxShape.circle,
                                                border: Border.all(
                                                    color: Colors.white,
                                                    width: 3)),
                                            child: _uploadingAvatar
                                                ? Padding(
                                                    padding: EdgeInsets.all(6),
                                                    child:
                                                        CircularProgressIndicator(
                                                            color: Colors.white,
                                                            strokeWidth: 2))
                                                : Icon(Icons.camera_alt,
                                                    size: 14,
                                                    color: Colors.white)),
                                      )),
                                ]),
                                SizedBox(width: 14),
                                Expanded(
                                    child: Padding(
                                  padding: EdgeInsets.only(bottom: 4),
                                  child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                            _name.text.isNotEmpty
                                                ? _name.text
                                                : 'Your Name',
                                            style: TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.w700,
                                                color: Color(0xFF1B4D3E)),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis),
                                        if (locationStr.isNotEmpty)
                                          Row(children: [
                                            Icon(Icons.location_on,
                                                size: 11,
                                                color: Color(0xFF9CA3AF)),
                                            SizedBox(width: 2),
                                            Expanded(
                                                child: Text(locationStr,
                                                    style: TextStyle(
                                                        fontSize: 12,
                                                        color:
                                                            Color(0xFF9CA3AF)),
                                                    overflow:
                                                        TextOverflow.ellipsis)),
                                          ]),
                                      ]),
                                )),
                              ]),
                          SizedBox(height: 20),

                          // Fields
                          _FieldRow(
                              icon: Icons.person_outline,
                              label: 'Full Name',
                              ctrl: _name,
                              editMode: _editMode,
                              placeholder: 'Enter your full name'),
                          SizedBox(height: 10),
                          _FieldRow(
                              icon: Icons.phone_outlined,
                              label: 'Phone',
                              ctrl: _phone,
                              editMode: _editMode,
                              placeholder: '+1 234 567 8900',
                              keyboardType: TextInputType.phone),
                          SizedBox(height: 10),
                          Row(children: [
                            Expanded(
                                child: _FieldRow(
                                    icon: null,
                                    label: 'City',
                                    ctrl: _city,
                                    editMode: _editMode,
                                    placeholder: 'City')),
                            SizedBox(width: 10),
                            Expanded(
                                child: _FieldRow(
                                    icon: null,
                                    label: 'Country',
                                    ctrl: _country,
                                    editMode: _editMode,
                                    placeholder: 'Country')),
                          ]),
                        ]),
                      ),
                    ]),
                  ),

                  SizedBox(height: 16),

                  // ── Quick actions ─────────────────────────────────────────
                  if (!_editMode)
                    Container(
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                                color: Colors.black.withOpacity(0.06),
                                blurRadius: 20)
                          ]),
                      child: Column(children: [
                        _ActionRow(
                          icon: Icons.shield_outlined,
                          label: 'My Wards',
                          sub: 'View and manage linked wards',
                          onTap: () => Get.toNamed('/guardian/add-ward'),
                        ),
                        Divider(
                            height: 1,
                            indent: 68,
                            color: Colors.black.withOpacity(0.05)),
                        _ActionRow(
                          icon: Icons.logout,
                          label: 'Logout',
                          sub: 'Sign out of your account',
                          danger: true,
                          onTap: _logout,
                        ),
                      ]),
                    ),
                ]),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────
class _Initial extends StatelessWidget {
  final String initial;
  const _Initial({required this.initial});

  @override
  Widget build(BuildContext context) => Center(
      child: Text(initial,
          style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1B4D3E))));
}

class _GreenBtn extends StatelessWidget {
  final IconData? icon;
  final String label;
  final VoidCallback? onTap;
  final bool loading;

  const _GreenBtn(
      {this.icon, required this.label, this.onTap, this.loading = false});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
              color: loading
                  ? Color(0xFF1B4D3E).withOpacity(0.7)
                  : Color(0xFF1B4D3E),
              borderRadius: BorderRadius.circular(20)),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            if (loading)
              SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2))
            else if (icon != null)
              Icon(icon, size: 14, color: Color(0xFFFEF3C7)),
            SizedBox(width: 6),
            Text(label,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFFEF3C7))),
          ]),
        ),
      );
}

class _FieldRow extends StatelessWidget {
  final IconData? icon;
  final String label, placeholder;
  final TextEditingController ctrl;
  final bool editMode;
  final TextInputType keyboardType;

  const _FieldRow(
      {this.icon,
      required this.label,
      required this.ctrl,
      required this.editMode,
      required this.placeholder,
      this.keyboardType = TextInputType.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
          color: Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.06))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: Color(0xFF1B4D3E).withOpacity(0.7)),
            SizedBox(width: 4),
          ],
          Text(label.toUpperCase(),
              style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1B4D3E).withOpacity(0.7),
                  letterSpacing: 0.5)),
        ]),
        SizedBox(height: 6),
        if (editMode)
          TextField(
            controller: ctrl,
            keyboardType: keyboardType,
            style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1B4D3E)),
            decoration: InputDecoration(
                hintText: placeholder,
                hintStyle: TextStyle(
                    fontSize: 15,
                    color: Color(0xFF9CA3AF),
                    fontWeight: FontWeight.normal),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero),
          )
        else
          Text(
              ctrl.text.isNotEmpty
                  ? ctrl.text
                  : 'No ${label.toLowerCase()} set',
              style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: ctrl.text.isNotEmpty
                      ? Color(0xFF1B4D3E)
                      : Color(0xFF9CA3AF))),
      ]),
    );
  }
}

class _ActionRow extends StatelessWidget {
  final IconData icon;
  final String label, sub;
  final VoidCallback onTap;
  final bool danger;

  const _ActionRow(
      {required this.icon,
      required this.label,
      required this.sub,
      required this.onTap,
      this.danger = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(children: [
          Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                  color: danger ? Color(0xFFFEE2E2) : Color(0xFFF0F5F3),
                  borderRadius: BorderRadius.circular(12)),
              child: Icon(icon,
                  size: 17,
                  color: danger ? Color(0xFFEF4444) : Color(0xFF1B4D3E))),
          SizedBox(width: 14),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: danger ? Color(0xFFEF4444) : Color(0xFF1B4D3E))),
                Text(sub,
                    style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
              ])),
          Icon(Icons.chevron_right, size: 16, color: Color(0xFFD1D5DB)),
        ]),
      ),
    );
  }
}

class _LoadingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(
      backgroundColor: Color(0xFFF3F4F6),
      body: Center(
          child: CircularProgressIndicator(
              color: Color(0xFF1B4D3E), strokeWidth: 2.5)));
}
