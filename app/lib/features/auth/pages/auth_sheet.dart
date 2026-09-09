import 'package:app/bottom_tabs.dart';
import 'package:app/features/auth/pages/forgot_password_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/svg.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';

// Adjust this import to match where AuthController actually lives in your
// project (e.g. package:app/features/auth/auth_controller.dart).
import '../controllers/auth_controller.dart';

/// Which flow the auth sheet opens in.
enum AuthMode { signUp, signIn }

/// Light, theme-driven auth bottom sheet that handles both sign-up and
/// sign-in, wired to [AuthController] for real network calls.
///
/// Users start on the social-provider screen and can expand an inline email
/// form. A footer link toggles between the two modes without closing the sheet.
Future<void> showAuthSheet(BuildContext context, {required AuthMode mode}) {
  final theme = Theme.of(context);
  return showModalBottomSheet<void>(
    context: context,
    backgroundColor: theme.colorScheme.surface,
    isScrollControlled: true,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(28.r)),
    ),
    builder: (_) => _AuthSheet(initialMode: mode),
  );
}

class _AuthSheet extends StatefulWidget {
  const _AuthSheet({required this.initialMode});

  final AuthMode initialMode;

  @override
  State<_AuthSheet> createState() => _AuthSheetState();
}

class _AuthSheetState extends State<_AuthSheet> {
  late AuthMode _mode = widget.initialMode;
  bool _emailMode = false;
  bool _obscure = true;

  /// Real auth calls (login/register/forgotPassword) go through here.
  final AuthController _auth = Get.find<AuthController>();

  /// Which social provider is mid sign-in (null when idle). Social login has
  /// no backend wired up yet, so this stays a visual simulation.
  String? _busyProvider;
  bool get _socialBusy => _busyProvider != null;

  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  bool get _isSignUp => _mode == AuthMode.signUp;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  void _switchMode() {
    setState(() {
      _mode = _isSignUp ? AuthMode.signIn : AuthMode.signUp;
      _emailMode = false;
      _auth.errorMessage.value = '';
      _formKey.currentState?.reset();
    });
  }

