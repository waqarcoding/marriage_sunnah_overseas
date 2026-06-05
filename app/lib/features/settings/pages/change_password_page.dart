import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../services/settings_service.dart';
import '../widgets/settings_widgets.dart';

class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({Key? key}) : super(key: key);

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final _currentCtrl = TextEditingController();
  final _nextCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _showCurrent = false, _showNext = false, _showConfirm = false;
  bool _loading = false;
  bool _success = false;
  String _error = '';

  int get _strength {
    final p = _nextCtrl.text;
    if (p.isEmpty) return 0;
    int s = 0;
    if (p.length >= 8) s++;
    if (RegExp(r'[A-Z]').hasMatch(p)) s++;
    if (RegExp(r'[0-9]').hasMatch(p)) s++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(p)) s++;
    return s;
  }

  static const _strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  static const _strengthColors = [
    Color(0xFF9CA3AF),
    Color(0xFFEF4444),
    Color(0xFFF59E0B),
    Color(0xFF10B981),
    Color(0xFF1B4D3E),
  ];

  Future<void> _submit() async {
    setState(() { _error = ''; });
    if (_currentCtrl.text.isEmpty) { setState(() => _error = 'Enter your current password'); return; }
    if (_nextCtrl.text.length < 8) { setState(() => _error = 'New password must be at least 8 characters'); return; }
    if (_nextCtrl.text != _confirmCtrl.text) { setState(() => _error = "Passwords don't match"); return; }

    setState(() => _loading = true);
    try {
      final service = Get.find<UserSettingsService>();
      final res = await service.changePassword({
        'current_password': _currentCtrl.text,
        'new_password': _nextCtrl.text,
      });
      if (res != null && res['success'] == true) {
        setState(() { _success = true; _loading = false; });
        await Future.delayed(Duration(milliseconds: 1800));
        Get.back();
      } else {
        setState(() { _error = res?['message'] ?? 'Failed to update password'; _loading = false; });
      }
    } catch (e) {
      setState(() { _error = 'Failed to update password'; _loading = false; });
    }
  }

  @override
  void dispose() {
    _currentCtrl.dispose();
    _nextCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF0F5F3),
      body: Column(
        children: [
          SubPageHeader(title: 'Change Password', onBack: () => Get.back()),

          Expanded(
            child: SingleChildScrollView(
              child: Center(
                child: Container(
                  constraints: BoxConstraints(maxWidth: 400),
                  padding: EdgeInsets.fromLTRB(20, 32, 20, 40),
                  child: Column(
                    children: [
                      // Lock icon
                      Container(
                        width: 64, height: 64,
                        decoration: BoxDecoration(
                          color: Color(0xFF1B4D3E),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.25), blurRadius: 24, offset: Offset(0, 8))],
                        ),
                        child: Icon(Icons.lock_outline, color: Colors.white, size: 28),
                      ),
                      SizedBox(height: 20),
                      Text('Update Password',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Color(0xFF1B4D3E))),
                      SizedBox(height: 6),
                      Text('Choose a strong password to keep your account secure',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 13, color: Color(0xFF9CA3AF), height: 1.5)),
                      SizedBox(height: 24),

                      // Success banner
                      AnimatedSize(
                        duration: Duration(milliseconds: 200),
                        child: _success
                            ? Container(
                                margin: EdgeInsets.only(bottom: 16),
                                padding: EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: Color(0xFFF0FDF4),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: Color(0xFFBBF7D0)),
                                ),
                                child: Row(
                                  children: [
                                    Icon(Icons.verified_user_outlined, size: 20, color: Color(0xFF16A34A)),
                                    SizedBox(width: 10),
                                    Text('Password updated successfully!',
                                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF15803D))),
                                  ],
                                ),
                              )
                            : SizedBox.shrink(),
                      ),

                      // Error banner
                      AnimatedSize(
                        duration: Duration(milliseconds: 200),
                        child: _error.isNotEmpty
                            ? Container(
                                margin: EdgeInsets.only(bottom: 16),
                                padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  color: Color(0xFFFFF1F2),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Color(0xFFFECDD3)),
                                ),
                                child: Text(_error,
                                    style: TextStyle(fontSize: 13, color: Color(0xFFBE123C))),
                              )
                            : SizedBox.shrink(),
                      ),

                      // Card
                      Container(
                        padding: EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.07), blurRadius: 16)],
                          border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.07)),
                        ),
                        child: Column(
                          children: [
                            _PasswordField(
                              label: 'Current password',
                              controller: _currentCtrl,
                              show: _showCurrent,
                              onToggle: () => setState(() => _showCurrent = !_showCurrent),
                            ),
                            _Divider(),
                            _PasswordField(
                              label: 'New password',
                              controller: _nextCtrl,
                              show: _showNext,
                              onToggle: () => setState(() => _showNext = !_showNext),
                              onChanged: (_) => setState(() {}),
                            ),

                            // Strength bar
                            if (_nextCtrl.text.isNotEmpty)
                              Padding(
                                padding: EdgeInsets.only(top: 10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: List.generate(4, (i) => Expanded(
                                        child: Container(
                                          margin: EdgeInsets.only(right: i < 3 ? 4 : 0),
                                          height: 4,
                                          decoration: BoxDecoration(
                                            color: i < _strength ? _strengthColors[_strength] : Color(0xFFE5E7EB),
                                            borderRadius: BorderRadius.circular(2),
                                          ),
                                        ),
                                      )),
                                    ),
                                    SizedBox(height: 4),
                                    Text(_strengthLabels[_strength],
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600,
                                            color: _strengthColors[_strength])),
                                  ],
                                ),
                              ),

                            _Divider(),
                            _PasswordField(
                              label: 'Confirm new password',
                              controller: _confirmCtrl,
                              show: _showConfirm,
                              onToggle: () => setState(() => _showConfirm = !_showConfirm),
                              hasError: _confirmCtrl.text.isNotEmpty && _nextCtrl.text != _confirmCtrl.text,
                              onChanged: (_) => setState(() {}),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 16),

                      // Password tips
                      ..._tips.map((tip) => Padding(
                        padding: EdgeInsets.symmetric(vertical: 3),
                        child: Row(
                          children: [
                            AnimatedContainer(
                              duration: Duration(milliseconds: 200),
                              width: 18, height: 18,
                              decoration: BoxDecoration(
                                color: tip['check']! ? Color(0xFF1B4D3E) : Color(0xFFE5E7EB),
                                shape: BoxShape.circle,
                              ),
                              child: tip['check']! ? Center(child: Icon(Icons.check, size: 11, color: Colors.white)) : null,
                            ),
                            SizedBox(width: 8),
                            Text(tip['text']!,
                                style: TextStyle(fontSize: 12,
                                    color: tip['check']! ? Color(0xFF1B4D3E) : Color(0xFF9CA3AF))),
                          ],
                        ),
                      )),

                      SizedBox(height: 24),

                      // Submit button
                      GestureDetector(
                        onTap: _loading || _success ? null : _submit,
                        child: AnimatedContainer(
                          duration: Duration(milliseconds: 200),
                          width: double.infinity,
                          height: 48,
                          decoration: BoxDecoration(
                            color: _loading || _success
                                ? Color(0xFF1B4D3E).withOpacity(0.8)
                                : Color(0xFF1B4D3E),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Center(
                            child: _loading
                                ? SizedBox(width: 20, height: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : Text('Update Password',
                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> get _tips => [
    {'text': 'At least 8 characters', 'check': _nextCtrl.text.length >= 8},
    {'text': 'One uppercase letter', 'check': RegExp(r'[A-Z]').hasMatch(_nextCtrl.text)},
    {'text': 'One number', 'check': RegExp(r'[0-9]').hasMatch(_nextCtrl.text)},
    {'text': 'One special character', 'check': RegExp(r'[^A-Za-z0-9]').hasMatch(_nextCtrl.text)},
  ];
}

class _PasswordField extends StatefulWidget {
  final String label;
  final TextEditingController controller;
  final bool show;
  final VoidCallback onToggle;
  final bool hasError;
  final ValueChanged<String>? onChanged;

  const _PasswordField({
    required this.label, required this.controller,
    required this.show, required this.onToggle,
    this.hasError = false, this.onChanged,
  });

  @override
  State<_PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<_PasswordField> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    final borderColor = widget.hasError
        ? Color(0xFFFCA5A5)
        : _focused ? Color(0xFF1B4D3E) : Color(0xFF1B4D3E).withOpacity(0.12);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF6B7280))),
        SizedBox(height: 8),
        Container(
          height: 48,
          decoration: BoxDecoration(
            color: widget.hasError ? Color(0xFFFFF5F5) : Color(0xFFF0F5F3),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor, width: 1.5),
          ),
          child: Row(
            children: [
              SizedBox(width: 14),
              Icon(Icons.lock_outline, size: 16,
                  color: _focused ? Color(0xFF1B4D3E) : Color(0xFF9CA3AF)),
              SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: widget.controller,
                  obscureText: !widget.show,
                  onChanged: widget.onChanged,
                  onTap: () => setState(() => _focused = true),
                  onEditingComplete: () => setState(() => _focused = false),
                  decoration: InputDecoration(
                    hintText: '••••••••',
                    hintStyle: TextStyle(color: Color(0xFF9CA3AF)),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                  style: TextStyle(fontSize: 14, color: Color(0xFF1A1A1A)),
                ),
              ),
              GestureDetector(
                onTap: widget.onToggle,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 14),
                  child: Icon(
                    widget.show ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    size: 16, color: Color(0xFF9CA3AF),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Container(margin: EdgeInsets.symmetric(vertical: 16), height: 1,
          color: Color(0xFF1B4D3E).withOpacity(0.06));
}
