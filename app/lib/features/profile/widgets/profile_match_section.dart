import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ProfileMatchSection extends StatelessWidget {
  final Map<String, dynamic>? profile;
  final Map<String, dynamic>? myProfile;
  final int? matchPct;
  final List<String> photos;

  const ProfileMatchSection({
    Key? key,
    this.profile,
    this.myProfile,
    this.matchPct,
    this.photos = const [],
  }) : super(key: key);

  List<String> _parseImages(dynamic v) {
    if (v == null) return [];
    if (v is List) return v.map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
    try {
      final s = v.toString();
      if (s.startsWith('[')) {
        return s.replaceAll('[', '').replaceAll(']', '').replaceAll('"', '')
            .split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      }
      return s.isNotEmpty ? [s] : [];
    } catch (_) { return []; }
  }

  String _fmt(dynamic v) {
    if (v == null) return '—';
    if (v == true || v == 1) return 'Yes';
    if (v == false || v == 0) return 'No';
    return v.toString();
  }

  @override
  Widget build(BuildContext context) {
    if (profile == null || myProfile == null) return SizedBox.shrink();

    final myName = myProfile!['name']?.toString().split(' ').first ?? 'You';
    final theirName = profile!['name']?.toString().split(' ').first ?? 'Them';
    final myPhotos = _parseImages(myProfile!['images']);
    final theirPhotos = _parseImages(profile!['images']);
    final myPhoto = myPhotos.isNotEmpty ? myPhotos.first : null;
    final theirPhoto = theirPhotos.isNotEmpty ? theirPhotos.first : null;

    final fields = [
      {'key': 'religion', 'label': 'Religion', 'mine': myProfile!['religion'], 'theirs': profile!['religion']},
      {'key': 'sect', 'label': 'Sect', 'mine': myProfile!['sect'], 'theirs': profile!['sect']},
      {'key': 'nationality', 'label': 'Nationality', 'mine': myProfile!['nationality'], 'theirs': profile!['nationality']},
      {'key': 'country', 'label': 'Country', 'mine': myProfile!['country'], 'theirs': profile!['country']},
      {'key': 'marital_status', 'label': 'Marital status', 'mine': myProfile!['marital_status'], 'theirs': profile!['marital_status']},
      {'key': 'has_children', 'label': 'Has children', 'mine': myProfile!['has_children'], 'theirs': profile!['has_children']},
      {'key': 'willing_to_relocate', 'label': 'Open to relocate', 'mine': myProfile!['willing_to_relocate'], 'theirs': profile!['willing_to_relocate']},
    ].where((f) => f['theirs'] != null).toList();

    final matchCount = fields.where((f) {
      if (f['mine'] == null) return false;
      return f['mine'].toString().toLowerCase() == f['theirs'].toString().toLowerCase() || f['mine'] == f['theirs'];
    }).length;

    return Container(
      margin: EdgeInsets.fromLTRB(16, 16, 16, 40),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.08), blurRadius: 12, offset: Offset(0, 2)),
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4, offset: Offset(0, 1)),
        ],
        border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.06)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          children: [
            // Header - dark green background
            Container(
              padding: EdgeInsets.all(20),
              color: Color(0xFF1B4D3E),
              child: Column(
                children: [
                  Row(
                    children: [
                      // My side
                      Expanded(child: _PersonSide(name: myName, photo: myPhoto, isMe: true)),

                      // Center match ring
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: matchPct != null
                            ? _AnimatedMatchRing(pct: matchPct!)
                            : Icon(Icons.favorite, size: 32, color: Colors.white.withOpacity(0.35)),
                      ),

                      // Their side
                      Expanded(child: _PersonSide(name: theirName, photo: theirPhoto, isMe: false)),
                    ],
                  ),

                  // Match summary badge
                  if (fields.isNotEmpty)
                    Padding(
                      padding: EdgeInsets.only(top: 14),
                      child: Center(
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '$matchCount of ${fields.length} ${fields.length == 1 ? "match" : "matches"}',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white, letterSpacing: 0.01),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Comparison rows
            ...List.generate(fields.length, (i) {
              final field = fields[i];
              final matched = field['mine'] != null && (
                field['mine'].toString().toLowerCase() == field['theirs'].toString().toLowerCase() ||
                field['mine'] == field['theirs']
              );
              return Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: matched ? Color(0xFF10B981).withOpacity(0.04) : Colors.white,
                  border: Border(
                    bottom: i < fields.length - 1
                        ? BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.06))
                        : BorderSide.none,
                  ),
                ),
                child: Row(
                  children: [
                    // My value
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(field['label'].toString().toUpperCase(),
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Color(0xFF9CA3AF), letterSpacing: 0.02)),
                          SizedBox(height: 3),
                          Text(
                            _fmt(field['mine']),
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: matched ? FontWeight.w600 : FontWeight.w500,
                              color: matched ? Color(0xFF1B4D3E) : Color(0xFF374151),
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),

                    // Center indicator
                    Container(
                      width: 32,
                      child: Center(
                        child: Container(
                          width: 20, height: 20,
                          decoration: BoxDecoration(
                            color: matched ? Color(0xFF10B981) : Color(0xFFF5F5F5),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Icon(
                            matched ? Icons.check : Icons.remove,
                            size: matched ? 12 : 10,
                            color: matched ? Colors.white : Color(0xFFD1D5DB),
                          ),
                        ),
                      ),
                    ),

                    // Their value
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(field['label'].toString().toUpperCase(),
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Color(0xFF9CA3AF), letterSpacing: 0.02)),
                          SizedBox(height: 3),
                          Text(
                            _fmt(field['theirs']),
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF6B7280)),
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.right,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _PersonSide extends StatelessWidget {
  final String name;
  final String? photo;
  final bool isMe;

  const _PersonSide({required this.name, this.photo, required this.isMe});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 60, height: 60,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white.withOpacity(0.25), width: 2),
            color: Colors.white.withOpacity(0.1),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(17),
            child: photo != null
                ? CachedNetworkImage(imageUrl: photo!, fit: BoxFit.cover, errorWidget: (_, __, ___) => _Initial(name: name))
                : _Initial(name: name),
          ),
        ),
        SizedBox(height: 8),
        Text(name, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white, letterSpacing: 0.01)),
      ],
    );
  }
}

