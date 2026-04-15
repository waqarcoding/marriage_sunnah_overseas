import 'dart:async';
import 'package:app/core/utils/styles.dart';
import 'package:app_component/widgets/image_widget.dart';
import 'package:flutter/material.dart';

enum CarouselScrollMode {
  standard,
  cardStack,
  centerZoom,
  parallax,
  carousel3D,
}

enum CarouselIndicatorType { dot, line, oval, none }

class CarouselItem {
  final String imgUrl;
  final String title;
  final String subtitle;

  CarouselItem({
    required this.imgUrl,
    required this.title,
    required this.subtitle,
  });
}

class CarouselWidget extends StatefulWidget {
  final List<CarouselItem> items;
  final double height;
  final bool autoScroll;
  final Duration autoScrollInterval;
  final double itemSpacing;
  final EdgeInsetsGeometry padding;
  final double borderRadius;
  final double borderWidth;
  final Color borderColor;
  final CarouselScrollMode scrollMode;

  final CarouselIndicatorType indicatorType;
  final bool showIndicator;
  final double indicatorSpacing;
  final double indicatorWidthFactor;
  final double? indicatorHeight;
  final double dotSize;
  final double? indicatorOvalBorder;
  final double? viewportFraction;
  final ImageSourceType imageSourceType;

  const CarouselWidget({
    super.key,
    required this.items,
    this.height = 260,
    this.autoScroll = true,
    this.autoScrollInterval = const Duration(seconds: 3),
    this.itemSpacing = 8,
    this.padding = EdgeInsets.zero,
    this.borderRadius = 20,
    this.borderWidth = 0,
    this.borderColor = Colors.transparent,
    this.scrollMode = CarouselScrollMode.standard,
    this.indicatorType = CarouselIndicatorType.dot,
    this.showIndicator = true,
    this.indicatorSpacing = 6,
    this.indicatorWidthFactor = 0.6,
    this.indicatorHeight = 4,
    this.dotSize = 8,
    this.indicatorOvalBorder,
    this.viewportFraction,
    this.imageSourceType = ImageSourceType.network,
  });

  @override
  State<CarouselWidget> createState() => _CarouselWidgetState();
}

class _CarouselWidgetState extends State<CarouselWidget> {
  late final PageController _pageController;
  Timer? _autoTimer;

  late final int _virtualItemCount;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();

    _virtualItemCount = widget.items.length * 100000;
    final initialPage = _virtualItemCount ~/ 2;
    _currentIndex = initialPage % widget.items.length;

    _pageController = PageController(
      viewportFraction: widget.viewportFraction ?? 0.85,
      initialPage: initialPage,
    );

    if (widget.autoScroll) {
      _autoTimer = Timer.periodic(
        widget.autoScrollInterval,
        (_) => _nextPage(),
      );
    }
  }

  void _nextPage() {
    if (_pageController.hasClients && widget.items.isNotEmpty) {
      final nextPage = _pageController.page!.toInt() + 1;
      _pageController.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeInOut,
      );
      setState(() => _currentIndex = nextPage % widget.items.length);
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    _autoTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: widget.padding,
      child: SizedBox(
        height: widget.height,
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemBuilder: (context, index) {
                  final realIndex = index % widget.items.length;
                  return _buildAnimatedItem(context, realIndex, index);
                },
              ),
            ),
            if (widget.showIndicator) _buildIndicator(),
          ],
        ),
      ),
    );
  }

  Widget _buildAnimatedItem(
    BuildContext context,
    int realIndex,
    int virtualIndex,
  ) {
    final item = widget.items[realIndex];

    return AnimatedBuilder(
      animation: _pageController,
      builder: (context, _) {
        double value = 1.0;

        if (_pageController.hasClients &&
            _pageController.position.haveDimensions &&
            _pageController.page != null) {
          value = _pageController.page! - virtualIndex;
        } else {
          // 👇 This fixes initial equal scale issue
          value = (_pageController.initialPage - virtualIndex).toDouble();
        }

        double scale = 1.0;
        Matrix4 transform = Matrix4.identity();
        double opacity = 1.0;

        switch (widget.scrollMode) {
          case CarouselScrollMode.standard:
            scale = 1 - (value.abs() * 0.15);
            opacity = (1 - value.abs()).clamp(0.5, 1.0);
            break;

          case CarouselScrollMode.cardStack:
            scale = 1 - (value.abs() * 0.18);
            transform =
                Matrix4.identity()
                  ..translate(value * -20)
                  ..scale(scale);
            opacity = (1 - value.abs()).clamp(0.4, 1.0);
            break;

          case CarouselScrollMode.centerZoom:
            final double distance = value.abs();

            // Center biggest
            scale = (1 - (distance * 0.3)).clamp(0.76, 1.0);

            // Fade sides slightly
            //opacity = (1 - distance * 0.2).clamp(0.5, 1.0);

            // Symmetric horizontal & vertical shift
            transform =
                Matrix4.identity()
                  ..translate(
                    value * 30,
                    distance * 10,
                  ) // horizontal & vertical
                  ..scale(scale);
            break;

          case CarouselScrollMode.parallax:
            transform = Matrix4.identity()..translate(value * 50);
            scale = 1 - (value.abs() * 0.1);
            break;

          case CarouselScrollMode.carousel3D:
            transform =
                Matrix4.identity()
                  ..setEntry(3, 2, 0.001)
                  ..rotateY(value * 0.25);
            scale = 0.9 + (0.1 * (1 - value.abs()));
            break;
        }

        return Transform(
          alignment: Alignment.center,
          transform: transform,
          child: Opacity(
            opacity: opacity,
            child: Container(
              margin: EdgeInsets.symmetric(horizontal: widget.itemSpacing / 2),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(widget.borderRadius),
                border: Border.all(
                  color: widget.borderColor,
                  width: widget.borderWidth,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(widget.borderRadius),
                child: Stack(
                  children: [
                    // Image
                    Positioned.fill(
                      child: ImageWidget(
                        path: item.imgUrl,
                        fit: BoxFit.cover,
                        sourceType: widget.imageSourceType,
                      ),
                    ),

                    // Gradient Overlay
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [
                              Colors.black.withOpacity(0.6),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildIndicator() {
    final item = widget.items[_currentIndex];
    final color = Theme.of(context).colorScheme.primary;

    return Column(
      children: [
        const SizedBox(height: 16),

        // 🔹 Title
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 400),
          child: Column(
            key: ValueKey(_currentIndex),
            children: [
              Style.heading(
                item.title,
                alignment: Alignment.center,
                size: 22,
                color: color,
              ),

              const SizedBox(height: 10),

              SizedBox(
                width: 150,
                child: Style.title(item.subtitle, textAlign: TextAlign.center),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // 🔹 Indicator
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(widget.items.length, (index) {
            final active = index == _currentIndex;
            final color = Theme.of(context).colorScheme.primary;

            return Padding(
              padding: EdgeInsets.symmetric(
                horizontal: widget.indicatorSpacing,
              ),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: active ? widget.dotSize * 1.5 : widget.dotSize,
                height: widget.dotSize,
                decoration: BoxDecoration(
                  color: active ? color : Colors.grey,
                  borderRadius: BorderRadius.circular(widget.dotSize / 2),
                ),
              ),
            );
          }),
        ),
        SizedBox(height: 10),
      ],
    );
  }
}
