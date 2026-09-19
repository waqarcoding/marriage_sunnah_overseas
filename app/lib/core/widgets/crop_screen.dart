import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:crop_image/crop_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';

/// Full-screen image cropper. Pass raw [imageBytes] in; pops the route
/// with the cropped PNG bytes (Uint8List) on confirm, or null on cancel.
///
/// Works on web and desktop (and mobile) — crop_image is pure Dart, so
/// there's no need for a separate kIsWeb branch anymore.
class CropScreen extends StatefulWidget {
  final Uint8List imageBytes;
  final double? aspectRatio; // e.g. 1 for square, null for free-form

  const CropScreen({
    Key? key,
    required this.imageBytes,
    this.aspectRatio,
  }) : super(key: key);

  @override
  State<CropScreen> createState() => _CropScreenState();
}

class _CropScreenState extends State<CropScreen> {
  late final CropController _controller;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _controller = CropController(
      aspectRatio: widget.aspectRatio,
      defaultCrop: const Rect.fromLTRB(0.05, 0.05, 0.95, 0.95),
    );
  }

  // crop_image sets its internal bitmapSize asynchronously (via a listener
  // attached when its own ImageStream resolves), with no public "ready"
  // callback — so calling croppedBitmap() too soon after the screen opens
  // can throw LateInitializationError: bitmapSize not initialized. Retrying
  // briefly covers that gap without a fixed guessed delay.
  Future<void> _confirmCrop() async {
    setState(() => _isSaving = true);

    const maxAttempts = 20;
    const retryDelay = Duration(milliseconds: 100);

    for (var attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        final ui.Image bitmap = await _controller.croppedBitmap();
        final byteData =
            await bitmap.toByteData(format: ui.ImageByteFormat.png);
        if (byteData == null) {
          if (mounted) Navigator.pop(context);
          return;
        }
        final bytes = byteData.buffer.asUint8List();
        if (mounted) Navigator.pop(context, bytes);
        return;
      } on Error catch (e) {
        if (e.toString().contains('bitmapSize') && attempt < maxAttempts - 1) {
          await Future.delayed(retryDelay);
          continue;
        }
        if (mounted) {
          setState(() => _isSaving = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not crop image: $e')),
          );
        }
        return;
      } catch (e) {
        if (mounted) {
          setState(() => _isSaving = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not crop image: $e')),
          );
        }
        return;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= 700;

    // Matches the package's own documented usage: let CropImage size
    // itself. It computes its own height from the image's aspect ratio
    // once loaded, given a bounded width — it does NOT expect to also be
    // pinned to a fixed max height (that previously produced a 640x0
    // collapsed box; see below).
    final cropImage = MouseRegion(
      cursor: SystemMouseCursors.grab,
      child: CropImage(
        controller: _controller,
        image: Image.memory(widget.imageBytes),
        paddingSize: 25.0,
        gridColor: Colors.white54,
        gridCornerSize: 32,
        gridThinWidth: 1,
        gridThickWidth: 3,
        scrimColor: Colors.black.withOpacity(0.6),
        alwaysShowThirdLines: true,
      ),
    );

    return Shortcuts(
      shortcuts: <LogicalKeySet, Intent>{
        LogicalKeySet(LogicalKeyboardKey.escape): const _CancelIntent(),
        LogicalKeySet(LogicalKeyboardKey.enter): const _ConfirmIntent(),
      },
      child: Actions(
        actions: <Type, Action<Intent>>{
          _CancelIntent: CallbackAction<_CancelIntent>(
            onInvoke: (_) {
              if (!_isSaving) Navigator.pop(context);
              return null;
            },
          ),
          _ConfirmIntent: CallbackAction<_ConfirmIntent>(
            onInvoke: (_) {
              if (!_isSaving) _confirmCrop();
              return null;
            },
          ),
        },
        child: Focus(
          autofocus: true,
          child: Scaffold(
            backgroundColor: Colors.black,
            appBar: AppBar(
              backgroundColor: Colors.black,
              foregroundColor: Colors.white,
              elevation: 0,
              // Fixed explicitly rather than left to the default 56 — on
              // desktop, IconButton's tap target/padding shrinks under
              // VisualDensity.adaptivePlatformDensity while toolbarHeight
              // does not, so icons look mis-sized/cramped against the bar.
              // A slightly taller bar plus fixed icon sizing below keeps
              // it visually consistent across platforms.
              toolbarHeight: isDesktop ? 64 : 56,
              titleSpacing: 4,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios),
                iconSize: 24,
                visualDensity: VisualDensity.standard,
                constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
                onPressed: () => Navigator.pop(context), // cancel → null
              ),
              title: const Text('Crop your photo'),

              actions: [
                IconButton(
                  icon: const Icon(Icons.rotate_90_degrees_ccw_rounded),
                  iconSize: 24,
                  visualDensity: VisualDensity.standard,
                  constraints:
                      const BoxConstraints(minWidth: 48, minHeight: 48),
                  tooltip: 'Rotate left',
                  onPressed: () => _controller.rotateLeft(),
                ),
                IconButton(
                  icon: const Icon(Icons.rotate_90_degrees_cw_rounded),
                  iconSize: 24,
                  visualDensity: VisualDensity.standard,
                  constraints:
                      const BoxConstraints(minWidth: 48, minHeight: 48),
                  tooltip: 'Rotate right',
                  onPressed: () => _controller.rotateRight(),
                ),
                const SizedBox(width: 8),
              ],
            ),
            // Only cap WIDTH on desktop — never height. CropImage derives
            // its own height from the image's aspect ratio and the width
            // it's given; feeding it a fixed maxHeight too fights that
            // internal calculation and can collapse it to zero height.
            body: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: isDesktop ? 640 : double.infinity,
                ),
                child: cropImage,
              ),
            ),
            bottomNavigationBar: SafeArea(
              child: SizedBox(
                height: 100, // fixed height for the button bar
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                          maxWidth: isDesktop ? 420 : double.infinity),
                      child: Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _isSaving
                                  ? null
                                  : () => Navigator.pop(context),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white,
                                side: const BorderSide(color: Colors.white54),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: const Text('Cancel'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _isSaving ? null : _confirmCrop,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: _isSaving
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Text('Done'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CancelIntent extends Intent {
  const _CancelIntent();
}

class _ConfirmIntent extends Intent {
  const _ConfirmIntent();
}
