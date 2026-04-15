import 'package:app/core/widgets/button_widget.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app_component/app_widget.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class OtpPage extends StatelessWidget {
  final AuthController authController = Get.find<AuthController>();

  final String email; // Email to verify
  final int userId; // Email to verify
  final TextEditingController otpController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  OtpPage({super.key, required this.email, required this.userId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("OTP Verification")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Obx(
          () => Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // OTP info text
                Text(
                  "An OTP has been sent to your email:",
                  style: TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 4),
                Text(
                  email,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.blueAccent,
                  ),
                ),
                const SizedBox(height: 16),

                // OTP input
                TextFormField(
                  controller: otpController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: "Enter OTP",
                    border: OutlineInputBorder(),
                  ),
                  validator:
                      (value) =>
                          value == null || value.length < 4
                              ? "Enter valid OTP"
                              : null,
                ),
                const SizedBox(height: 16),

                // Error message
                if (authController.errorMessage.isNotEmpty)
                  Text(
                    authController.errorMessage.value,
                    style: const TextStyle(color: Colors.red),
                  ),
                const SizedBox(height: 16),

                // Verify button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed:
                        authController.isLoading.value
                            ? null
                            : () {
                              if (_formKey.currentState!.validate()) {
                                authController.verifyOtp(
                                  userId,
                                  otpController.text.trim(),
                                );
                              }
                            },
                    child:
                        authController.isLoading.value
                            ? const CircularProgressIndicator(
                              color: Colors.white,
                            )
                            : const Text("Verify OTP"),
                  ),
                ),

                const SizedBox(height: 16),

                // Resend OTP
                Center(
                  child: TextButton(
                    onPressed:
                        authController.isLoading.value
                            ? null
                            : () {
                              authController.resendOtp(
                                userId.toString(),
                                email,
                              );
                            },
                    child: const Text("Resend OTP"),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
