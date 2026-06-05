import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/user_profile_controller.dart';

class GuardianSectionWidget extends StatelessWidget {
  const GuardianSectionWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.find<UserProfileController>();

    return Obx(() => Container(
      padding: EdgeInsets.all(24),
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                color: Color(0xFFF0F5F3),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.shield_outlined, size: 16, color: Color(0xFF1B4D3E)),
            ),
            SizedBox(width: 8),
            Text('GUARDIAN (WALI)',
                style: TextStyle(
                    fontSize: 14, fontWeight: FontWeight.w700,
                    color: Color(0xFF1B4D3E), letterSpacing: 0.3)),
          ]),
          SizedBox(height: 16),

          // Info banner
          Container(
            padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            margin: EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Color(0xFF1B4D3E).withOpacity(0.05),
              border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.2)),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '🔒 Guardian details are private and only shared after mutual interest is established.',
              style: TextStyle(fontSize: 12, color: Color(0xFF1B4D3E), height: 1.5),
            ),
          ),

          // Guardian content
          if (ctrl.hasGuardian.value && ctrl.guardian.value != null)
            _GuardianDetails(
              guardian: ctrl.guardian.value!,
              onRemove: () => _confirmRemove(context, ctrl),
            )
          else
            _ManageButton(),
        ],
      ),
    ));
  }

  void _confirmRemove(BuildContext context, UserProfileController ctrl) {
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
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 30)],
            ),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 56, height: 56,
                decoration: BoxDecoration(color: Color(0xFFFEE2E2), shape: BoxShape.circle),
                child: Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 28)),
              SizedBox(height: 16),
              Text('Remove Guardian?',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF1B4D3E))),
              SizedBox(height: 8),
              Text('Your guardian will no longer be able to view your profile or approve interests.',
                  style: TextStyle(fontSize: 13, color: Color(0xFF6B7280), height: 1.5),
                  textAlign: TextAlign.center),
              SizedBox(height: 20),
              Row(children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => Get.back(),
                    child: Container(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        border: Border.all(color: Color(0xFFE5E7EB), width: 2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(child: Text('Cancel',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF6B7280)))),
                    ),
                  ),
                ),
                SizedBox(width: 10),
                Expanded(
                  child: GestureDetector(
                    onTap: () { Get.back(); ctrl.removeGuardian(); },
                    child: Container(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: Color(0xFFEF4444),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(child: Text('Remove',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white))),
                    ),
                  ),
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

class _GuardianDetails extends StatelessWidget {
  final Map<String, dynamic> guardian;
  final VoidCallback onRemove;

  const _GuardianDetails({required this.guardian, required this.onRemove});

  String? get _avatar {
    try {
      final imgs = guardian['guardianUser']?['profile']?['images'];
      if (imgs == null) return null;
      final list = imgs is List ? imgs : (imgs as String).split(',');
      return list.isNotEmpty ? list.first.toString().trim() : null;
    } catch (_) { return null; }
  }

  @override
  Widget build(BuildContext context) {
    final gUser    = guardian['guardianUser'] ?? {};
    final gProfile = gUser['profile'] ?? {};

    return Column(children: [
      // Avatar + name
      Container(
        padding: EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: Color(0xFFF0F5F3))),
        ),
        child: Row(children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Color(0xFFF0F5F3),
            backgroundImage: _avatar != null ? NetworkImage(_avatar!) : null,
            child: _avatar == null
                ? Icon(Icons.shield_outlined, size: 24, color: Color(0xFF1B4D3E))
                : null,
          ),
          SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(gProfile['name']?.toString() ?? gUser['email']?.toString() ?? 'Guardian',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1B4D3E))),
            Text(guardian['relationship']?.toString() ?? 'Guardian',
                style: TextStyle(fontSize: 12, color: Color(0xFF1B4D3E).withOpacity(0.7))),
          ])),
        ]),
      ),
      SizedBox(height: 12),

      // Contact details
      if (gUser['mobile'] != null)
        _ContactRow(icon: Icons.phone, label: gUser['mobile'].toString(), sub: 'Phone'),
      if (gUser['email'] != null)
        _ContactRow(icon: Icons.email_outlined, label: gUser['email'].toString(), sub: 'Email'),

      SizedBox(height: 12),

      // Action buttons
      Row(children: [
        Expanded(
          child: GestureDetector(
            onTap: () => Get.toNamed('/individual/show-pin'),
            child: Container(
              padding: EdgeInsets.symmetric(vertical: 10, horizontal: 18),
              decoration: BoxDecoration(
                border: Border.all(color: Color(0xFF1B4D3E), width: 1.5),
                borderRadius: BorderRadius.circular(10),
                color: Colors.white,
              ),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.edit_outlined, size: 14, color: Color(0xFF1B4D3E)),
                SizedBox(width: 8),
                Text('Manage', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1B4D3E))),
              ]),
            ),
          ),
        ),
        SizedBox(width: 8),
        Expanded(
          child: GestureDetector(
            onTap: onRemove,
            child: Container(
              padding: EdgeInsets.symmetric(vertical: 10, horizontal: 18),
              decoration: BoxDecoration(
                border: Border.all(color: Color(0xFFEF4444), width: 1.5),
                borderRadius: BorderRadius.circular(10),
                color: Colors.white,
              ),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.delete_outline, size: 14, color: Color(0xFFEF4444)),
                SizedBox(width: 8),
                Text('Remove', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFFEF4444))),
              ]),
            ),
          ),
        ),
      ]),
    ]);
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String label, sub;
  const _ContactRow({required this.icon, required this.label, required this.sub});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10),
      child: Row(children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(color: Color(0xFFF0F5F3), shape: BoxShape.circle),
          child: Icon(icon, size: 16, color: Color(0xFF1B4D3E)),
        ),
        SizedBox(width: 12),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: TextStyle(fontSize: 13, color: Color(0xFF1B4D3E), fontWeight: FontWeight.w500)),
          Text(sub, style: TextStyle(fontSize: 11, color: Color(0xFF1B4D3E).withOpacity(0.5))),
        ]),
      ]),
    );
  }
}

class _ManageButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Get.toNamed('/individual/show-pin'),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(
          border: Border.all(color: Color(0xFF1B4D3E), width: 2),
          borderRadius: BorderRadius.circular(12),
          color: Colors.white,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(children: [
              Icon(Icons.shield_outlined, size: 18, color: Color(0xFF1B4D3E)),
              SizedBox(width: 10),
              Text('Manage Guardian',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1B4D3E))),
            ]),
            Icon(Icons.chevron_right, size: 18, color: Color(0xFF1B4D3E)),
          ],
        ),
      ),
    );
  }
}
