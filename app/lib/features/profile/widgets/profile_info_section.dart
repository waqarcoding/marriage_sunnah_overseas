import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/profile_detail_controller.dart';
import 'reveal_contact_dialog.dart';

class ProfileInfoSection extends StatelessWidget {
  final Map<String, dynamic> p;
  final List<String> interests;
  final VoidCallback onLike;
  final ProfileDetailController ctrl;

  const ProfileInfoSection({
    Key? key,
    required this.p,
    required this.interests,
    required this.onLike,
    required this.ctrl,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final phoneValue = ctrl.revealedPhone.value ?? p['phone']?.toString() ?? p['user']?['mobile']?.toString();
      final emailValue = ctrl.revealedEmail.value ?? p['user']?['email']?.toString();
      final role = ctrl.currentUserRole.value;

      // Show reveal dialog as overlay
      if (ctrl.showRevealDialog.value) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (ctrl.showRevealDialog.value && !(Get.isDialogOpen ?? false)) {
            Get.dialog(
              RevealContactDialog(
                isOpen: true,
                onClose: () { ctrl.showRevealDialog.value = false; Get.back(); },
                onConfirm: () { Get.back(); ctrl.confirmReveal(p['individual_id']); },
                revealType: ctrl.pendingRevealType.value,
                creditCost: ctrl.creditCost[ctrl.pendingRevealType.value ?? 'phone'] ?? 500,
                creditsRemaining: ctrl.creditsRemaining.value,
                unlimitedReveals: ctrl.unlimitedReveals.value,
                targetUserName: p['name']?.toString() ?? '',
                approvalStatus: ctrl.approvalStatus,
              ),
              barrierColor: Colors.black.withOpacity(0.6),
              barrierDismissible: true,
            );
          }
        });
      }

      return Column(
        children: [
          // Quick badges
          Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Wrap(
              spacing: 6, runSpacing: 6,
              children: [
                if (p['marital_status'] != null)
                  _QuickBadge(emoji: '💍', label: p['marital_status'].toString(), bg: Color(0xFFFEF2F2), fg: Color(0xFFDC2626), border: Color(0xFFDC2626).withOpacity(0.15)),
                if (p['religion'] != null)
                  _QuickBadge(emoji: '🕌', label: p['religion'].toString(), bg: Color(0xFFF0FDF4), fg: Color(0xFF16A34A), border: Color(0xFF16A34A).withOpacity(0.15)),
                if (p['nationality'] != null)
                  _QuickBadge(emoji: '🌍', label: p['nationality'].toString(), bg: Color(0xFFEFF6FF), fg: Color(0xFF2563EB), border: Color(0xFF2563EB).withOpacity(0.15)),
                if (p['is_guardian_required'] == true || p['is_guardian_required'] == 1)
                  _QuickBadge(emoji: '🛡️', label: 'Guardian Required', bg: Color(0xFFFAF5FF), fg: Color(0xFF9333EA), border: Color(0xFF9333EA).withOpacity(0.15)),
                if (p['willing_to_relocate'] == 'Yes')
                  _QuickBadge(emoji: '✈️', label: 'Open to Relocate', bg: Color(0xFFF0FDFA), fg: Color(0xFF0D9488), border: Color(0xFF0D9488).withOpacity(0.15)),
                if (ctrl.unlimitedReveals.value)
                  _QuickBadge(emoji: '⭐', label: 'Unlimited Reveals', bg: Color(0xFFFEF3C7), fg: Color(0xFFD97706), border: Color(0xFFD97706).withOpacity(0.15)),
              ],
            ),
          ),

          // Action buttons
          Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _ActionButton(
              onTap: onLike,
              icon: Icons.favorite,
              label: 'Send Interest',
              primary: true,
            ),
          ),

          // Contact Information
          if (phoneValue != null || emailValue != null)
            _Section(
              title: 'Contact Information',
              child: Column(
                children: [
                  if (phoneValue != null)
                    _ContactRow(
                      icon: Icons.phone_outlined,
                      label: 'Phone Number',
                      value: phoneValue,
                      type: 'phone',
                      isRevealed: ctrl.phoneRevealed.value,
                      onUnlock: () => ctrl.openRevealDialog('phone'),
                      isUnlocking: ctrl.isUnlocking.value,
                      creditCost: ctrl.creditCost['phone'] ?? 500,
                      accent: Color(0xFF059669),
                      bg: Color(0xFFD1FAE5),
                      role: role,
                    ),
                  if (emailValue != null)
                    _ContactRow(
                      icon: Icons.email_outlined,
                      label: 'Email Address',
                      value: emailValue,
                      type: 'email',
                      isRevealed: ctrl.emailRevealed.value,
                      onUnlock: () => ctrl.openRevealDialog('email'),
                      isUnlocking: ctrl.isUnlocking.value,
                      creditCost: ctrl.creditCost['email'] ?? 500,
                      accent: Color(0xFF2563EB),
                      bg: Color(0xFFDBEAFE),
                      role: role,
                    ),
                  if (role != 'guardian' && (!ctrl.phoneRevealed.value || !ctrl.emailRevealed.value))
                    Container(
                      margin: EdgeInsets.only(top: 12),
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: Color(0xFFFFFBEB),
                        border: Border.all(color: Color(0xFFFBBF24).withOpacity(0.2)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.lock_outline, size: 14, color: Color(0xFFF59E0B)),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Use credits to unlock contact details and connect directly',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF92400E), height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

          // About
          if (p['bio'] != null && p['bio'].toString().isNotEmpty)
            _Section(
              title: 'About',
              child: Padding(
                padding: EdgeInsets.only(top: 8),
                child: Text(p['bio'].toString(), style: TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.6)),
              ),
            ),

          // Personal
          _Section(
            title: 'Personal',
            child: Column(
              children: [
                _InfoRow(icon: Icons.menu_book_outlined, label: 'Religion', value: p['religion'], accent: Color(0xFF059669), bg: Color(0xFFD1FAE5)),
                _InfoRow(icon: Icons.nightlight_outlined, label: 'Sect', value: p['sect'], accent: Color(0xFF7C3AED), bg: Color(0xFFEDE9FE)),
                _InfoRow(icon: Icons.language, label: 'Nationality', value: p['nationality'], accent: Color(0xFF2563EB), bg: Color(0xFFDBEAFE)),
                _InfoRow(icon: Icons.location_on_outlined, label: 'Marital Status', value: p['marital_status'], accent: Color(0xFFDB2777), bg: Color(0xFFFCE7F3)),
                _InfoRow(icon: Icons.nightlight_outlined, label: 'Practice Level', value: p['religious_practice_level'], accent: Color(0xFF059669), bg: Color(0xFFD1FAE5)),
                _InfoRow(icon: Icons.straighten, label: 'Height', value: p['height'], accent: Color(0xFF0891B2), bg: Color(0xFFE0F2FE)),
                _InfoRow(icon: Icons.person_outline, label: 'Body Type', value: p['body_type'], accent: Color(0xFF64748B), bg: Color(0xFFF1F5F9)),
                _InfoRow(icon: Icons.translate, label: 'Mother Tongue', value: p['mother_tongue'], accent: Color(0xFF0D9488), bg: Color(0xFFCCFBF1)),
                _InfoRow(icon: Icons.people_outline, label: 'Caste', value: p['caste'], accent: Color(0xFF92400E), bg: Color(0xFFFEF3C7)),
                _InfoRow(icon: Icons.child_care_outlined, label: 'Has Children', value: p['has_children'], accent: Color(0xFF6D28D9), bg: Color(0xFFEDE9FE)),
                if (interests.isNotEmpty) ...[
                  SizedBox(height: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('INTERESTS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Color(0xFF9CA3AF), letterSpacing: 0.02)),
                      SizedBox(height: 10),
                      Wrap(
                        spacing: 6, runSpacing: 6,
                        children: interests.map((item) => Container(
                          padding: EdgeInsets.symmetric(horizontal: 11, vertical: 5),
                          decoration: BoxDecoration(
                            color: Color(0xFFF0F5F3),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.12)),
                          ),
                          child: Text(item, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF1B4D3E))),
                        )).toList(),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          // Career
          _Section(
            title: 'Career & Education',
            child: Column(
              children: [
                _InfoRow(icon: Icons.work_outline, label: 'Profession', value: p['profession'], accent: Color(0xFF1D4ED8), bg: Color(0xFFDBEAFE)),
                _InfoRow(icon: Icons.school_outlined, label: 'Education', value: p['education'], accent: Color(0xFF7C3AED), bg: Color(0xFFEDE9FE)),
                _InfoRow(icon: Icons.work_outline, label: 'Employment Type', value: p['employment_type'], accent: Color(0xFF0891B2), bg: Color(0xFFE0F2FE)),
                _InfoRow(icon: Icons.attach_money, label: 'Monthly Salary', value: p['monthly_salary'], accent: Color(0xFF059669), bg: Color(0xFFD1FAE5)),
              ],
            ),
          ),

          // Family
          _Section(
            title: 'Family',
            child: Column(
              children: [
                _InfoRow(icon: Icons.people_outline, label: 'Family Background', value: p['family_background'], accent: Color(0xFFD97706), bg: Color(0xFFFEF3C7)),
                _InfoRow(icon: Icons.people_outline, label: "Father's Occupation", value: p['father_occupation'], accent: Color(0xFF374151), bg: Color(0xFFF3F4F6)),
                _InfoRow(icon: Icons.people_outline, label: "Mother's Occupation", value: p['mother_occupation'], accent: Color(0xFF374151), bg: Color(0xFFF3F4F6)),
                _InfoRow(icon: Icons.people_outline, label: 'Brothers', value: p['brothers'], accent: Color(0xFF1D4ED8), bg: Color(0xFFDBEAFE)),
                _InfoRow(icon: Icons.people_outline, label: 'Sisters', value: p['sisters'], accent: Color(0xFFDB2777), bg: Color(0xFFFCE7F3)),
              ],
            ),
          ),

          SizedBox(height: 32),
        ],
      );
    });
  }
}

