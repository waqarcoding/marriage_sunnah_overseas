import 'dart:math' as math;

import 'package:app/features/auth/controllers/auth_controller.dart';
import 'package:app/features/golive/golive_page.dart';
import 'package:app/features/intro/profile_progress_widget.dart';
import 'package:app/features/verification/controllers/liveness_controller.dart';
import 'package:app/features/verification/services/verification_service.dart';
import 'package:app/features/verification/widgets/face_scan_controller.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LivenessBinding extends Bindings {
  @override
  void dependencies() {
    // VerificationService may already be registered globally (e.g. in
    // InitialBinding). Guard so this binding is safe to use standalone too.
    if (!Get.isRegistered<VerificationService>()) {
      Get.lazyPut<VerificationService>(() => VerificationService());
    }
    Get.lazyPut<LivenessController>(() => LivenessController());
  }
}

/// Which step of the flow we're visually on. Drives the progress rail
/// at the top of the screen.
enum _Stage { camera, scan, upload, done }

/// Above this width we treat the window as "desktop" and constrain content
/// to a centered card instead of letting it stretch edge-to-edge.
const double _kDesktopBreakpoint = 900;
const double _kContentMaxWidth = 480;
const double _kScannerMaxWidth = 420;
const double _kScannerMaxHeight = 560;

class VerificationPage extends GetView<LivenessController> {
  final bool hideBackButton;

