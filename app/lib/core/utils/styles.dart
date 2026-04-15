import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';

class Style {
  // ---------------- Paddings ----------------
  static const EdgeInsets paddingSmall = EdgeInsets.all(8);
  static const EdgeInsets paddingMedium = EdgeInsets.all(16);
  static const EdgeInsets paddingLarge = EdgeInsets.all(24);

  // ---------------- Border Radius ----------------
  static const BorderRadius radiusSmall = BorderRadius.all(Radius.circular(8));
  static const BorderRadius radiusMedium = BorderRadius.all(
    Radius.circular(16),
  );
  static const BorderRadius radiusLarge = BorderRadius.all(Radius.circular(24));
  static const BorderRadius radiusPro = BorderRadius.all(Radius.circular(32));

  // ---------------- Shadows ----------------
  static const List<BoxShadow> shadowSoft = [
    BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 4)),
  ];

  static const List<BoxShadow> shadowMedium = [
    BoxShadow(color: Colors.black38, blurRadius: 16, offset: Offset(0, 6)),
  ];

  static const List<BoxShadow> shadowStrong = [
    BoxShadow(color: Colors.black45, blurRadius: 20, offset: Offset(0, 8)),
  ];

  // ---------------- Background Containers ----------------
  /// Basic container with color, radius, and shadow
  static Widget container({
    required Widget child,
    Color? color,
    BorderRadius? borderRadius,
    List<BoxShadow>? boxShadow,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    Gradient? gradient,
    Border? border,
    double? width,
    double? height,
    AlignmentGeometry alignment = Alignment.center,
  }) {
    // Default values
    final defaultColor = Colors.white;
    final defaultBorderRadius = BorderRadius.circular(10);
    final defaultBorder = Border.all(color: Colors.black12, width: 0.5);

    return Container(
      width: width,
      height: height,
      alignment: alignment,
      padding: padding,
      margin: margin,
      decoration: BoxDecoration(
        color: color ?? defaultColor,
        gradient: gradient,
        borderRadius: borderRadius ?? defaultBorderRadius,
        boxShadow: boxShadow,
        border: border ?? defaultBorder,
      ),
      child: child,
    );
  }

  /// Card style container
  static Widget card({
    required Widget child,
    Color? color,
    BorderRadius? borderRadius,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    List<BoxShadow>? boxShadow,
  }) {
    return container(
      child: child,
      color: color ?? Colors.white,
      borderRadius: borderRadius ?? radiusMedium,
      padding: padding ?? paddingMedium,
      margin: margin,
      boxShadow: boxShadow ?? shadowSoft,
    );
  }

  /// Rounded circular container
  static Widget rounded({
    required Widget child,
    Color? color,
    double radius = 16,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    List<BoxShadow>? boxShadow,
  }) {
    return container(
      child: child,
      color: color,
      borderRadius: BorderRadius.circular(radius),
      padding: padding,
      margin: margin,
      boxShadow: boxShadow,
    );
  }

  /// Gradient container
  static Widget gradient({
    required Widget child,
    required Gradient gradient,
    BorderRadius? borderRadius,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    List<BoxShadow>? boxShadow,
    AlignmentGeometry alignment = Alignment.center,
  }) {
    return container(
      child: child,
      gradient: gradient,
      borderRadius: borderRadius ?? radiusMedium,
      padding: padding,
      margin: margin,
      boxShadow: boxShadow,
      alignment: alignment,
    );
  }

  /// Bordered container
  static Widget bordered({
    required Widget child,
    Color? color,
    Color borderColor = Colors.black12,
    double borderWidth = 1,
    BorderRadius? borderRadius,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    List<BoxShadow>? boxShadow,
  }) {
    return container(
      child: child,
      color: color ?? Colors.white,
      borderRadius: borderRadius ?? radiusMedium,
      padding: padding,
      margin: margin,
      boxShadow: boxShadow,
      border: Border.all(color: borderColor, width: borderWidth),
    );
  }

  /// Access current context
  static BuildContext get ctx => Get.context!;

  /// Access current TextTheme
  static TextTheme get text => Theme.of(ctx).textTheme;

  // ---------------- Predefined TextStyles ----------------
  static TextStyle get bodySmall => text.bodySmall!;
  static TextStyle get bodyMedium => text.bodyMedium!;
  static TextStyle get labelSmall => text.labelSmall!;
  static TextStyle get headlineSmall => text.headlineSmall!;
  static TextStyle get headlineMedium => text.headlineMedium!;
  static TextStyle get displayLarge => text.displayLarge!;

  // ---------------- Helper methods to create Text widgets ----------------

  /// Simple Title Text
  static Widget title(
    String text, {
    double size = 13,
    Color? color,
    FontWeight? weight,
    TextAlign textAlign = TextAlign.start,
    EdgeInsets padding = const EdgeInsets.symmetric(vertical: 4),
  }) {
    return Padding(
      padding: padding,
      child: Text(
        text.tr,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        textAlign: textAlign,
        style: GoogleFonts.poppins(
          fontSize: _adjustFontSize(size),
          fontWeight: weight ?? FontWeight.normal,
          color: color ?? AppColors.onSurface,
        ),
      ),
    );
  }

  /// Label Text (secondary / small text)
  static Widget label(
    String text, {
    double size = 12,
    Color? color = AppColors.gray100,
    FontWeight? weight,
    TextAlign textAlign = TextAlign.start,
    EdgeInsets padding = const EdgeInsets.symmetric(vertical: 2),
  }) {
    return Padding(
      padding: padding,
      child: Text(
        text.tr,
        textAlign: textAlign,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: GoogleFonts.poppins(
          fontSize: _adjustFontSize(size),
          fontWeight: weight ?? FontWeight.w500,
          color: color ?? AppColors.onSurface,
        ),
      ),
    );
  }

  /// Heading with optional icon
  static Widget heading(
    String text, {
    double size = 16,
    Color? color,
    Alignment alignment = Alignment.centerLeft,
    EdgeInsets padding = const EdgeInsets.all(5),
    IconData? icon,
    double iconSize = 20,
    Color? iconColor,
    FontWeight weight = FontWeight.bold,
  }) {
    return Padding(
      padding: padding,
      child: Align(
        alignment: alignment,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: iconSize,
                color: iconColor ?? color ?? AppColors.primary,
              ),
              const SizedBox(width: 6),
            ],
            Text(
              text.tr,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.poppins(
                fontSize: _adjustFontSize(size),
                fontWeight: weight,
                color: color ?? AppColors.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Body text with flexible max lines
  static Widget body(
    String text, {
    double size = 14,
    Color? color,
    FontWeight? weight,
    TextAlign textAlign = TextAlign.start,
    int maxLines = 2,
    EdgeInsets padding = const EdgeInsets.symmetric(vertical: 2),
  }) {
    return Padding(
      padding: padding,
      child: Text(
        text.tr,
        maxLines: maxLines,
        overflow: TextOverflow.ellipsis,
        textAlign: textAlign,
        style: GoogleFonts.poppins(
          fontSize: _adjustFontSize(size),
          fontWeight: weight ?? FontWeight.normal,
          color: color ?? AppColors.onSurface,
        ),
      ),
    );
  }

  // ---------------- Private helper ----------------
  /// Adjust font size for RTL languages like Urdu/Arabic
  static double _adjustFontSize(double size) {
    if (Get.locale != null &&
        (Get.locale!.languageCode == 'ur' ||
            Get.locale!.languageCode == 'ar')) {
      return size - 1;
    }
    return size;
  }
}

/// ---------------- COLORS ----------------
///
class AppColors {
  static BuildContext get ctx => Get.context!;
  static ColorScheme get scheme => Theme.of(ctx).colorScheme;
  static TextTheme get text => Theme.of(ctx).textTheme;

  // =============== PRIMARY COLORS ===============
  static Color get primary => Color.fromARGB(255, 138, 176, 225);
  static Color get secondary => Color(0xFF89BCFF);
  static Color get accent => scheme.tertiary;

  static Color get surface =>
      Theme.of(ctx).brightness == Brightness.dark
          ? scheme.surface
          : Color(0xFFF6F6F6); //cards,buttons ...
  static Color get onSurface => scheme.onSurface;
  static Color get brand => Colors.blue;

  // =============== OTHER ===============

  static Color get onBackground => scheme.onSurface;

  static Color get tertiary => scheme.tertiary;
  static Color get onPrimary => scheme.onPrimary;
  static Color get onSecondary => scheme.onSecondary;
  static Color get onTertiary => scheme.onTertiary;
  //===============ICON========================
  static Color get iconPrimary => scheme.onBackground;
  static Color get iconSecondary => scheme.onSurfaceVariant;

  static Color get surfaceVariant => scheme.surfaceVariant;
  static Color get onSurfaceVariant => scheme.onSurfaceVariant;

  // =============== ERROR ===============
  static Color get error => scheme.error;
  static Color get onError => scheme.onError;

  // =============== OUTLINE ===============
  static Color get outline => scheme.outline;
  static Color get outlineVariant => scheme.outlineVariant;

  // =============== INVERSE ===============
  static Color get inversePrimary => scheme.inversePrimary;
  static Color get inverseSurface => scheme.inverseSurface;
  static Color get onInverseSurface => scheme.onInverseSurface;

  // Dynamic brightness helpers
  static bool get isDark => scheme.brightness == Brightness.dark;
  static bool get isLight => scheme.brightness == Brightness.light;

  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF000000);

  // -------------------------------------------------
  // DEFAULT COLORS
  // -------------------------------------------------
  static const blue = Color(0xFF0B84FE);
  static const red = Color(0xFFFF3B30);
  static const orange = Color(0xFFFF9500);
  static const yellow = Color(0xFFFFCC00);
  static const green = Color(0xFF34C759);
  static const indigo = Color(0xFF5856D6);
  static const purple = Color(0xFFAF52DE);
  static const teal = Color(0xFF30B0C7);
  // -------------------------------------------------
  // GRAYSCALE
  // -------------------------------------------------
  static const gray50 = Color(0xFFFAFAFA);
  static const gray100 = Color(0xFFF5F5F5);
  static const gray200 = Color(0xFFE5E5E5);
  static const gray300 = Color(0xFFD4D4D4);
  static const gray400 = Color(0xFFA3A3A3);
  static const gray500 = Color(0xFF737373);
  static const gray600 = Color(0xFF525252);
  static const gray700 = Color(0xFF404040);
  static const gray800 = Color(0xFF262626);
  static const gray900 = Color(0xFF1A1A1A);

  // -------------------------------------------------
  // REDS
  // -------------------------------------------------
  static const red50 = Color(0xFFFFEBEE);
  static const red100 = Color(0xFFFFCDD2);
  static const red200 = Color(0xFFEF9A9A);
  static const red300 = Color(0xFFE57373);
  static const red400 = Color(0xFFEF5350);
  static const red500 = Color(0xFFF44336);
  static const red600 = Color(0xFFE53935);
  static const red700 = Color(0xFFD32F2F);
  static const red800 = Color(0xFFC62828);
  static const red900 = Color(0xFFB71C1C);

  // -------------------------------------------------
  // GREENS
  // -------------------------------------------------
  static const green50 = Color(0xFFE8F5E9);
  static const green100 = Color(0xFFC8E6C9);
  static const green200 = Color(0xFFA5D6A7);
  static const green300 = Color(0xFF81C784);
  static const green400 = Color(0xFF66BB6A);
  static const green500 = Color(0xFF4CAF50);
  static const green600 = Color(0xFF43A047);
  static const green700 = Color(0xFF388E3C);
  static const green800 = Color(0xFF2E7D32);
  static const green900 = Color(0xFF1B5E20);

  // -------------------------------------------------
  // BLUES
  // -------------------------------------------------
  static const blue50 = Color(0xFFE3F2FD);
  static const blue100 = Color(0xFFBBDEFB);
  static const blue200 = Color(0xFF90CAF9);
  static const blue300 = Color(0xFF64B5F6);
  static const blue400 = Color(0xFF42A5F5);
  static const blue500 = Color(0xFF2196F3);
  static const blue600 = Color(0xFF1E88E5);
  static const blue700 = Color(0xFF1976D2);
  static const blue800 = Color(0xFF1565C0);
  static const blue900 = Color(0xFF0D47A1);

  // -------------------------------------------------
  // YELLOWS
  // -------------------------------------------------
  static const yellow50 = Color(0xFFFFFDE7);
  static const yellow100 = Color(0xFFFFF9C4);
  static const yellow200 = Color(0xFFFFF59D);
  static const yellow300 = Color(0xFFFFF176);
  static const yellow400 = Color(0xFFFFEE58);
  static const yellow500 = Color(0xFFFFEB3B);
  static const yellow600 = Color(0xFFFDD835);
  static const yellow700 = Color(0xFFFBC02D);
  static const yellow800 = Color(0xFFF9A825);
  static const yellow900 = Color(0xFFF57F17);

  // -------------------------------------------------
  // PURPLES
  // -------------------------------------------------
  static const purple50 = Color(0xFFF3E5F5);
  static const purple100 = Color(0xFFE1BEE7);
  static const purple200 = Color(0xFFCE93D8);
  static const purple300 = Color(0xFFBA68C8);
  static const purple400 = Color(0xFFAB47BC);
  static const purple500 = Color(0xFF9C27B0);
  static const purple600 = Color(0xFF8E24AA);
  static const purple700 = Color(0xFF7B1FA2);
  static const purple800 = Color(0xFF6A1B9A);
  static const purple900 = Color(0xFF4A148C);

  // -------------------------------------------------
  // ORANGES
  // -------------------------------------------------
  static const orange50 = Color(0xFFFFF3E0);
  static const orange100 = Color(0xFFFFE0B2);
  static const orange200 = Color(0xFFFFCC80);
  static const orange300 = Color(0xFFFFB74D);
  static const orange400 = Color(0xFFFFA726);
  static const orange500 = Color(0xFFFF9800);
  static const orange600 = Color(0xFFFB8C00);
  static const orange700 = Color(0xFFF57C00);
  static const orange800 = Color(0xFFEF6C00);
  static const orange900 = Color(0xFFE65100);

  // -------------------------------------------------
  // TEALS
  // -------------------------------------------------
  static const teal50 = Color(0xFFE0F2F1);
  static const teal100 = Color(0xFFB2DFDB);
  static const teal200 = Color(0xFF80CBC4);
  static const teal300 = Color(0xFF4DB6AC);
  static const teal400 = Color(0xFF26A69A);
  static const teal500 = Color(0xFF009688);
  static const teal600 = Color(0xFF00897B);
  static const teal700 = Color(0xFF00796B);
  static const teal800 = Color(0xFF00695C);
  static const teal900 = Color(0xFF004D40);

  // -------------------------------------------------
  // CYANS
  // -------------------------------------------------
  static const cyan50 = Color(0xFFE0F7FA);
  static const cyan100 = Color(0xFFB2EBF2);
  static const cyan200 = Color(0xFF80DEEA);
  static const cyan300 = Color(0xFF4DD0E1);
  static const cyan400 = Color(0xFF26C6DA);
  static const cyan500 = Color(0xFF00BCD4);
  static const cyan600 = Color(0xFF00ACC1);
  static const cyan700 = Color(0xFF0097A7);
  static const cyan800 = Color(0xFF00838F);
  static const cyan900 = Color(0xFF006064);

  // -------------------------------------------------
  // PINKS
  // -------------------------------------------------
  static const pink50 = Color(0xFFFCE4EC);
  static const pink100 = Color(0xFFF8BBD0);
  static const pink200 = Color(0xFFF48FB1);
  static const pink300 = Color(0xFFF06292);
  static const pink400 = Color(0xFFEC407A);
  static const pink500 = Color(0xFFE91E63);
  static const pink600 = Color(0xFFD81B60);
  static const pink700 = Color(0xFFC2185B);
  static const pink800 = Color(0xFFAD1457);
  static const pink900 = Color(0xFF880E4F);
}