class _Initial extends StatelessWidget {
  final String name;
  const _Initial({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white.withOpacity(0.1),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w500, color: Colors.white),
        ),
      ),
    );
  }
}

class _AnimatedMatchRing extends StatefulWidget {
  final int pct;
  const _AnimatedMatchRing({required this.pct});

  @override
  State<_AnimatedMatchRing> createState() => _AnimatedMatchRingState();
}

class _AnimatedMatchRingState extends State<_AnimatedMatchRing> with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ac = AnimationController(vsync: this, duration: Duration(milliseconds: 1200));
    _anim = Tween<double>(begin: 0, end: widget.pct / 100.0)
        .animate(CurvedAnimation(parent: _ac, curve: Curves.easeOutCubic));
    _ac.forward();
  }

  @override
  void dispose() { _ac.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 68, height: 68,
      child: AnimatedBuilder(
        animation: _anim,
        builder: (_, __) => Stack(
          fit: StackFit.expand,
          children: [
            CustomPaint(painter: _ArcPainter(value: _anim.value)),
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('${widget.pct}%',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white, letterSpacing: -0.01)),
                  Text('MATCH',
                      style: TextStyle(fontSize: 8, fontWeight: FontWeight.w600, color: Colors.white.withOpacity(0.7), letterSpacing: 0.08)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ArcPainter extends CustomPainter {
  final double value;
  const _ArcPainter({required this.value});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 5;
    final paint = Paint()..style = PaintingStyle.stroke..strokeWidth = 5..strokeCap = StrokeCap.round;
    paint.color = Colors.white.withOpacity(0.2);
    canvas.drawCircle(center, radius, paint);
    paint.color = Colors.white;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -3.14159 / 2,
      2 * 3.14159 * value,
      false, paint,
    );
  }

  @override
  bool shouldRepaint(covariant _ArcPainter old) => old.value != value;
}
