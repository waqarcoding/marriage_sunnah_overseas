import 'package:app/core/widgets/image_widget.dart';
import 'package:app/data/models/user_model.dart';
import 'package:app/features/explore/pages/notification_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:swipe_cards/swipe_cards.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/services/socket_service.dart';
import 'package:get_storage/get_storage.dart';
import '../controllers/explore_controller.dart';
import '../widgets/profile_card.dart';
import '../widgets/filter_modal.dart';
import '../../profile/pages/profile_detail_page.dart';

class ExplorePage extends StatelessWidget {
  const ExplorePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Get.put(ExploreController());
    return _ExploreView();
  }
}

class _ExploreView extends GetView<ExploreController> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            _MobileGreetingBar(),
            _FilterBar(),
            Expanded(child: _CardArea()),
          ],
        ),
      ),
    );
  }
}

// ─── Filter bar ───────────────────────────────────────────────────────────────
class _FilterBar extends GetView<ExploreController> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 12),
      decoration: BoxDecoration(
        border: Border(
            bottom: BorderSide(
                color: Color(0xFF1B4D3E).withOpacity(0.08), width: 0.5)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Obx(() => _SearchInput(
                      value: controller.search.value,
                      onChanged: (v) => controller.search.value = v,
                    )),
              ),
              SizedBox(width: 8),
              _SettingsBtn(
                  onTap: () => Get.dialog(
                        FilterModal(onClose: () => Get.back()),
                        barrierColor: Colors.black.withOpacity(0.3),
                        barrierDismissible: true,
                      )),
            ],
          ),
          SizedBox(height: 14),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Obx(() => Row(
                  children: ExploreController.filterChips.map((chip) {
                    final isActive = controller.activeFilters.contains(chip);
                    return Padding(
                      padding: EdgeInsets.only(right: 6),
                      child: _FilterChip(
                          label: chip,
                          isActive: isActive,
                          onTap: () => controller.toggleFilter(chip)),
                    );
                  }).toList(),
                )),
          ),
        ],
      ),
    );
  }
}

// ─── Card area ────────────────────────────────────────────────────────────────
class _CardArea extends GetView<ExploreController> {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Obx(() {
          if (controller.isLoading.value) return _LoadingState();
          return Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: 440),
                child: Obx(() {
                  if (controller.isEmpty) {
                    return _NoMatchesState(
                        onAdjust: () => Get.dialog(
                              FilterModal(onClose: () => Get.back()),
                              barrierColor: Colors.black.withOpacity(0.3),
                              barrierDismissible: true,
                            ));
                  }
                  if (controller.profiles.isEmpty) {
                    return _EmptyState(
                        onRefresh: () => controller.fetchProfiles());
                  }
                  return _SwipeCardDeck();
                }),
              ),
            ),
          );
        }),

        // Refresh overlay
        Obx(() {
          if (!controller.isRefreshing.value) return SizedBox.shrink();
          return Container(
            color: Colors.white.withOpacity(0.85),
            child: Center(
              child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                        width: 32,
                        height: 32,
                        child: CircularProgressIndicator(
                            color: Color(0xFF1B4D3E), strokeWidth: 2.5)),
                    SizedBox(height: 12),
                    Text('Updating results…',
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: Colors.grey[500])),
                  ]),
            ),
          );
        }),

        // Filter modal shown via Get.dialog — see _openFilterModal()
      ],
    );
  }
}

// ─── Swipe card deck ──────────────────────────────────────────────────────────
class _SwipeCardDeck extends GetView<ExploreController> {
  _SwipeCardDeck({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final profiles = List<Map<String, dynamic>>.from(controller.profiles);
      if (profiles.isEmpty) {
        return _EmptyState(onRefresh: () => controller.fetchProfiles());
      }

      final swipeItems = profiles
          .map((p) => SwipeItem(
                content: p,
                likeAction: () => controller.handleLike(),
                nopeAction: () => controller.handlePass(),
                superlikeAction: () => controller.handleSuperLike(),
              ))
          .toList();

      final engine = MatchEngine(swipeItems: swipeItems);

      return Column(
        children: [
          // ── Card stack ─────────────────────────────────────────────────
          Expanded(
            child: SwipeCards(
              matchEngine: engine,
              itemBuilder: (ctx, i) =>
                  _CardItem(profile: profiles[i < profiles.length ? i : 0]),
              onStackFinished: () => controller.fetchProfiles(),
              itemChanged: (_, i) => controller.currentIndex.value = i,
              upSwipeAllowed: true,
              fillSpace: true,
            ),
          ),
          SizedBox(height: 14),
        ],
      );
    });
  }
}

