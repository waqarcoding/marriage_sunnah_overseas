import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart'; // adjust path to your project

/// Full-screen "finding your match" simulation page.
/// No AppBar, no status/nav bars — pure centered animation + cycling text.
class GoLivePage extends StatefulWidget {
  const GoLivePage({Key? key}) : super(key: key);

  @override
  State<GoLivePage> createState() => _GoLivePageState();
}

class _GoLivePageState extends State<GoLivePage> with TickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final AnimationController _rotateController;

  final List<String> _messages = const [
    'Finding your perfect match…',
    'Checking compatibility…',
    'Scanning nearby profiles…',
    'Analyzing shared interests…',
    'Matching preferences…',
    'Almost there…',
  ];

  int _messageIndex = 0;
  Timer? _textTimer;

  @override
  void initState() {
    super.initState();

    // Hide both the status bar and the system nav bar for a true full-page
    // feel. Restored in dispose() so the rest of the app isn't affected.
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    _rotateController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat();

    _textTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      if (!mounted) return;
      setState(() {
        _messageIndex = (_messageIndex + 1) % _messages.length;
      });
    });
  }

  @override
  void dispose() {
    // Restore normal system UI (status bar + nav bar) for the rest of the app.
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    _pulseController.dispose();
    _rotateController.dispose();
    _textTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SizedBox.expand(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildRadar(),
              const SizedBox(height: 48),
              _buildCyclingText(),
              const SizedBox(height: 12),
              Text(
                'Sit tight — this only takes a moment',
                style: TextStyle(
                  color: AppColors.mutedForeground,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRadar() {
    return SizedBox(
      width: 220,
      height: 220,
      child: AnimatedBuilder(
        animation: Listenable.merge([_pulseController, _rotateController]),
        builder: (context, _) {
          return Stack(
            alignment: Alignment.center,
            children: [
              // Expanding pulse rings
              for (final delay in [0.0, 0.33, 0.66]) _pulseRing(delay),

              // Rotating dashed ring
              Transform.rotate(
                angle: _rotateController.value * 2 * math.pi,
                child: CustomPaint(
                  size: const Size(150, 150),
                  painter: _DashedRingPainter(color: AppColors.primary),
                ),
              ),

              // Center icon
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [AppColors.primary, AppColors.secondary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 24,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.favorite_rounded,
                  color: Colors.white,
                  size: 40,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _pulseRing(double delay) {
    final t = (_pulseController.value + delay) % 1.0;
    final scale = 0.4 + t * 1.0; // grows from 0.4x to 1.4x
    final opacity = (1.0 - t).clamp(0.0, 1.0);

    return Opacity(
      opacity: opacity * 0.5,
      child: Transform.scale(
        scale: scale,
        child: Container(
          width: 150,
          height: 150,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.primary, width: 2),
          ),
        ),
      ),
    );
  }

  Widget _buildCyclingText() {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 400),
      transitionBuilder: (child, anim) => FadeTransition(
        opacity: anim,
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.2),
            end: Offset.zero,
          ).animate(anim),
          child: child,
        ),
      ),
      child: Text(
        _messages[_messageIndex],
        key: ValueKey(_messageIndex),
        textAlign: TextAlign.center,
        style: TextStyle(
          color: AppColors.foreground,
          fontSize: 17,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

/// Simple dashed circular ring, drawn manually since Flutter has no
/// built-in dashed-border shape.
class _DashedRingPainter extends CustomPainter {
  final Color color;
  _DashedRingPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(0.7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final radius = size.width / 2;
    final center = Offset(size.width / 2, size.height / 2);
    const dashCount = 24;
    const dashSweep = (2 * math.pi) / dashCount;
    const dashFraction = 0.5; // half dash, half gap

    for (var i = 0; i < dashCount; i++) {
      final startAngle = i * dashSweep;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        dashSweep * dashFraction,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _DashedRingPainter oldDelegate) => false;
}
