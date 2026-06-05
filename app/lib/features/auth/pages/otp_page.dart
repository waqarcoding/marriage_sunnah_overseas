import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'dart:async';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/aurora_background.dart';
import '../controllers/auth_controller.dart';

class OtpPage extends StatefulWidget {
  final String? email;
  final int? userId;

  const OtpPage({
    Key? key,
    this.email,
    this.userId,
  }) : super(key: key);

  @override
  State<OtpPage> createState() => _OtpPageState();
}

class _OtpPageState extends State<OtpPage> {
  final _authController = Get.put(AuthController());
  final List<TextEditingController> _otpControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  int _timer = 600; // 10 minutes
  Timer? _countdownTimer;
  int _resendCooldown = 0;
  Timer? _resendTimer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _resendTimer?.cancel();
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    _timer = 600;
    _countdownTimer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (_timer > 0) {
        setState(() {
          _timer--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  void _startResendCooldown() {
    setState(() {
      _resendCooldown = 30;
    });
    _resendTimer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (_resendCooldown > 0) {
        setState(() {
          _resendCooldown--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  String _formatTime(int seconds) {
    final minutes = (seconds ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return '$minutes:$secs';
  }

  String _getOtp() {
    return _otpControllers.map((c) => c.text).join();
  }

  Future<void> _handleVerify() async {
    final otp = _getOtp();
    if (otp.length < 6) {
      Get.snackbar(
        'Error',
        'Please enter a 6-digit OTP',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    await _authController.verifyOtp(otp);
  }

  Future<void> _handleResend() async {
    if (_resendCooldown > 0) return;

    // Clear OTP fields
    for (var controller in _otpControllers) {
      controller.clear();
    }
    _focusNodes[0].requestFocus();

    await _authController.resendOtp();

    _startTimer();
    _startResendCooldown();
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
                      'Secure verification',
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
                'One step away from\nyour journey',
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
                'We sent a 6-digit code to your email to keep your account secure. It expires in 10 minutes.',
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
          // Logo (mobile)
          if (MediaQuery.of(context).size.width <= 1024)
            Center(
              child: Image.asset(
                'assets/logo.png',
                height: 155,
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

          // Title
          Text(
            'Verify your email',
            style: TextStyle(
              color: AppColors.primary,
              fontSize: 24,
              fontWeight: FontWeight.w600,
            ),
          ),

          SizedBox(height: 4),

          Text(
            'Enter the 6-digit code sent to',
            style: TextStyle(
              color: Colors.grey[400],
              fontSize: 14,
            ),
          ),

          SizedBox(height: 12),

          // Email Badge
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.secondary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.mail_outline,
                  size: 14,
                  color: AppColors.primary,
                ),
                SizedBox(width: 8),
                Text(
                  widget.email ?? 'your email',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          SizedBox(height: 32),

          // Error Message
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

          // OTP Input
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(6, (index) {
              return Container(
                width: 44,
                height: 56,
                margin: EdgeInsets.symmetric(horizontal: 4),
                child: TextField(
                  controller: _otpControllers[index],
                  focusNode: _focusNodes[index],
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  maxLength: 1,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                  decoration: InputDecoration(
                    counterText: '',
                    contentPadding: EdgeInsets.zero,
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: AppColors.primary.withOpacity(0.3),
                        width: 2,
                      ),
                    ),
                  ),
                  onChanged: (value) {
                    if (value.isNotEmpty && index < 5) {
                      _focusNodes[index + 1].requestFocus();
                    }
                  },
                  onTap: () {
                    _otpControllers[index].selection =
                        TextSelection.fromPosition(
                      TextPosition(offset: _otpControllers[index].text.length),
                    );
                  },
                ),
              );
            }),
          ),

          SizedBox(height: 24),

          // Timer
          Center(
            child: Text(
              _timer > 0
                  ? 'Expires in ${_formatTime(_timer)}'
                  : 'OTP expired. Please resend.',
              style: TextStyle(
                color: _timer > 0 ? AppColors.primary : Colors.red,
                fontSize: 12,
                fontWeight: _timer > 0 ? FontWeight.w500 : FontWeight.normal,
              ),
            ),
          ),

          SizedBox(height: 32),

          // Verify Button
          Obx(() {
            return ElevatedButton(
              onPressed: (_authController.isLoading.value || _timer <= 0)
                  ? null
                  : _handleVerify,
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 48),
              ),
              child: _authController.isLoading.value
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppColors.accent,
                        ),
                      ),
                    )
                  : Text('Verify'),
            );
          }),

          SizedBox(height: 12),

          // Resend Button
          Obx(() {
            return OutlinedButton(
              onPressed:
                  (_authController.isLoading.value || _resendCooldown > 0)
                      ? null
                      : _handleResend,
              style: OutlinedButton.styleFrom(
                minimumSize: Size(double.infinity, 48),
              ),
              child: Text(
                _resendCooldown > 0
                    ? 'Resend in ${_resendCooldown}s'
                    : 'Resend OTP',
              ),
            );
          }),

          SizedBox(height: 24),

          // Back to Login
          Center(
            child: TextButton(
              onPressed: () => Get.back(),
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.arrow_back, size: 16, color: AppColors.primary),
                  SizedBox(width: 4),
                  Text(
                    'Back to login',
                    style: TextStyle(
                      color: AppColors.primary.withOpacity(0.6),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
