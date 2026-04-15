import 'package:app/features/profile/widgets/profile_tile.dart';
import 'package:flutter/material.dart';

class ProfileStatsSection extends StatelessWidget {
  const ProfileStatsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        child: Column(
          children: const [
            ProfileTile(
              icon: Icons.favorite,
              title: "1.2K Likes",
              subtitle: "People liked this profile",
              label: "Likes",
            ),
            Divider(height: 24, thickness: 1),
            ProfileTile(
              icon: Icons.people,
              title: "890 Matches",
              subtitle: "Total successful matches",
              label: "Matches",
            ),
            Divider(height: 24, thickness: 1),
            ProfileTile(
              icon: Icons.verified,
              title: "Verified Account",
              subtitle: "Identity verified",
              label: "Verified",
            ),
          ],
        ),
      ),
    );
  }
}
