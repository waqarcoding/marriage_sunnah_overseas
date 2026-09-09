import 'package:app/core/widgets/islamic_page_header.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../controllers/link_ward_controller.dart';

class LinkWardPage extends StatelessWidget {
  const LinkWardPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.put(LinkWardController());

    return Scaffold(
      backgroundColor: Color(0xFFF3F4F6),
      body: SafeArea(
        child: Obx(() {
          if (ctrl.view.value == 'loading') return _LoadingView();

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header

                // Page header
                IslamicPageHeader(
                  title: 'My Wards',
                  subtitle: 'Manage linked individuals',
                  icon: Icon(Icons.settings_outlined,
                      color: Colors.white, size: 18),
                ),

                // Wards list
                if (ctrl.wards.isNotEmpty) ...[
                  ...ctrl.wards.map((ward) => Padding(
                        padding: EdgeInsets.all(10),
                        child: _WardCard(ward: ward, ctrl: ctrl),
                      )),
                  SizedBox(height: 12),
                ],

                // Add new button or form
                if (ctrl.view.value == 'not-linked' || ctrl.showAddNew.value)
                  Padding(
                    padding: EdgeInsets.all(10),
                    child: _PinLinkSection(ctrl: ctrl),
                  )
              ],
            ),
          );
        }),
      ),
    );
  }
}

// ─── Ward card ────────────────────────────────────────────────────────────────
class _WardCard extends StatelessWidget {
  final Map<String, dynamic> ward;
  final LinkWardController ctrl;
  const _WardCard({required this.ward, required this.ctrl});

  @override
  Widget build(BuildContext context) {
    final name = ward['name']?.toString() ?? 'Unknown';
    final email = ward['email']?.toString() ?? '';
    final phone = ward['phone']?.toString() ?? '';
    final city = ward['city']?.toString() ?? '';
    final country = ward['country']?.toString() ?? '';
    final relation = ward['relationship']?.toString() ?? 'Guardian';
    final avatar = ward['avatar']?.toString() ?? '';
    final location = [city, country].where((s) => s.isNotEmpty).join(', ');

    return Container(
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 12)
        ],
      ),
      child: Column(children: [
        Padding(
          padding: EdgeInsets.all(20),
          child: Column(children: [
            // Avatar + name
            Row(children: [
              avatar.isNotEmpty
                  ? ClipOval(
                      child: Image.network(avatar,
                          width: 56,
                          height: 56,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _Initial(name: name)))
                  : _Initial(name: name),
              SizedBox(width: 14),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(name,
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF111827))),
                    Container(
                      margin: EdgeInsets.only(top: 4),
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                          color: Color(0xFF1B4D3E).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(8)),
                      child: Text(relation,
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1B4D3E))),
                    ),
                  ])),
            ]),
            SizedBox(height: 14),
            Divider(color: Color(0xFFF0F0F0), height: 1),
            SizedBox(height: 14),

            // Contact details
            if (email.isNotEmpty)
              _DetailRow(icon: Icons.email_outlined, text: email),
            if (phone.isNotEmpty)
              _DetailRow(icon: Icons.phone_outlined, text: phone),
            if (location.isNotEmpty)
              _DetailRow(icon: Icons.location_on_outlined, text: location),
            SizedBox(height: 14),

            // Remove button
            Obx(() => GestureDetector(
                  onTap: ctrl.isRemoving.value
                      ? null
                      : () => _confirmRemove(context, ward, ctrl),
                  child: Container(
                    width: double.infinity,
                    padding: EdgeInsets.symmetric(vertical: 11),
                    decoration: BoxDecoration(
                      border: Border.all(color: Color(0xFFFCA5A5), width: 1.5),
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.white,
                    ),
                    child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (ctrl.isRemoving.value)
                            SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(
                                    color: Color(0xFFDC2626), strokeWidth: 2))
                          else
                            Icon(Icons.delete_outline,
                                size: 15, color: Color(0xFFDC2626)),
                          SizedBox(width: 6),
                          Text('Remove Ward',
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFFDC2626))),
                        ]),
                  ),
                )),
          ]),
        ),
      ]),
    );
  }

  void _confirmRemove(BuildContext ctx, Map ward, LinkWardController ctrl) {
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
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.15), blurRadius: 30)
                ]),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                      color: Color(0xFFFEE2E2), shape: BoxShape.circle),
                  child: Icon(Icons.warning_amber_rounded,
                      color: Color(0xFFEF4444), size: 28)),
              SizedBox(height: 16),
              Text('Remove Ward?',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF111827))),
              SizedBox(height: 8),
              Text(
                  '${ward['name']} will be unlinked from your guardian account.',
                  style: TextStyle(
                      fontSize: 13, color: Color(0xFF6B7280), height: 1.5),
                  textAlign: TextAlign.center),
              SizedBox(height: 20),
              Row(children: [
                Expanded(
                    child: GestureDetector(
                  onTap: () => Get.back(),
                  child: Container(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                          border:
                              Border.all(color: Color(0xFFE5E7EB), width: 2),
                          borderRadius: BorderRadius.circular(12)),
                      child: Center(
                          child: Text('Cancel',
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF6B7280))))),
                )),
                SizedBox(width: 10),
                Expanded(
                  child: GestureDetector(
                      onTap: () {
                        Get.back();
                        print(ward);

                        ctrl.removeWard(ward['id']);
                      },
                      child: Container(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                              color: Color(0xFFEF4444),
                              borderRadius: BorderRadius.circular(12)),
                          child: Center(
                              child: Text('Remove',
                                  style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white))))),
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

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _DetailRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.only(bottom: 8),
        child: Row(children: [
          Icon(icon, size: 15, color: Color(0xFF9CA3AF)),
          SizedBox(width: 8),
          Expanded(
              child: Text(text,
                  style: TextStyle(fontSize: 13, color: Color(0xFF374151)),
                  overflow: TextOverflow.ellipsis)),
        ]),
      );
}

