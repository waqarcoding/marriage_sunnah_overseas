import 'package:flutter/material.dart';

class ProfileInterestSection extends StatelessWidget {
  const ProfileInterestSection({super.key});

  @override
  Widget build(BuildContext context) {
    final interests = [
      "Travel",
      "Music",
      "Gym",
      "Photography",
      "Food",
      "Movies",
    ];

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Wrap(
          spacing: 10,
          runSpacing: 10,
          children:
              interests
                  .map(
                    (interest) => Chip(
                      label: Text(interest),
                      backgroundColor: Theme.of(
                        context,
                      ).primaryColor.withOpacity(0.1),
                    ),
                  )
                  .toList(),
        ),
      ),
    );
  }
}
