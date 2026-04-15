import 'package:flutter/material.dart';
import 'package:app/data/services/storage_service.dart';
import 'package:app_component/core/utils/page_transition_manager.dart';

class SplashWidget extends StatefulWidget {
  final String title;
  final String subtitle;
  final TextStyle? titleStyle;
  final TextStyle? subtitleStyle;
  final Color backgroundColor;
  final Widget? icon;
  final int duration;
  final Widget entryWidget;

  const SplashWidget({
    super.key,
    required this.title,
    required this.subtitle,
    required this.entryWidget,
    this.titleStyle,
    this.subtitleStyle,
    this.backgroundColor = Colors.white,
    this.icon,
    this.duration = 2800,
  });

  @override
  State<SplashWidget> createState() => _SplashWidgetState();
}

class _SplashWidgetState extends State<SplashWidget>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _slideAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();

    StorageService.init();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _slideAnimation = Tween<double>(
      begin: 0,
      end: -30,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));

    _fadeAnimation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeIn));

    _controller.forward();

    Future.delayed(Duration(milliseconds: widget.duration), _goNext);
  }

  void _goNext() {
    if (!mounted) return;
    PageManager.offAll(() => widget.entryWidget);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: widget.backgroundColor,
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder:
              (_, child) => Transform.translate(
                offset: Offset(0, _slideAnimation.value),
                child: Opacity(opacity: _fadeAnimation.value, child: child),
              ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (widget.icon != null) widget.icon!,
              const SizedBox(height: 16),
              Text(
                widget.title,
                textAlign: TextAlign.center,
                style:
                    widget.titleStyle ??
                    const TextStyle(fontSize: 35, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                widget.subtitle,
                textAlign: TextAlign.center,
                style:
                    widget.subtitleStyle ??
                    const TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