// ─── PIN link section ─────────────────────────────────────────────────────────
class _PinLinkSection extends StatelessWidget {
  final LinkWardController ctrl;
  const _PinLinkSection({required this.ctrl});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      // Step 3: success
      if (ctrl.step.value == 3) {
        return _SuccessView();
      }

      // Step 2: confirm
      if (ctrl.step.value == 2 && ctrl.wardDetails.value != null) {
        return _ConfirmStep(ctrl: ctrl);
      }

      // Step 1: enter PIN
      return _EnterPinStep(ctrl: ctrl);
    });
  }
}

class _EnterPinStep extends StatelessWidget {
  final LinkWardController ctrl;
  const _EnterPinStep({required this.ctrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 12)
        ],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                  gradient: LinearGradient(
                      colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)]),
                  borderRadius: BorderRadius.circular(12)),
              child: Icon(Icons.key, size: 20, color: Colors.white)),
          SizedBox(width: 12),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Enter Ward\'s PIN',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF111827))),
            Text('Ask your ward for their 6-digit PIN',
                style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
          ]),
        ]),
        SizedBox(height: 20),

        // PIN input
        TextField(
          keyboardType: TextInputType.number,
          maxLength: 6,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          textAlign: TextAlign.center,
          style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              letterSpacing: 8,
              color: Color(0xFF1B4D3E)),
          onChanged: (v) => ctrl.pin.value = v,
          decoration: InputDecoration(
            hintText: '••••••',
            hintStyle: TextStyle(
                fontSize: 24, color: Color(0xFF9CA3AF), letterSpacing: 8),
            counterText: '',
            filled: true,
            fillColor: Color(0xFFF9FAFB),
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide:
                    BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.2))),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: Color(0xFF1B4D3E), width: 2)),
            contentPadding: EdgeInsets.symmetric(vertical: 16),
          ),
        ),
        SizedBox(height: 16),

        // Verify button
        Obx(() => GestureDetector(
              onTap: ctrl.isLoading.value ? null : ctrl.verifyPin,
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                    gradient: LinearGradient(
                        colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)]),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                          color: Color(0xFF1B4D3E).withOpacity(0.25),
                          blurRadius: 12)
                    ]),
                child: Center(
                  child: ctrl.isLoading.value
                      ? SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.search, size: 16, color: Colors.white),
                          SizedBox(width: 8),
                          Text('Verify PIN',
                              style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white)),
                        ]),
                ),
              ),
            )),
      ]),
    );
  }
}

