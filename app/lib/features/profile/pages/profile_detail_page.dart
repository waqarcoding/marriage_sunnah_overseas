import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/profile_detail_controller.dart';
import '../widgets/profile_media_section.dart';
import '../widgets/profile_info_section.dart';
import '../widgets/profile_match_section.dart';
import '../../explore/services/explore_service.dart';

class ProfileDetailPage extends StatefulWidget {
  final Map<String, dynamic> profile;

  const ProfileDetailPage({Key? key, required this.profile}) : super(key: key);

  @override
  State<ProfileDetailPage> createState() => _ProfileDetailPageState();
}

class _ProfileDetailPageState extends State<ProfileDetailPage> {
  late final ProfileDetailController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = Get.put(ProfileDetailController(),
        tag: widget.profile['individual_id']?.toString() ?? 'detail');
    _ctrl.init(widget.profile);
  }

  @override
  void dispose() {
    Get.delete<ProfileDetailController>(
        tag: widget.profile['individual_id']?.toString() ?? 'detail');
    super.dispose();
  }

  List<Map<String, dynamic>> get _media {
    final photos = _parseList(widget.profile['images']);
    final videos = _parseList(widget.profile['videos']);
    return [
      ...photos.map((url) => {'type': 'image', 'url': url}),
      ...videos.map((url) => {'type': 'video', 'url': url}),
    ];
  }

  List<String> _parseList(dynamic v) {
    if (v == null) return [];
    if (v is List)
      return v.map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
    try {
      final s = v.toString();
      if (s.startsWith('[')) {
        return s
            .replaceAll('[', '')
            .replaceAll(']', '')
            .replaceAll('"', '')
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList();
      }
      return s.isNotEmpty ? [s] : [];
    } catch (_) {
      return [];
    }
  }

  List<String> get _interests {
    final raw = widget.profile['interests'];
    if (raw == null) return [];
    if (raw is List)
      return raw.map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
    return raw
        .toString()
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
  }

  String _inchesToFt(dynamic n) {
    if (n == null) return '';
    final inches = int.tryParse(n.toString());
    if (inches == null) return '';
    return "${inches ~/ 12}'${inches % 12}\"";
  }

  Map<String, dynamic> get _p {
    final profile = widget.profile;
    final hc = profile['has_children'];
    final wtr = profile['willing_to_relocate'];
    return {
      'name': profile['name'] ?? 'Anonymous',
      'age': profile['age'],
      'location': [profile['city'], profile['country']]
          .where((e) => e != null && e.toString().isNotEmpty)
          .join(', '),
      'religion': profile['religion'],
      'sect': profile['sect'],
      'nationality': profile['nationality'],
      'marital_status': profile['marital_status'],
      'religious_practice_level': profile['religious_practice_level'],
      'education': profile['education'],
      'profession': profile['profession'],
      'employment_type': profile['employment_type'],
      'monthly_salary': profile['monthly_salary'],
      'height': _inchesToFt(profile['height_inches']),
      'body_type': profile['body_type'],
      'caste': profile['caste'],
      'mother_tongue': profile['mother_tongue'],
      'has_children':
          hc != null ? (hc == 1 || hc == true ? 'Yes' : 'No') : null,
      'willing_to_relocate':
          wtr != null ? (wtr == 1 || wtr == true ? 'Yes' : 'No') : null,
      'is_guardian_required': profile['is_guardian_required'],
      'father_occupation': profile['father_occupation'],
      'mother_occupation': profile['mother_occupation'],
      'brothers':
          profile['brothers'] != null ? profile['brothers'].toString() : null,
      'sisters':
          profile['sisters'] != null ? profile['sisters'].toString() : null,
      'family_background': profile['family_background'],
      'bio': profile['bio'],
      'last_seen': profile['last_seen'],
      'individual_id': profile['individual_id'],
      'phone': profile['phone'],
      'user': profile['user'],
    };
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (_ctrl.isLoading.value) return _ProfileSkeleton();

      final p = _p;
      final media = _media;
      final name = p['name'].toString();
      final age = p['age']?.toString();
      final headerTitle = age != null && age.isNotEmpty ? '$name, $age' : name;

      return Scaffold(
        backgroundColor: Color(0xFFF5F5F3),
        body: Column(
          children: [
            // Sticky header
            _StickyHeader(title: headerTitle, onBack: () => Get.back()),

            // Scrollable content
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    // 1. Media carousel
                    ProfileMediaSection(
                      media: media,
                      profile: widget.profile,
                      matchPct: _ctrl.matchPct.value,
                      isPro: _ctrl.isPro.value,
                      onExpand: (idx) {
                        // TODO: open media viewer
                      },
                    ),

                    // 2. Profile info + actions + contact reveal
                    ProfileInfoSection(
                      p: p,
                      interests: _interests,
                      onLike: () {
                        final id = p['individual_id'];
                        if (id != null) {
                          Get.find<ExploreService>()
                              .sendInterest(id as int, isSuperLike: true);
                        }
                      },
                      ctrl: _ctrl,
                    ),

                    // 3. Compatibility match section (only for individual role)
                    if (_ctrl.currentUserRole.value == 'individual')
                      ProfileMatchSection(
                        profile:
                            _ctrl.compatibilityPair.value?['otherPerson'] ??
                                widget.profile,
                        myProfile: _ctrl.compatibilityPair.value?['myWard'] ??
                            _ctrl.myProfile.value,
                        matchPct: _ctrl.matchPct.value,
                        photos: _parseList(widget.profile['images']),
                      ),

                    SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    });
  }
}

