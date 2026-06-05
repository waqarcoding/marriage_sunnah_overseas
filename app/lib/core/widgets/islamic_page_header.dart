import 'package:flutter/material.dart';
import 'dart:math' as math;

class IslamicPageHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? icon;
  final bool showPattern;

  const IslamicPageHeader({
    Key? key,
    required this.title,
    this.subtitle,
    this.icon,
    this.showPattern = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // ✅ Same padding as _MobileGreetingBar — heights match exactly
    return Container(
      padding: EdgeInsets.fromLTRB(16, 14, 16, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.08)),
        ),
      ),
      child: Stack(
        // ✅ hardEdge clips pattern so it never bleeds to the left
        clipBehavior: Clip.hardEdge,
        children: [
          // ── Pattern: top-right corner only, fixed 88×88 box, no tile repeat ──
          if (showPattern)
            Positioned(
              top: 0,
              right: 0,
              child: Opacity(
                opacity: 0.04,
                child: SizedBox(
                  width: 88,
                  height: 88,
                  child: CustomPaint(painter: _CornerPatternPainter()),
                ),
              ),
            ),

          // ── Star inside the pattern area ────────────────────────────────────
          Positioned(
            top: 4,
            right: 8,
            child: Opacity(
              opacity: 0.08,
              child: SizedBox(
                width: 28,
                height: 28,
                child: CustomPaint(painter: _StarPainter()),
              ),
            ),
          ),

          // ── Content row ─────────────────────────────────────────────────────
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (icon != null) ...[
                _IconBox(child: icon!),
                SizedBox(width: 12),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Title with gold underline
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        ShaderMask(
                          blendMode: BlendMode.srcIn,
                          shaderCallback: (bounds) => LinearGradient(
                            colors: [Color(0xFF1B4D3E), Color(0xFF2d8c6e)],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ).createShader(bounds),
                          child: Text(
                            title,
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -0.01,
                              height: 1.1,
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: -3,
                          left: 0,
                          child: Container(
                            width: 48,
                            height: 2,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(1),
                              gradient: LinearGradient(
                                colors: [
                                  Color(0xFFD4AF37),
                                  Color(0xFFD4AF37).withOpacity(0),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (subtitle != null) ...[
                      SizedBox(height: 6),
                      Text(
                        subtitle!,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF6B7280).withOpacity(0.85),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Icon box ─────────────────────────────────────────────────────────────────
class _IconBox extends StatelessWidget {
  final Widget child;
  const _IconBox({required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF1B4D3E), Color(0xFF2d8c6e)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Color(0xFF1B4D3E).withOpacity(0.20),
                blurRadius: 12,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Center(child: child),
        ),
        Positioned(
          bottom: -4,
          right: -4,
          child: Container(
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: Color(0xFFD4AF37),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4),
              ],
            ),
            child:
                Icon(Icons.nightlight_round, size: 9, color: Color(0xFF1B4D3E)),
          ),
        ),
      ],
    );
  }
}

// ─── Corner pattern — bounded to 88×88, no left bleed ────────────────────────
class _CornerPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Color(0xFF1B4D3E)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5;

    const step = 20.0;
    for (double x = 0; x <= size.width; x += step) {
      for (double y = 0; y <= size.height; y += step) {
        final cx = x + step / 2;
        final cy = y + step / 2;
        if (cx > size.width || cy > size.height) continue;
        canvas.drawCircle(Offset(cx, cy), 7, paint);
        canvas.drawCircle(Offset(cx, cy), 3.5, paint);
        canvas.drawPath(
          Path()
            ..moveTo(cx, cy - 7)
            ..lineTo(cx + 7, cy)
            ..lineTo(cx, cy + 7)
            ..lineTo(cx - 7, cy)
            ..close(),
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

// ─── Star ─────────────────────────────────────────────────────────────────────
class _StarPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width / 2;
    final points = <Offset>[];
    for (int i = 0; i < 11; i++) {
      final angle = (i * 2 * math.pi / 10) - math.pi / 2;
      final radius = i.isEven ? r : r * 0.45;
      points.add(
          Offset(cx + radius * math.cos(angle), cy + radius * math.sin(angle)));
    }
    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (final p in points.skip(1)) path.lineTo(p.dx, p.dy);
    path.close();
    canvas.drawPath(path, Paint()..color = Color(0xFF1B4D3E));
    canvas.drawPath(
        path,
        Paint()
          ..color = Color(0xFFD4AF37)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 0.5);
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}