class _ConfirmStep extends StatelessWidget {
  final LinkWardController ctrl;
  const _ConfirmStep({required this.ctrl});

  @override
  Widget build(BuildContext context) {
    final ward = ctrl.wardDetails.value!;
    final profile = ward['profile'] ?? ward;
    final name = profile['name']?.toString() ?? 'Unknown';

    return Container(
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
                color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 12)
          ]),
      child: Column(children: [
        Icon(Icons.person_pin, size: 48, color: Color(0xFF1B4D3E)),
        SizedBox(height: 12),
        Text('Link with $name?',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Color(0xFF111827))),
        SizedBox(height: 6),
        Text('Select your relationship to confirm',
            style: TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
        SizedBox(height: 20),

        // Relationship dropdown
        Container(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
              border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.2)),
              borderRadius: BorderRadius.circular(12)),
          child: Obx(() => DropdownButton<String>(
                value: ctrl.relationship.value,
                isExpanded: true,
                underline: SizedBox(),
                onChanged: (v) => ctrl.relationship.value = v!,
                items: kRelationships
                    .map((r) => DropdownMenuItem(
                        value: r,
                        child: Text(r, style: TextStyle(fontSize: 14))))
                    .toList(),
              )),
        ),
        SizedBox(height: 16),

        Row(children: [
          Expanded(
              child: GestureDetector(
            onTap: () => ctrl.reset(),
            child: Container(
                padding: EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                    border: Border.all(color: Color(0xFFE5E7EB), width: 1.5),
                    borderRadius: BorderRadius.circular(12)),
                child: Center(
                    child: Text('Back',
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF6B7280))))),
          )),
          SizedBox(width: 10),
          Expanded(
              child: Obx(() => GestureDetector(
                    onTap: ctrl.isLoading.value ? null : ctrl.confirmLink,
                    child: Container(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                          gradient: LinearGradient(
                              colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)]),
                          borderRadius: BorderRadius.circular(12)),
                      child: Center(
                          child: ctrl.isLoading.value
                              ? SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                      color: Colors.white, strokeWidth: 2))
                              : Text('Confirm Link',
                                  style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white))),
                    ),
                  ))),
        ]),
      ]),
    );
  }
}

class _SuccessView extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
        padding: EdgeInsets.all(40),
        decoration: BoxDecoration(
            color: Colors.white, borderRadius: BorderRadius.circular(20)),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                  gradient: LinearGradient(
                      colors: [Color(0xFFD1FAE5), Color(0xFFA7F3D0)]),
                  shape: BoxShape.circle),
              child: Icon(Icons.check_rounded,
                  size: 36, color: Color(0xFF059669))),
          SizedBox(height: 16),
          Text('Ward Linked!',
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF111827))),
          SizedBox(height: 6),
          Text(
              'You are now their guardian. You will receive notifications for their interests.',
              style: TextStyle(
                  fontSize: 13, color: Color(0xFF6B7280), height: 1.5),
              textAlign: TextAlign.center),
        ]),
      );
}

class _AddNewButton extends StatelessWidget {
  final VoidCallback onTap;
  const _AddNewButton({required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
              border: Border.all(
                  color: Color(0xFF1B4D3E), width: 2, style: BorderStyle.solid),
              borderRadius: BorderRadius.circular(16),
              color: Colors.white),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.add, size: 20, color: Color(0xFF1B4D3E)),
            SizedBox(width: 8),
            Text('Link Another Ward',
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1B4D3E))),
          ]),
        ),
      );
}

class _Initial extends StatelessWidget {
  final String name;
  const _Initial({required this.name});

  @override
  Widget build(BuildContext context) => Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
            gradient:
                LinearGradient(colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)]),
            shape: BoxShape.circle),
        child: Center(
            child: Text(name.isNotEmpty ? name[0].toUpperCase() : '?',
                style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFFEF3C7)))),
      );
}

class _LoadingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(
      child: CircularProgressIndicator(
          color: Color(0xFF1B4D3E), strokeWidth: 2.5));
}
