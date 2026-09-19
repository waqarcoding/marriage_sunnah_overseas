import 'package:app/bottom_tabs.dart';
import 'package:app/features/auth/pages/otp_page.dart';
import 'package:app/features/auth/services/auth_service.dart';
import 'package:app/data/services/settings_service.dart';
import 'package:app/features/auth/widgets/join_as_bottom_sheet.dart';
import 'package:app/features/guardian/services/guardian_service.dart';
import 'package:app/features/profile/pages/intro_page.dart';
import 'package:app/features/profile/services/profile_service.dart';
import 'package:app/features/userguardian/link_guardian_page.dart';
import 'package:app/features/userprofile/services/user_profile_service.dart';
import 'package:app/features/verification/pages/live_verification_page.dart';
import 'package:app/features/verification/pages/verification_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// ============================================================
// PROFILE PROGRESS CONTROLLER
// ============================================================

class ProfileProgressController extends GetxController {
  // ============================================================
  // COMPLETION STATES
  // ============================================================

  final RxBool isProfileCompleted = false.obs;
  final RxBool isCnicVerified = false.obs;
  final RxBool isGuardianLinked = false.obs;
  final RxBool isGuardianVerified = false.obs;
  final RxBool isAdminApproved = false.obs;

  // ============================================================
  // REQUIRED SETTINGS
  // ============================================================

  final RxBool userVerificationRequired = false.obs;
  final RxBool guardianLinkingRequired = false.obs;
  final RxBool guardianVerificationRequired = false.obs;
  final RxBool manualProfileApproval = false.obs;

  // ============================================================
  // INIT
  // ============================================================

  @override
  void onInit() {
    super.onInit();

    _initialize();
  }

  Future<void> _initialize() async {
    await fetchData();
  }

  // ============================================================
  // FETCH PROFILE PROGRESS
  // ============================================================

  Future<void> fetchData() async {
    try {
      final settingsService = Get.find<SettingsService>();

      // --- LOAD SETTINGS ---
      userVerificationRequired.value = settingsService.userVerificationRequired;
      guardianLinkingRequired.value = settingsService.guardianLinkingRequired;
      guardianVerificationRequired.value =
          settingsService.guardianVerificationRequired;
      manualProfileApproval.value = settingsService.manualProfileApproval;

      print("✅ userVerificationRequired: ${userVerificationRequired.value}");
      print("✅ guardianLinkingRequired: ${guardianLinkingRequired.value}");
      print(
          "✅ guardianVerificationRequired: ${guardianVerificationRequired.value}");
      print("✅ Cnic Verification Required: ${manualProfileApproval.value}");

      // --- GET CURRENT USER ---
      final profileService = ProfileService();
      final user = await profileService.getCurrentUser();

      if (user == null) {
        print("ProfileProgress: current user is null");
        return;
      }

      final profile =
          user['profile'] ?? user['data']?['profile'] ?? user['data'] ?? user;

      // --- PROFILE ---
      isProfileCompleted.value = profile?['is_profile_completed'] == true ||
          profile?['is_profile_completed'] == 1;

      // --- CNIC / USER VERIFICATION as admin approved by default if verified ---
      isAdminApproved.value = user['is_verified'] == true ||
          user['is_verified'] == 1 ||
          profile?['is_verified'] == true ||
          profile?['is_verified'] == 1;

      // --- GUARDIAN ---
      if (!guardianLinkingRequired.value &&
          !guardianVerificationRequired.value) {
        isGuardianLinked.value = true;
        isGuardianVerified.value = true;
      }

      // --- ADMIN APPROVAL ---
      if (!manualProfileApproval.value) {
        isAdminApproved.value = true;
      } else {
        isAdminApproved.value = user['is_approved'] == true ||
            user['is_approved'] == 1 ||
            profile?['is_approved'] == true ||
            profile?['is_approved'] == 1 ||
            profile?['admin_approved'] == true ||
            profile?['admin_approved'] == 1 ||
            profile?['is_admin_approved'] == true ||
            profile?['is_admin_approved'] == 1;
      }
    } catch (e) {
      print("ProfileProgressController error: $e");
    }
  }

  // ============================================================
  // CHECK PROFILE
  // ============================================================

