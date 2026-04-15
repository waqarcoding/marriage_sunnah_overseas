import 'package:app/features/profile/profile_controller.dart';
import 'package:app/features/profile/widgets/profile_header.dart';
import 'package:app/features/profile/widgets/profile_interest.dart';
import 'package:app/features/profile/widgets/profile_stats.dart';
import 'package:app/features/profile/widgets/profle_about.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/src/simple/get_view.dart';

class ProfilePage extends GetView<ProfileController> {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    controller.fetchProfile();

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      body: CustomScrollView(
        slivers: [
          // Profile header with collapse effect
          const ProfileHeaderSliver(),

          // Profile stats section
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: ProfileStatsSection(),
            ),
          ),

          // Profile About section
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: ProfileAboutSection(),
            ),
          ),

          // Profile Interests section
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: ProfileInterestSection(),
            ),
          ),

          const SliverToBoxAdapter(
            child: SizedBox(height: 30), // bottom spacing
          ),
        ],
      ),
    );
  }
}
