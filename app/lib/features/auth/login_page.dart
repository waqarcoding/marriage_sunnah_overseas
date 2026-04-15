import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/register_page.dart';
import 'package:app_component/core/utils/page_transition_manager.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LoginPage extends StatelessWidget {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<AuthController>();

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("Login", style: TextStyle(fontSize: 28)),
            const SizedBox(height: 20),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(labelText: "Email"),
            ),
            TextField(
              controller: passwordController,
              decoration: const InputDecoration(labelText: "Password"),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            Obx(
              () => ElevatedButton(
                onPressed:
                    controller.isLoading.value
                        ? null
                        : () => controller.login(
                          emailController.text,
                          passwordController.text,
                        ),
                child:
                    controller.isLoading.value
                        ? const CircularProgressIndicator()
                        : const Text("Login"),
              ),
            ),
            TextButton(
              onPressed: () => PageManager.fadeIn(() => RegisterPage()),
              child: const Text("Create Account"),
            ),
          ],
        ),
      ),
    );
  }
}
