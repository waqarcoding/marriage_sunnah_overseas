import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:get/get.dart';

// ─── Helpers ──────────────────────────────────────────────────────────────────
String formatLastSeen(String? dateStr) {
  if (dateStr == null) return '';
  try {
    final diff = DateTime.now().difference(DateTime.parse(dateStr)).inSeconds;
    if (diff < 60) return 'just now';
    if (diff < 3600) return '${diff ~/ 60}m ago';
    if (diff < 86400) return '${diff ~/ 3600}h ago';
    return '${diff ~/ 86400}d ago';
  } catch (_) {
    return '';
  }
}

bool isOnline(String? dateStr) {
  if (dateStr == null) return false;
  try {
    return DateTime.now().difference(DateTime.parse(dateStr)).inSeconds < 3600;
  } catch (_) {
    return false;
  }
}

// ─── Last Seen Badge ──────────────────────────────────────────────────────────
class LastSeenBadge extends StatelessWidget {
  final Map<String, dynamic> profile;
  final bool viewerIsPro;

  const LastSeenBadge({
    Key? key,
    required this.profile,
    this.viewerIsPro = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final profileIsPro = profile['is_pro'] == true || profile['is_pro'] == 1;
    final canShow = profile['show_last_seen'] != false && profileIsPro;
    if (!canShow || !viewerIsPro) return SizedBox.shrink();

    final online = isOnline(profile['last_seen']?.toString());
    final seen = formatLastSeen(profile['last_seen']?.toString());
    if (seen.isEmpty) return SizedBox.shrink();

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _PulseDot(online: online),
        SizedBox(width: 6),
        Text(
          online ? 'Online' : seen,
          style: TextStyle(
            fontSize: 12,
            color: online ? Color(0xFF10B981) : Color(0xFF9CA3AF),
          ),
        ),
      ],
    );
  }
}

class _PulseDot extends StatefulWidget {
  final bool online;
  const _PulseDot({required this.online});

  @override
  State<_PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<_PulseDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 1000))
          ..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.5, end: 1.0).animate(_ac);
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.online) {
      return Container(
        width: 8,
        height: 8,
        decoration:
            BoxDecoration(color: Color(0xFF9CA3AF), shape: BoxShape.circle),
      );
    }
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Opacity(
        opacity: _anim.value,
        child: Container(
          width: 8,
          height: 8,
          decoration:
              BoxDecoration(color: Color(0xFF4ADE80), shape: BoxShape.circle),
        ),
      ),
    );
  }
}

// ─── Image Avatar ─────────────────────────────────────────────────────────────
class ImageAvatar extends StatelessWidget {
  /// Accepts: String url, List<String> urls, or JSON string
  final dynamic images;
  final String? gender;
  final String alt;
  final bool isBlurred;
  final bool viewerIsPro;
  final bool shouldShowOverlay;
  final BorderRadius? borderRadius;
  final double? width;
  final double? height;
  final BoxFit fit;

  const ImageAvatar({
    Key? key,
    required this.images,
    this.gender,
    this.alt = '',
    this.isBlurred = false,
    this.viewerIsPro = false,
    this.shouldShowOverlay = true,
    this.borderRadius,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
  }) : super(key: key);

  String? get _src {
    if (images == null) return null;
    if (images is List && (images as List).isNotEmpty) {
      final first = (images as List).first;
      return first?.toString();
    }
    if (images is String) {
      final s = (images as String).trim();
      if (s.isEmpty) return null;
      if (s.startsWith('[')) {
        try {
          // Simple parse: extract first url from JSON array string
          final inner = s
              .replaceAll('[', '')
              .replaceAll(']', '')
              .replaceAll('"', '')
              .split(',')
              .first
              .trim();
          if (inner.isNotEmpty) return inner;
        } catch (_) {}
      }
      if (s.startsWith('http')) return s;
    }
    return null;
  }

  bool get _shouldBlur => isBlurred && !viewerIsPro;

  @override
  Widget build(BuildContext context) {
    final src = _src;
    final br = borderRadius ?? BorderRadius.zero;

    return ClipRRect(
      borderRadius: br,
      child: SizedBox(
        width: width,
        height: height,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // ── Image / Fallback ───────────────────────────────────────────
            if (src != null)
              CachedNetworkImage(
                imageUrl: src,
                fit: fit,
                fadeInDuration: Duration(milliseconds: 200),
                imageBuilder: (ctx, img) => Image(
                  image: img,
                  fit: fit,
                  semanticLabel: _shouldBlur ? '' : alt,
                ),
                placeholder: (_, __) => _LoadingPlaceholder(),
                errorWidget: (_, __, ___) => _GenderPlaceholder(gender: gender),
              )
            else
              _GenderPlaceholder(gender: gender),

            // ── Blur effect ────────────────────────────────────────────────
            if (_shouldBlur)
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: br,
                  child: _BlurOverlay(
                    shouldShowOverlay: shouldShowOverlay,
                  ),
                ),
              ),

            // ── Bottom gradient (non-blurred only) ─────────────────────────
            if (!_shouldBlur && src != null)
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: Container(
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.black.withOpacity(0.7),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ─── Loading placeholder ──────────────────────────────────────────────────────
class _LoadingPlaceholder extends StatefulWidget {
  @override
  State<_LoadingPlaceholder> createState() => _LoadingPlaceholderState();
}

class _LoadingPlaceholderState extends State<_LoadingPlaceholder>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _rot;

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 850))
          ..repeat();
    _rot = Tween<double>(begin: 0, end: 1).animate(_ac);
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Color(0xFFE8F5F1),
      child: Center(
        child: AnimatedBuilder(
          animation: _rot,
          builder: (_, __) => Transform.rotate(
            angle: _rot.value * 2 * 3.14159,
            child: SizedBox(
              width: 32,
              height: 32,
              child: CustomPaint(painter: _SpinnerPainter()),
            ),
          ),
        ),
      ),
    );
  }
}

class _SpinnerPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 1.5;

    // Track
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..color = Color(0xFF1B4D3E).withOpacity(0.13)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3,
    );

    // Arc
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -3.14159 / 2,
      3.14159, // half circle arc
      false,
      Paint()
        ..color = Color(0xFF1B4D3E)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

// ─── Gender placeholder ───────────────────────────────────────────────────────
class _GenderPlaceholder extends StatelessWidget {
  final String? gender;
  const _GenderPlaceholder({this.gender});

  @override
  Widget build(BuildContext context) {
    final isFemale = gender?.toLowerCase() == 'female';
    return Container(
      color: Color(0xFFF3F4F6),
      child: Center(
        child: Icon(
          isFemale ? Icons.person_outline : Icons.person,
          color: Color(0xFF9CA3AF),
          size: 40,
        ),
      ),
    );
  }
}

// ─── Blur overlay ─────────────────────────────────────────────────────────────
class _BlurOverlay extends StatelessWidget {
  final bool shouldShowOverlay;
  const _BlurOverlay({required this.shouldShowOverlay});

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Blur tint
        Container(
          color: Colors.white.withOpacity(0.15),
        ),

        // Lock overlay
        if (shouldShowOverlay)
          GestureDetector(
            onTap: () => Get.toNamed('/subscription'),
            child: Container(
              color: Colors.transparent,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('🔒', style: TextStyle(fontSize: 22)),
                  SizedBox(height: 4),
                  Text(
                    'Upgrade\nto view',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      shadows: [
                        Shadow(
                          color: Colors.black.withOpacity(0.8),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
