import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'app_colors.dart';

class AppTheme {
  // Font families matching web
  static const String fontSans = 'DM Sans';
  static const String fontHeading = 'Playfair Display';
  static const double _desktopBreakpoint = 1024;

  /// Returns a font size appropriate for the current screen width.
  /// On mobile, uses ScreenUtil's `.sp` (scales with device pixel density).
  /// On desktop, uses a fixed logical size so text doesn't balloon with
  /// ScreenUtil's mobile-oriented scaling.
  static double _fontSize(
      BuildContext context, double mobileSp, double desktopSize) {
    final width = MediaQuery.of(context).size.width;
    if (width > _desktopBreakpoint) {
      return desktopSize;
    }
    return mobileSp.sp;
  }

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFFAFAFA), Color(0xFFA1A1AA)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF1C1C1F), Color(0xFF111113)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Color primary = AppColors.primary;
  static const Color primaryLight = Color(0xFFE4E4E7);
  static const Color primaryDark = Color(0xFFA1A1AA);

  static ThemeData lightTheme(BuildContext context) {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.background,
        error: AppColors.error,
        onPrimary: AppColors.accent,
        onSecondary: AppColors.foreground,
        onSurface: AppColors.foreground,
        onError: Colors.white,
      ),
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.secondary,
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
          side: BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.foreground,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
          systemNavigationBarColor: Colors.white,
          systemNavigationBarIconBrightness: Brightness.dark,
        ),
        titleTextStyle: TextStyle(
          fontFamily: fontHeading,
          fontSize: _fontSize(context, 22, 24),
          fontWeight: FontWeight.bold,
          color: AppColors.foreground,
        ),
        iconTheme: IconThemeData(color: AppColors.foreground, size: 24.sp),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.mutedForeground,
        selectedLabelStyle: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 12, 13),
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 12, 13),
          fontWeight: FontWeight.w500,
        ),
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.input,
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: BorderSide(color: AppColors.inputBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: BorderSide(color: AppColors.inputBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: BorderSide(color: AppColors.error, width: 2),
        ),
        labelStyle: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 14, 15),
          color: AppColors.mutedForeground,
        ),
        hintStyle: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 14, 15),
          color: AppColors.mutedForeground,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.accent,
          elevation: 0,
          padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 14.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
          textStyle: TextStyle(
            fontFamily: fontSans,
            fontSize: _fontSize(context, 15, 16),
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: TextStyle(
            fontFamily: fontSans,
            fontSize: _fontSize(context, 14, 15),
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: BorderSide(color: AppColors.border),
          padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 14.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
          textStyle: TextStyle(
            fontFamily: fontSans,
            fontSize: _fontSize(context, 15, 16),
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        elevation: 8,
      ),
      dividerTheme: DividerThemeData(
        color: AppColors.border,
        thickness: 1,
        space: 1,
      ),
      iconTheme: IconThemeData(
        color: AppColors.foreground,
        size: 24.sp,
      ),
      textTheme: TextTheme(
        displayLarge: TextStyle(
          fontFamily: fontHeading,
          fontSize: _fontSize(context, 40, 44),
          fontWeight: FontWeight.bold,
          color: AppColors.foreground,
          height: 1.2,
        ),
        displayMedium: TextStyle(
          fontFamily: fontHeading,
          fontSize: _fontSize(context, 34, 38),
          fontWeight: FontWeight.bold,
          color: AppColors.foreground,
          height: 1.2,
        ),
        displaySmall: TextStyle(
          fontFamily: fontHeading,
          fontSize: _fontSize(context, 28, 30),
          fontWeight: FontWeight.bold,
          color: AppColors.foreground,
          height: 1.2,
        ),
        headlineLarge: TextStyle(
          fontFamily: fontHeading,
          fontSize: _fontSize(context, 26, 28),
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        headlineMedium: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 24, 25),
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        headlineSmall: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 22, 23),
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        titleLarge: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 20, 21),
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        titleMedium: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 17, 18),
          fontWeight: FontWeight.w500,
          color: AppColors.foreground,
        ),
        titleSmall: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 15, 16),
          fontWeight: FontWeight.w500,
          color: AppColors.foreground,
        ),
        bodyLarge: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 17, 17),
          fontWeight: FontWeight.normal,
          color: AppColors.cardForeground,
          height: 1.5,
        ),
        bodyMedium: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 15, 15),
          fontWeight: FontWeight.normal,
          color: AppColors.cardForeground,
          height: 1.5,
        ),
        bodySmall: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 13, 13),
          fontWeight: FontWeight.normal,
          color: AppColors.mutedForeground,
          height: 1.4,
        ),
        labelLarge: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 15, 15),
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        labelMedium: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 13, 13),
          fontWeight: FontWeight.w500,
          color: AppColors.foreground,
        ),
        labelSmall: TextStyle(
          fontFamily: fontSans,
          fontSize: _fontSize(context, 12, 12),
          fontWeight: FontWeight.w500,
          color: AppColors.mutedForeground,
        ),
      ),
      fontFamily: fontSans,
    );
  }
}
