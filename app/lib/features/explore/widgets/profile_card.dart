import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'islamic_chat_dialog.dart';
import '../../profile/pages/profile_detail_page.dart';

class ProfileCard extends StatefulWidget {
  final Map<String, dynamic> profile;
  final VoidCallback onLike;
  final VoidCallback onPass;
  final VoidCallback onSuperLike;

  const ProfileCard({
    Key? key,
    required this.profile,
    required this.onLike,
    required this.onPass,
    required this.onSuperLike,
  }) : super(key: key);

  @override
  State<ProfileCard> createState() => _ProfileCardState();
}

class _ProfileCardState extends State<ProfileCard> {
  int _photoIdx = 0;

  List<String> get _photos {
    try {
      dynamic imgs = widget.profile['images'];
      if (imgs == null) return [];
      if (imgs is List)
        return imgs
            .map((e) => e.toString())
            .where((e) => e.isNotEmpty)
            .toList();
      if (imgs is String && imgs.isNotEmpty) {
        final cleaned =
            imgs.replaceAll('[', '').replaceAll(']', '').replaceAll('"', '');
        return cleaned
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList();
      }
    } catch (_) {}
    return [];
  }

  List<String> get _interests {
    try {
      dynamic ints = widget.profile['interests'];
      if (ints == null) return [];
      if (ints is List)
        return ints
            .map((e) => e.toString())
            .where((e) => e.isNotEmpty)
            .toList();
      if (ints is String && ints.isNotEmpty) {
        return ints
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList();
      }
    } catch (_) {}
    return [];
  }

  String get _location {
    final parts = [widget.profile['city'], widget.profile['country']]
        .where((e) => e != null && e.toString().isNotEmpty)
        .map((e) => e.toString())
        .toList();
    return parts.join(', ');
  }

  bool get _isOnline {
    final lastSeen = widget.profile['last_seen'];
    if (lastSeen == null) return false;
    try {
      final d = DateTime.parse(lastSeen.toString());
      return DateTime.now().difference(d).inSeconds < 3600;
    } catch (_) {
      return false;
    }
  }

  String _formatLastSeen(dynamic d) {
    if (d == null) return '';
    try {
      final dt = DateTime.parse(d.toString());
      final s = DateTime.now().difference(dt).inSeconds;
      if (s < 60) return 'just now';
      if (s < 3600) return '${s ~/ 60}m ago';
      if (s < 86400) return '${s ~/ 3600}h ago';
      return '${s ~/ 86400}d ago';
    } catch (_) {
      return '';
    }
  }

  String _formatHeight(dynamic inches) {
    if (inches == null) return '';
    final h = int.tryParse(inches.toString());
    if (h == null) return '';
    final ft = h ~/ 12;
    final inch = h % 12;
    return "$ft' $inch\"";
  }

