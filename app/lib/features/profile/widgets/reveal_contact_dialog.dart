import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/profile_detail_controller.dart';

class RevealContactDialog extends StatelessWidget {
  final bool isOpen;
  final VoidCallback onClose;
  final VoidCallback onConfirm;
  final String? revealType;
  final int creditCost;
  final int? creditsRemaining;
  final bool unlimitedReveals;
  final String targetUserName;
  final Map<String, dynamic> approvalStatus;

  const RevealContactDialog({
    Key? key,
    required this.isOpen,
    required this.onClose,
    required this.onConfirm,
    this.revealType,
    required this.creditCost,
    this.creditsRemaining,
    this.unlimitedReveals = false,
    required this.targetUserName,
    required this.approvalStatus,
  }) : super(key: key);

  String get _revealTypeText {
    switch (revealType) {
      case 'phone': return 'phone number';
      case 'email': return 'email address';
      case 'both': return 'phone number and email address';
      default: return 'contact details';
    }
  }

  bool _isFullyApproved() {
    if (approvalStatus['interestExists'] != true) return false;
    if (approvalStatus['interestAccepted'] != true) return false;
    if (approvalStatus['guardiansInvolved'] == true && approvalStatus['guardiansApproved'] != true) return false;
    return true;
  }

  bool get _canAfford => unlimitedReveals || (creditsRemaining != null && creditsRemaining! >= creditCost);
  bool get _canReveal => _canAfford && _isFullyApproved();

  @override
  Widget build(BuildContext context) {
    if (!isOpen) return SizedBox.shrink();

    return GestureDetector(
      onTap: () {},
      child: Container(
        margin: EdgeInsets.all(16),
        constraints: BoxConstraints(maxWidth: 440),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.2), blurRadius: 60, offset: Offset(0, 20)),
          ],
        ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Header
                  Container(
                    padding: EdgeInsets.fromLTRB(24, 24, 24, 20),
                    decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.08)))),
                    child: Stack(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 56, height: 56,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Icon(Icons.lock_open_outlined, size: 28, color: Colors.white),
                            ),
                            SizedBox(height: 16),
                            Text('Reveal Contact Details',
                                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, color: Color(0xFF1B4D3E), letterSpacing: -0.01)),
                            SizedBox(height: 8),
                            RichText(
                              text: TextSpan(
                                style: TextStyle(fontSize: 14, color: Color(0xFF6B7280), height: 1.5),
                                children: [
                                  TextSpan(text: "You're about to reveal $_revealTypeText for "),
                                  TextSpan(text: targetUserName, style: TextStyle(fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        Positioned(
                          top: 0, right: 0,
                          child: GestureDetector(
                            onTap: onClose,
                            child: Container(
                              width: 32, height: 32,
                              decoration: BoxDecoration(color: Color(0xFFF5F5F4), borderRadius: BorderRadius.circular(8)),
                              child: Icon(Icons.close, size: 18, color: Color(0xFF78716C)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Content
                  Padding(
                    padding: EdgeInsets.all(24),
                    child: Column(
                      children: [
                        // Approval checklist
                        Container(
                          padding: EdgeInsets.all(16),
                          decoration: BoxDecoration(color: Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(12)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('VERIFICATION STATUS',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF1B4D3E), letterSpacing: 0.05)),
                              SizedBox(height: 12),
                              _CheckRow(ok: approvalStatus['interestExists'] == true, label: 'Interest sent/received'),
                              SizedBox(height: 10),
                              _CheckRow(ok: approvalStatus['interestAccepted'] == true, label: 'Both users accepted'),
                              if (approvalStatus['guardiansInvolved'] == true) ...[
                                SizedBox(height: 10),
                                _CheckRow(ok: approvalStatus['guardiansApproved'] == true, label: 'Both families approved'),
                              ],
                              SizedBox(height: 10),
                              _CheckRow(
                                ok: _canAfford,
                                label: unlimitedReveals
                                    ? 'Unlimited reveals (Premium)'
                                    : 'Sufficient credits (${creditsRemaining ?? 0} available)',
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: 20),

                        // Cost info
                        if (!unlimitedReveals)
                          Container(
                            padding: EdgeInsets.fromLTRB(16, 14, 16, 14),
                            margin: EdgeInsets.only(bottom: 20),
                            decoration: BoxDecoration(
                              color: Color(0xFFFFFBEB),
                              border: Border.all(color: Color(0xFFFBBF24).withOpacity(0.2)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.credit_card, size: 20, color: Color(0xFFD97706)),
                                SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Cost: $creditCost Credits',
                                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF92400E))),
                                      Text(
                                        'Remaining after: ${(creditsRemaining ?? 0) >= creditCost ? (creditsRemaining ?? 0) - creditCost : (creditsRemaining ?? 0)} credits',
                                        style: TextStyle(fontSize: 12, color: Color(0xFFB45309)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),

                        // Privacy notice
                        Container(
                          padding: EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Color(0xFFF0F9FF),
                            border: Border.all(color: Color(0xFF2563EB).withOpacity(0.15)),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.shield_outlined, size: 18, color: Color(0xFF2563EB)),
                              SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Privacy Notice',
                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E40AF))),
                                    SizedBox(height: 4),
                                    Text(
                                      "The user will be notified that you've unlocked their contact details. Please use this information respectfully.",
                                      style: TextStyle(fontSize: 11, color: Color(0xFF1E40AF), height: 1.5),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Footer
                  Container(
                    padding: EdgeInsets.fromLTRB(24, 20, 24, 24),
                    decoration: BoxDecoration(border: Border(top: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.08)))),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: onClose,
                            child: Container(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(color: Color(0xFFF5F5F4), borderRadius: BorderRadius.circular(12)),
                              child: Center(
                                child: Text('Cancel',
                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF57534E))),
                              ),
                            ),
                          ),
                        ),
                        SizedBox(width: 12),
                        Expanded(
                          child: GestureDetector(
                            onTap: _canReveal ? onConfirm : null,
                            child: AnimatedContainer(
                              duration: Duration(milliseconds: 200),
                              padding: EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                gradient: _canReveal
                                    ? LinearGradient(colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)], begin: Alignment.topLeft, end: Alignment.bottomRight)
                                    : null,
                                color: _canReveal ? null : Colors.grey[300],
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  unlimitedReveals ? 'Reveal Now (Free)' : 'Reveal for $creditCost Credits',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
        ),
      ),
    );
  }
}

class _CheckRow extends StatelessWidget {
  final bool ok;
  final String label;
  const _CheckRow({required this.ok, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          ok ? Icons.check_circle : Icons.error_outline,
          size: 18,
          color: ok ? Color(0xFF059669) : Color(0xFFDC2626),
        ),
        SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: ok ? Color(0xFF059669) : Color(0xFFDC2626)),
          ),
        ),
      ],
    );
  }
}
