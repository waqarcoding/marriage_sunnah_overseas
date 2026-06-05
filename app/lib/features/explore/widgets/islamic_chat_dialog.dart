import 'package:flutter/material.dart';

class IslamicChatDialog extends StatelessWidget {
  final bool isOpen;
  final VoidCallback onClose;
  final String profileName;

  const IslamicChatDialog({
    Key? key,
    required this.isOpen,
    required this.onClose,
    required this.profileName,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!isOpen) return SizedBox.shrink();

    return Center(
      child: GestureDetector(
        onTap: () {}, // prevent dismiss on card tap
        child: Container(
          margin: EdgeInsets.all(16),
          constraints: BoxConstraints(maxWidth: 440),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Color(0xFF1B4D3E).withOpacity(0.3),
                blurRadius: 60,
                offset: Offset(0, 20),
              ),
            ],
            border: Border.all(
              color: Color(0xFF1B4D3E).withOpacity(0.08),
            ),
          ),
          child: Stack(
            children: [
              // Islamic pattern background
              Positioned(
                top: 0,
                right: 0,
                child: Opacity(
                  opacity: 0.03,
                  child: SizedBox(
                    width: 120,
                    height: 120,
                    child: CustomPaint(painter: _IslamicPatternPainter()),
                  ),
                ),
              ),

              Padding(
                padding: EdgeInsets.fromLTRB(24, 28, 24, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Close button
                    Align(
                      alignment: Alignment.topRight,
                      child: GestureDetector(
                        onTap: onClose,
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: Color(0xFF1B4D3E).withOpacity(0.06),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.close,
                              size: 18, color: Color(0xFF1B4D3E)),
                        ),
                      ),
                    ),
                    SizedBox(height: 8),

                    // Icon
                    Stack(
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Color(0xFF1B4D3E), Color(0xFF2d8c6e)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Color(0xFF1B4D3E).withOpacity(0.25),
                                blurRadius: 24,
                                offset: Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Icon(Icons.message_outlined,
                              size: 28, color: Color(0xFFFEF3C7)),
                        ),
                        Positioned(
                          bottom: -2,
                          right: -2,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(
                              color: Color(0xFFD4AF37),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                    color: Colors.black.withOpacity(0.15),
                                    blurRadius: 8,
                                    offset: Offset(0, 2)),
                              ],
                            ),
                            child: Icon(Icons.nightlight,
                                size: 12, color: Color(0xFF1B4D3E)),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 20),

                    // Title
                    ShaderMask(
                      shaderCallback: (bounds) => LinearGradient(
                        colors: [Color(0xFF1B4D3E), Color(0xFF2d8c6e)],
                      ).createShader(bounds),
                      child: Text(
                        'Halal Connection Process',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: -0.02,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Following Islamic guidelines for respectful connections',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[500],
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 20),

                    // Steps
                    _StepItem(
                      icon: Icons.favorite_outline,
                      title: 'Mutual Interest',
                      description:
                          'Both you and the other person need to accept the interest request to move forward.',
                      iconBg: Color(0xFFEC4899).withOpacity(0.08),
                      iconColor: Color(0xFFEC4899),
                      stepNumber: 1,
                      isLast: false,
                    ),
                    SizedBox(height: 16),
                    _StepItem(
                      icon: Icons.shield_outlined,
                      title: 'Guardian Approval',
                      description:
                          'Guardian reviews and approves the match to ensure it meets family values and Islamic principles.',
                      iconBg: Color(0xFF1B4D3E).withOpacity(0.08),
                      iconColor: Color(0xFF1B4D3E),
                      stepNumber: 2,
                      isLast: false,
                    ),
                    SizedBox(height: 16),
                    _StepItem(
                      icon: Icons.chat_bubble_outline,
                      title: 'Halal Communication',
                      description:
                          'Once approved, you can start respectful conversations following Islamic guidelines.',
                      iconBg: Color(0xFF10B981).withOpacity(0.08),
                      iconColor: Color(0xFF10B981),
                      stepNumber: 3,
                      isLast: true,
                    ),
                    SizedBox(height: 24),

                    // Info note
                    Container(
                      padding:
                          EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: Color(0xFF1B4D3E).withOpacity(0.04),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: Color(0xFF1B4D3E).withOpacity(0.08)),
                      ),
                      child: Text(
                        '$profileName follows these guidelines to ensure all connections are respectful and halal.',
                        style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF4B5563),
                            height: 1.6),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: 20),

                    // Button
                    GestureDetector(
                      onTap: onClose,
                      child: Container(
                        width: double.infinity,
                        padding: EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF1B4D3E), Color(0xFF2d8c6e)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Color(0xFF1B4D3E).withOpacity(0.25),
                              blurRadius: 12,
                              offset: Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            'Got it',
                            style: TextStyle(
                              color: Color(0xFFFEF3C7),
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Color iconBg;
  final Color iconColor;
  final int stepNumber;
  final bool isLast;

  const _StepItem({
    required this.icon,
    required this.title,
    required this.description,
    required this.iconBg,
    required this.iconColor,
    required this.stepNumber,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: iconBg,
                    borderRadius: BorderRadius.circular(12),
                    border:
                        Border.all(color: iconColor.withOpacity(0.2), width: 2),
                  ),
                  child: Icon(icon, size: 22, color: iconColor),
                ),
                Positioned(
                  top: -6,
                  right: -6,
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: iconColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 6,
                            offset: Offset(0, 2))
                      ],
                    ),
                    child: Center(
                      child: Text(
                        '$stepNumber',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 20,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [iconColor.withOpacity(0.3), Colors.transparent],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
          ],
        ),
        SizedBox(width: 14),
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(top: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1F2937))),
                SizedBox(height: 4),
                Text(description,
                    style: TextStyle(
                        fontSize: 13, color: Color(0xFF6B7280), height: 1.5)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _IslamicPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Color(0xFF1B4D3E)
      ..strokeWidth = 0.5
      ..style = PaintingStyle.stroke;

    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 5; j++) {
        final cx = i * 20.0 + 10;
        final cy = j * 20.0 + 10;
        canvas.drawCircle(Offset(cx, cy), 8, paint);
        final path = Path()
          ..moveTo(cx, cy - 8)
          ..lineTo(cx + 8, cy)
          ..lineTo(cx, cy + 8)
          ..lineTo(cx - 8, cy)
          ..close();
        canvas.drawPath(path, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