class _CardItem extends StatelessWidget {
  final Map<String, dynamic> profile;
  const _CardItem({required this.profile});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      child: ProfileCard(
        profile: profile,
        onLike: () => Get.find<ExploreController>().handleLike(),
        onPass: () => Get.find<ExploreController>().handlePass(),
        onSuperLike: () => Get.find<ExploreController>().handleSuperLike(),
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  final MatchEngine engine;
  const _ActionRow({required this.engine});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Pass ✕
        _CircleBtn(
            size: 56,
            bgColor: Colors.white,
            shadowColor: Color(0xFFEF4444).withOpacity(0.25),
            border: Color(0xFFEF4444).withOpacity(0.15),
            icon: Icons.close,
            iconColor: Color(0xFFEF4444),
            iconSize: 26,
            onTap: () => engine.currentItem?.nope()),
        SizedBox(width: 14),

        // Super-like ⭐
        _CircleBtn(
            size: 48,
            bgColor: Colors.white,
            shadowColor: Color(0xFF3B82F6).withOpacity(0.2),
            border: Color(0xFF3B82F6).withOpacity(0.15),
            icon: Icons.star_rounded,
            iconColor: Color(0xFF3B82F6),
            iconSize: 22,
            onTap: () => engine.currentItem?.superLike()),
        SizedBox(width: 14),

        // Like ❤
        _CircleBtn(
            size: 64,
            bgColor: Color(0xFF1B4D3E),
            shadowColor: Color(0xFF1B4D3E).withOpacity(0.35),
            border: Colors.transparent,
            icon: Icons.favorite,
            iconColor: Colors.white,
            iconSize: 28,
            onTap: () => engine.currentItem?.like()),
        SizedBox(width: 14),

        // Info
        _CircleBtn(
            size: 48,
            bgColor: Colors.white,
            shadowColor: Color(0xFF1B4D3E).withOpacity(0.12),
            border: Color(0xFF1B4D3E).withOpacity(0.12),
            icon: Icons.info_outline,
            iconColor: Color(0xFF1B4D3E),
            iconSize: 22,
            onTap: () {
              final profile = Get.find<ExploreController>().currentProfile;
              if (profile != null)
                Get.to(() => ProfileDetailPage(profile: profile),
                    transition: Transition.rightToLeft);
            }),
      ],
    );
  }
}

class _CircleBtn extends StatefulWidget {
  final double size, iconSize;
  final Color bgColor, shadowColor, border, iconColor;
  final IconData icon;
  final VoidCallback onTap;
  const _CircleBtn(
      {required this.size,
      required this.bgColor,
      required this.shadowColor,
      required this.border,
      required this.icon,
      required this.iconColor,
      required this.iconSize,
      required this.onTap});
  @override
  State<_CircleBtn> createState() => _CircleBtnState();
}

class _CircleBtnState extends State<_CircleBtn> {
  bool _p = false;
  @override
  Widget build(BuildContext context) => GestureDetector(
        onTapDown: (_) => setState(() => _p = true),
        onTapUp: (_) {
          setState(() => _p = false);
          widget.onTap();
        },
        onTapCancel: () => setState(() => _p = false),
        child: AnimatedScale(
          scale: _p ? 0.92 : 1.0,
          duration: Duration(milliseconds: 100),
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
                color: widget.bgColor,
                shape: BoxShape.circle,
                border: Border.all(color: widget.border, width: 1.5),
                boxShadow: [
                  BoxShadow(
                      color: widget.shadowColor,
                      blurRadius: 16,
                      offset: Offset(0, 4))
                ]),
            child: Icon(widget.icon,
                size: widget.iconSize, color: widget.iconColor),
          ),
        ),
      );
}

// ─── Search ───────────────────────────────────────────────────────────────────
class _SearchInput extends StatefulWidget {
  final String value;
  final ValueChanged<String> onChanged;
  const _SearchInput({required this.value, required this.onChanged});
  @override
  State<_SearchInput> createState() => _SearchInputState();
}