// ─── Sticky header ─────────────────────────────────────────────────────────────
class _StickyHeader extends StatelessWidget {
  final String title;
  final VoidCallback onBack;
  const _StickyHeader({required this.title, required this.onBack});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.94),
        border: Border(bottom: BorderSide(color: Color(0xFFF0F0ED))),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              GestureDetector(
                onTap: onBack,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                      color: Colors.grey[100], shape: BoxShape.circle),
                  child: Icon(Icons.chevron_left,
                      size: 22, color: Colors.grey[600]),
                ),
              ),
              Expanded(
                child: Center(
                  child: Text(
                    title,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF111827)),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
              ),
              SizedBox(width: 40), // balance
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────
class _ProfileSkeleton extends StatefulWidget {
  @override
  State<_ProfileSkeleton> createState() => _ProfileSkeletonState();
}

class _ProfileSkeletonState extends State<_ProfileSkeleton>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 1200))
          ..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.4, end: 1.0).animate(_ac);
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF5F5F3),
      body: Column(
        children: [
          // Header skeleton
          Container(
            color: Colors.white.withOpacity(0.94),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    AnimatedBuilder(
                      animation: _anim,
                      builder: (_, __) => Opacity(
                        opacity: _anim.value,
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(colors: [
                              Color(0xFF1B4D3E).withOpacity(0.05),
                              Color(0xFF1B4D3E).withOpacity(0.12)
                            ]),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: AnimatedBuilder(
                        animation: _anim,
                        builder: (_, __) => Opacity(
                          opacity: _anim.value,
                          child: Container(
                            height: 14,
                            width: 120,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(colors: [
                                Color(0xFF1B4D3E).withOpacity(0.05),
                                Color(0xFF1B4D3E).withOpacity(0.12)
                              ]),
                              borderRadius: BorderRadius.circular(7),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: AnimatedBuilder(
                animation: _anim,
                builder: (_, __) => Opacity(
                  opacity: _anim.value,
                  child: Column(
                    children: [
                      // Media skeleton
                      Container(
                        height: 300,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: [
                            Color(0xFF1B4D3E).withOpacity(0.03),
                            Color(0xFF1B4D3E).withOpacity(0.1)
                          ]),
                          borderRadius: BorderRadius.circular(24),
                        ),
                      ),
                      SizedBox(height: 16),
                      // Info skeleton rows
                      ...List.generate(
                          3,
                          (i) => Padding(
                                padding: EdgeInsets.only(bottom: 12),
                                child: Container(
                                  height: 52,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(colors: [
                                      Color(0xFF1B4D3E).withOpacity(0.05),
                                      Color(0xFF1B4D3E).withOpacity(0.12)
                                    ]),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                              )),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
