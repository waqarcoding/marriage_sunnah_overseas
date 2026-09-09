import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/subscription/controller/subscription_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:video_player/video_player.dart';

class SubscriptionPage extends GetView<SettingsController> {
  const SubscriptionPage({super.key});

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      systemNavigationBarColor: Colors.black,
      systemNavigationBarIconBrightness: Brightness.light,
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          const Positioned.fill(child: BackgroundVideo()),
          SafeArea(
            child: Column(
              children: [
                const _TopBar(),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: Column(
                      children: const [
                        SizedBox(height: 20),
                        _HeroSection(),
                        SizedBox(height: 28),
                        _FeaturesList(),
                        SizedBox(height: 28),
                        _PricingCards(),
                        SizedBox(height: 16),
                        _RestoreButton(),
                        SizedBox(height: 12),
                        _LegalText(),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ───────────────── BACKGROUND VIDEO ─────────────────

class BackgroundVideo extends StatefulWidget {
  const BackgroundVideo({super.key});

  @override
  State<BackgroundVideo> createState() => _BackgroundVideoState();
}

class _BackgroundVideoState extends State<BackgroundVideo> {
  // ── Add / remove asset paths here to extend the playlist ──
  static const List<String> _playlist = [
    'assets/videos/paywall.mp4',
    'assets/videos/paywall2.mp4',
    'assets/videos/paywall3.mp4',
  ];

  VideoPlayerController? _current;
  VideoPlayerController? _next; // pre-loaded next video
  int _index = 0;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _loadAndPlay(_index);
  }

  // ── Returns asset path for given index, wrapping around ──
  String _assetAt(int i) => _playlist[i % _playlist.length];

  Future<void> _loadAndPlay(int index) async {
    try {
      final ctrl = VideoPlayerController.asset(_assetAt(index));
      await ctrl.initialize();
      if (!mounted) {
        ctrl.dispose();
        return;
      }

      await ctrl.setLooping(false); // we handle looping manually
      await ctrl.setVolume(0);

      // Listen for end-of-video to advance playlist
      ctrl.addListener(() => _onVideoProgress(ctrl));

      setState(() {
        _current?.dispose();
        _current = ctrl;
        _index = index;
        _isInitialized = true;
      });

      await ctrl.play();

      // Pre-load the next video silently in background
      _preloadNext(index + 1);
    } catch (e) {
      debugPrint('BackgroundVideo error [$index]: $e');
      // Skip broken asset → try next
      if (mounted) _advanceTo(_index + 1);
    }
  }

  Future<void> _preloadNext(int index) async {
    try {
      final ctrl = VideoPlayerController.asset(_assetAt(index));
      await ctrl.initialize();
      if (!mounted) {
        ctrl.dispose();
        return;
      }
      await ctrl.setVolume(0);
      // Just store it; don't play yet
      _next?.dispose();
      _next = ctrl;
    } catch (_) {
      // Pre-load failure is non-fatal; _loadAndPlay will handle it when needed
    }
  }

  void _onVideoProgress(VideoPlayerController ctrl) {
    if (!ctrl.value.isInitialized) return;
    final pos = ctrl.value.position;
    final dur = ctrl.value.duration;
    // Trigger ~200 ms before end to avoid black flash
    if (dur.inMilliseconds > 0 &&
        pos.inMilliseconds >= dur.inMilliseconds - 200 &&
        !ctrl.value.isPlaying == false) {
      // Remove listener so it doesn't fire multiple times
      ctrl.removeListener(() => _onVideoProgress(ctrl));
      _advanceTo(_index + 1);
    }
  }

  void _advanceTo(int nextIndex) {
    if (!mounted) return;
    final wrappedIndex = nextIndex % _playlist.length;

    // If the pre-loaded controller matches the next asset, reuse it
    if (_next != null) {
      _playPreloaded(wrappedIndex);
    } else {
      _loadAndPlay(wrappedIndex);
    }
  }

  Future<void> _playPreloaded(int index) async {
    final ctrl = _next!;
    _next = null;

    if (!mounted) {
      ctrl.dispose();
      return;
    }

    ctrl.addListener(() => _onVideoProgress(ctrl));

    setState(() {
      _current?.dispose();
      _current = ctrl;
      _index = index;
    });

    await ctrl.play();

    // Pre-load the one after
    _preloadNext(index + 1);
  }

  @override
  void dispose() {
    _current?.dispose();
    _next?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Fallback solid background
        Container(color: Colors.black),

        // Active video
        if (_isInitialized && _current != null)
          FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: _current!.value.size.width,
              height: _current!.value.size.height,
              child: VideoPlayer(_current!),
            ),
          ),

        // Semi-transparent overlay so text stays readable
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withOpacity(0.20),
                Colors.black.withOpacity(0.95),
                Colors.black
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ───────────────── TOP BAR ─────────────────

class _TopBar extends StatelessWidget {
  const _TopBar();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
      child: Row(
        children: [
          IconButton(
            onPressed: () {
              FocusManager.instance.primaryFocus?.unfocus(); // before pop
              Get.back();
            },
            icon: const Icon(Icons.close, color: Colors.white70),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              '✦ PRO',
              style: TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ───────────────── HERO ─────────────────

class _HeroSection extends StatelessWidget {
  const _HeroSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [
        Icon(Icons.auto_awesome, color: Colors.white, size: 42),
        SizedBox(height: 16),
        Text(
          'Unlock Unlimited\nAI Video Creation',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white,
            fontSize: 26,
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: 8),
        Text(
          'Go Pro and generate viral videos without limits',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white70, fontSize: 14),
        ),
      ],
    );
  }
}

// ───────────────── FEATURES ─────────────────

class _FeaturesList extends StatelessWidget {
  const _FeaturesList();

  @override
  Widget build(BuildContext context) {
    const features = [
      "🎬 More video credits",
      "⚡ Priority generation",
      "🎵 AI audio + voice",
      "📺 1080p HD export",
      "💾 Unlimited storage",
    ];

    return Column(
      children: features
          .map(
            (f) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  Text(f.split(' ')[0]),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      f.substring(3).trim(),
                      style: const TextStyle(color: Colors.white70),
                    ),
                  ),
                  const Icon(Icons.check_circle,
                      color: Colors.greenAccent, size: 16),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

// ───────────────── PRICING ─────────────────

class _PricingCards extends GetView<SettingsController> {
  const _PricingCards();

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.availablePackages.isEmpty) {
        return const Padding(
          padding: EdgeInsets.all(16),
          child:
              Text('No plans found', style: TextStyle(color: Colors.white70)),
        );
      }

      return Column(
        children: controller.availablePackages.map((p) {
          final isPopular = p.packageType == PackageType.annual;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _PricingCard(package: p, isPopular: isPopular),
          );
        }).toList(),
      );
    });
  }
}

class _PricingCard extends GetView<SettingsController> {
  final Package package;
  final bool isPopular;

  const _PricingCard({required this.package, this.isPopular = false});

  int _credits() {
    return controller.getCreditsForPackage(package);
  }

  @override
  Widget build(BuildContext context) {
    final product = package.storeProduct;

    return GestureDetector(
      onTap: () => controller.purchasePackage(package),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(isPopular ? 0.75 : 0.55),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isPopular ? AppTheme.primary : Colors.white12,
            width: isPopular ? 2 : 1,
          ),
          boxShadow: isPopular
              ? [
                  BoxShadow(
                    color: AppTheme.primary.withOpacity(0.25),
                    blurRadius: 12,
                    spreadRadius: 1,
                  )
                ]
              : [],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        package.packageType.name.toUpperCase(),
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                      if (isPopular) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'BEST VALUE',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w700),
                          ),
                        ),
                      ]
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '🎬 ${_credits()} credits',
                    style: TextStyle(color: AppTheme.primaryLight),
                  ),
                ],
              ),
            ),
            Text(
              product.priceString,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}

// ───────────────── RESTORE ─────────────────

class _RestoreButton extends GetView<SettingsController> {
  const _RestoreButton();

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: controller.restorePurchases,
      child: const Text(
        'Restore Purchases',
        style: TextStyle(color: Colors.white70),
      ),
    );
  }
}

// ───────────────── LEGAL ─────────────────

class _LegalText extends StatelessWidget {
  const _LegalText();

  @override
  Widget build(BuildContext context) {
    return const Text(
      'Subscriptions auto-renew unless cancelled.',
      textAlign: TextAlign.center,
      style: TextStyle(color: Colors.white38, fontSize: 10),
    );
  }
}