// ─── Helper widgets ────────────────────────────────────────────────────────────

class _QuickBadge extends StatelessWidget {
  final String emoji;
  final String label;
  final Color bg, fg, border;
  const _QuickBadge({required this.emoji, required this.label, required this.bg, required this.fg, required this.border});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10), border: Border.all(color: border)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: TextStyle(fontSize: 13)),
          SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: fg)),
        ],
      ),
    );
  }
}

class _ActionButton extends StatefulWidget {
  final VoidCallback onTap;
  final IconData icon;
  final String label;
  final bool primary;
  const _ActionButton({required this.onTap, required this.icon, required this.label, this.primary = false});

  @override
  State<_ActionButton> createState() => _ActionButtonState();
}

class _ActionButtonState extends State<_ActionButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) { setState(() => _pressed = false); widget.onTap(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.96 : 1.0,
        duration: Duration(milliseconds: 100),
        child: Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(vertical: 11),
          decoration: BoxDecoration(
            color: widget.primary ? Color(0xFF1B4D3E) : Color(0xFFFAFAF9),
            borderRadius: BorderRadius.circular(12),
            border: widget.primary ? null : Border.all(color: Color(0xFF1B4D3E).withOpacity(0.12)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(widget.icon, size: 16, color: widget.primary ? Colors.white : Color(0xFF1B4D3E)),
              SizedBox(width: 6),
              Text(widget.label,
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
                      color: widget.primary ? Colors.white : Color(0xFF1B4D3E))),
            ],
          ),
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final Widget child;
  const _Section({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.fromLTRB(16, 16, 16, 0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 12, offset: Offset(0, 2)),
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4, offset: Offset(0, 1)),
        ],
        border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(18, 16, 18, 12),
            child: Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1B4D3E), letterSpacing: 0.01)),
          ),
          Divider(height: 1, color: Color(0xFF1B4D3E).withOpacity(0.08)),
          Padding(padding: EdgeInsets.fromLTRB(18, 4, 18, 18), child: child),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final dynamic value;
  final Color accent, bg;

  const _InfoRow({required this.icon, required this.label, this.value, required this.accent, required this.bg});

  @override
  Widget build(BuildContext context) {
    if (value == null || value.toString().isEmpty) return SizedBox.shrink();
    return Container(
      padding: EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.06)))),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 16, color: accent),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label.toUpperCase(),
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Color(0xFF9CA3AF), letterSpacing: 0.02)),
                SizedBox(height: 2),
                Text(value.toString(),
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF1B4D3E)),
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final String type;
  final bool isRevealed;
  final VoidCallback onUnlock;
  final bool isUnlocking;
  final int creditCost;
  final Color accent, bg;
  final String? role;

  const _ContactRow({
    required this.icon, required this.label, required this.value,
    required this.type, required this.isRevealed, required this.onUnlock,
    required this.isUnlocking, required this.creditCost,
    required this.accent, required this.bg, this.role,
  });

  String get _masked {
    if (isRevealed) return value;
    if (type == 'email') return value.length > 4 ? '****${value.substring(4)}' : value;
    if (type == 'phone') return value.length > 4 ? '${'*' * (value.length - 4)}${value.substring(value.length - 4)}' : value;
    return value.length > 3 ? '${'*' * (value.length - 3)}${value.substring(value.length - 3)}' : value;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.06)))),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 16, color: accent),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label.toUpperCase(),
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Color(0xFF9CA3AF), letterSpacing: 0.02)),
                SizedBox(height: 2),
                Text(_masked,
                    style: TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w500,
                      color: isRevealed ? Color(0xFF1B4D3E) : Color(0xFF9CA3AF),
                      letterSpacing: isRevealed ? 0 : 0.05,
                    ),
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          if (!isRevealed && role != 'guardian')
            GestureDetector(
              onTap: isUnlocking ? null : onUnlock,
              child: AnimatedContainer(
                duration: Duration(milliseconds: 150),
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isUnlocking ? Color(0xFF1B4D3E).withOpacity(0.6) : Color(0xFF1B4D3E),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isUnlocking)
                      SizedBox(width: 12, height: 12, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    else
                      Icon(Icons.lock_open, size: 12, color: Colors.white),
                    SizedBox(width: 4),
                    Text(isUnlocking ? 'Unlocking...' : '$creditCost 💰',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
