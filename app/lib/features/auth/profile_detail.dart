import 'dart:io';

import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/widgets/avatar_picker.dart';
import 'package:app/features/auth/widgets/custom_button.dart';
import 'package:app/features/auth/widgets/custom_text_field.dart';
import 'package:app/features/home/home_page.dart';
import 'package:app_component/core/core.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';

class ProfileDetailsPage extends StatefulWidget {
  final String firstName;
  final String lastName;
  final String email;
  final String mobile;
  final String password;

  const ProfileDetailsPage({
    super.key,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.mobile,
    required this.password,
  });

  @override
  State<ProfileDetailsPage> createState() => _ProfileDetailsPageState();
}

class _ProfileDetailsPageState extends State<ProfileDetailsPage> {
  final AuthController authController = Get.find<AuthController>();

  // Controllers for profile fields
  final TextEditingController genderController = TextEditingController();
  DateTime? dateOfBirth;
  final TextEditingController ageController = TextEditingController();
  final TextEditingController maritalStatusController = TextEditingController();
  final TextEditingController countryController = TextEditingController();
  final TextEditingController cityController = TextEditingController();
  final TextEditingController nationalityController = TextEditingController();
  final TextEditingController educationController = TextEditingController();
  final TextEditingController professionController = TextEditingController();
  final TextEditingController bioController = TextEditingController();
  final TextEditingController interestsController = TextEditingController();
  final TextEditingController familyBackgroundController =
      TextEditingController();
  final TextEditingController religiousPracticeController =
      TextEditingController();

  File? avatarImage;
  final _formKey = GlobalKey<FormState>();

  double get progress {
    int filled = 0;
    if (avatarImage != null) filled++;
    if (genderController.text.isNotEmpty) filled++;
    if (dateOfBirth != null) filled++;
    if (ageController.text.isNotEmpty) filled++;
    if (maritalStatusController.text.isNotEmpty) filled++;
    if (countryController.text.isNotEmpty) filled++;
    if (cityController.text.isNotEmpty) filled++;
    if (nationalityController.text.isNotEmpty) filled++;
    if (educationController.text.isNotEmpty) filled++;
    if (professionController.text.isNotEmpty) filled++;
    if (bioController.text.isNotEmpty) filled++;
    if (interestsController.text.isNotEmpty) filled++;
    // Optional fields count as half
    if (familyBackgroundController.text.isNotEmpty) filled++;
    if (religiousPracticeController.text.isNotEmpty) filled++;

    final total = 12 + 1; // mandatory 12 + optional 2 counted as 1
    return (filled / total).clamp(0, 1).toDouble();
  }

  void _submitProfile() {
    if (_formKey.currentState!.validate()) {
      final fullName =
          "${widget.firstName} ${widget.lastName}"; // Already capitalized if needed

      authController
          .register({
            "name": fullName,
            "email": widget.email,
            "mobile": widget.mobile,
            "password_hash": widget.password, // send hashed if needed
            "avatar": avatarImage?.path,
            "gender": genderController.text.trim(),
            "date_of_birth": dateOfBirth?.toIso8601String(),
            "age": ageController.text.trim(),
            "marital_status": maritalStatusController.text.trim(),
            "country": countryController.text.trim(),
            "city": cityController.text.trim(),
            "nationality": nationalityController.text.trim(),
            "education": educationController.text.trim(),
            "profession": professionController.text.trim(),
            "bio": bioController.text.trim(),
            "interests": interestsController.text.trim().split(','),
            "family_background": familyBackgroundController.text.trim(),
            "religious_practice_level": religiousPracticeController.text.trim(),
          })
          .then((success) {
            PageManager.offAll(() => HomePage());
          });
    }
  }

  Future pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 365 * 20)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        dateOfBirth = picked;
        ageController.text = (DateTime.now().year - picked.year).toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Complete Your Profile")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Obx(
          () => Form(
            key: _formKey,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  LinearPercentIndicator(
                    lineHeight: 8,
                    percent: progress,
                    backgroundColor: Colors.grey[300]!,
                    progressColor: Colors.blue,
                    barRadius: const Radius.circular(4),
                  ),
                  const SizedBox(height: 16),
                  AvatarPicker(
                    onImageSelected:
                        (file) => setState(() => avatarImage = file),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value:
                        genderController.text.isEmpty
                            ? null
                            : genderController.text,
                    items:
                        ["Male", "Female", "Other"]
                            .map(
                              (g) => DropdownMenuItem(value: g, child: Text(g)),
                            )
                            .toList(),
                    onChanged: (v) => genderController.text = v ?? "",
                    decoration: const InputDecoration(labelText: "Gender"),
                    validator:
                        (v) => v == null || v.isEmpty ? "Required" : null,
                  ),
                  const SizedBox(height: 16),
                  GestureDetector(
                    onTap: pickDate,
                    child: AbsorbPointer(
                      child: CustomTextField(
                        controller: ageController,
                        label:
                            dateOfBirth == null
                                ? "Date of Birth"
                                : "DOB: ${dateOfBirth!.toLocal().toString().split(' ')[0]}",
                        validator:
                            (v) => dateOfBirth == null ? "Required" : null,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: maritalStatusController,
                    label: "Marital Status",
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: countryController,
                    label: "Country",
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(controller: cityController, label: "City"),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: nationalityController,
                    label: "Nationality",
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: educationController,
                    label: "Education",
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: professionController,
                    label: "Profession",
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(controller: bioController, label: "Bio"),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: interestsController,
                    label: "Interests (comma separated)",
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: familyBackgroundController,
                    label: "Family Background (Optional)",
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: religiousPracticeController,
                    label: "Religious Practice Level (Optional)",
                  ),
                  const SizedBox(height: 24),
                  CustomButton(
                    onPressed:
                        authController.isLoading.value ? null : _submitProfile,
                    child:
                        authController.isLoading.value
                            ? const CircularProgressIndicator(
                              color: Colors.white,
                            )
                            : const Text("Save Profile"),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