class _SearchInputState extends State<_SearchInput> {
  final _ctrl = TextEditingController();
  bool _f = false;
  @override
  void initState() {
    super.initState();
    _ctrl.text = widget.value;
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedContainer(
        duration: Duration(milliseconds: 150),
        height: 40,
        decoration: BoxDecoration(
            color: _f ? Colors.white : Color(0xFFFAFAF9),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
                color: _f
                    ? Color(0xFF1B4D3E).withOpacity(0.24)
                    : Color(0xFF1B4D3E).withOpacity(0.12))),
        child: TextField(
            controller: _ctrl,
            onChanged: widget.onChanged,
            onTap: () => setState(() => _f = true),
            onEditingComplete: () => setState(() => _f = false),
            style: TextStyle(fontSize: 14, color: Color(0xFF1B4D3E)),
            decoration: InputDecoration(
                hintText: 'Search by name or city…',
                hintStyle: TextStyle(fontSize: 14, color: Colors.grey[400]),
                prefixIcon:
                    Icon(Icons.search, size: 16, color: Colors.grey[400]),
                border: InputBorder.none,
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                isDense: true)),
      );
}

// ─── Filter button ────────────────────────────────────────────────────────────
class _SettingsBtn extends StatefulWidget {
  final VoidCallback onTap;
  const _SettingsBtn({required this.onTap});
  @override
  State<_SettingsBtn> createState() => _SettingsBtnState();
}

class _SettingsBtnState extends State<_SettingsBtn> {
  bool _h = false;
  @override
  Widget build(BuildContext context) => GestureDetector(
        onTapDown: (_) => setState(() => _h = true),
        onTapUp: (_) {
          setState(() => _h = false);
          widget.onTap();
        },
        onTapCancel: () => setState(() => _h = false),
        child: AnimatedContainer(
            duration: Duration(milliseconds: 150),
            width: 40,
            height: 40,
            decoration: BoxDecoration(
                color: _h ? Color(0xFFF0F5F3) : Color(0xFFFAFAF9),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: _h
                        ? Color(0xFF1B4D3E).withOpacity(0.24)
                        : Color(0xFF1B4D3E).withOpacity(0.12))),
            child: Icon(Icons.tune, size: 18, color: Color(0xFF1B4D3E))),
      );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────
class _FilterChip extends StatefulWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  const _FilterChip(
      {required this.label, required this.isActive, required this.onTap});
  @override
  State<_FilterChip> createState() => _FilterChipState();
}

class _FilterChipState extends State<_FilterChip>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _scale;
  @override
  void initState() {
    super.initState();
    _ac =
        AnimationController(vsync: this, duration: Duration(milliseconds: 100));
    _scale = Tween<double>(begin: 1.0, end: 0.96).animate(_ac);
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
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
                child: AnimatedContainer(
                    duration: Duration(milliseconds: 200),
                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                        gradient: widget.isActive
                            ? LinearGradient(
                                colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)])
                            : null,
                        color: widget.isActive ? null : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: widget.isActive
                            ? null
                            : Border.all(
                                color: Color(0xFF1B4D3E).withOpacity(0.14))),
                    child: Text(widget.label,
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: widget.isActive
                                ? Colors.white
                                : Color(0xFF1B4D3E)))))),
      );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
class _LoadingState extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        SizedBox(
            width: 40,
            height: 40,
            child: CircularProgressIndicator(
                color: Color(0xFF1B4D3E), strokeWidth: 2.5)),
        SizedBox(height: 16),
        Text('Loading profiles…',
            style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.grey[500])),
      ]));
}

// ─── Empty ────────────────────────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  final VoidCallback onRefresh;
  const _EmptyState({required this.onRefresh});
  @override
  Widget build(BuildContext context) =>
      Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
                color: AppColors.secondary,
                borderRadius: BorderRadius.circular(28)),
            child: Icon(Icons.auto_awesome,
                size: 40, color: Color(0xFF1B4D3E).withOpacity(0.6))),
        SizedBox(height: 24),
        Text("You're all caught up",
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w500,
                color: Color(0xFF1B4D3E),
                letterSpacing: -0.01)),
        SizedBox(height: 8),
        Text(
            'No more profiles for now. Check back later or adjust your filters.',
            style:
                TextStyle(fontSize: 14, color: Colors.grey[500], height: 1.5),
            textAlign: TextAlign.center),
        SizedBox(height: 32),
        _GreenBtn(label: 'Refresh', onTap: onRefresh),
      ]);
}

class _NoMatchesState extends StatelessWidget {
  final VoidCallback onAdjust;
  const _NoMatchesState({required this.onAdjust});
  @override
  Widget build(BuildContext context) =>
      Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
                color: Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(28)),
            child: Icon(Icons.warning_amber_outlined,
                size: 40, color: Color(0xFFD97706))),
        SizedBox(height: 24),
        Text('No Matches Found',
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w500,
                color: Color(0xFF1B4D3E),
                letterSpacing: -0.01)),
        SizedBox(height: 8),
        Text(
            'Your current preferences filtered out all available profiles. Try adjusting your criteria to see more matches.',
            style:
                TextStyle(fontSize: 14, color: Colors.grey[500], height: 1.5),
            textAlign: TextAlign.center),
        SizedBox(height: 32),
        GestureDetector(
            onTap: onAdjust,
            child: Container(
                padding: EdgeInsets.symmetric(horizontal: 28, vertical: 11),
                decoration: BoxDecoration(
                    color: Color(0xFF1B4D3E),
                    borderRadius: BorderRadius.circular(12)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.tune, size: 16, color: Colors.white),
                  SizedBox(width: 8),
                  Text('Adjust Filters',
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.white)),
                ]))),
      ]);
}

