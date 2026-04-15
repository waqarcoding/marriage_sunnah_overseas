import 'package:flutter/material.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';

class ProgressStep extends StatelessWidget {
  final double percent; // 0.0 to 1.0
  final String label;

  const ProgressStep({super.key, required this.percent, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        LinearPercentIndicator(
          lineHeight: 8.0,
          percent: percent,
          backgroundColor: Colors.grey[300]!,
          progressColor: Colors.blue,
          barRadius: const Radius.circular(4),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}
