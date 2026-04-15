import 'package:flutter/material.dart';

class ProfileImagePicker extends StatelessWidget {
  final String imageUrl;
  final VoidCallback onChange;

  const ProfileImagePicker({
    super.key,
    required this.imageUrl,
    required this.onChange,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.bottomRight,
      children: [
        CircleAvatar(radius: 70, backgroundImage: NetworkImage(imageUrl)),
        GestureDetector(
          onTap: onChange,
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.blue,
            ),
            child: const Icon(Icons.camera_alt, color: Colors.white, size: 20),
          ),
        ),
      ],
    );
  }
}
