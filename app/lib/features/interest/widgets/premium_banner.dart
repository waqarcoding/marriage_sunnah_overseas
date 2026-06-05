import 'package:flutter/material.dart';
import 'dart:math' as math;

class PremiumBanner extends StatefulWidget {
  final VoidCallback onUpgrade;

  const PremiumBanner({Key? key, required this.onUpgrade}) : super(key: key);

  @override
  State<PremiumBanner> createState() => _PremiumBannerState();
}

class _PremiumBannerState extends State<PremiumBanner>
    with TickerProviderStateMixin {
  late AnimationController _bgCtrl;
  late AnimationController _pulseCtrl;
  late AnimationController _floatCtrl;
  late Animation<double> _pulseAnim;
  late Animation<double> _floatAnim;

  @override
  void initState() {
    super.initState();
    _bgCtrl = AnimationController(vsync: this, duration: Duration(seconds: 8))
      ..repeat();
    _pulseCtrl =
        AnimationController(vsync: this, duration: Duration(milliseconds: 1800))
          ..repeat(reverse: true);
    _floatCtrl =
        AnimationController(vsync: this, duration: Duration(seconds: 3))
          ..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.98, end: 1.02)
        .animate(CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
    _floatAnim = Tween<double>(begin: 0, end: -4)
        .animate(CurvedAnimation(parent: _floatCtrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _bgCtrl.dispose();
    _pulseCtrl.dispose();
    _floatCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.fromLTRB(16, 20, 16, 0),
      // ✅ No fixed height — let content size it, min 180
      constraints: BoxConstraints(minHeight: 180),
      decoration: BoxDecoration(
        color: Color(0xFF021a0e),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 40,
              offset: Offset(0, 8)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // ── Animated background ──────────────────────────────────────────
            Positioned.fill(
              child: AnimatedBuilder(
                animation: _bgCtrl,
                builder: (_, __) => CustomPaint(
                  painter: _BannerPainter(_bgCtrl.value),
                ),
              ),
            ),

            // ── Glow border ──────────────────────────────────────────────────
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Color(0xFF34D399).withOpacity(0.2)),
                ),
              ),
            ),

            // ── Content ──────────────────────────────────────────────────────
            Padding(
              padding: EdgeInsets.all(20),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Left: text + button
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Heading
                        RichText(
                          text: TextSpan(
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFFECFDF5),
                                fontFamily: 'Playfair Display'),
                            children: [
                              TextSpan(text: 'Unlock All '),
                              TextSpan(
                                text: 'Likes',
                                style: TextStyle(
                                  foreground: Paint()
                                    ..shader = LinearGradient(
                                      colors: [
                                        Color(0xFF34d399),
                                        Color(0xFFa7f3d0),
                                        Color(0xFF34d399)
                                      ],
                                    ).createShader(
                                        Rect.fromLTWH(0, 0, 100, 28)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: 6),

                        // Subtext
                        Text(
                          'See everyone who likes you and match instantly.',
                          style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF6EE7B7),
                              height: 1.4),
                        ),
                        SizedBox(height: 14),

                        // CTA Button
                        AnimatedBuilder(
                          animation: _pulseAnim,
                          builder: (_, child) => Transform.scale(
                              scale: _pulseAnim.value, child: child),
                          child: GestureDetector(
                            onTap: widget.onUpgrade,
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 9),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: Color(0xFF34D399).withOpacity(0.45),
                                    blurRadius: 16,
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.auto_awesome,
                                      size: 13, color: Color(0xFF065f46)),
                                  SizedBox(width: 6),
                                  Text(
                                    'Upgrade to Premium',
                                    style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF065f46)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  SizedBox(width: 16),

                  // Right: floating crown icon
                  AnimatedBuilder(
                    animation: _floatAnim,
                    builder: (_, child) => Transform.translate(
                        offset: Offset(0, _floatAnim.value), child: child!),
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF065f46), Color(0xFF34d399)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                              color: Color(0xFF34D399).withOpacity(0.5),
                              blurRadius: 24)
                        ],
                      ),
                      child: Icon(Icons.workspace_premium,
                          color: Color(0xFF021a0e), size: 26),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BannerPainter extends CustomPainter {
  final double t;
  static final _rng = math.Random(42);
  static final _particles = List.generate(
      28,
      (i) => [
            _rng.nextDouble(),
            _rng.nextDouble(),
            _rng.nextDouble() * 1.2 + 0.4,
            (_rng.nextDouble() - 0.5) * 0.0004,
            (_rng.nextDouble() - 0.5) * 0.0004,
            _rng.nextDouble() * 0.6 + 0.2,
          ]);

  _BannerPainter(this.t);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height),
        Paint()..color = Color(0xFF021a0e));

    final blobs = [
      [0.1, 0.5, 0.7, Color(0xFF064e3b), 0.004],
      [0.75, 0.3, 0.6, Color(0xFF047857), 0.003],
      [0.5, 0.8, 0.5, Color(0xFF059669), 0.005],
    ];

    for (var b in blobs) {
      final angle = t * 2 * math.pi * (b[4] as double) * 250;
      final gx = ((b[0] as double) + math.cos(angle) * 0.08) * size.width;
      final gy =
          ((b[1] as double) + math.sin(angle * 0.8) * 0.06) * size.height;
      final gr = math.min(size.width, size.height) * (b[2] as double);
      final paint = Paint()
        ..shader = RadialGradient(
          colors: [
            (b[3] as Color).withOpacity(0.87),
            (b[3] as Color).withOpacity(0)
          ],
        ).createShader(Rect.fromCircle(center: Offset(gx, gy), radius: gr));
      canvas.drawCircle(Offset(gx, gy), gr, paint);
    }

    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height),
        Paint()..color = Colors.black.withOpacity(0.2));

    for (var p in _particles) {
      final px = (p[0] + p[3] * t * 1000) % 1.0;
      final py = (p[1] + p[4] * t * 1000) % 1.0;
      final flicker =
          0.5 + 0.5 * math.sin(t * math.pi * 2 * 6 + (px as double) * 10);
      canvas.drawCircle(
        Offset(px * size.width, (py as double) * size.height),
        p[2] as double,
        Paint()
          ..color = Color(0xFF34D39B).withOpacity((p[5] as double) * flicker),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _BannerPainter old) => true;
}