  const VerificationPage({
    Key? key,
    this.hideBackButton = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: Colors.white,
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isDesktop = constraints.maxWidth >= _kDesktopBreakpoint;

                return Obx(() {
                  final stage = _stageFor(controller);
                  final hasError = controller.errorMessage.value.isNotEmpty;

                  final column = Column(
                    children: [
                      ProfileProgressWidget(),
                      Expanded(
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 420),
                          switchInCurve: Curves.easeOutCubic,
                          switchOutCurve: Curves.easeInCubic,
                          transitionBuilder: (child, animation) =>
                              FadeTransition(
                            opacity: animation,
                            child: SlideTransition(
                              position: Tween<Offset>(
                                begin: const Offset(0, 0.05),
                                end: Offset.zero,
                              ).animate(animation),
                              child: child,
                            ),
                          ),
                          child: _buildBody(context, scheme, isDesktop),
                        ),
                      ),
                    ],
                  );

                  if (!isDesktop) return column;

                  // Desktop: center a fixed-width card instead of letting
                  // the step rail and status text stretch full window width.
                  return Center(
                    child: ConstrainedBox(
                      constraints:
                          const BoxConstraints(maxWidth: _kContentMaxWidth),
                      child: column,
                    ),
                  );
                });
              },
            ),
          ),
        ],
      ),
    );
  }

  _Stage _stageFor(LivenessController c) {
    if (c.isVerified.value) return _Stage.done;
    if (c.isUploading.value) return _Stage.upload;
    if (c.hasCameraPermission.value && !c.isCheckingPermission.value) {
      return _Stage.scan;
    }
    return _Stage.camera;
  }

  Widget _buildBody(BuildContext context, ColorScheme scheme, bool isDesktop) {
    // ── 1. Permission gate ────────────────────────────────────────────
    if (controller.isCheckingPermission.value) {
      return _StatusView(
        key: const ValueKey('checking-permission'),
        primary: scheme.primary,
        pulsing: true,
        icon: Icons.camera_alt_rounded,
        title: 'Preparing camera',
        subtitle: 'Just a second…',
      );
    }

    if (!controller.hasCameraPermission.value) {
      return _StatusView(
        key: const ValueKey('permission-denied'),
        primary: scheme.primary,
        pulsing: true,
        icon: Icons.camera_alt_rounded,
        title: 'Camera access needed',
        subtitle: 'We use your camera for a quick, secure liveness check. '
            'Nothing is shared without your permission.',
        buttonLabel: 'Allow camera access',
        onPressed: controller.requestCameraPermission,
      );
    }

    // ── 2. Uploading state ───────────────────────────────────────────
    if (controller.isUploading.value) {
      return _StatusView(
        key: const ValueKey('uploading'),
        primary: scheme.primary,
        pulsing: true,
        icon: Icons.cloud_upload_rounded,
        title: 'Uploading verification',
        subtitle: 'Hang tight, this only takes a moment.',
      );
    }

    // ── 3. Success state ─────────────────────────────────────────────
    if (controller.isVerified.value) {
      return _StatusView(
        key: const ValueKey('verified'),
        primary: scheme.primary,
        checkmark: true,
        title: 'You\'re verified',
        subtitle: 'Your liveness check passed successfully.',
        buttonLabel: 'Go Live',
        onPressed: () {
          // Open the GoLive page using GetX navigation via class
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const GoLivePage()),
            (route) => false,
          );
        },
      );
    }

    // ── 4. Error state ───────────────────────────────────────────────
    if (controller.errorMessage.value.isNotEmpty) {
      return _StatusView(
        key: const ValueKey('error'),
        primary: scheme.error,
        shake: true,
        icon: Icons.priority_high_rounded,
        title: 'Verification failed',
        subtitle: controller.errorMessage.value,
        buttonLabel: 'Try again',
        onPressed: controller.reset,
      );
    }

    // ── 5. Default: face-detection scan + auto-capture ────────────────
    // Watching scanGeneration makes this rebuild whenever a new
    // FaceScanController is created (initial start / retry), so the
    // AnimatedBuilder below always listens to the current instance.
    // ignore: unused_local_variable
    final generation = controller.scanGeneration.value;
    final faceScan = controller.faceScan;

    if (faceScan == null) {
      return _StatusView(
        key: ValueKey('starting-scan-$generation'),
        primary: scheme.primary,
        pulsing: true,
        icon: Icons.camera_alt_rounded,
        title: 'Starting camera',
        subtitle: 'Just a second…',
      );
    }

    return AnimatedBuilder(
      animation: faceScan,
      builder: (context, _) {
        final camera = faceScan.camera;

        if (camera == null || !camera.value.isInitialized) {
          final noCamera = faceScan.status == FaceGuide.noCamera;
          return _StatusView(
            key: const ValueKey('starting-camera'),
            primary: scheme.primary,
            pulsing: !noCamera,
            icon: Icons.camera_alt_rounded,
            title: noCamera ? 'No camera found' : 'Starting camera',
            subtitle: noCamera
                ? 'This device doesn\'t have a usable camera.'
                : 'Just a second…',
          );
        }

        final status = faceScan.status;
        final accent = status.isReady
            ? const Color(0xFF34C759)
            : status == FaceGuide.searching
                ? scheme.primary
                : scheme.error;

        final scanner = _ScannerFrame(
          key: const ValueKey('face-scan'),
          accent: accent,
          child: _FaceScanCameraView(camera: camera, hint: status.hint),
        );

        if (!isDesktop) return scanner;

        // Desktop: give the camera a fixed card size instead of stretching
        // to fill the whole remaining height of a tall window.
        return Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              maxWidth: _kScannerMaxWidth,
              maxHeight: _kScannerMaxHeight,
            ),
            child: AspectRatio(aspectRatio: 3 / 4, child: scanner),
          ),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Face scan camera view (preview + hint text — the oval crop, brackets and
// scan line come from _ScannerFrame/_FramePainter below)
// ─────────────────────────────────────────────────────────────────────────

class _FaceScanCameraView extends StatelessWidget {
  final CameraController camera;
  final String hint;

  const _FaceScanCameraView({required this.camera, required this.hint});

  @override
  Widget build(BuildContext context) {
    final isFront =
        camera.description.lensDirection == CameraLensDirection.front;

    return Stack(
      fit: StackFit.expand,
      children: [
        // Front camera preview is naturally un-mirrored on most platforms
        // (shows what the sensor sees, not a mirror image) — flip it so it
        // matches what the user expects from a "selfie" view.
        Transform(
          alignment: Alignment.center,
          transform: isFront ? Matrix4.rotationY(math.pi) : Matrix4.identity(),
          child: CameraPreview(camera),
        ),
        // Subtle bottom scrim so the hint text stays legible over any
        // background.
        const IgnorePointer(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.transparent, Color(0x59000000)],
                stops: [0.6, 1.0],
              ),
            ),
          ),
        ),
        Positioned(
          left: 24,
          right: 24,
          bottom: 28,
          child: IgnorePointer(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Text(
                hint,
                key: ValueKey(hint),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  shadows: [Shadow(blurRadius: 8, color: Colors.black54)],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Background
// ─────────────────────────────────────────────────────────────────────────

class _BackgroundGlow extends StatelessWidget {
  final Color color;
  const _BackgroundGlow({required this.color});

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        children: [
          Positioned(
            top: -90,
            right: -70,
            child: _blob(220, color.withOpacity(0.10)),
          ),
          Positioned(
            bottom: -110,
            left: -80,
            child: _blob(260, color.withOpacity(0.06)),
          ),
        ],
      ),
    );
  }

  Widget _blob(double size, Color color) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Step rail
// ─────────────────────────────────────────────────────────────────────────

class _StepRail extends StatelessWidget {
  final _Stage stage;
  final bool hasError;
  final Color color;
  final Color errorColor;

  const _StepRail({
    required this.stage,
    required this.hasError,
    required this.color,
    required this.errorColor,
  });

  static const _labels = ['Camera', 'Scan', 'Upload', 'Done'];

  @override
  Widget build(BuildContext context) {
    final activeIndex = _Stage.values.indexOf(stage);

    return Row(
      children: List.generate(_labels.length * 2 - 1, (i) {
        if (i.isOdd) {
          final segmentIndex = (i - 1) ~/ 2;
          final filled = segmentIndex < activeIndex;
          return Expanded(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 350),
              height: 3,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: filled
                    ? (hasError && segmentIndex == activeIndex - 1
                        ? errorColor
                        : color)
                    : color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          );
        }
        final index = i ~/ 2;
        final isActive = index == activeIndex;
        final isDone = index < activeIndex;
        final dotColor = hasError && isActive
            ? errorColor
            : (isActive || isDone)
                ? color
                : color.withOpacity(0.15);
        return AnimatedContainer(
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeOut,
          width: isActive ? 12 : 8,
          height: isActive ? 12 : 8,
          decoration: BoxDecoration(shape: BoxShape.circle, color: dotColor),
        );
      }),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Status view (permission / uploading / success / error)
// ─────────────────────────────────────────────────────────────────────────

class _StatusView extends StatelessWidget {
  final Color primary;
  final IconData? icon;
  final bool pulsing;
  final bool checkmark;
  final bool shake;
  final String title;
  final String subtitle;
  final String? buttonLabel;
  final VoidCallback? onPressed;

  const _StatusView({
    super.key,
    required this.primary,
    required this.title,
    required this.subtitle,
    this.icon,
    this.pulsing = false,
    this.checkmark = false,
    this.shake = false,
    this.buttonLabel,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 132,
              height: 132,
              child: checkmark
                  ? _AnimatedCheckmark(color: primary)
                  : shake
                      ? _ShakeBadge(color: primary, icon: icon!)
                      : _PulseBadge(
                          color: primary,
                          icon: icon!,
                          animate: pulsing,
                        ),
            ),
            const SizedBox(height: 28),
            _BounceIn(
              child: Text(
                title,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.black.withOpacity(0.87),
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.1,
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.black.withOpacity(0.5),
                fontSize: 14,
                height: 1.45,
              ),
            ),
            if (buttonLabel != null && onPressed != null) ...[
              const SizedBox(height: 32),
              _AnimatedCta(
                label: buttonLabel!,
                color: primary,
                onPressed: onPressed!,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Fades and slides a child up on first build — used to stagger the title
/// in just behind the icon animation.
class _BounceIn extends StatefulWidget {
  final Widget child;
  const _BounceIn({required this.child});

  @override
  State<_BounceIn> createState() => _BounceInState();
}

class _BounceInState extends State<_BounceIn> {
  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 380),
      curve: Curves.easeOutCubic,
      builder: (context, t, child) => Opacity(
        opacity: t,
        child: Transform.translate(
          offset: Offset(0, (1 - t) * 10),
          child: child,
        ),
      ),
      child: widget.child,
    );
  }
}

class _AnimatedCta extends StatefulWidget {
  final String label;
  final Color color;
  final VoidCallback onPressed;

  const _AnimatedCta({
    required this.label,
    required this.color,
    required this.onPressed,
  });

  @override
  State<_AnimatedCta> createState() => _AnimatedCtaState();
}

class _AnimatedCtaState extends State<_AnimatedCta> {
  double _scale = 1;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 420),
      curve: Curves.easeOutBack,
      builder: (context, t, child) => Opacity(
        opacity: t.clamp(0, 1),
        child: Transform.scale(scale: 0.9 + 0.1 * t, child: child),
      ),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _scale = 0.96),
        onTapUp: (_) => setState(() => _scale = 1),
        onTapCancel: () => setState(() => _scale = 1),
        onTap: widget.onPressed,
        child: AnimatedScale(
          scale: _scale,
          duration: const Duration(milliseconds: 120),
          child: Container(
            width: double.infinity,
            height: 52,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: widget.color,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: widget.color.withOpacity(0.28),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Text(
              widget.label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Pulsing badge (permission / uploading)
// ─────────────────────────────────────────────────────────────────────────

class _PulseBadge extends StatefulWidget {
  final Color color;
  final IconData icon;
  final bool animate;

  const _PulseBadge({
    required this.color,
    required this.icon,
    required this.animate,
  });

  @override
  State<_PulseBadge> createState() => _PulseBadgeState();
}

class _PulseBadgeState extends State<_PulseBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1800),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Stack(
          alignment: Alignment.center,
          children: [
            if (widget.animate) ...[
              _ring(_controller.value),
              _ring((_controller.value + 0.5) % 1.0),
            ],
            Container(
              width: 84,
              height: 84,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: widget.color.withOpacity(0.10),
              ),
              child: Icon(widget.icon, color: widget.color, size: 38),
            ),
          ],
        );
      },
    );
  }

  Widget _ring(double t) {
    final size = 84 + t * 48;
    return Opacity(
      opacity: (1 - t).clamp(0, 1) * 0.35,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: widget.color, width: 1.4),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Shake badge (error)
// ─────────────────────────────────────────────────────────────────────────

class _ShakeBadge extends StatefulWidget {
  final Color color;
  final IconData icon;
  const _ShakeBadge({required this.color, required this.icon});

  @override
  State<_ShakeBadge> createState() => _ShakeBadgeState();
}

class _ShakeBadgeState extends State<_ShakeBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 500),
  )..forward();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final dx = math.sin(_controller.value * math.pi * 6) *
            8 *
            (1 - _controller.value);
        return Transform.translate(offset: Offset(dx, 0), child: child);
      },
      child: Container(
        width: 84,
        height: 84,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: widget.color.withOpacity(0.10),
        ),
        child: Icon(widget.icon, color: widget.color, size: 38),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Animated checkmark (success)
