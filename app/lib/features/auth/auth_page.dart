import 'package:app/core/utils/styles.dart';
import 'package:app/core/widgets/button_widget.dart';
import 'package:app_component/widgets/image_widget.dart';
import 'package:flutter/material.dart';
import 'package:app_component/core/core.dart';

class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: Stack(
        children: [
          // Background image with opacity
          Positioned.fill(
            child: Opacity(
              opacity: 0.07, // Adjust opacity (0.0 to 1.0)
              child: ImageWidget(
                path:
                    "https://images.unsplash.com/photo-1510181414401-d3f2aa71a124?q=80",
                fit: BoxFit.cover,
              ),
            ),
          ),

          // Main content
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 100),
                  Image.asset("assets/images/appicon.png", scale: 1),
                  const SizedBox(height: 80),
                  Style.heading(
                    "Sign up to continue",
                    alignment: Alignment.center,
                  ),
                  const SizedBox(height: 30),
                  ButtonWidget(title: "Continue with email"),
                  const SizedBox(height: 20),
                  Style.label("Use phone number", color: colorScheme.primary),

                  // Alternative options
                  const SizedBox(height: 50),
                  _label(),
                  const SizedBox(height: 30),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconsWidget(
                        context: context,
                        icon: Icons.apple,
                        onTap: () {},
                      ),
                      const SizedBox(width: 20),
                      IconsWidget(
                        context: context,
                        icon: Icons.facebook,
                        onTap: () {},
                      ),
                      const SizedBox(width: 20),
                      IconsWidget(
                        context: context,
                        icon: Icons.g_mobiledata,
                        onTap: () {},
                      ),
                    ],
                  ),
                  const SizedBox(height: 50),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      InkWell(
                        onTap: () {},
                        child: Style.label(
                          "Terms of Use",
                          color: colorScheme.primary,
                        ),
                      ),
                      const SizedBox(width: 20),
                      InkWell(
                        onTap: () {},
                        child: Style.label(
                          "Privacy Policy",
                          color: colorScheme.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 50),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

Widget _label() {
  return Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      SizedBox(
        width: 50,
        child: Divider(color: Colors.grey[400], thickness: 1),
      ),
      const SizedBox(width: 8),
      Text(
        "or sign up with",
        style: TextStyle(color: Colors.grey[400], fontWeight: FontWeight.w500),
      ),
      const SizedBox(width: 8),
      SizedBox(
        width: 50,
        child: Divider(color: Colors.grey[400], thickness: 1),
      ),
    ],
  );
}

Widget IconsWidget({
  required BuildContext context,
  required IconData icon,
  required VoidCallback onTap,
}) {
  final colorScheme = Theme.of(context).colorScheme;

  return InkWell(
    splashColor: Colors.transparent,
    child: Container(
      padding: const EdgeInsets.all(5),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black12, width: 0.5),
        borderRadius: BorderRadius.circular(10),
      ),
      height: 64,
      width: 64,
      child: Icon(icon, size: 32, color: colorScheme.primary),
    ),
    onTap: onTap,
  );
}