class _GreenBtn extends StatefulWidget {
  final String label;
  final VoidCallback onTap;
  const _GreenBtn({required this.label, required this.onTap});
  @override
  State<_GreenBtn> createState() => _GreenBtnState();
}

class _GreenBtnState extends State<_GreenBtn> {
  bool _p = false;
  @override
  Widget build(BuildContext context) => GestureDetector(
      onTapDown: (_) => setState(() => _p = true),
      onTapUp: (_) {
        setState(() => _p = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _p = false),
      child: AnimatedScale(
          scale: _p ? 0.96 : 1.0,
          duration: Duration(milliseconds: 100),
          child: Container(
              padding: EdgeInsets.symmetric(horizontal: 28, vertical: 11),
              decoration: BoxDecoration(
                  color: Color(0xFF1B4D3E),
                  borderRadius: BorderRadius.circular(12)),
              child: Text(widget.label,
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                      letterSpacing: 0.01)))));
}

// ─── Mobile Greeting Bar ──────────────────────────────────────────────────────
// Pixel-perfect Flutter port of MobileGreetingBar.jsx
class _MobileGreetingBar extends StatelessWidget {
  _MobileGreetingBar({Key? key}) : super(key: key);

  Map<String, dynamic>? get _user {
    try {
      final u = GetStorage().read('user');
      return u is Map ? Map<String, dynamic>.from(u) : null;
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = _user;
    final fullName = user?['name']?.toString() ?? '';
    final firstName =
        fullName.isNotEmpty ? fullName.split(' ').first : 'Friend';
    final avatar = user?['avatar_url']?.toString();

    // Badge counts from socket
    SocketService? socket;
    try {
      socket = Get.find<SocketService>();
    } catch (_) {}
    final notifCount = Rx<int>(0);

    return Obx(() {
      if (socket != null) {
        notifCount.value =
            socket.badges.interestCount.value + socket.badges.chatCount.value;
      }
      final credits = socket?.badges.credits.value ?? 0;

      return Container(
        padding: EdgeInsets.fromLTRB(16, 14, 16, 12),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(
              bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.08))),
        ),
        child: Stack(
          children: [
            // ── Islamic pattern background ───────────────────────────────────
            Positioned.fill(
              child: Opacity(
                opacity: 0.03,
                child: CustomPaint(painter: _IslamicPatternPainter()),
              ),
            ),

            // ── Content row ──────────────────────────────────────────────────
            Row(
              children: [
                // ── Avatar + greeting ────────────────────────────────────────
                _AvatarButton(avatar: avatar, user: user, name: fullName),
                SizedBox(width: 12),

                // ── Text ─────────────────────────────────────────────────────
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Text('السلام عليكم',
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF6B7280).withOpacity(0.85))),
                          SizedBox(width: 6),
                          Text('•',
                              style: TextStyle(
                                  fontSize: 11, color: Color(0xFF6B7280))),
                          SizedBox(width: 6),
                          Text(firstName,
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF6B7280).withOpacity(0.85))),
                        ],
                      ),
                      SizedBox(height: 2),
                      ShaderMask(
                        blendMode: BlendMode.srcIn,
                        shaderCallback: (bounds) => LinearGradient(
                          colors: [Color(0xFF1B4D3E), Color(0xFF2d8c6e)],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ).createShader(bounds),
                        child: Text(
                          'Find Your Halal Match',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.3,
                            fontFamily: 'Playfair Display',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // ── Right: credits + bell ────────────────────────────────────
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Credits chip
                    _CreditsChip(credits: credits),
                    SizedBox(width: 8),

                    // Notification bell
                    _BellButton(count: notifCount.value),
                  ],
                ),
              ],
            ),
          ],
        ),
      );
    });
  }
}

