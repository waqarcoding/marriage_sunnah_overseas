import 'package:flutter/material.dart';

enum ButtonVariant {
  primary,
  destructive,
  outline,
  secondary,
  ghost,
  link,
}

enum ButtonSize {
  small,
  medium,
  large,
  icon,
}

class AppButton extends StatelessWidget {
  final String? text;
  final Widget? child;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool isLoading;
  final IconData? icon;
  final bool disabled;

  const AppButton({
    Key? key,
    this.text,
    this.child,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.icon,
    this.disabled = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    // Size configurations
    final double height;
    final EdgeInsets padding;
    final double fontSize;
    
    switch (size) {
      case ButtonSize.small:
        height = 32;
        padding = icon != null 
            ? EdgeInsets.symmetric(horizontal: 10) 
            : EdgeInsets.symmetric(horizontal: 12);
        fontSize = 13;
        break;
      case ButtonSize.large:
        height = 44;
        padding = icon != null 
            ? EdgeInsets.symmetric(horizontal: 16) 
            : EdgeInsets.symmetric(horizontal: 24);
        fontSize = 16;
        break;
      case ButtonSize.icon:
        height = 36;
        padding = EdgeInsets.all(8);
        fontSize = 14;
        break;
      default: // medium
        height = 36;
        padding = icon != null 
            ? EdgeInsets.symmetric(horizontal: 12) 
            : EdgeInsets.symmetric(horizontal: 16);
        fontSize = 14;
    }

    // Variant configurations
    Color backgroundColor;
    Color foregroundColor;
    Color? borderColor;
    
    switch (variant) {
      case ButtonVariant.destructive:
        backgroundColor = Color(0xFFEF4444);
        foregroundColor = Colors.white;
        borderColor = null;
        break;
      case ButtonVariant.outline:
        backgroundColor = Colors.white;
        foregroundColor = Color(0xFF1B4D3E);
        borderColor = Color(0xFFE5E7EB);
        break;
      case ButtonVariant.secondary:
        backgroundColor = Color(0xFFF0F5F3);
        foregroundColor = Color(0xFF1B4D3E);
        borderColor = null;
        break;
      case ButtonVariant.ghost:
        backgroundColor = Colors.transparent;
        foregroundColor = Color(0xFF1B4D3E);
        borderColor = null;
        break;
      case ButtonVariant.link:
        backgroundColor = Colors.transparent;
        foregroundColor = Color(0xFF1B4D3E);
        borderColor = null;
        break;
      default: // primary
        backgroundColor = Color(0xFF1B4D3E);
        foregroundColor = Color(0xFFFEF3C7);
        borderColor = null;
    }

    final isDisabled = disabled || onPressed == null;

    return SizedBox(
      height: size == ButtonSize.icon ? height : null,
      child: Material(
        color: isDisabled 
            ? backgroundColor.withOpacity(0.5) 
            : backgroundColor,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: isDisabled || isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            height: height,
            padding: padding,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: borderColor != null 
                  ? Border.all(color: borderColor, width: 1.5) 
                  : null,
            ),
            child: Row(
              mainAxisSize: size == ButtonSize.icon 
                  ? MainAxisSize.min 
                  : MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isLoading)
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(foregroundColor),
                    ),
                  )
                else ...[
                  if (icon != null) ...[
                    Icon(icon, size: 16, color: foregroundColor),
                    if (text != null || child != null) SizedBox(width: 8),
                  ],
                  if (child != null)
                    child!
                  else if (text != null)
                    Text(
                      text!,
                      style: TextStyle(
                        color: isDisabled 
                            ? foregroundColor.withOpacity(0.5) 
                            : foregroundColor,
                        fontSize: fontSize,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
