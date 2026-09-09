import 'package:app/bottom_tabs.dart';
import 'package:app/features/auth/pages/otp_page.dart';
import 'package:app/features/auth/services/auth_service.dart';
import 'package:app/data/services/settings_service.dart';
import 'package:app/features/auth/widgets/join_as_bottom_sheet.dart';
import 'package:app/features/guardian/services/guardian_service.dart';
import 'package:app/features/profile/pages/complete_profile_page.dart';
import 'package:app/features/profile/services/profile_service.dart';
import 'package:app/features/userguardian/link_guardian_page.dart';
import 'package:app/features/userprofile/services/user_profile_service.dart';
import 'package:app/features/verification/pages/verification_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

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
      final settingsService = SettingsService();

      // ----------------------------------------------------------
      // LOAD SETTINGS
      // ----------------------------------------------------------

      userVerificationRequired.value =
          await settingsService.userVerificationRequired;

      guardianLinkingRequired.value =
          await settingsService.guardianLinkingRequired;

      guardianVerificationRequired.value =
          await settingsService.guardianVerificationRequired;

      manualProfileApproval.value = await settingsService.manualProfileApproval;

      print(
        "userVerificationRequired "
        "${userVerificationRequired.value}",
      );

      print(
        "guardianLinkingRequired "
        "${guardianLinkingRequired.value}",
      );

      print(
        "guardianVerificationRequired "
        "${guardianVerificationRequired.value}",
      );

      print(
        "manualProfileApproval "
        "${manualProfileApproval.value}",
      );

      // ----------------------------------------------------------
      // GET CURRENT USER
      // ----------------------------------------------------------

      final profileService = ProfileService();

      final user = await profileService.getCurrentUser();

      if (user == null) {
        print("ProfileProgress: current user is null");
        return;
      }

      final profile =
          user['profile'] ?? user['data']?['profile'] ?? user['data'] ?? user;

      // ----------------------------------------------------------
      // PROFILE
      // ----------------------------------------------------------

      isProfileCompleted.value = profile?['is_profile_completed'] == true ||
          profile?['is_profile_completed'] == 1;

      // ----------------------------------------------------------
      // CNIC / USER VERIFICATION
      // ----------------------------------------------------------

      isCnicVerified.value = user['is_verified'] == true ||
          user['is_verified'] == 1 ||
          profile?['is_verified'] == true ||
          profile?['is_verified'] == 1;

      // ----------------------------------------------------------
      // GUARDIAN
      // ----------------------------------------------------------

      if (!guardianLinkingRequired.value &&
          !guardianVerificationRequired.value) {
        // Guardian process isn't required.
        // Therefore consider it complete.
        isGuardianLinked.value = true;
        isGuardianVerified.value = true;
      }

      // ----------------------------------------------------------
      // ADMIN APPROVAL
      // ----------------------------------------------------------

      if (!manualProfileApproval.value) {
        // Admin approval isn't required.
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

      print(
        "isProfileCompleted "
        "${isProfileCompleted.value}",
      );

      print(
        "isCnicVerified "
        "${isCnicVerified.value}",
      );

      print(
        "isGuardianLinked "
        "${isGuardianLinked.value}",
      );

      print(
        "isGuardianVerified "
        "${isGuardianVerified.value}",
      );

      print(
        "isAdminApproved "
        "${isAdminApproved.value}",
      );
    } catch (e) {
      print(
        "ProfileProgressController error: $e",
      );
    }
  }

  // ============================================================
  // CHECK PROFILE
  // ============================================================

  Future<void> checkProfile(BuildContext context) async {
    SettingsService settingsService = Get.find<SettingsService>();
    AuthService authService = Get.find<AuthService>();

    print("Profile Checking..");
    try {
      // Fetch current user (same as React: ProfileService.getCurrentUser())
      final userProfileService = Get.find<UserProfileService>();
      final res = await userProfileService.getCurrentUser();
      if (res == null) return;

      final user = res; // top-level user object
      final profile = res['profile'] ?? {}; // nested profile
      final role = user['role']?.toString() ?? 'individual';

      // Check here: if provider is email, use OtpPage logic
      if (user['provider'] == "email" &&
          (user['role'] == null || role == null)) {
        // This block mimics OtpPage logic for non-Google accounts

        // For simplicity, let's check OTP verification
        final bool isOtpVerified =
            user['is_otp_verified'] == true || user['is_otp_verified'] == 1;

        if (!isOtpVerified) {
          // Navigate (or display) OTP Page for verification
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

      if (user['role'] == null) {
        final role = await showJoinAsBottomSheet(
          Get.context!,
          onSubmit: (selectedRole) async {
            final updateResponse = await authService.updateRole(selectedRole);
            return updateResponse != null && updateResponse['success'] == true;
          },
        );

        if (role == null) {
          // Sheet was dismissed without a successful submit
          return;
        }
      }

      // ── INDIVIDUAL ──────────────────────────────────────────────────────────
      if (role == 'individual') {
        final isProfileComplete = profile['is_profile_completed'] == 1 ||
            profile['is_profile_completed'] == true;

        final isVerified =
            user['is_verified'] == true || user['is_verified'] == 1;

        // Fetch guardian data
        Map<String, dynamic>? guardianData;
        bool isGuardianFound = false;
        try {
          final guardianService = Get.find<GuardianService>();
          final gRes = await guardianService.getMyGuardian();
          guardianData = gRes;
          isGuardianFound = gRes?['data'] != null;
        } catch (_) {}

        print('User Role: $role');
        print('isProfileCompleted: ${profile['is_profile_completed']}');

        // Load settings

        final userVerificationRequired =
            settingsService.userVerificationRequired;
        final guardianLinkingRequired = settingsService.guardianLinkingRequired;
        final guardianVerificationRequired =
            settingsService.guardianVerificationRequired;
        final manualProfileApproval = settingsService.manualProfileApproval;

        // Step 1: Profile completion

        if (!isProfileComplete) {
          print('navigating to setup:');
          isProfileCompleted.value = false;
          Get.off(() => CompleteProfilePage());

          return;
        }

        // Step 2: User CNIC verification
        if (userVerificationRequired && !isVerified) {
          print('User CNIC verification required');

          Get.off(() => VerificationPage(
                hideBackButton: true,
              ));
          return;
        }

        // Step 3: Guardian linking
        if (guardianLinkingRequired && !isGuardianFound) {
          print('Guardian linking required');
          Get.off(() => LinkGuardianPage(isShowHeader: false));
          Get.offAllNamed('/individual/addguardian');
          return;
        }

        // Step 4: Manual approval
        if (manualProfileApproval) {
          final isApproved =
              user['is_approved'] == true || user['is_approved'] == 1;

          if (!isApproved) {
            print('Profile pending admin approval');
            Get.off(() => VerificationPage());
            return;
          }
        }

        // ✅ All checks passed — go to home
        print('All checks passed - redirecting to home');
        isProfileCompleted.value = true;

        // Get.offAll(() => BottomTabBar());
        return;
      }

      // ── GUARDIAN ────────────────────────────────────────────────────────────
      else if (role == 'guardian') {
        final guardianVerificationRequired =
            settingsService.guardianVerificationRequired;

        if (guardianVerificationRequired) {
          final isVerified =
              user['is_verified'] == true || user['is_verified'] == 1;

          if (!isVerified) {
            Get.off(() => VerificationPage());
            return;
          }
        }
        // ✅ All checks passed — go to home
        Get.offAll(() => BottomTabBar());
        return;
      }

      // ── ADMIN / STAFF ────────────────────────────────────────────────────────
      else if (role == 'admin' || role == 'staff') {
        //

        AuthService authService = AuthService();
        authService.logout();
        Get.snackbar(
            'Message', 'Invalid role! make sure you are individual or guardian',
            snackPosition: SnackPosition.BOTTOM);

        return;
      }
    } catch (e) {
      print('Profile check error: $e');
      Get.offAllNamed('/profilesetup');
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
    print("controller: $controller");
    print("isProfileCompleted: ${controller.isProfileCompleted.value}");
    print(
        "userVerificationRequired: ${controller.userVerificationRequired.value}");
    print("isCnicVerified: ${controller.isCnicVerified.value}");
    print(
        "guardianLinkingRequired: ${controller.guardianLinkingRequired.value}");
    print("isGuardianLinked: ${controller.isGuardianLinked.value}");
    print(
        "guardianVerificationRequired: ${controller.guardianVerificationRequired.value}");
    print("isGuardianVerified: ${controller.isGuardianVerified.value}");
    print("manualProfileApproval: ${controller.manualProfileApproval.value}");
    print("isAdminApproved: ${controller.isAdminApproved.value}");

    return Obx(() {
      final steps = <ProfileProgressStep>[
        ProfileProgressStep(
          title: 'Profile',
          required: true,
          completed: controller.isProfileCompleted.value,
        ),
        ProfileProgressStep(
          title: 'Verification',
          required: controller.userVerificationRequired.value,
          completed: controller.isCnicVerified.value,
        ),
        ProfileProgressStep(
          title: 'Guardian',
          required: controller.guardianLinkingRequired.value,
          completed: controller.isGuardianLinked.value,
        ),
        ProfileProgressStep(
          title: 'Guardian Verification',
          required: controller.guardianVerificationRequired.value,
          completed: controller.isGuardianVerified.value,
        ),
        ProfileProgressStep(
          title: 'Approval',
          required: controller.manualProfileApproval.value,
          completed: controller.isAdminApproved.value,
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
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
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

class _StepItem extends StatelessWidget {
  final String title;
  final bool completed;
  final bool isCurrent;

  const _StepItem({
    required this.title,
    required this.completed,
    required this.isCurrent,
  });

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).colorScheme.primary;

    Color circleColor;

    if (completed) {
      circleColor = primaryColor;
    } else if (isCurrent) {
      circleColor = primaryColor.withOpacity(0.12);
    } else {
      circleColor = Colors.grey.withOpacity(0.12);
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: circleColor,
            border: Border.all(
              color: completed || isCurrent
                  ? primaryColor
                  : Colors.grey.withOpacity(0.35),
              width: 1.5,
            ),
          ),
          child: Center(
            child: completed
                ? const Icon(
                    Icons.check,
                    size: 17,
                    color: Colors.white,
                  )
                : isCurrent
                    ? Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: primaryColor,
                        ),
                      )
                    : null,
          ),
        ),
        const SizedBox(height: 5),
        Text(
          title,
          style: TextStyle(
            fontSize: 10,
            fontWeight:
                completed || isCurrent ? FontWeight.w600 : FontWeight.w400,
            color: completed || isCurrent ? primaryColor : Colors.grey.shade600,
          ),
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