// ─── Avatar button ────────────────────────────────────────────────────────────
class _AvatarButton extends StatelessWidget {
  final String? avatar;
  final String name;
  final user;
  const _AvatarButton({this.avatar, this.user, required this.name});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {}, // navigate to profile
      child: SizedBox(
        width: 52,
        height: 52,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            // Decorative conic ring
            Positioned.fill(
              child: Transform.scale(
                scale: 1.15,
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: SweepGradient(
                      colors: [
                        Color(0xFF1B4D3E).withOpacity(0.15),
                        Colors.transparent,
                        Colors.transparent,
                        Color(0xFF1B4D3E).withOpacity(0.15),
                      ],
                      stops: [0.0, 0.25, 0.75, 1.0],
                    ),
                  ),
                ),
              ),
            ),

            // Photo or initial
            avatar != null && avatar!.isNotEmpty
                ? ClipOval(
                    child: ImageAvatar(
                      images: avatar,
                      width: 60,
                      height: 60,
                      borderRadius: BorderRadius.circular(16),
                    ),
                  )
                : _Initial(name: name),

            // Gold crescent accent bottom-right
            Positioned(
              bottom: -1,
              right: -1,
              child: Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [Color(0xFF1B4D3E), Color(0xFF2d8c6e)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black.withOpacity(0.15), blurRadius: 4)
                  ],
                ),
                child: Icon(Icons.nightlight_round,
                    size: 10, color: Color(0xFFD4AF37)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Initial extends StatelessWidget {
  final String name;
  const _Initial({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [Color(0xFF1B4D3E), Color(0xFF2d8c6e)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Color(0xFFD4AF37).withOpacity(0.2), width: 2),
        boxShadow: [
          BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.25), blurRadius: 8)
        ],
      ),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : 'U',
          style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Color(0xFFFEF3C7)),
        ),
      ),
    );
  }
}

// ─── Credits chip ─────────────────────────────────────────────────────────────
class _CreditsChip extends StatelessWidget {
  final int credits;
  const _CreditsChip({required this.credits});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFFFF8E7), Color(0xFFFFF3CC)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Color(0xFFD4AF37).withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
                color: Color(0xFFD4AF37).withOpacity(0.15),
                blurRadius: 6,
                offset: Offset(0, 2)),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.bolt_rounded, size: 14, color: Color(0xFFD4AF37)),
            SizedBox(width: 3),
            Text(
              '$credits',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF92400E)),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Bell button ──────────────────────────────────────────────────────────────
class _BellButton extends StatefulWidget {
  final int count;
  const _BellButton({required this.count});

  @override
  State<_BellButton> createState() => _BellButtonState();
}

class _BellButtonState extends State<_BellButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => NotificationsPage()),
        );
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.90 : 1.0,
        duration: Duration(milliseconds: 100),
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [Color(0xFF1B4D3E), Color(0xFF2d8c6e)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            border: Border.all(
                color: Color(0xFFD4AF37).withOpacity(0.3), width: 1.5),
            boxShadow: [
              BoxShadow(
                  color: Color(0xFF1B4D3E).withOpacity(0.3),
                  blurRadius: 12,
                  offset: Offset(0, 4)),
            ],
          ),
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.center,
            children: [
              Icon(Icons.notifications_outlined,
                  size: 18, color: Color(0xFFFEF3C7)),

              // Gold badge
              if (widget.count > 0)
                Positioned(
                  top: -3,
                  right: -3,
                  child: Container(
                    constraints: BoxConstraints(minWidth: 17),
                    height: 17,
                    padding: EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFFD4AF37), Color(0xFFB8941F)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(
                          color: Color(0xFF1B4D3E).withOpacity(0.2),
                          width: 1.5),
                      boxShadow: [
                        BoxShadow(
                            color: Color(0xFFD4AF37).withOpacity(0.5),
                            blurRadius: 6),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        widget.count > 9 ? '9+' : '${widget.count}',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1B4D3E),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Islamic pattern background painter ──────────────────────────────────────
class _IslamicPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Color(0xFF1B4D3E)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5;

    const step = 40.0;
    for (double x = 0; x < size.width + step; x += step) {
      for (double y = 0; y < size.height + step; y += step) {
        // Diamond outline
        final path = Path()
          ..moveTo(x + step / 2, y)
          ..lineTo(x + step, y + step / 2)
          ..lineTo(x + step / 2, y + step)
          ..lineTo(x, y + step / 2)
          ..close();
        canvas.drawPath(path, paint);
        // Inner diamond
        final inner = Path()
          ..moveTo(x + step / 2, y + step * 0.25)
          ..lineTo(x + step * 0.75, y + step / 2)
          ..lineTo(x + step / 2, y + step * 0.75)
          ..lineTo(x + step * 0.25, y + step / 2)
          ..close();
        canvas.drawPath(inner, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}
