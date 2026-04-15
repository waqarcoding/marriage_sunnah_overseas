import 'package:app/features/profile/widgets/profile_form_tile.dart';
import 'package:app/features/auth/widgets/profile_image_picker.dart';
import 'package:flutter/material.dart';

class EditDatingProfilePage extends StatefulWidget {
  const EditDatingProfilePage({super.key});

  @override
  State<EditDatingProfilePage> createState() => _EditDatingProfilePageState();
}

class _EditDatingProfilePageState extends State<EditDatingProfilePage> {
  final _formKey = GlobalKey<FormState>();

  final nameController = TextEditingController(text: "Sophia");
  final ageController = TextEditingController(text: "24");
  final locationController = TextEditingController(text: "New York, USA");
  final bioController = TextEditingController(
    text: "Coffee lover ☕ | Travel addict ✈️",
  );

  String imageUrl =
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Edit Profile"), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              ProfileImagePicker(
                imageUrl: imageUrl,
                onChange: () {
                  // TODO: Open image picker
                },
              ),
              const SizedBox(height: 30),

              ProfileFormTile(
                controller: nameController,
                label: "Full Name",
                icon: Icons.person,
              ),

              ProfileFormTile(
                controller: ageController,
                label: "Age",
                icon: Icons.cake,
                keyboardType: TextInputType.number,
              ),

              ProfileFormTile(
                controller: locationController,
                label: "Location",
                icon: Icons.location_on,
              ),

              ProfileFormTile(
                controller: bioController,
                label: "Bio",
                icon: Icons.info,
                maxLines: 3,
              ),

              const SizedBox(height: 30),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      // Save logic
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Profile Updated Successfully"),
                        ),
                      );
                    }
                  },
                  child: const Text("Save Changes"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
