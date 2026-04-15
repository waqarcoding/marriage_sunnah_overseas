import 'package:app/core/utils/styles.dart';
import 'package:app/core/widgets/button_widget.dart';
import 'package:app/features/onboarding/widgets.dart/crousel_widget.dart';
import 'package:flutter/material.dart';

class OnboardingPage extends StatelessWidget {
  const OnboardingPage({super.key});

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme;

    return SafeArea(
      child: Scaffold(
        body: Column(
          children: [
            CarouselWidget(
              height: MediaQuery.of(context).size.height / 1.6,
              padding: EdgeInsets.only(top: 60),
              viewportFraction: 0.70,
              scrollMode: CarouselScrollMode.centerZoom,

              items: [
                CarouselItem(
                  imgUrl: "assets/images/sample1.png",
                  title: "Find Your Match",
                  subtitle:
                      "Users going through a vetting process to ensure you never match with bots.",
                ),
                CarouselItem(
                  imgUrl: "assets/images/sample2.png",
                  title: "Chat Instantly",
                  subtitle:
                      "We match you with people that have a large array of similar interests.",
                ),
                CarouselItem(
                  imgUrl: "assets/images/sample3.png",
                  title: "Safe & Secure",
                  subtitle:
                      "Sign up today and enjoy the first month of premium benefits on us.",
                ),
              ],
            ),
            SizedBox(height: 30),
            ButtonWidget(title: "Continue with email"),
            SizedBox(height: 30),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Style.label("Already have an account?", color: Colors.black26),
                Style.label("Sign in", color: color.primary),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
