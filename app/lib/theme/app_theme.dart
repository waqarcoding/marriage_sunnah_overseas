import 'package:flex_color_scheme/flex_color_scheme.dart';
import 'package:flutter/material.dart';
import 'package:app/core/utils/styles.dart';

class AppTheme {
  static final ThemeData light = FlexThemeData.light(
    scheme: FlexScheme.deepBlue,
    primary: const Color(0xFFE94057),
    surface: Colors.white,
    onSurface: AppColors.gray600,
    secondary: Colors.white,
    scaffoldBackground: Colors.white,
    surfaceMode: FlexSurfaceMode.highScaffoldLowSurface,
    blendLevel: 15,
    tabBarStyle: FlexTabBarStyle.forBackground,
    useMaterial3: true,
  );

  static final ThemeData dark = FlexThemeData.dark(
    scheme: FlexScheme.deepBlue,
    primary: Colors.blue.shade300, // slightly lighter for dark theme
    surface: Color(0xFF1F1F1F), // dark surface
    onSurface: AppColors.gray300, // light gray text on dark background
    secondary: Colors.blueGrey.shade700, // secondary accent
    surfaceMode: FlexSurfaceMode.highScaffoldLowSurface,
    blendLevel: 15,
    tabBarStyle: FlexTabBarStyle.forBackground,
    useMaterial3: true,
  );
}