  Future<void> _enter() async {
    if (!mounted) return;
    Navigator.of(context).pop();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => BottomTabBar()),
      (route) => false,
    );
  }

  /// Social providers aren't wired to a backend yet — kept as a visual
  /// placeholder so this flow can be swapped in once available.
  Future<void> _handleProvider(String key) async {
    if (_socialBusy || _auth.isLoading.value) return;
    setState(() => _busyProvider = key);
    await Future<void>.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;
    setState(() => _busyProvider = null);
    await _enter();
  }

  Future<void> _submitEmail(BuildContext context) async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    FocusScope.of(context).unfocus();
    _auth.errorMessage.value = '';

    if (_isSignUp) {
      await _auth.register({
        'name': _name.text.trim(),
        'email': _email.text.trim(),
        'password': _password.text,
      }, {});
    } else {
      await _auth.login(
          email: _email.text.trim(),
          password: _password.text,
          context: context,
          onFailed: (msg) {
            print(msg.toString());
          });
    }
    // login() and register() navigate to the OTP screen themselves on
    // success. On failure, errorMessage is set and the inline error text
    // below picks it up — nothing else to do here.
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    return AnimatedPadding(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      padding: EdgeInsets.only(bottom: bottomInset),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(22.w, 12.h, 22.w, 22.h),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _grabHandle(theme),
              SizedBox(height: 18.h),
              _header(theme),
              SizedBox(height: 24.h),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                child: _emailMode ? _emailForm(theme) : _providers(theme),
              ),
              SizedBox(height: 20.h),
              _modeToggle(theme),
              if (_isSignUp) ...[
                SizedBox(height: 16.h),
                _terms(theme),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _grabHandle(ThemeData theme) {
    return Center(
      child: Container(
        width: 44.w,
        height: 4.h,
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(4.r),
        ),
      ),
    );
  }

  Widget _header(ThemeData theme) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _isSignUp ? 'Sign up for MSO' : 'Welcome back',
                style: TextStyle(
                  fontFamily: 'round',
                  color: theme.colorScheme.onSurface,
                  fontSize: 26.sp,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
              SizedBox(height: 6.h),
              Text(
                _isSignUp
                    ? 'Join millions buying and selling pre-loved fashion.'
                    : 'Log in to pick up where you left off.',
                style: TextStyle(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  fontSize: 14.sp,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
        GestureDetector(
          onTap: () => Navigator.of(context).pop(),
          child: Icon(
            Iconsax.close_circle,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.35),
            size: 28.sp,
          ),
        ),
      ],
    );
  }

  Widget _providers(ThemeData theme) {
    return Column(
      key: const ValueKey('providers'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        /*
        _ProviderButton(
          label: 'Continue with Apple',
          icon:
              FaIcon(FontAwesomeIcons.apple, color: Colors.white, size: 22.sp),
          background: Colors.black,
          foreground: Colors.white,
          loading: _busyProvider == 'apple',
          dimmed: _socialBusy && _busyProvider != 'apple',
          onTap: () => _handleProvider('apple'),
        ),
        */
        SizedBox(height: 12.h),
        _ProviderButton(
          label: 'Continue with Google',
          icon: BrandLogo.google(22.sp),
          borderColor: theme.colorScheme.outline,
          foreground: theme.colorScheme.onSurface,
          loading: _busyProvider == 'google',
          dimmed: _socialBusy && _busyProvider != 'google',
          onTap: () => _handleProvider('google'),
        ),
        SizedBox(height: 12.h),
        /*
        _ProviderButton(
          label: 'Continue with Facebook',
          icon: BrandLogo.facebook(22.sp),
          borderColor: theme.colorScheme.outline,
          foreground: theme.colorScheme.onSurface,
          loading: _busyProvider == 'facebook',
          dimmed: _socialBusy && _busyProvider != 'facebook',
          onTap: () => _handleProvider('facebook'),
        ),
        */

        OutlinedButton.icon(
          onPressed: () => setState(() => _emailMode = true),
          style: OutlinedButton.styleFrom(
            foregroundColor: theme.colorScheme.onSurface,
            side: BorderSide(color: theme.colorScheme.outline, width: 1.5),
            padding: EdgeInsets.symmetric(vertical: 16.h),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14.r)),
          ),
          icon: Icon(Iconsax.sms, size: 20.sp),
          label: Text(
            _isSignUp ? 'Sign up with email' : 'Log in with email',
            style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }

  Widget _emailForm(ThemeData theme) {
    return Form(
      key: _formKey,
      child: Column(
        key: const ValueKey('email'),
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_isSignUp) ...[
            _field(
              theme: theme,
              controller: _name,
              hint: 'Full name',
              icon: Iconsax.user,
              keyboardType: TextInputType.name,
              validator: (v) =>
                  (v == null || v.trim().length < 2) ? 'Enter your name' : null,
            ),
            SizedBox(height: 12.h),
          ],
          _field(
            theme: theme,
            controller: _email,
            hint: 'Email address',
            icon: Iconsax.sms,
            keyboardType: TextInputType.emailAddress,
            validator: (v) {
              if (v == null || v.isEmpty) return 'Enter your email';
              final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v);
              return ok ? null : 'Enter a valid email';
            },
          ),
          SizedBox(height: 12.h),
          _field(
            theme: theme,
            controller: _password,
            hint: 'Password',
            icon: Iconsax.lock,
            obscure: _obscure,
            validator: (v) =>
                (v == null || v.length < 6) ? 'At least 6 characters' : null,
            suffix: GestureDetector(
              onTap: () => setState(() => _obscure = !_obscure),
              child: Icon(
                _obscure ? Iconsax.eye_slash : Iconsax.eye,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.35),
                size: 20.sp,
              ),
            ),
          ),
          if (!_isSignUp) ...[
            SizedBox(height: 8.h),
            Align(
              alignment: Alignment.centerRight,
              child: GestureDetector(
                onTap: () {
                  Get.to(() => ForgotPasswordPage());
                },
                child: Text(
                  'Forgot password?',
                  style: TextStyle(
                    color: theme.colorScheme.primary,
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
          Obx(() {
            final err = _auth.errorMessage.value;
            if (err.isEmpty) return const SizedBox.shrink();
            return Padding(
              padding: EdgeInsets.only(top: 12.h),
              child: Text(
                err,
                style: TextStyle(
                    color: theme.colorScheme.error, fontSize: 12.5.sp),
              ),
            );
          }),
          SizedBox(height: 18.h),
          Obx(() {
            final loading = _auth.isLoading.value;
            return SizedBox(
              height: 54.h,
              child: ElevatedButton(
                onPressed: loading ? null : () => _submitEmail(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: theme.colorScheme.onPrimary,
                  disabledBackgroundColor:
                      theme.colorScheme.primary.withValues(alpha: 0.5),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14.r)),
                ),
                child: loading
                    ? SizedBox(
                        width: 22.w,
                        height: 22.w,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.4,
                          color: theme.colorScheme.onPrimary,
                        ),
                      )
                    : Text(
                        _isSignUp ? 'Create account' : 'Log in',
                        style: TextStyle(
                            fontSize: 16.sp, fontWeight: FontWeight.w800),
                      ),
              ),
            );
          }),
          SizedBox(height: 12.h),
          Center(
            child: GestureDetector(
              onTap: () => setState(() {
                _emailMode = false;
                _auth.errorMessage.value = '';
              }),
              child: Text(
                '← Back to all options',
                style: TextStyle(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                  fontSize: 13.sp,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _field({
    required ThemeData theme,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    bool obscure = false,
    Widget? suffix,
  }) {
    final muted = theme.colorScheme.onSurface.withValues(alpha: 0.35);
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      obscureText: obscure,
      style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 15.sp),
      cursorColor: theme.colorScheme.primary,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: muted, fontSize: 15.sp),
        prefixIcon: Icon(icon, color: muted, size: 20.sp),
        suffixIcon: suffix == null
            ? null
            : Padding(padding: EdgeInsets.only(right: 14.w), child: suffix),
        suffixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
        filled: true,
        fillColor:
            theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
        contentPadding: EdgeInsets.symmetric(vertical: 16.h),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14.r),
          borderSide: BorderSide(color: theme.colorScheme.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14.r),
          borderSide: BorderSide(color: theme.colorScheme.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14.r),
          borderSide: BorderSide(color: theme.colorScheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14.r),
          borderSide: BorderSide(color: theme.colorScheme.error, width: 1.5),
        ),
        errorStyle: TextStyle(color: theme.colorScheme.error, fontSize: 12.sp),
      ),
    );
  }

  Widget _orDivider(ThemeData theme) {
    return Row(
      children: [
        Expanded(child: Divider(color: theme.colorScheme.outline)),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 12.w),
          child: Text(
            'or',
            style: TextStyle(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
              fontSize: 13.sp,
            ),
          ),
        ),
        Expanded(child: Divider(color: theme.colorScheme.outline)),
      ],
    );
  }

  Widget _modeToggle(ThemeData theme) {
    return Center(
      child: Text.rich(
        TextSpan(
          text: _isSignUp ? 'Already have an account?  ' : 'New to MSO?  ',
          style: TextStyle(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.55),
            fontSize: 14.sp,
          ),
          children: [
            WidgetSpan(
              alignment: PlaceholderAlignment.middle,
              child: GestureDetector(
                onTap: _switchMode,
                child: Text(
                  _isSignUp ? 'Log in' : 'Sign up',
                  style: TextStyle(
                    color: theme.colorScheme.primary,
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _terms(ThemeData theme) {
    return Text(
      'By signing up you agree to MSO\'s Terms & Conditions and Privacy Policy.',
      textAlign: TextAlign.center,
      style: TextStyle(
        color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
        fontSize: 11.5.sp,
        height: 1.4,
      ),
    );
  }
}

class _ProviderButton extends StatelessWidget {
  const _ProviderButton({
    required this.label,
    required this.icon,
    required this.onTap,
    this.background,
    this.borderColor,
    this.foreground = Colors.black,
    this.loading = false,
    this.dimmed = false,
  });

  final String label;
  final Widget icon;
  final VoidCallback onTap;

  /// Filled background (e.g. Apple). Leave null for an outlined button.
  final Color? background;

  /// Border color for outlined buttons (e.g. Google, Facebook).
  final Color? borderColor;
  final Color foreground;

  /// This provider is mid sign-in: show a spinner in place of the logo.
  final bool loading;

  /// Another provider is busy: fade this button to read as disabled.
  final bool dimmed;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 200),
      opacity: dimmed ? 0.4 : 1,
      child: GestureDetector(
        onTap: (loading || dimmed) ? null : onTap,
        child: Container(
          height: 54.h,
          padding: EdgeInsets.symmetric(horizontal: 18.w),
          decoration: BoxDecoration(
            color: background ?? Colors.transparent,
            borderRadius: BorderRadius.circular(14.r),
            border: borderColor == null
                ? null
                : Border.all(color: borderColor!, width: 1.5),
          ),
          child: Row(
            children: [
              // Leading brand mark (or spinner); the trailing SizedBox of equal
              // width keeps the label optically centred in the button.
              SizedBox(
                width: 22.sp,
                height: 22.sp,
                child: Center(
                  child: loading
                      ? SizedBox(
                          width: 18.sp,
                          height: 18.sp,
                          child: CircularProgressIndicator(
                              strokeWidth: 2.2, color: foreground),
                        )
                      : icon,
                ),
              ),
              Expanded(
                child: Text(
                  loading ? 'Connecting…' : label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: foreground,
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w700),
                ),
              ),
              SizedBox(width: 22.sp),
            ],
          ),
        ),
      ),
    );
  }
}

/// App palette — teal green primary (replacing the maroon in the reference).
class AppColors {
  AppColors._();

  /// Primary teal green — used for buttons, selected chips, accents.
  static const Color teal = Color(0xFF0B7B73);
  static const Color tealDark = Color(0xFF055C56);
  static const Color tealLight = Color(0xFF1A9E94);

  static const Color background = Color(0xFFF4F4F5);
  static const Color card = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFF1F1F3);
  static const Color textPrimary = Color(0xFF1C1C1E);
  static const Color textSecondary = Color(0xFF9A9A9E);
  static const Color border = Color(0xFFECECEC);
  static const Color star = Color(0xFFFFB300);
  static const Color heart = Color(0xFFE53935);
  static const Color strike = Color(0xFFBDBDBD);

  /// Dark MSO-style auth/onboarding background + sheet.
  static const Color authBg = Color(0xFF11161B);
  static const Color authSheet = Color(0xFF171C22);
  static const Color authBorder = Color(0xFF2A3138);

  /// Brand colors for social-login marks.
  static const Color google = Color(0xFF4285F4);
  static const Color facebook = Color(0xFF1877F2);

  /// Soft elevation used on cards / floating elements for a premium feel.
  static const List<BoxShadow> softShadow = [
    BoxShadow(color: Color(0x0F101828), blurRadius: 18, offset: Offset(0, 8)),
  ];

  static const List<BoxShadow> tealGlow = [
    BoxShadow(color: Color(0x3D0B7B73), blurRadius: 22, offset: Offset(0, 10)),
  ];
}

/// Crisp, full-colour social brand marks (real logos, not monochrome glyphs).
class BrandLogo {
  BrandLogo._();

  /// The official multi-colour Google "G".
  static Widget google(double size) =>
      SvgPicture.string(_googleG, width: size, height: size);

  /// The official Facebook "f" in brand blue (#1877F2).
  static Widget facebook(double size) =>
      SvgPicture.string(_facebookF, width: size, height: size);

  static const String _googleG = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
<path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
<path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
<path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
</svg>''';

  static const String _facebookF = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
<path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
</svg>''';
}
