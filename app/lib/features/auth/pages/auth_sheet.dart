import 'package:app/bottom_tabs.dart';
import 'package:app/core/widgets/terms.dart';
import 'package:app/features/auth/pages/forgot_password_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/svg.dart';

import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';

// Adjust this import to match where AuthController actually lives in your
// project (e.g. package:app/features/auth/auth_controller.dart).
import '../controllers/auth_controller.dart';

/// Which flow the auth sheet opens in.
enum AuthMode { signUp, signIn }

/// Above this width we stop behaving like a phone: the sheet becomes a
/// centred dialog and sizing switches to raw logical pixels.
const double kAuthWideBreakpoint = 700;

/// The form never gets wider than this, on any layout. Long single-column
/// inputs stretched across a 1920px monitor are unusable.
const double kAuthMaxContentWidth = 440;

/// ScreenUtil scales every dimension against a phone design size, so on a
/// 1440px-wide window `22.w` becomes ~84px and the sheet falls apart. On wide
/// layouts we bypass it and use logical pixels directly.
class _Scale {
  const _Scale(this.useScreenUtil);

  final bool useScreenUtil;

  double w(double v) => useScreenUtil ? v.w : v;
  double h(double v) => useScreenUtil ? v.h : v;
  double sp(double v) => useScreenUtil ? v.sp : v;
  double r(double v) => useScreenUtil ? v.r : v;
}

/// Light, theme-driven auth surface that handles both sign-up and sign-in,
/// wired to [AuthController] for real network calls.
///
/// On phones it opens as a bottom sheet. On tablets, desktop and web it opens
/// as a centred dialog with a fixed max width, keyboard navigation and
/// hover cursors.
Future<void> showAuthSheet(BuildContext context, {required AuthMode mode}) {
  final theme = Theme.of(context);
  final isWide = MediaQuery.sizeOf(context).width >= kAuthWideBreakpoint;

  if (isWide) {
    return showDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierColor: Colors.black.withValues(alpha: 0.45),
      builder: (_) => Dialog(
        backgroundColor: theme.colorScheme.surface,
        surfaceTintColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(24),
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: kAuthMaxContentWidth + 64, // content + horizontal padding
            maxHeight: 660,
          ),
          child: _AuthSheetHost(initialMode: mode),
        ),
      ),
    );
  }

  return showModalBottomSheet<void>(
    context: context,
    backgroundColor: theme.colorScheme.surface,
    isScrollControlled: true,
    // Keeps the sheet sane on foldables and small desktop windows that sit
    // just under the breakpoint.
    constraints: const BoxConstraints(maxWidth: 560),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(28.r)),
    ),
    builder: (_) => _AuthSheetHost(initialMode: mode),
  );
}

/// Reads the live width so the sheet reflows if the window is resized while
/// it's open — a desktop-only situation that would otherwise leave the layout
/// stuck at whatever size it opened with.
class _AuthSheetHost extends StatelessWidget {
  const _AuthSheetHost({required this.initialMode});

  final AuthMode initialMode;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = MediaQuery.sizeOf(context).width >= kAuthWideBreakpoint;
        return _AuthSheet(initialMode: initialMode, isWide: isWide);
      },
    );
  }
}

class _AuthSheet extends StatefulWidget {
  const _AuthSheet({required this.initialMode, required this.isWide});

  final AuthMode initialMode;
  final bool isWide;

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

  // Focus nodes drive tab order and Enter-to-advance on desktop.
  final _nameFocus = FocusNode();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();

  final _scrollController = ScrollController();

  bool get _isSignUp => _mode == AuthMode.signUp;
  bool get _isWide => widget.isWide;
  _Scale get _s => _Scale(!_isWide);

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _nameFocus.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    _scrollController.dispose();
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