// ─────────────────────────────────────────────────────────────────────────

class _AnimatedCheckmark extends StatefulWidget {
  final Color color;
  const _AnimatedCheckmark({required this.color});

  @override
  State<_AnimatedCheckmark> createState() => _AnimatedCheckmarkState();
}

class _AnimatedCheckmarkState extends State<_AnimatedCheckmark>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 650),
  )..forward();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final circleT = Curves.easeOutBack.transform(
          (_controller.value / 0.6).clamp(0, 1).toDouble(),
        );
        final checkT =
            ((_controller.value - 0.35) / 0.65).clamp(0, 1).toDouble();
        return Transform.scale(
          scale: circleT,
          child: CustomPaint(
            size: const Size(132, 132),
            painter: _CheckPainter(color: widget.color, progress: checkT),
          ),
        );
      },
    );
  }
}

class _CheckPainter extends CustomPainter {
  final Color color;
  final double progress;
  _CheckPainter({required this.color, required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = size.width / 2;

    final circlePaint = Paint()..color = color.withOpacity(0.10);
    canvas.drawCircle(center, radius, circlePaint);

    final path = Path();
    final p1 = Offset(size.width * 0.30, size.height * 0.53);
    final p2 = Offset(size.width * 0.45, size.height * 0.68);
    final p3 = Offset(size.width * 0.72, size.height * 0.36);
    path.moveTo(p1.dx, p1.dy);
    path.lineTo(p2.dx, p2.dy);
    path.lineTo(p3.dx, p3.dy);

    final metrics = path.computeMetrics().first;
    final extract = metrics.extractPath(0, metrics.length * progress);

    final strokePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(extract, strokePaint);
  }

  @override
  bool shouldRepaint(covariant _CheckPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.color != color;
}

// ─────────────────────────────────────────────────────────────────────────
// Scanner frame around the camera view
// ─────────────────────────────────────────────────────────────────────────

/// Oval viewfinder: the camera preview is clipped to an ellipse, with arc
/// brackets and a sweeping scan line drawn on top of it.
class _ScannerFrame extends StatefulWidget {
  final Widget child;
  final Color accent;

  /// Gap between the padded box and the oval itself — the brackets sit on
  /// the oval edge, so this is also their outer bound.
  final double inset;

  /// Height / width of the oval. 1.0 is a circle; > 1 is a portrait oval
  /// (good for faces / ID photos), < 1 is landscape.
  final double ovalRatio;

  const _ScannerFrame({
    super.key,
    required this.child,
    required this.accent,
    this.inset = 14,
    this.ovalRatio = 1.35,
  });

  @override
  State<_ScannerFrame> createState() => _ScannerFrameState();
}

class _ScannerFrameState extends State<_ScannerFrame>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2200),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final ovalRect = _ovalRect(constraints.biggest, widget.inset);

