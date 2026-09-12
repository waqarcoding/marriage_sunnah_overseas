import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../theme/app_colors.dart';

class SingleProfilePhotoPicker extends StatefulWidget {
  final String? imageUrl; // existing photo URL (from API) or local preview
  final bool isUploading;
  final VoidCallback onTap; // triggers pick+crop+upload in parent controller
  final double size;

  const SingleProfilePhotoPicker({
    Key? key,
    this.imageUrl,
    this.isUploading = false,
    required this.onTap,
    this.size = 96,
  }) : super(key: key);

  @override
  State<SingleProfilePhotoPicker> createState() =>
      _SingleProfilePhotoPickerState();
}

class _SingleProfilePhotoPickerState extends State<SingleProfilePhotoPicker> {
  @override
  Widget build(BuildContext context) {
    final hasImage = widget.imageUrl != null && widget.imageUrl!.isNotEmpty;

    return Center(
      child: GestureDetector(
        onTap: widget.isUploading ? null : widget.onTap,
        child: Stack(
          children: [
            Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFF0F5F3),
                border: Border.all(
                  color: AppColors.primary.withOpacity(0.3),
                  width: 1.5,
                ),
              ),
              child: ClipOval(
                child: hasImage
                    ? _buildImage(widget.imageUrl!)
                    : Icon(
                        Icons.person_outline,
                        size: widget.size * 0.45,
                        color: AppColors.primary,
                      ),
              ),
            ),
            if (widget.isUploading)
              Positioned.fill(
                child: Container(
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.black45,
                  ),
                  child: const Center(
                    child: SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    ),
                  ),
                ),
              ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: const Icon(
                  Icons.camera_alt,
                  size: 14,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage(String source) {
    if (source.startsWith('data:image')) {
      // base64 preview (used right after cropping, before upload completes)
      final base64Str = source.split(',').last;
      final bytes = base64Decode(base64Str);
      return Image.memory(bytes, fit: BoxFit.cover);
    }
    return Image.network(
      source,
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) => Icon(
        Icons.person_outline,
        size: widget.size * 0.45,
        color: AppColors.primary,
      ),
    );
  }
}