  void _openEmailMode() {
    setState(() => _emailMode = true);
    // Land the caret in the first field so a desktop user can start typing
    // without reaching for the mouse.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      (_isSignUp ? _nameFocus : _emailFocus).requestFocus();
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
    if (_auth.isLoading.value) return;
    if (!(_formKey.currentState?.validate() ?? false)) return;
    FocusScope.of(context).unfocus();
    _auth.errorMessage.value = '';

    if (_isSignUp) {
      await _auth.register({
        'name': _name.text.trim(),
        'email': _email.text.trim(),
        'password_hash': _password.text,
      }, {});
    } else {
      await _auth.login(
        email: _email.text.trim(),
        password: _password.text,
        context: context,
        onFailed: (msg) => debugPrint(msg.toString()),
      );
    }
    // login() and register() navigate to the OTP screen themselves on
    // success. On failure, errorMessage is set and the inline error text
    // below picks it up — nothing else to do here.
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    final content = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (!_isWide) ...[
          _grabHandle(theme),
          SizedBox(height: _s.h(18)),
        ],
        _header(theme),
        SizedBox(height: _s.h(24)),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 250),
          child: _emailMode ? _emailForm(theme) : _providers(theme),
        ),
        SizedBox(height: _s.h(20)),
        _modeToggle(theme),
        if (_isSignUp) ...[SizedBox(height: _s.h(16)), TermsText()],
      ],
    );

    final padded = Padding(
      padding: _isWide
          ? const EdgeInsets.fromLTRB(32, 28, 32, 28)
          : EdgeInsets.fromLTRB(_s.w(22), _s.h(12), _s.w(22), _s.h(22)),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: kAuthMaxContentWidth),
          child: content,
        ),
      ),
    );

    // Scrollbar so a long form is obviously scrollable with a mouse.
    final scrollable = Scrollbar(
      controller: _scrollController,
      thumbVisibility: _isWide,
      child: SingleChildScrollView(
        controller: _scrollController,
        child: padded,
      ),
    );

    if (_isWide) return scrollable;

    return AnimatedPadding(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      padding: EdgeInsets.only(bottom: bottomInset),
      child: SafeArea(top: false, child: scrollable),
    );
  }

  /// Pointer cursor + opaque hit area. Bare [GestureDetector]s leave a text
  /// cursor over links on desktop, which reads as non-interactive.
  Widget _clickable({required Widget child, required VoidCallback onTap}) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: child,
      ),
    );
  }

  Widget _grabHandle(ThemeData theme) {
    return Center(
      child: Container(
        width: _s.w(44),
        height: _s.h(4),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(_s.r(4)),
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
                  fontSize: _s.sp(26),
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
              SizedBox(height: _s.h(6)),
              Text(
                _isSignUp
                    ? 'Join millions buying and selling pre-loved fashion.'
                    : 'Log in to pick up where you left off.',
                style: TextStyle(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  fontSize: _s.sp(14),
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
        Tooltip(
          message: 'Close',
          child: _clickable(
            onTap: () => Navigator.of(context).pop(),
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: Icon(
                Iconsax.close_circle,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.35),
                size: _s.sp(28),
              ),
            ),
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
          scale: _s,
          label: 'Continue with Apple',
          icon:
              FaIcon(FontAwesomeIcons.apple, color: Colors.white, size: _s.sp(22)),
          background: Colors.black,
          foreground: Colors.white,
          loading: _busyProvider == 'apple',
          dimmed: _socialBusy && _busyProvider != 'apple',
          onTap: () => _handleProvider('apple'),
        ),
        */
        OutlinedButton.icon(
          onPressed: _openEmailMode,
          style: OutlinedButton.styleFrom(
            foregroundColor: theme.colorScheme.onSurface,
            side: BorderSide(color: theme.colorScheme.outline, width: 1.5),
            padding: EdgeInsets.symmetric(vertical: _s.h(16)),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(_s.r(14))),
          ).copyWith(
            // Hover/focus feedback for pointer and keyboard users.
            overlayColor: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.hovered) ||
                  states.contains(WidgetState.focused)) {
                return theme.colorScheme.primary.withValues(alpha: 0.06);
              }
              return null;
            }),
          ),
          icon: Icon(Iconsax.sms, size: _s.sp(20)),
          label: Text(
            _isSignUp ? 'Sign up with email' : 'Log in with email',
            style: TextStyle(fontSize: _s.sp(15), fontWeight: FontWeight.w700),
          ),
        ),
        SizedBox(height: _s.h(12)),
        /*
        _ProviderButton(
          scale: _s,
          label: 'Continue with Facebook',
          icon: BrandLogo.facebook(_s.sp(22)),
          borderColor: theme.colorScheme.outline,
          foreground: theme.colorScheme.onSurface,
          loading: _busyProvider == 'facebook',
          dimmed: _socialBusy && _busyProvider != 'facebook',
          onTap: () => _handleProvider('facebook'),
        ),
        */
      ],
    );
  }

  Widget _emailForm(ThemeData theme) {
    return Form(
      key: _formKey,
      child: AutofillGroup(
        child: Column(
          key: const ValueKey('email'),
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_isSignUp) ...[
              _field(
                theme: theme,
                controller: _name,
                focusNode: _nameFocus,
                hint: 'Full name',
                icon: Iconsax.user,
                keyboardType: TextInputType.name,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.name],
                onSubmitted: (_) => _emailFocus.requestFocus(),
                validator: (v) => (v == null || v.trim().length < 2)
                    ? 'Enter your name'
                    : null,
              ),
              SizedBox(height: _s.h(12)),
            ],
            _field(
              theme: theme,
              controller: _email,
              focusNode: _emailFocus,
              hint: 'Email address',
              icon: Iconsax.sms,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              autofillHints: const [
                AutofillHints.email,
                AutofillHints.username
              ],
              onSubmitted: (_) => _passwordFocus.requestFocus(),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Enter your email';
                final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v);
                return ok ? null : 'Enter a valid email';
              },
            ),
            SizedBox(height: _s.h(12)),
            _field(
              theme: theme,
              controller: _password,
              focusNode: _passwordFocus,
              hint: 'Password',
              icon: Iconsax.lock,
              obscure: _obscure,
              textInputAction: TextInputAction.done,
              autofillHints: [
                _isSignUp ? AutofillHints.newPassword : AutofillHints.password,
              ],
              // Enter submits the form, as a desktop user expects.
              onSubmitted: (_) => _submitEmail(context),
              validator: (v) =>
                  (v == null || v.length < 6) ? 'At least 6 characters' : null,
              suffix: Tooltip(
                message: _obscure ? 'Show password' : 'Hide password',
                child: _clickable(
                  onTap: () => setState(() => _obscure = !_obscure),
                  child: Icon(
                    _obscure ? Iconsax.eye_slash : Iconsax.eye,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.35),
                    size: _s.sp(20),
                  ),
                ),
              ),
            ),
            if (!_isSignUp) ...[
              SizedBox(height: _s.h(8)),
              Align(
                alignment: Alignment.centerRight,
                child: _clickable(
                  onTap: () => Get.to(() => ForgotPasswordPage()),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Text(
                      'Forgot password?',
                      style: TextStyle(
                        color: theme.colorScheme.primary,
                        fontSize: _s.sp(13),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
            ],
            Obx(() {
              final err = _auth.errorMessage.value;
              if (err.isEmpty) return const SizedBox.shrink();
              return Padding(
                padding: EdgeInsets.only(top: _s.h(12)),
                child: Text(
                  err,
                  style: TextStyle(
                      color: theme.colorScheme.error, fontSize: _s.sp(12.5)),
                ),
              );
            }),
            SizedBox(height: _s.h(18)),
            Obx(() {
              final loading = _auth.isLoading.value;
              return SizedBox(
                height: _s.h(54),
                child: ElevatedButton(
                  onPressed: loading ? null : () => _submitEmail(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: theme.colorScheme.onPrimary,
                    disabledBackgroundColor:
                        theme.colorScheme.primary.withValues(alpha: 0.5),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(_s.r(14))),
                  ),
                  child: loading
                      ? SizedBox(
                          width: _s.w(22),
                          height: _s.w(22),
                          child: CircularProgressIndicator(
                            strokeWidth: 2.4,
                            color: theme.colorScheme.onPrimary,
                          ),
                        )
                      : Text(
                          _isSignUp ? 'Create account' : 'Log in',
                          style: TextStyle(
                              fontSize: _s.sp(16), fontWeight: FontWeight.w800),
                        ),
                ),
              );
            }),
            SizedBox(height: _s.h(12)),
            Center(
              child: _clickable(
                onTap: () => setState(() {
                  _emailMode = false;
                  _auth.errorMessage.value = '';
                }),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Text(
                    '← Back to all options',
                    style: TextStyle(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                      fontSize: _s.sp(13),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field({
    required ThemeData theme,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    FocusNode? focusNode,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    TextInputAction? textInputAction,
    Iterable<String>? autofillHints,
    ValueChanged<String>? onSubmitted,
    bool obscure = false,
    Widget? suffix,
  }) {
    final muted = theme.colorScheme.onSurface.withValues(alpha: 0.35);
    return TextFormField(
      controller: controller,
      focusNode: focusNode,
      validator: validator,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      autofillHints: autofillHints,
      onFieldSubmitted: onSubmitted,
      obscureText: obscure,
      style: TextStyle(color: theme.colorScheme.onSurface, fontSize: _s.sp(15)),
      cursorColor: theme.colorScheme.primary,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: muted, fontSize: _s.sp(15)),
        prefixIcon: Icon(icon, color: muted, size: _s.sp(20)),
        suffixIcon: suffix == null
            ? null
            : Padding(padding: EdgeInsets.only(right: _s.w(14)), child: suffix),
        suffixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
        filled: true,
        fillColor:
            theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
        contentPadding: EdgeInsets.symmetric(vertical: _s.h(16)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(_s.r(14)),
          borderSide: BorderSide(color: theme.colorScheme.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(_s.r(14)),
          borderSide: BorderSide(color: theme.colorScheme.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(_s.r(14)),
          borderSide: BorderSide(color: theme.colorScheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(_s.r(14)),
          borderSide: BorderSide(color: theme.colorScheme.error, width: 1.5),
        ),
        errorStyle:
            TextStyle(color: theme.colorScheme.error, fontSize: _s.sp(12)),
      ),
    );
  }

  // ignore: unused_element
  Widget _orDivider(ThemeData theme) {
    return Row(
      children: [
        Expanded(child: Divider(color: theme.colorScheme.outline)),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: _s.w(12)),
          child: Text(
            'or',
            style: TextStyle(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
              fontSize: _s.sp(13),
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
            fontSize: _s.sp(14),
          ),
          children: [
            WidgetSpan(
              alignment: PlaceholderAlignment.middle,
              child: _clickable(
                onTap: _switchMode,
                child: Text(
                  _isSignUp ? 'Log in' : 'Sign up',
                  style: TextStyle(
                    color: theme.colorScheme.primary,
                    fontSize: _s.sp(14),
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
}

class _ProviderButton extends StatelessWidget {
  const _ProviderButton({
    required this.scale,
    required this.label,
    required this.icon,
    required this.onTap,
    this.background,
    this.borderColor,
    this.foreground = Colors.black,
    this.loading = false,
    this.dimmed = false,
  });

  final _Scale scale;
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
    final disabled = loading || dimmed;
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 200),
      opacity: dimmed ? 0.4 : 1,
      child: MouseRegion(
        cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
        child: Material(
          color: background ?? Colors.transparent,
          borderRadius: BorderRadius.circular(scale.r(14)),
          child: InkWell(
            onTap: disabled ? null : onTap,
            borderRadius: BorderRadius.circular(scale.r(14)),
            child: Container(
              height: scale.h(54),
              padding: EdgeInsets.symmetric(horizontal: scale.w(18)),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(scale.r(14)),
                border: borderColor == null
                    ? null
                    : Border.all(color: borderColor!, width: 1.5),
              ),
              child: Row(
                children: [
                  // Leading brand mark (or spinner); the trailing SizedBox of
                  // equal width keeps the label optically centred.
                  SizedBox(
                    width: scale.sp(22),
                    height: scale.sp(22),
                    child: Center(
                      child: loading
                          ? SizedBox(
                              width: scale.sp(18),
                              height: scale.sp(18),
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
                          fontSize: scale.sp(15),
                          fontWeight: FontWeight.w700),
                    ),
                  ),
                  SizedBox(width: scale.sp(22)),
                ],
              ),
            ),
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