  Future<void> checkProfile(BuildContext context) async {
    final settingsService = Get.find<SettingsService>();
    final authService = Get.find<AuthService>();

    await fetchData();

    print("Profile Checking..");
    try {
      final userProfileService = Get.find<UserProfileService>();
      final res = await userProfileService.getCurrentUser();
      if (res == null) return;
      String? role = res['role'];

      final user = res;
      final profile = res['profile'] ?? {};

      print('role: $role');

      // OTP for email provider if role missing
      if (user['provider'] == "email") {
        final bool isOtpVerified =
            user['is_otp_verified'] == true || user['is_otp_verified'] == 1;

        if (!isOtpVerified) {
          print('OTP verification required');
          Get.off(() => OtpPage(
                email: user['email']?.toString(),
                userId: user['id'] is int
                    ? user['id']
                    : int.tryParse(user['id'].toString() ?? ''),
              ));
          return;
        }
      }

      // Role selection if none
      if (user['role'] == null) {
        final srole = await showJoinAsBottomSheet(
          Get.context!,
          onSubmit: (srole) async {
            final updateResponse = await authService.updateRole(srole, context);
            return updateResponse != null && updateResponse['success'] == true;
          },
        );

        if (srole == null) {
          print("Sheet was dismissed without a successful submit");
          return;
        }
      }

      // ── INDIVIDUAL ──────────────────────────────────────────────
      if (role == 'individual') {
        isProfileCompleted.value = profile['is_profile_completed'] == 1 ||
            profile['is_profile_completed'] == true;

        isAdminApproved.value =
            user['is_verified'] == true || user['is_verified'] == 1;

        // Fetch guardian link data
        bool isGuardianFound = false;
        try {
          final guardianService = Get.find<GuardianService>();
          final gRes = await guardianService.getMyGuardian();
          isGuardianFound = gRes?['data'] != null;
          isGuardianLinked.value = isGuardianFound;
        } catch (_) {}

        // Use settings
        final userVerificationRequired =
            settingsService.userVerificationRequired;
        final guardianLinkingRequired = settingsService.guardianLinkingRequired;
        final guardianVerificationRequired =
            settingsService.guardianVerificationRequired;
        final manualProfileApproval = settingsService.manualProfileApproval;

        print('⚙️  Loaded Settings: '
            'User Verification Required: $userVerificationRequired | '
            'Guardian Linking Required: $guardianLinkingRequired | '
            'Guardian Verification Required: $guardianVerificationRequired | '
            'Manual Profile Approval: $manualProfileApproval');

        print('👤 User Role: $role');
        print('✅ isProfileCompleted: ${profile['is_profile_completed']}');

        // 1. Must complete basic profile
        if (!isProfileCompleted.value) {
          print('navigating to setup:');
          isProfileCompleted.value = false;
          Get.off(() => CompleteProfilePage());
          return;
        }

        // 2. (optional: cnic verif, skipped by comment)

        // 3. Guardian must be linked if required
        if (guardianLinkingRequired && !isGuardianFound) {
          print('Guardian linking required');
          Get.off(() => LinkGuardianPage(isShowHeader: false));
          return;
        }

        // 4. Manual admin approval (if required and not yet approved)
        if (manualProfileApproval) {
          if (!isAdminApproved.value) {
            print('Profile pending admin approval');
            Get.off(() => VerificationPage(
                  hideBackButton: true,
                ));
            return;
          }
        }

        print('All checks passed - redirecting to home');
        isProfileCompleted.value = true;
        Get.offAll(() => BottomTabBar());
        return;
      }

      // ── GUARDIAN ───────────────────────────────────────────────
      else if (role == 'guardian') {
        final guardianVerificationRequired =
            settingsService.guardianVerificationRequired;

        if (guardianVerificationRequired) {
          final isVerified =
              user['is_verified'] == true || user['is_verified'] == 1;
          if (!isVerified) {
            Get.off(() => VerificationPage(
                  hideBackButton: true,
                ));
            return;
          }
        }
        Get.offAll(() => BottomTabBar());
        return;
      }

      // ── ADMIN / STAFF ─────────────────────────────────────────
      else if (role == 'admin' || role == 'staff') {
        print(
            "Access restricted: Admin and staff accounts are not permitted in this app. Logging out...");

        AuthService().logout();
        return;
      }
    } catch (e) {
      print('Profile check error: $e');
    }
  }
}

// ============================================================
// STEP MODEL
// ============================================================

class ProfileProgressStep {
  final String title;
  final bool required;
  final bool completed;

  const ProfileProgressStep({
    required this.title,
    required this.required,
    required this.completed,
  });
}

// ============================================================
// PROFILE PROGRESS WIDGET
// ============================================================

