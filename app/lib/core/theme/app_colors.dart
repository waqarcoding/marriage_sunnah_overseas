import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF1B4D3E);
  static const Color accent = Color(0xFFFEF3C7);
  static const Color secondary = Color(0xFFF0F5F3);
  
  // Aurora Glow Colors
  static const Color primaryGlow = Color(0xFFD4AF37);
  static const Color secondaryGlow = Color(0xFFF7E5B2);
  static const Color tertiaryGlow = Color(0xFFDDE9DA);
  static const Color overlayTint = Color(0xFFD6C893);
  
  // Background Gradient Colors
  static const Color backgroundStart = Color(0xFFE8F5F1);
  static const Color backgroundMid = Color(0xFFF0F9F6);
  static const Color backgroundEnd = Color(0xFFFAFFFE);
  
  // Text Colors
  static const Color foreground = Color(0xFF1B4D3E);
  static const Color background = Color(0xFFFFFFFF);
  static const Color mutedForeground = Color(0xFF6B7280);
  static const Color cardForeground = Color(0xFF1F2937);
  
  // Border & Input
  static const Color border = Color(0xFFE5E7EB);
  static const Color input = Color(0xFFFFFFFF);
  static const Color inputBorder = Color(0xFFD1D5DB);
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
  
  // Card & Surface
  static const Color card = Color(0xFFFFFFFF);
  static const Color popover = Color(0xFFFFFFFF);
  
  // Ring (focus state)
  static const Color ring = Color(0xFF1B4D3E);
  
  // Destructive
  static const Color destructive = Color(0xFFEF4444);
  static const Color destructiveForeground = Color(0xFFFFFFFF);
  
  // Premium/Gold
  static const Color gold = Color(0xFFD4AF37);
  
  // Online Status
  static const Color online = Color(0xFF10B981);
  static const Color offline = Color(0xFF9CA3AF);
  
  // Shadows
  static BoxShadow get cardShadow => BoxShadow(
    color: Colors.black.withOpacity(0.05),
    blurRadius: 10,
    offset: const Offset(0, 2),
  );
  
  static BoxShadow get elevatedShadow => BoxShadow(
    color: Colors.black.withOpacity(0.1),
    blurRadius: 20,
    offset: const Offset(0, 4),
  );
  
  // Helper method for opacity
  static Color withOpacity(Color color, double opacity) {
    return color.withOpacity(opacity);
  }
}
