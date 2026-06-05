import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/user_profile_controller.dart';
import '../services/user_profile_service.dart';
import '../widgets/profile_header_widget.dart';
import '../widgets/media_section_widget.dart';
import '../widgets/stats_section_widget.dart';
import '../widgets/profile_info_section_widget.dart';
import '../widgets/guardian_section_widget.dart';
import '../widgets/settings_section_widget.dart';

class MyProfilePage extends StatelessWidget {
  const MyProfilePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Register service + controller if not already registered
    if (!Get.isRegistered<UserProfileService>()) {
      Get.put(UserProfileService(), permanent: true);
    }
    Get.put(UserProfileController());

    return Scaffold(
      backgroundColor: Color(0xFFF3F4F6),
      body: SafeArea(
        child: Obx(() {
          final ctrl = Get.find<UserProfileController>();

          if (ctrl.isLoading.value) {
            return _LoadingView();
          }

          return SingleChildScrollView(
            padding: EdgeInsets.only(bottom: 60),
            child: Column(
              children: [
                // ── Header ─────────────────────────────────────────────
                Obx(() => ProfileHeaderWidget(
                  isPremium: ctrl.isPremium.value,
                )),

                SizedBox(height: 8),

                // ── Media (photos + videos) ────────────────────────────
                MediaSectionWidget(),

                // ── Stats ──────────────────────────────────────────────
                Obx(() => Padding(
                  padding: EdgeInsets.symmetric(horizontal: 0),
                  child: StatsSectionWidget(counts: Map<String, int>.from(ctrl.counts)),
                )),

                // ── Profile info (bio, interests) ──────────────────────
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 0),
                  child: ProfileInfoSectionWidget(),
                ),

                // ── Guardian section ───────────────────────────────────
                GuardianSectionWidget(),

                // ── Settings nav rows ──────────────────────────────────
                SettingsSectionWidget(),
              ],
            ),
          );
        }),
      ),
    );
  }
}

// ─── Loading view ─────────────────────────────────────────────────────────────
class _LoadingView extends StatefulWidget {
  @override
  State<_LoadingView> createState() => _LoadingViewState();
}

class _LoadingViewState extends State<_LoadingView>
    with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _rot;

  @override
  void initState() {
    super.initState();
    _ac = AnimationController(vsync: this, duration: Duration(milliseconds: 850))
      ..repeat();
    _rot = Tween<double>(begin: 0, end: 1).animate(_ac);
  }

  @override
  void dispose() { _ac.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height,
      child: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          SizedBox(
            width: 64, height: 64,
            child: AnimatedBuilder(
              animation: _rot,
              builder: (_, __) => Stack(
                children: [
                  Container(
                    width: 64, height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: Color(0xFF1B4D3E).withOpacity(0.2), width: 4),
                    ),
                  ),
                  Transform.rotate(
                    angle: _rot.value * 2 * 3.14159,
                    child: Container(
                      width: 64, height: 64,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border(
                          top: BorderSide(color: Color(0xFF1B4D3E), width: 4),
                          right: BorderSide(color: Color(0xFF1B4D3E), width: 4),
                          bottom: BorderSide(color: Colors.transparent, width: 4),
                          left: BorderSide(color: Colors.transparent, width: 4),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 24),
          Text('Loading profile...',
              style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1B4D3E))),
          SizedBox(height: 4),
          Text('Please wait',
              style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
        ]),
      ),
    );
  }
}