class ProfileProgressWidget extends StatelessWidget {
  const ProfileProgressWidget({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<ProfileProgressController>();
    controller.fetchData();
    final settingsService = Get.find<SettingsService>();
    print('Profile Completed: ${controller.isProfileCompleted.value}');
    print('Guardian Linked: ${controller.isGuardianLinked.value}');
    print('Admin Approved: ${controller.isAdminApproved.value}');

    return Obx(() {
      final steps = <ProfileProgressStep>[
        ProfileProgressStep(
          title: 'Profile',
          required: true,
          completed: controller.isProfileCompleted.value,
        ),
        ProfileProgressStep(
          title: 'Guardian',
          required: settingsService.guardianLinkingRequired,
          completed: controller.isGuardianLinked.value,
        ),
        ProfileProgressStep(
          title: 'Verify',
          required: settingsService.manualProfileApproval,
          completed: controller.isAdminApproved.value,
        ),
        ProfileProgressStep(
          title: 'Go Live',
          required: true,
          completed: controller.isProfileCompleted.value &&
              controller.isGuardianLinked.value &&
              controller.isGuardianVerified.value &&
              controller.isAdminApproved.value,
        ),
      ];

      // ----------------------------------------------------------
      // REMOVE NON-REQUIRED STEPS
      // ----------------------------------------------------------

      final visibleSteps = steps
          .where(
            (step) => step.required,
          )
          .toList();

      if (visibleSteps.isEmpty) {
        return const SizedBox.shrink();
      }

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(
            bottom: BorderSide(
              color: Colors.grey.withOpacity(0.12),
            ),
          ),
        ),
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(minWidth: constraints.maxWidth),
                child: Center(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(
                      visibleSteps.length,
                      (index) {
                        final step = visibleSteps[index];
                        final bool isLast = index == visibleSteps.length - 1;
                        final bool isCurrent = !step.completed &&
                            _isCurrentStep(
                              visibleSteps,
                              index,
                            );

                        return Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            _StepItem(
                              title: step.title,
                              completed: step.completed,
                              isCurrent: isCurrent,
                            ),
                            if (!isLast)
                              _StepConnector(
                                completed: step.completed,
                              ),
                          ],
                        );
                      },
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      );
    });
  }

  bool _isCurrentStep(
    List<ProfileProgressStep> steps,
    int index,
  ) {
    for (int i = 0; i < steps.length; i++) {
      if (!steps[i].completed) {
        return i == index;
      }
    }

    return false;
  }
}

// ============================================================
// STEP ITEM
// ============================================================

class _StepItem extends StatefulWidget {
  final String title;
  final bool completed;
  final bool isCurrent;

  const _StepItem({
    required this.title,
    required this.completed,
    required this.isCurrent,
  });

  @override
  State<_StepItem> createState() => _StepItemState();
}

class _StepItemState extends State<_StepItem>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1400),
      vsync: this,
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).colorScheme.primary;

    Color circleColor;
    Color borderColor;

    if (widget.completed) {
      circleColor = primaryColor;
      borderColor = primaryColor;
    } else if (widget.isCurrent) {
      circleColor = primaryColor.withOpacity(0.10);
      borderColor = primaryColor;
    } else {
      circleColor = Colors.grey.withOpacity(0.08);
      borderColor = Colors.grey.withOpacity(0.3);
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 40,
          height: 40,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Outer pulse ring — only for current step
              if (widget.isCurrent)
                AnimatedBuilder(
                  animation: _pulseAnimation,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: _pulseAnimation.value,
                      child: Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: primaryColor.withOpacity(
                            0.25 * (1.15 - _pulseAnimation.value) / 0.15,
                          ),
                        ),
                      ),
                    );
                  },
                ),

              // Main circle
              TweenAnimationBuilder<double>(
                duration: const Duration(milliseconds: 350),
                curve: Curves.easeOutBack,
                tween: Tween(begin: 0.85, end: 1.0),
                builder: (context, scale, child) {
                  return Transform.scale(
                    scale: widget.completed ? scale : 1.0,
                    child: child,
                  );
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOut,
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: circleColor,
                    border: Border.all(
                      color: borderColor,
                      width: 1.6,
                    ),
                    boxShadow: widget.completed
                        ? [
                            BoxShadow(
                              color: primaryColor.withOpacity(0.35),
                              blurRadius: 8,
                              spreadRadius: 0.5,
                            ),
                          ]
                        : null,
                  ),
                  child: Center(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 250),
                      transitionBuilder: (child, animation) => ScaleTransition(
                        scale: animation,
                        child: child,
                      ),
                      child: widget.completed
                          ? const Icon(
                              Icons.check_rounded,
                              key: ValueKey('check'),
                              size: 17,
                              color: Colors.white,
                            )
                          : widget.isCurrent
                              ? Container(
                                  key: const ValueKey('dot'),
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: primaryColor,
                                  ),
                                )
                              : const SizedBox.shrink(key: ValueKey('empty')),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 6),
        AnimatedDefaultTextStyle(
          duration: const Duration(milliseconds: 250),
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: widget.completed || widget.isCurrent
                ? FontWeight.w600
                : FontWeight.w400,
            color: widget.completed || widget.isCurrent
                ? primaryColor
                : Colors.grey.shade500,
            letterSpacing: 0.1,
          ),
          child: Text(widget.title),
        ),
      ],
    );
  }
}
// ============================================================
// CONNECTOR
// ============================================================

class _StepConnector extends StatelessWidget {
  final bool completed;

  const _StepConnector({
    required this.completed,
  });

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).colorScheme.primary;

    return Container(
      width: 35,
      height: 2,
      margin: const EdgeInsets.only(
        left: 8,
        right: 8,
        bottom: 18,
      ),
      color: completed ? primaryColor : Colors.grey.withOpacity(0.20),
    );
  }
}
