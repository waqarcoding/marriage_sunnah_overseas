import 'package:app/features/auth/profile_detail.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:app/features/auth/auth_controller.dart';

import 'package:app/features/auth/widgets/custom_text_field.dart';
import 'package:app/features/auth/widgets/custom_button.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final AuthController authController = Get.find<AuthController>();

  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController mobileController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  void _next() {
    if (_formKey.currentState!.validate()) {
      // Navigate to profile details page with collected data
      Get.to(
        () => ProfileDetailsPage(
          firstName: firstNameController.text.trim(),
          lastName: lastNameController.text.trim(),
          email: emailController.text.trim(),
          mobile: mobileController.text.trim(),
          password: passwordController.text.trim(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Sign Up")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              CustomTextField(
                controller: firstNameController,
                label: "First Name",
                validator: (v) => v == null || v.isEmpty ? "Required" : null,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: lastNameController,
                label: "Last Name",
                validator: (v) => v == null || v.isEmpty ? "Required" : null,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: emailController,
                label: "Email",
                inputType: TextInputType.emailAddress,
                validator:
                    (v) =>
                        v == null || !v.contains('@') ? "Invalid email" : null,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: mobileController,
                label: "Mobile Number",
                inputType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: passwordController,
                label: "Password",
                obscureText: true,
                validator:
                    (v) =>
                        v == null || v.length < 6
                            ? "Minimum 6 characters"
                            : null,
              ),
              const SizedBox(height: 24),
              CustomButton(onPressed: _next, child: const Text("Next")),
            ],
          ),
        ),
      ),
    );
  }
}
