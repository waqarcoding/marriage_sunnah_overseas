import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ProfileMediaSection extends StatefulWidget {
  final List<Map<String, dynamic>> media;
  final Map<String, dynamic> profile;
  final int? matchPct;
  final bool isPro;
  final ValueChanged<int> onExpand;

  const ProfileMediaSection({
    Key? key,
    required this.media,
    required this.profile,
    this.matchPct,
    this.isPro = false,
    required this.onExpand,
  }) : super(key: key);

  @override
  State<ProfileMediaSection> createState() => _ProfileMediaSectionState();
}

class _ProfileMediaSectionState extends State<ProfileMediaSection> {
  int _idx = 0;
  late PageController _pageCtrl;

  @override
  void initState() {
    super.initState();
    _pageCtrl = PageController();
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  bool get _isOnline {
    final d = widget.profile['last_seen'];
    if (d == null) return false;
    try {
      return DateTime.now().difference(DateTime.parse(d.toString())).inSeconds < 3600;
    } catch (_) { return false; }
  }

  String _formatLastSeen(dynamic d) {
    if (d == null) return '';
    try {
      final s = DateTime.now().difference(DateTime.parse(d.toString())).inSeconds;
      if (s < 60) return 'now';
      if (s < 3600) return '${s ~/ 60}m ago';
      if (s < 86400) return '${s ~/ 3600}h ago';
      return '${s ~/ 86400}d ago';
    } catch (_) { return ''; }
  }

  @override
  Widget build(BuildContext context) {
    final media = widget.media;
    final profile = widget.profile;
    final name = profile['name']?.toString() ?? '';
    final age = profile['age']?.toString();
    final location = [profile['city'], profile['country']]
        .where((e) => e != null && e.toString().isNotEmpty)
        .map((e) => e.toString())
        .join(', ');

    if (media.isEmpty) return SizedBox.shrink();

    return Padding(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        children: [
          // Main carousel
          AspectRatio(
            aspectRatio: 1,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Page view
                  PageView.builder(
                    controller: _pageCtrl,
                    onPageChanged: (i) => setState(() => _idx = i),
                    itemCount: media.length,
                    itemBuilder: (ctx, i) {
                      final item = media[i];
                      if (item['type'] == 'video') {
                        return _VideoSlide(url: item['url'] ?? '');
                      }
                      return _ImageSlide(
                        url: item['url'] ?? '',
                        profile: profile,
                        isPro: widget.isPro,
                      );
                    },
                  ),

                  // Tap zones prev/next
                  if (media.length > 1) ...[
                    Positioned(
                      left: 0, top: 0, bottom: 0, width: 80,
                      child: GestureDetector(
                        onTap: () {
                          final prev = (_idx - 1 + media.length) % media.length;
                          _pageCtrl.animateToPage(prev, duration: Duration(milliseconds: 300), curve: Curves.easeOut);
                        },
                        child: Container(color: Colors.transparent),
                      ),
                    ),
                    Positioned(
                      right: 0, top: 0, bottom: 0, width: 80,
                      child: GestureDetector(
                        onTap: () {
                          final next = (_idx + 1) % media.length;
                          _pageCtrl.animateToPage(next, duration: Duration(milliseconds: 300), curve: Curves.easeOut);
                        },
                        child: Container(color: Colors.transparent),
                      ),
                    ),
                  ],

                  // Dot indicators
                  if (media.length > 1)
                    Positioned(
                      top: 14, left: 0, right: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(media.length, (i) => AnimatedContainer(
                          duration: Duration(milliseconds: 250),
                          margin: EdgeInsets.symmetric(horizontal: 3),
                          height: 3,
                          width: i == _idx ? 24 : 12,
                          decoration: BoxDecoration(
                            color: i == _idx ? Colors.white : Colors.white.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        )),
                      ),
                    ),

                  // Counter top right
                  if (media.length > 1)
                    Positioned(
                      top: 14, right: 14,
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.white.withOpacity(0.15)),
                        ),
                        child: Text('${_idx + 1}/${media.length}',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white)),
                      ),
                    ),

                  // Expand button top left
                  Positioned(
                    top: 14, left: 14,
                    child: GestureDetector(
                      onTap: () => widget.onExpand(_idx),
                      child: Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withOpacity(0.15)),
                        ),
                        child: Icon(Icons.fullscreen, size: 18, color: Colors.white),
                      ),
                    ),
                  ),

                  // Bottom overlay with name + match ring
                  Positioned(
                    bottom: 0, left: 0, right: 0,
                    child: Container(
                      padding: EdgeInsets.fromLTRB(18, 80, 18, 18),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [Colors.black.withOpacity(0.85), Colors.black.withOpacity(0.3), Colors.transparent],
                          stops: [0, 0.6, 1],
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  age != null && age.isNotEmpty ? '$name, $age' : name,
                                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w500, color: Colors.white, letterSpacing: -0.015, height: 1.2),
                                ),
                                if (location.isNotEmpty)
                                  Padding(
                                    padding: EdgeInsets.only(top: 6),
                                    child: Row(
                                      children: [
                                        Icon(Icons.location_on, size: 13, color: Colors.white.withOpacity(0.7)),
                                        SizedBox(width: 4),
                                        Text(location, style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.75))),
                                      ],
                                    ),
                                  ),
                                Padding(
                                  padding: EdgeInsets.only(top: 8),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 7, height: 7,
                                        decoration: BoxDecoration(
                                          color: _isOnline ? Color(0xFF10B981) : Color(0xFF6B7280),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      SizedBox(width: 6),
                                      Text(
                                        _isOnline
                                            ? 'Active ${_formatLastSeen(profile['last_seen'])}'
                                            : 'Offline',
                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.65)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (widget.matchPct != null)
                            _MatchRing(pct: widget.matchPct!),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Thumbnails
          if (media.length > 1)
            Padding(
              padding: EdgeInsets.only(top: 12),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: List.generate(media.length, (i) {
                    final item = media[i];
                    return GestureDetector(
                      onTap: () {
                        _pageCtrl.animateToPage(i, duration: Duration(milliseconds: 300), curve: Curves.easeOut);
                      },
                      child: AnimatedContainer(
                        duration: Duration(milliseconds: 200),
                        margin: EdgeInsets.only(right: 8),
                        width: 60, height: 60,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: i == _idx ? Color(0xFF1B4D3E) : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(13),
                          child: item['type'] == 'video'
                              ? Container(
                                  color: Color(0xFF1A1A1A),
                                  child: Icon(Icons.play_arrow, color: Colors.white, size: 20),
                                )
                              : Opacity(
                                  opacity: i == _idx ? 1.0 : 0.5,
                                  child: CachedNetworkImage(
                                    imageUrl: item['url'] ?? '',
                                    fit: BoxFit.cover,
                                    errorWidget: (_, __, ___) => Container(color: Colors.grey[200]),
                                  ),
                                ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ImageSlide extends StatefulWidget {
  final String url;
  final Map<String, dynamic> profile;
  final bool isPro;
  const _ImageSlide({required this.url, required this.profile, required this.isPro});

  @override
  State<_ImageSlide> createState() => _ImageSlideState();
}

class _ImageSlideState extends State<_ImageSlide> {
  bool _loaded = false;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        if (!_loaded)
          Container(
            color: Color(0xFF1A1A1A),
            child: Center(
              child: CircularProgressIndicator(color: Color(0xFF1B4D3E), strokeWidth: 2.5),
            ),
          ),
        CachedNetworkImage(
          imageUrl: widget.url,
          fit: BoxFit.cover,
          imageBuilder: (ctx, img) {
            if (!_loaded) WidgetsBinding.instance.addPostFrameCallback((_) => setState(() => _loaded = true));
            return AnimatedOpacity(
              opacity: _loaded ? 1.0 : 0.0,
              duration: Duration(milliseconds: 300),
              child: Image(image: img, fit: BoxFit.cover),
            );
          },
          errorWidget: (_, __, ___) => Container(color: Colors.grey[200]),
        ),
      ],
    );
  }
}

class _VideoSlide extends StatelessWidget {
  final String url;
  const _VideoSlide({required this.url});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.play_circle_outline, size: 64, color: Colors.white.withOpacity(0.7)),
            SizedBox(height: 8),
            Text('Video', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
          ],
        ),
      ),
    );
  }
}

class _MatchRing extends StatelessWidget {
  final int pct;
  const _MatchRing({required this.pct});

  Color get _color => pct >= 80 ? Color(0xFF10B981) : pct >= 50 ? Color(0xFFF59E0B) : Color(0xFFEF4444);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 64, height: 64,
      child: Stack(
        fit: StackFit.expand,
        children: [
          CustomPaint(painter: _RingPainter(pct: pct, color: _color)),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('$pct%', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                Text('Match', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.7))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final int pct;
  final Color color;
  const _RingPainter({required this.pct, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 4;
    final paint = Paint()..style = PaintingStyle.stroke..strokeWidth = 4..strokeCap = StrokeCap.round;
    paint.color = Colors.white.withOpacity(0.15);
    canvas.drawCircle(center, radius, paint);
    paint.color = color;
    final sweep = 2 * 3.14159 * pct / 100;
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), -3.14159 / 2, sweep, false, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
