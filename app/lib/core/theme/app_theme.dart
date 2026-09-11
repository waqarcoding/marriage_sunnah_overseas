import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'app_colors.dart';

class AppTheme {
  // Font families matching web
  static const String fontSans = 'DM Sans';
  static const String fontHeading = 'Playfair Display';

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

  static ThemeData get lightTheme {
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

      // Card Theme
      cardTheme: CardTheme(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
          side: BorderSide(color: AppColors.border, width: 1),
        ),
      ),

      // AppBar Theme — white background, dark icons/text, dark status bar icons
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
          fontSize: 22.sp,
          fontWeight: FontWeight.bold,
          color: AppColors.foreground,
        ),
        iconTheme: IconThemeData(color: AppColors.foreground, size: 24.sp),
      ),

      // Bottom Navigation Bar Theme — white background
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.mutedForeground,
        selectedLabelStyle: TextStyle(
          fontFamily: fontSans,
          fontSize: 12.sp,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: TextStyle(
          fontFamily: fontSans,
          fontSize: 12.sp,
          fontWeight: FontWeight.w500,
        ),
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),

      // Input Decoration Theme
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
          fontSize: 14.sp,
          color: AppColors.mutedForeground,
        ),
        hintStyle: TextStyle(
          fontFamily: fontSans,
          fontSize: 14.sp,
          color: AppColors.mutedForeground,
        ),
      ),

      // Elevated Button Theme
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
            fontSize: 15.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Text Button Theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: TextStyle(
            fontFamily: fontSans,
            fontSize: 14.sp,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),

      // Outlined Button Theme
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
            fontSize: 15.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Bottom Sheet Theme
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
        ),
      ),

      // Dialog Theme
      dialogTheme: DialogTheme(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        elevation: 8,
      ),

      // Divider Theme
      dividerTheme: DividerThemeData(
        color: AppColors.border,
        thickness: 1,
        space: 1,
      ),

      // Icon Theme
      iconTheme: IconThemeData(
        color: AppColors.foreground,
        size: 24.sp,
      ),

      // Text Theme
      textTheme: TextTheme(
        displayLarge: TextStyle(
          fontFamily: fontHeading,
          fontSize: 40.sp,
          fontWeight: FontWeight.bold,
          color: AppColors.foreground,
          height: 1.2,
        ),
        displayMedium: TextStyle(
          fontFamily: fontHeading,
          fontSize: 34.sp,
          fontWeight: FontWeight.bold,
          color: AppColors.foreground,
          height: 1.2,
        ),
        displaySmall: TextStyle(
          fontFamily: fontHeading,
          fontSize: 28.sp,
          fontWeight: FontWeight.bold,
          color: AppColors.foreground,
          height: 1.2,
        ),
        headlineLarge: TextStyle(
          fontFamily: fontHeading,
          fontSize: 26.sp,
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        headlineMedium: TextStyle(
          fontFamily: fontSans,
          fontSize: 24.sp,
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        headlineSmall: TextStyle(
          fontFamily: fontSans,
          fontSize: 22.sp,
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        titleLarge: TextStyle(
          fontFamily: fontSans,
          fontSize: 20.sp,
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        titleMedium: TextStyle(
          fontFamily: fontSans,
          fontSize: 17.sp,
          fontWeight: FontWeight.w500,
          color: AppColors.foreground,
        ),
        titleSmall: TextStyle(
          fontFamily: fontSans,
          fontSize: 15.sp,
          fontWeight: FontWeight.w500,
          color: AppColors.foreground,
        ),
        bodyLarge: TextStyle(
          fontFamily: fontSans,
          fontSize: 17.sp,
          fontWeight: FontWeight.normal,
          color: AppColors.cardForeground,
          height: 1.5,
        ),
        bodyMedium: TextStyle(
          fontFamily: fontSans,
          fontSize: 15.sp,
          fontWeight: FontWeight.normal,
          color: AppColors.cardForeground,
          height: 1.5,
        ),
        bodySmall: TextStyle(
          fontFamily: fontSans,
          fontSize: 13.sp,
          fontWeight: FontWeight.normal,
          color: AppColors.mutedForeground,
          height: 1.4,
        ),
        labelLarge: TextStyle(
          fontFamily: fontSans,
          fontSize: 15.sp,
          fontWeight: FontWeight.w600,
          color: AppColors.foreground,
        ),
        labelMedium: TextStyle(
          fontFamily: fontSans,
          fontSize: 13.sp,
          fontWeight: FontWeight.w500,
          color: AppColors.foreground,
        ),
        labelSmall: TextStyle(
          fontFamily: fontSans,
          fontSize: 12.sp,
          fontWeight: FontWeight.w500,
          color: AppColors.mutedForeground,
        ),
      ),

      fontFamily: fontSans,
    );
  }
}
