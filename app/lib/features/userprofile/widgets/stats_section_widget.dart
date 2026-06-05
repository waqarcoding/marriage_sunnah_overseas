import 'package:flutter/material.dart';

class StatsSectionWidget extends StatelessWidget {
  final Map<String, int> counts;

  const StatsSectionWidget({Key? key, required this.counts}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final items = [
      {'icon': Icons.favorite, 'label': 'Likes',      'val': counts['likes_received'] ?? 0},
      {'icon': Icons.people,   'label': 'Matches',    'val': counts['matches']         ?? 0},
      {'icon': Icons.star,     'label': 'Likes Sent', 'val': counts['likes_sent']      ?? 0},
    ];

    return Container(
      padding: EdgeInsets.all(24),
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: items.map((item) {
          return Column(
            children: [
              Container(
                width: 56, height: 56,
                decoration: BoxDecoration(
                  color: Color(0xFFF0F5F3),
                  shape: BoxShape.circle,
                ),
                child: Icon(item['icon'] as IconData,
                    size: 28, color: Color(0xFF1B4D3E)),
              ),
              SizedBox(height: 8),
              Text('${item['val']}',
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1B4D3E))),
              SizedBox(height: 2),
              Text(item['label'] as String,
                  style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFF1B4D3E).withOpacity(0.7))),
            ],
          );
        }).toList(),
      ),
    );
  }
}
