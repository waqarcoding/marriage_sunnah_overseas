import 'package:flutter/material.dart';

class BasicPage extends StatelessWidget {
  final Widget child;
  final bool safeArea;
  final EdgeInsetsGeometry padding;
  final PreferredSizeWidget? appBar;
  final Widget? floatingActionButton;

  const BasicPage({
    super.key,
    required this.child,
    this.safeArea = true,
    this.padding = const EdgeInsets.symmetric(horizontal: 20),
    this.appBar,
    this.floatingActionButton,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = Scaffold(
      appBar: appBar,
      floatingActionButton: floatingActionButton,
      body: Padding(padding: padding, child: child),
    );

    return safeArea ? SafeArea(child: content) : content;
  }
}