  void _handlePhotoTap(TapUpDetails details, double cardWidth) {
    if (_photos.length <= 1) return;
    setState(() {
      if (details.localPosition.dx < cardWidth / 2) {
        _photoIdx = (_photoIdx - 1).clamp(0, _photos.length - 1);
      } else {
        _photoIdx = (_photoIdx + 1).clamp(0, _photos.length - 1);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final photos = _photos;
    final isPro =
        widget.profile['is_pro'] == true || widget.profile['is_pro'] == 1;
    final isVerified = widget.profile['is_verified'] == true ||
        widget.profile['is_verified'] == 1;
    final isBlurred = widget.profile['is_blurred_images'] == true ||
        widget.profile['is_blurred_images'] == 1;
    final showLastSeen = widget.profile['is_show_last_seen'] != false &&
        widget.profile['is_show_last_seen'] != 0;
    final lastSeen = _formatLastSeen(widget.profile['last_seen']);
    final name = widget.profile['name']?.toString() ?? '';
    final age = widget.profile['age']?.toString();

    return Stack(
      children: [
        // Main card
        Container(
          width: double.infinity,
          height: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                  color: Color(0xFF1B4D3E).withOpacity(0.08),
                  blurRadius: 16,
                  offset: Offset(0, 2)),
              BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 4,
                  offset: Offset(0, 1)),
            ],
            border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.06)),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Column(
              children: [
                // Photo area
                Expanded(
                  child: LayoutBuilder(
                    builder: (ctx, constraints) {
                      return GestureDetector(
                        onTapUp: (d) =>
                            _handlePhotoTap(d, constraints.maxWidth),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            // Photo
                            _buildPhoto(photos, isBlurred),

                            // Photo dots
                            if (photos.length > 1)
                              Positioned(
                                top: 10,
                                left: 0,
                                right: 0,
                                child: _PhotoDots(
                                    total: photos.length, current: _photoIdx),
                              ),

                            // Badges (top left)
                            Positioned(
                              top: 10,
                              left: 10,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (isPro)
                                    _Badge(
                                      label: 'Premium',
                                      icon: Icons.star,
                                      bg: Color(0xFFEAB308).withOpacity(0.95),
                                      fg: Color(0xFF854D0E),
                                    ),
                                  if (isPro) SizedBox(height: 6),
                                  if (isVerified)
                                    _Badge(
                                      label: 'Verified',
                                      icon: Icons.verified,
                                      bg: Color(0xFF3B82F6).withOpacity(0.95),
                                      fg: Colors.white,
                                    ),
                                ],
                              ),
                            ),

                            // Gradient + name + tags (bottom overlay)
                            Positioned(
                              bottom: 0,
                              left: 0,
                              right: 0,
                              child: Container(
                                padding: EdgeInsets.fromLTRB(18, 80, 18, 16),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.bottomCenter,
                                    end: Alignment.topCenter,
                                    colors: [
                                      Colors.black.withOpacity(0.78),
                                      Colors.black.withOpacity(0.35),
                                      Colors.transparent,
                                    ],
                                    stops: [0, 0.6, 1],
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Name + age
                                    Text(
                                      age != null && age.isNotEmpty
                                          ? '$name, $age'
                                          : name,
                                      style: TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w500,
                                        color: Colors.white,
                                        letterSpacing: -0.015,
                                        height: 1.2,
                                      ),
                                    ),
                                    // Location + last seen
                                    if (_location.isNotEmpty ||
                                        (showLastSeen && lastSeen.isNotEmpty))
                                      Padding(
                                        padding: EdgeInsets.only(top: 6),
                                        child: Row(
                                          children: [
                                            Icon(Icons.location_on,
                                                size: 13,
                                                color: Colors.white
                                                    .withOpacity(0.75)),
                                            SizedBox(width: 4),
                                            if (_location.isNotEmpty)
                                              Text(
                                                _location,
                                                style: TextStyle(
                                                    fontSize: 13,
                                                    color: Colors.white
                                                        .withOpacity(0.85)),
                                              ),
                                            if (showLastSeen &&
                                                lastSeen.isNotEmpty) ...[
                                              Text(
                                                ' · $lastSeen',
                                                style: TextStyle(
                                                    fontSize: 13,
                                                    color: Colors.white
                                                        .withOpacity(0.55)),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                    // Pill tags
                                    SizedBox(height: 10),
                                    Wrap(
                                      spacing: 6,
                                      runSpacing: 6,
                                      children: [
                                        if (widget.profile['profession'] !=
                                                null &&
                                            widget.profile['profession']
                                                .toString()
                                                .isNotEmpty)
                                          _Pill(
                                              label: widget
                                                  .profile['profession']
                                                  .toString()),
                                        if (widget.profile['height_inches'] !=
                                            null)
                                          _Pill(
                                              label: _formatHeight(widget
                                                  .profile['height_inches'])),
                                        if (widget.profile['marital_status'] !=
                                                null &&
                                            widget.profile['marital_status']
                                                .toString()
                                                .isNotEmpty)
                                          _Pill(
                                              label: widget
                                                  .profile['marital_status']
                                                  .toString()),
                                        if (widget.profile['sect'] != null &&
                                            widget.profile['sect']
                                                .toString()
                                                .isNotEmpty)
                                          _Pill(
                                              label: widget.profile['sect']
                                                  .toString()),
                                        if (widget.profile['education'] !=
                                                null &&
                                            widget.profile['education']
                                                .toString()
                                                .isNotEmpty)
                                          _Pill(
                                              label: widget.profile['education']
                                                  .toString()),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // Action bar
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(
                        top: BorderSide(
                            color: Color(0xFF1B4D3E).withOpacity(0.06))),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Pass (X)
                      _ActionBtn(
                        onTap: widget.onPass,
                        variant: _BtnVariant.danger,
                        size: 52,
                        child: Icon(Icons.close,
                            size: 22, color: Color(0xFFEF4444)),
                      ),

                      // Info
                      _ActionBtn(
                        onTap: () {
                          Get.to(
                              () => ProfileDetailPage(profile: widget.profile),
                              transition: Transition.rightToLeft);
                        },
                        variant: _BtnVariant.secondary,
                        size: 52,
                        child: Icon(Icons.info_outline,
                            size: 20, color: Color(0xFF1B4D3E)),
                      ),

                      // Like (Heart) - primary large
                      _ActionBtn(
                        onTap: widget.onLike,
                        variant: _BtnVariant.primary,
                        size: 64,
                        child:
                            Icon(Icons.favorite, size: 28, color: Colors.white),
                      ),

                      // Chat
                      _ActionBtn(
                        onTap: () {
                          final name = widget.profile['name']?.toString() ?? '';
                          Get.dialog(
                            IslamicChatDialog(
                              isOpen: true,
                              onClose: () => Get.back(),
                              profileName: name,
                            ),
                            barrierColor: Colors.black.withOpacity(0.5),
                            barrierDismissible: true,
                          );
                        },
                        variant: _BtnVariant.secondary,
                        size: 52,
                        child: Icon(Icons.chat_bubble_outline,
                            size: 20, color: Color(0xFF1B4D3E)),
                      ),

                      // Super like (Star)
                      _ActionBtn(
                        onTap: widget.onSuperLike,
                        variant: _BtnVariant.superLike,
                        size: 52,
                        child: Icon(Icons.star,
                            size: 22, color: Color(0xFFA855F7), fill: 1.0),
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

  Widget _buildPhoto(List<String> photos, bool isBlurred) {
    final gender = widget.profile['gender']?.toString().toLowerCase() ?? '';
    final placeholder = gender == 'female'
        ? 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png'
        : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png';

    final photoUrl = photos.isNotEmpty ? photos[_photoIdx] : placeholder;

    return CachedNetworkImage(
      imageUrl: photoUrl,
      fit: BoxFit.cover,
      errorWidget: (ctx, url, err) =>
          Image.network(placeholder, fit: BoxFit.cover),
      imageBuilder: (ctx, img) => isBlurred
          ? ImageFiltered(
              imageFilter: ColorFilter.mode(Colors.transparent, BlendMode.dst),
              child: Image(image: img, fit: BoxFit.cover),
            )
          : Image(image: img, fit: BoxFit.cover),
    );
  }
}

// ─── Photo dots ────────────────────────────────────────────────────────────────
class _PhotoDots extends StatelessWidget {
  final int total;
  final int current;
  const _PhotoDots({required this.total, required this.current});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 48),
      child: Row(
        children: List.generate(
            total,
            (i) => Expanded(
                  child: Container(
                    height: 2,
                    margin: EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: i == current
                          ? Colors.white.withOpacity(0.95)
                          : Colors.white.withOpacity(0.35),
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                )),
      ),
    );
  }
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
class _Pill extends StatelessWidget {
  final String label;
  const _Pill({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.92),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.10)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: Color(0xFF1B4D3E),
          letterSpacing: 0.01,
        ),
      ),
    );
  }
}

// ─── Badge ────────────────────────────────────────────────────────────────────
class _Badge extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color bg;
  final Color fg;
  const _Badge(
      {required this.label,
      required this.icon,
      required this.bg,
      required this.fg});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: fg),
          SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: fg,
                  letterSpacing: 0.02)),
        ],
      ),
    );
  }
}

// ─── Action button ────────────────────────────────────────────────────────────
enum _BtnVariant { primary, secondary, danger, superLike }

class _ActionBtn extends StatefulWidget {
  final VoidCallback onTap;
  final _BtnVariant variant;
  final double size;
  final Widget child;

  const _ActionBtn({
    required this.onTap,
    required this.variant,
    required this.size,
    required this.child,
  });

  @override
  State<_ActionBtn> createState() => _ActionBtnState();
}

class _ActionBtnState extends State<_ActionBtn>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 100));
    _scale = Tween<double>(begin: 1.0, end: 0.94).animate(
      CurvedAnimation(parent: _ac, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  Color get _bg {
    switch (widget.variant) {
      case _BtnVariant.primary:
        return Color(0xFF1B4D3E);
      case _BtnVariant.danger:
        return Colors.white;
      case _BtnVariant.superLike:
        return Color(0xFFFAF5FF);
      case _BtnVariant.secondary:
        return Colors.white;
    }
  }

  BoxBorder? get _border {
    switch (widget.variant) {
      case _BtnVariant.primary:
        return null;
      case _BtnVariant.danger:
        return Border.all(color: Color(0xFFEF4444).withOpacity(0.2));
      case _BtnVariant.superLike:
        return Border.all(color: Color(0xFFA855F7).withOpacity(0.2));
      case _BtnVariant.secondary:
        return Border.all(color: Color(0xFF1B4D3E).withOpacity(0.14));
    }
  }

  List<BoxShadow>? get _shadow {
    if (widget.variant == _BtnVariant.primary) {
      return [
        BoxShadow(
            color: Color(0xFF1B4D3E).withOpacity(0.25),
            blurRadius: 14,
            offset: Offset(0, 4)),
        BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 4,
            offset: Offset(0, 2)),
      ];
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _ac.forward(),
      onTapUp: (_) {
        _ac.reverse();
        widget.onTap();
      },
      onTapCancel: () => _ac.reverse(),
      child: AnimatedBuilder(
        animation: _scale,
        builder: (_, child) => Transform.scale(
          scale: _scale.value,
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              color: _bg,
              shape: BoxShape.circle,
              border: _border,
              boxShadow: _shadow,
            ),
            child: Center(child: widget.child),
          ),
        ),
      ),
    );
  }
}
