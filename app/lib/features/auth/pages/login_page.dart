import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/aurora_background.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_input.dart';
import '../controllers/auth_controller.dart';
import 'register_page.dart';
import 'forgot_password_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authController = Get.put(AuthController());

  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    final storage = GetStorage();
    final savedEmail = storage.read('rememberedEmail');
    if (savedEmail != null) {
      _emailController.text = savedEmail;
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      final storage = GetStorage();
      storage.write('rememberedEmail', _emailController.text);

      await _authController.login(
        _emailController.text,
        _passwordController.text,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isDesktop = size.width > 1024;

    return Scaffold(
      body: AuroraBackground(
        child: Center(
          child: SingleChildScrollView(
            child: Container(
              constraints: BoxConstraints(maxWidth: isDesktop ? 1000 : 500),
              margin: EdgeInsets.all(16),
              child: Card(
                elevation: 8,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                child: isDesktop
                    ? Row(
                        children: [
                          Expanded(child: _buildLeftPanel()),
                          Expanded(child: _buildFormPanel()),
                        ],
                      )
                    : _buildFormPanel(),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLeftPanel() {
    return Container(
      padding: EdgeInsets.all(40),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          bottomLeft: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.favorite, color: AppColors.accent, size: 18),
              ),
              SizedBox(width: 12),
              Text(
                'Marriage Sunna Overseas',
                style: TextStyle(
                  color: AppColors.accent,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.2),
                    width: 0.5,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: Color(0xFF5DCAA5),
                        shape: BoxShape.circle,
                      ),
                    ),
                    SizedBox(width: 6),
                    Text(
                      'Trusted by thousands of families',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.75),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 20),
              Text(
                'Find your perfect match\nthe halal way',
                style: TextStyle(
                  color: AppColors.accent,
                  fontSize: 30,
                  fontWeight: FontWeight.w600,
                  height: 1.3,
                  fontFamily: 'Playfair Display',
                ),
              ),
              SizedBox(height: 16),
              Text(
                'A safe, private platform built on Islamic values to help you find a righteous life partner.',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
            ],
          ),
          Text(
            '© 2025 Marriage Sunna Overseas',
            style: TextStyle(
              color: Colors.white.withOpacity(0.3),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormPanel() {
    return Container(
      padding: EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (MediaQuery.of(context).size.width <= 1024)
            Center(
              child: Image.asset(
                'assets/logo.png',
                height: 130,
                errorBuilder: (context, error, stackTrace) {
                  return Icon(
                    Icons.favorite,
                    size: 80,
                    color: AppColors.primary,
                  );
                },
              ),
            ),

          SizedBox(height: 24),

          Text(
            'Welcome back',
            style: TextStyle(
              color: AppColors.primary,
              fontSize: 24,
              fontWeight: FontWeight.w600,
            ),
          ),

          SizedBox(height: 4),

          Text(
            'Sign in to continue to your account',
            style: TextStyle(
              color: Colors.grey[400],
              fontSize: 14,
            ),
          ),

          SizedBox(height: 32),

          Obx(() {
            if (_authController.errorMessage.value.isNotEmpty) {
              return Container(
                padding: EdgeInsets.all(12),
                margin: EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Color(0xFFFFE4E6),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Color(0xFFFECDD3)),
                ),
                child: Text(
                  _authController.errorMessage.value,
                  style: TextStyle(
                    color: Color(0xFF7F1D1D),
                    fontSize: 12,
                  ),
                ),
              );
            }
            return SizedBox.shrink();
          }),

          Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ✅ USING AppInput
                AppInput(
                  label: 'Email address',
                  hintText: 'you@example.com',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email';
                    }
                    if (!GetUtils.isEmail(value)) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),

                SizedBox(height: 16),

                // ✅ USING AppInput with password
                AppInput(
                  label: 'Password',
                  hintText: 'Enter your password',
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                      color: AppColors.mutedForeground,
                    ),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    return null;
                  },
                ),

                SizedBox(height: 8),

                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => Get.to(() => ForgotPasswordPage()),
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size(0, 0),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      'Forgot password?',
                      style: TextStyle(
                        color: AppColors.primary.withOpacity(0.7),
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),

                SizedBox(height: 24),

                // ✅ USING AppButton
                Obx(() {
                  return AppButton(
                    text: 'Sign in',
                    onPressed:
                        _authController.isLoading.value ? null : _handleLogin,
                    variant: ButtonVariant.primary,
                    size: ButtonSize.large,
                    isLoading: _authController.isLoading.value,
                  );
                }),
              ],
            ),
          ),

          SizedBox(height: 24),

          Row(
            children: [
              Expanded(child: Divider()),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'or continue with',
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 12,
                  ),
                ),
              ),
              Expanded(child: Divider()),
            ],
          ),

          SizedBox(height: 24),

          // ✅ USING AppButton for social buttons
          Row(
            children: [
              Expanded(
                child: AppButton(
                  text: 'Google',
                  icon: Icons.g_mobiledata,
                  onPressed: () {
                    Get.snackbar(
                      'Coming Soon',
                      'Google login will be available soon',
                      snackPosition: SnackPosition.BOTTOM,
                    );
                  },
                  variant: ButtonVariant.outline,
                  size: ButtonSize.medium,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: AppButton(
                  text: 'Apple',
                  icon: Icons.apple,
                  onPressed: () {
                    Get.snackbar(
                      'Coming Soon',
                      'Apple login will be available soon',
                      snackPosition: SnackPosition.BOTTOM,
                    );
                  },
                  variant: ButtonVariant.outline,
                  size: ButtonSize.medium,
                ),
              ),
            ],
          ),

          SizedBox(height: 24),

          Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "Don't have an account? ",
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 12,
                  ),
                ),
                TextButton(
                  onPressed: () => Get.to(() => RegisterPage()),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size(0, 0),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text(
                    'Register',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
