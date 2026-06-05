import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProfileHeaderWidget extends StatelessWidget {
  final bool isPremium;

  const ProfileHeaderWidget({Key? key, this.isPremium = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        border: Border(
          bottom: BorderSide(color: Color(0xFFF0F5F3)),
        ),
      ),
      child: Row(
        children: [
          // Back button
          GestureDetector(
            onTap: () => Get.back(),
            child: Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.chevron_left,
                  color: Color(0xFF1B4D3E), size: 26),
            ),
          ),
          SizedBox(width: 8),

          // Title
          Text('Profile',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1B4D3E),
                letterSpacing: -0.02 * 26,
              )),

          SizedBox(width: 10),

          // PRO badge
          if (isPremium)
            Container(
              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Color(0xFFFFD700).withOpacity(0.18),
                    blurRadius: 8,
                  )
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.workspace_premium,
                      size: 14, color: Color(0xFFFFA800)),
                  SizedBox(width: 4),
                  Text('PRO',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF4D3E1B),
                        letterSpacing: 0.5,
                      )),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
