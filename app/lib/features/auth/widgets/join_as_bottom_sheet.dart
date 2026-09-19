import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:app/features/auth/services/auth_service.dart';
import 'package:flutter/material.dart';

/// Colors pulled from the design
class _JoinAsColors {
  static const darkGreen = Color(0xFF1B4332);
  static const selectedBg = Color(0xFFEFF3EF);
  static const selectedBorder = Color(0xFF1B4332);
  static const unselectedBorder = Color(0xFFE1E4E8);
  static const iconBg = Color(0xFFF1F2F4);
  static const subtitleGrey = Color(0xFF98A2B3);
  static const linkGrey = Color(0xFF98A2B3);
}

enum JoinAsRole { individual, guardian }

const double _desktopBreakpoint = 1024;

/// [onSubmit] is called with the chosen role when Submit is tapped.
/// Return `true` on success (the sheet will close and return the role),
/// or `false`/throw on failure (the sheet stays open so the user can retry).
///
/// On mobile this shows as a bottom sheet (unchanged behavior).
/// On desktop (width > 1024) it shows as a centered dialog instead.
Future<JoinAsRole?> showJoinAsBottomSheet(
  BuildContext context, {
  required Future<bool> Function(JoinAsRole role) onSubmit,
}) {
  final isDesktop = MediaQuery.of(context).size.width > _desktopBreakpoint;

  if (isDesktop) {
    return showDialog<JoinAsRole>(
      context: context,
      barrierDismissible: true,
      builder: (context) => Center(
        child: Material(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: _JoinAsSheet(onSubmit: onSubmit),
          ),
        ),
      ),
    );
  }

  return showModalBottomSheet<JoinAsRole>(
    context: context,
    isScrollControlled: true,
    isDismissible: true,
    enableDrag: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (context) => _JoinAsSheet(onSubmit: onSubmit),
  );
}

class _JoinAsSheet extends StatefulWidget {
  final Future<bool> Function(JoinAsRole role) onSubmit;

  const _JoinAsSheet({required this.onSubmit});

  @override
  State<_JoinAsSheet> createState() => _JoinAsSheetState();
}

class _JoinAsSheetState extends State<_JoinAsSheet> {
  JoinAsRole _selected = JoinAsRole.guardian;
  bool _isSubmitting = false;

  Future<void> _handleSubmit() async {
    setState(() => _isSubmitting = true);
    bool success = false;
    try {
      success = await widget.onSubmit(_selected);
    } catch (_) {
      success = false;
    }
    if (!mounted) return;
    if (success) {
      Navigator.pop(context, _selected);
    } else {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Join as',
              style: TextStyle(
                fontFamily: 'Georgia', // swap for your serif/display font
                fontSize: 32,
                fontWeight: FontWeight.w700,
                color: _JoinAsColors.darkGreen,
                height: 1.1,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Choose how you want to register',
              style: TextStyle(
                fontSize: 16,
                color: _JoinAsColors.subtitleGrey,
              ),
            ),
            const SizedBox(height: 28),
            _RoleCard(
              icon: Icons.person_outline,
              title: 'Individual',
              subtitle: 'Looking for a life partner',
              selected: _selected == JoinAsRole.individual,
              onTap: _isSubmitting
                  ? null
                  : () => setState(() => _selected = JoinAsRole.individual),
            ),
            const SizedBox(height: 16),
            _RoleCard(
              icon: Icons.shield_outlined,
              title: 'Guardian (Wali)',
              subtitle: 'Managing on behalf of a family member',
              selected: _selected == JoinAsRole.guardian,
              onTap: _isSubmitting
                  ? null
                  : () => setState(() => _selected = JoinAsRole.guardian),
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _JoinAsColors.darkGreen,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor:
                      _JoinAsColors.darkGreen.withOpacity(0.7),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'Submit',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback? onTap;

  const _RoleCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? _JoinAsColors.selectedBg : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected
                ? _JoinAsColors.selectedBorder
                : _JoinAsColors.unselectedBorder,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: _JoinAsColors.iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: _JoinAsColors.darkGreen,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                      color: _JoinAsColors.darkGreen,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 14,
                      color: _JoinAsColors.subtitleGrey,
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