          return Stack(
            fit: StackFit.expand,
            children: [
              // Soft drop shadow hugging the ellipse. A BoxDecoration shadow
              // can't do this: BoxShape.circle falls back to the shortest
              // side, so a non-square oval would cast a circular shadow.
              CustomPaint(painter: _OvalShadowPainter(rect: ovalRect)),

              // The preview itself, cropped to the oval.
              ClipPath(
                clipper: _OvalClipper(ovalRect),
                // FittedBox + cover stops the preview being squashed into the
                // oval's bounds — it fills and overflows, then gets clipped.
                child: FittedBox(
                  fit: BoxFit.cover,
                  clipBehavior: Clip.hardEdge,
                  child: SizedBox(
                    width: constraints.maxWidth,
                    height: constraints.maxHeight,
                    child: widget.child,
                  ),
                ),
              ),

              IgnorePointer(
                child: AnimatedBuilder(
                  animation: _controller,
                  builder: (context, _) => CustomPaint(
                    painter: _FramePainter(
                      color: widget.accent,
                      scanT: _controller.value,
                      inset: widget.inset,
                      ovalRatio: widget.ovalRatio,
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Rect _ovalRect(Size size, double inset) =>
      _ovalRectFor(size, inset, widget.ovalRatio);
}

/// The largest oval of the requested ratio that fits inside [size], centred.
Rect _ovalRectFor(Size size, double inset, double ratio) {
  final maxW = size.width - inset * 2;
  final maxH = size.height - inset * 2;
  var w = maxW;
  var h = w * ratio;
  if (h > maxH) {
    h = maxH;
    w = h / ratio;
  }
  return Rect.fromCenter(
    center: Offset(size.width / 2, size.height / 2),
    width: w,
    height: h,
  );
}

class _OvalClipper extends CustomClipper<Path> {
  const _OvalClipper(this.rect);

  final Rect rect;

  @override
  Path getClip(Size size) => Path()..addOval(rect);

  @override
  bool shouldReclip(covariant _OvalClipper oldClipper) =>
      oldClipper.rect != rect;
}

class _OvalShadowPainter extends CustomPainter {
  const _OvalShadowPainter({required this.rect});

  final Rect rect;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawShadow(
      Path()..addOval(rect),
      Colors.black.withOpacity(0.06),
      12,
      true,
    );
  }

  @override
  bool shouldRepaint(covariant _OvalShadowPainter oldDelegate) =>
      oldDelegate.rect != rect;
}

class _FramePainter extends CustomPainter {
  final Color color;
  final double scanT;
  final double inset;
  final double ovalRatio;

  _FramePainter({
    required this.color,
    required this.scanT,
    this.inset = 14,
    this.ovalRatio = 1.35,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final rect = _ovalRectFor(size, inset, ovalRatio);

    final paint = Paint()
      ..color = color
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    // Four arc brackets sitting on the ellipse, at the diagonals — the oval
    // equivalent of the old corner brackets.
    const sweep = 34 * math.pi / 180;
    for (final centre in const [0.25, 0.75, 1.25, 1.75]) {
      canvas.drawArc(rect, centre * math.pi - sweep / 2, sweep, false, paint);
    }

    // Faint full outline so the crop edge is legible between the brackets.
    canvas.drawOval(
      rect,
      Paint()
        ..color = color.withOpacity(0.22)
        ..strokeWidth = 1.5
        ..style = PaintingStyle.stroke,
    );

    // Sweeping scan line, trimmed to the ellipse chord at that height so it
    // never pokes outside the oval.
    final a = rect.width / 2;
    final b = rect.height / 2;
    // Keep the sweep off the very poles, where the chord shrinks to nothing.
    final y = rect.center.dy + b * (scanT * 2 - 1) * 0.92;
    final dy = (y - rect.center.dy) / b;
    final halfChord = a * math.sqrt(math.max(0, 1 - dy * dy));
    if (halfChord <= 1) return;

    final x1 = rect.center.dx - halfChord;
    final x2 = rect.center.dx + halfChord;
    final linePaint = Paint()
      ..shader = LinearGradient(
        colors: [
          color.withOpacity(0),
          color.withOpacity(0.85),
          color.withOpacity(0),
        ],
      ).createShader(Rect.fromLTWH(x1, y - 1, halfChord * 2, 2))
      ..strokeWidth = 2;
    canvas.drawLine(Offset(x1, y), Offset(x2, y), linePaint);
  }

  @override
  bool shouldRepaint(covariant _FramePainter oldDelegate) =>
      oldDelegate.scanT != scanT ||
      oldDelegate.color != color ||
      oldDelegate.inset != inset ||
      oldDelegate.ovalRatio != ovalRatio;
}
