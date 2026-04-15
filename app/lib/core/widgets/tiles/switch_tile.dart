import 'package:flutter/material.dart';

class SwitchTile extends StatelessWidget {
  final String title;
  final bool value;
  final Function(bool) onChanged;

  SwitchTile({required this.title, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(title: Text(title), value: value, onChanged: onChanged);
  }
}
