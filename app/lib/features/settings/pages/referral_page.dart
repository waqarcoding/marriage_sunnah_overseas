import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../services/settings_service.dart';
import '../widgets/settings_widgets.dart';

const _primary = Color(0xFF1B4D3E);
const _lightGreen = Color(0xFFF0F7F5);
const _border = Color(0xFFE6ECE9);

class ReferralPage extends StatefulWidget {
  const ReferralPage({Key? key}) : super(key: key);

  @override
  State<ReferralPage> createState() => _ReferralPageState();
}

class _ReferralPageState extends State<ReferralPage> {
  bool _loading = true;
  bool _copied = false;
  String _tab = 'overview'; // overview | myReferrals | referredBy

  String? _referralLink;
  Map<String, dynamic>? _currentUser;
  Map<String, dynamic> _stats = {
    'total_referrals': 0,
    'total_commission_earned': '0.00',
    'total_credits_generated': '0.00',
    'referred_users': [],
  };
  Map<String, dynamic>? _referrer;

  // Settings-based values (fallback constants)
  int get _commissionRate => 10;
  int get _referrerBonus => 200;
  int get _refereeBonus => 100;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    try {
      final user = GetStorage().read('user');
      if (user != null) {
        _currentUser = Map<String, dynamic>.from(user as Map);
        final userId = _currentUser!['id'];
        _referralLink = 'https://marriagesunnah.com/register?id=$userId';

        final service = Get.find<UserSettingsService>();
        final referralsRes = await service.getMyReferrals(userId);
        if (referralsRes != null &&
            referralsRes['success'] == true &&
            referralsRes['data'] != null) {
          _stats = Map<String, dynamic>.from(referralsRes['data'] as Map);
        }

        final referrerRes = await service.getMyReferrer(userId);
        if (referrerRes != null &&
            referrerRes['success'] == true &&
            referrerRes['data'] != null) {
          _referrer = Map<String, dynamic>.from(referrerRes['data'] as Map);
        }
      }
    } catch (e) {
      print('ReferralPage fetchData error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  void _copy() {
    if (_referralLink != null) {
      Clipboard.setData(ClipboardData(text: _referralLink!));
      setState(() => _copied = true);
      Future.delayed(Duration(seconds: 2), () {
        if (mounted) setState(() => _copied = false);
      });
    }
  }

  void _share() {
    // TODO: integrate share_plus package
    _copy();
    Get.snackbar('Copied!', 'Referral link copied to clipboard',
        snackPosition: SnackPosition.BOTTOM);
  }

  String _fmtDate(dynamic d) {
    if (d == null) return 'N/A';
    try {
      final dt = DateTime.parse(d.toString());
      return '${[
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ][dt.month - 1]} ${dt.day}, ${dt.year}';
    } catch (_) {
      return 'N/A';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF4F7F5),
      body: Column(
        children: [
          SubPageHeader(title: 'Referral Program', onBack: () => Get.back()),

          // Tabs
          Container(
            color: Colors.white,
            decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: _border))),
            child: Row(
              children: [
                _TabBtn(
                    label: 'Overview',
                    active: _tab == 'overview',
                    onTap: () => setState(() => _tab = 'overview')),
                _TabBtn(
                    label: 'My Referrals (${_stats['total_referrals'] ?? 0})',
                    active: _tab == 'myReferrals',
                    onTap: () => setState(() => _tab = 'myReferrals')),
                _TabBtn(
                    label: 'Referred By',
                    active: _tab == 'referredBy',
                    onTap: () => setState(() => _tab = 'referredBy')),
              ],
            ),
          ),

          Expanded(
            child: _loading
                ? Center(
                    child: CircularProgressIndicator(
                        strokeWidth: 2.5, color: _primary))
                : AnimatedSwitcher(
                    duration: Duration(milliseconds: 200),
                    child: _tab == 'overview'
                        ? _OverviewTab(
                            key: ValueKey('overview'),
                            stats: _stats,
                            referralLink: _referralLink ?? '',
                            copied: _copied,
                            onCopy: _copy,
                            onShare: _share,
                            commissionRate: _commissionRate,
                            referrerBonus: _referrerBonus,
                            refereeBonus: _refereeBonus,
                            fmtDate: _fmtDate,
                          )
                        : _tab == 'myReferrals'
                            ? _MyReferralsTab(
                                key: ValueKey('myReferrals'),
                                stats: _stats,
                                fmtDate: _fmtDate)
                            : _ReferredByTab(
                                key: ValueKey('referredBy'),
                                referrer: _referrer,
                                fmtDate: _fmtDate),
                  ),
          ),
        ],
      ),
    );
  }
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
class _TabBtn extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _TabBtn(
      {required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) => Expanded(
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              border: Border(
                  bottom: BorderSide(
                      color: active ? _primary : Colors.transparent, width: 3)),
            ),
            child: Text(label,
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                    color: active ? _primary : Color(0xFF888888))),
          ),
        ),
      );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
class _OverviewTab extends StatelessWidget {
  final Map<String, dynamic> stats;
  final String referralLink;
  final bool copied;
  final VoidCallback onCopy, onShare;
  final int commissionRate, referrerBonus, refereeBonus;
  final String Function(dynamic) fmtDate;

  const _OverviewTab({
    Key? key,
    required this.stats,
    required this.referralLink,
    required this.copied,
    required this.onCopy,
    required this.onShare,
    required this.commissionRate,
    required this.referrerBonus,
    required this.refereeBonus,
    required this.fmtDate,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stat cards
          Row(children: [
            Expanded(
                child: _StatCard(
                    icon: Icons.monetization_on_outlined,
                    label: 'Total Earned',
                    value: '${stats['total_commission_earned'] ?? '0'} Cr',
                    color: Color(0xFF2F7A65))),
            SizedBox(width: 10),
            Expanded(
                child: _StatCard(
                    icon: Icons.people_outline,
                    label: 'Referrals',
                    value: '${stats['total_referrals'] ?? 0}',
                    color: _primary)),
            SizedBox(width: 10),
            Expanded(
                child: _StatCard(
                    icon: Icons.trending_up,
                    label: 'Credits Gen.',
                    value: '${stats['total_credits_generated'] ?? '0'}',
                    color: Color(0xFF4A9D7F))),
          ]),
          SizedBox(height: 20),

          Text('Invite & Earn',
              style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1A1A1A))),
          SizedBox(height: 6),
          Text(
              'Share your link and earn $commissionRate% commission on every credit your friends earn',
              style: TextStyle(
                  fontSize: 13, color: Color(0xFF777777), height: 1.5)),
          SizedBox(height: 20),

          // How it works
          _WhiteCard(
            title: 'How it Works',
            child: Column(
              children: [
                _HowStep(
                    num: 1,
                    step: 'Share your referral link',
                    detail: 'Copy and send to friends'),
                _HowStep(
                    num: 2,
                    step: 'Friend signs up using your link',
                    detail: 'They get $refereeBonus bonus credits'),
                _HowStep(
                    num: 3,
                    step: 'You earn commission',
                    detail: 'Get $commissionRate% of all credits they earn'),
              ],
            ),
          ),
          SizedBox(height: 16),

          // Rewards
          Container(
            padding: EdgeInsets.all(18),
            decoration: BoxDecoration(
                color: _lightGreen,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: _border)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Rewards',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                SizedBox(height: 12),
                Row(children: [
                  Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Text('You get',
                            style: TextStyle(
                                fontSize: 12, color: Color(0xFF666666))),
                        SizedBox(height: 4),
                        Text('$referrerBonus Credits',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: _primary)),
                        Text('Signup bonus',
                            style: TextStyle(
                                fontSize: 11, color: Color(0xFF888888))),
                      ])),
                  Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Text('Plus',
                            style: TextStyle(
                                fontSize: 12, color: Color(0xFF666666))),
                        SizedBox(height: 4),
                        Text('$commissionRate% Commission',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: _primary)),
                        Text('On their purchases',
                            style: TextStyle(
                                fontSize: 11, color: Color(0xFF888888))),
                      ])),
                ]),
                SizedBox(height: 16),
                Container(height: 1, color: _border),
                SizedBox(height: 16),
                Center(
                    child: Column(children: [
                  Text('Your friend gets',
                      style: TextStyle(fontSize: 12, color: Color(0xFF666666))),
                  SizedBox(height: 4),
                  Text('$refereeBonus Credits',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: _primary)),
                  Text('Bonus on signup',
                      style: TextStyle(fontSize: 11, color: Color(0xFF888888))),
                ])),
              ],
            ),
          ),
          SizedBox(height: 16),

          // Referral link box
          Container(
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: _border)),
            child: Column(
              children: [
                Container(
                  padding: EdgeInsets.fromLTRB(16, 12, 16, 12),
                  child: Text(
                      referralLink.isNotEmpty
                          ? referralLink
                          : 'Generating link…',
                      style: TextStyle(fontSize: 12, color: Color(0xFF555555)),
                      overflow: TextOverflow.ellipsis),
                ),
                GestureDetector(
                  onTap: onCopy,
                  child: AnimatedContainer(
                    duration: Duration(milliseconds: 200),
                    width: double.infinity,
                    padding: EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: copied ? Color(0xFF2F7A65) : _primary,
                      borderRadius:
                          BorderRadius.vertical(bottom: Radius.circular(16)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(copied ? Icons.check : Icons.copy,
                            color: Colors.white, size: 16),
                        SizedBox(width: 8),
                        Text(copied ? 'Copied!' : 'Copy Link',
                            style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: Colors.white)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 14),

          // Share button
          GestureDetector(
            onTap: onShare,
            child: Container(
              width: double.infinity,
              padding: EdgeInsets.symmetric(vertical: 15),
              decoration: BoxDecoration(
                color: _primary,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                      color: _primary.withOpacity(0.3),
                      blurRadius: 12,
                      offset: Offset(0, 4))
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.share, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text('Share Referral Link',
                      style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── My Referrals Tab ─────────────────────────────────────────────────────────
class _MyReferralsTab extends StatelessWidget {
  final Map<String, dynamic> stats;
  final String Function(dynamic) fmtDate;
  const _MyReferralsTab({Key? key, required this.stats, required this.fmtDate})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final referred =
        (stats['referred_users'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    return SingleChildScrollView(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('My Referrals',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
          SizedBox(height: 4),
          Text('People who joined using your link',
              style: TextStyle(fontSize: 13, color: Color(0xFF777777))),
          SizedBox(height: 16),

          // Summary card
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: _primary,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                    color: _primary.withOpacity(0.2),
                    blurRadius: 16,
                    offset: Offset(0, 4))
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Total Commission Earned',
                    style: TextStyle(
                        fontSize: 13, color: Colors.white.withOpacity(0.9))),
                SizedBox(height: 6),
                Text('${stats['total_commission_earned'] ?? '0'}',
                    style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w700,
                        color: Colors.white)),
                Text('Credits',
                    style: TextStyle(
                        fontSize: 13, color: Colors.white.withOpacity(0.8))),
                SizedBox(height: 16),
                Container(height: 1, color: Colors.white.withOpacity(0.2)),
                SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          Text('Total Referrals',
                              style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.white.withOpacity(0.8))),
                          SizedBox(height: 4),
                          Text('${stats['total_referrals'] ?? 0}',
                              style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white)),
                        ])),
                    Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          Text('Credits Generated',
                              style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.white.withOpacity(0.8))),
                          SizedBox(height: 4),
                          Text('${stats['total_credits_generated'] ?? '0'}',
                              style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white)),
                        ])),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 16),

          if (referred.isEmpty)
            _EmptyState(message: 'No referrals yet. Start sharing your link!')
          else
            ...referred
                .map((ref) => _ReferralCard(referral: ref, fmtDate: fmtDate)),
        ],
      ),
    );
  }
}

// ─── Referred By Tab ──────────────────────────────────────────────────────────
class _ReferredByTab extends StatelessWidget {
  final Map<String, dynamic>? referrer;
  final String Function(dynamic) fmtDate;
  const _ReferredByTab({Key? key, this.referrer, required this.fmtDate})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Referred By',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
          SizedBox(height: 4),
          Text('Who invited you to join',
              style: TextStyle(fontSize: 13, color: Color(0xFF777777))),
          SizedBox(height: 16),
          if (referrer == null)
            _EmptyState(message: "You weren't referred by anyone")
          else
            Column(
              children: [
                Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _border),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 8)
                      ]),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                                color: _lightGreen, shape: BoxShape.circle),
                            child: Icon(Icons.person_outline,
                                color: _primary, size: 28),
                          ),
                          SizedBox(width: 16),
                          Expanded(
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                Text(
                                    referrer!['referrer']?['name']
                                            ?.toString() ??
                                        '',
                                    style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600)),
                                SizedBox(height: 4),
                                Text(
                                    referrer!['referrer']?['email']
                                            ?.toString() ??
                                        '',
                                    style: TextStyle(
                                        fontSize: 13, color: Color(0xFF888888)),
                                    overflow: TextOverflow.ellipsis),
                              ])),
                        ],
                      ),
                      SizedBox(height: 16),
                      Container(height: 1, color: _border),
                      SizedBox(height: 16),
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: NeverScrollableScrollPhysics(),
                        childAspectRatio: 2.5,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        children: [
                          _InfoItem(
                              label: 'Commission Rate',
                              value: '${referrer!['commission_percentage']}%'),
                          _InfoItem(
                              label: 'Your Credits Earned',
                              value: '${referrer!['total_credits_earned']}'),
                          _InfoItem(
                              label: 'Commission Given',
                              value: '${referrer!['total_commission_given']}'),
                          _InfoItem(
                              label: 'Joined',
                              value: fmtDate(referrer!['activated_at'])),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 14),
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                      color: _lightGreen,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: _border)),
                  child: Column(children: [
                    Text(
                        '🎉 Thanks to ${referrer!['referrer']?['name'] ?? 'them'} for inviting you!',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: _primary)),
                    SizedBox(height: 6),
                    Text(
                        'They earn ${referrer!['commission_percentage']}% commission on credits you earn',
                        textAlign: TextAlign.center,
                        style:
                            TextStyle(fontSize: 12, color: Color(0xFF666666))),
                  ]),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

// ─── Helper widgets ───────────────────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color color;
  const _StatCard(
      {required this.icon,
      required this.label,
      required this.value,
      required this.color});

  @override
  Widget build(BuildContext context) => Container(
        padding: EdgeInsets.all(14),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _border),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)
            ]),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, size: 18, color: color),
          SizedBox(height: 8),
          Text(label, style: TextStyle(fontSize: 10, color: Color(0xFF888888))),
          SizedBox(height: 4),
          Text(value,
              style: TextStyle(
                  fontSize: 15, fontWeight: FontWeight.w700, color: color),
              overflow: TextOverflow.ellipsis),
        ]),
      );
}

class _WhiteCard extends StatelessWidget {
  final String title;
  final Widget child;
  const _WhiteCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) => Container(
        padding: EdgeInsets.all(18),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: _border),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)
            ]),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title,
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          SizedBox(height: 14),
          child,
        ]),
      );
}

class _HowStep extends StatelessWidget {
  final int num;
  final String step, detail;
  const _HowStep({required this.num, required this.step, required this.detail});

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.only(bottom: 12),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(color: _primary, shape: BoxShape.circle),
            child: Center(
                child: Text('$num',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white))),
          ),
          SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(step,
                    style:
                        TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                SizedBox(height: 2),
                Text(detail,
                    style: TextStyle(fontSize: 12, color: Color(0xFF888888))),
              ])),
        ]),
      );
}

class _ReferralCard extends StatelessWidget {
  final Map<String, dynamic> referral;
  final String Function(dynamic) fmtDate;
  const _ReferralCard({required this.referral, required this.fmtDate});

  @override
  Widget build(BuildContext context) => Container(
        margin: EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _border),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)
            ]),
        child: Column(
          children: [
            Row(children: [
              Container(
                  width: 50,
                  height: 50,
                  decoration:
                      BoxDecoration(color: _lightGreen, shape: BoxShape.circle),
                  child: Icon(Icons.person_outline, color: _primary, size: 22)),
              SizedBox(width: 12),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(referral['name']?.toString() ?? '',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w600)),
                    SizedBox(height: 2),
                    Text(referral['email']?.toString() ?? '',
                        style:
                            TextStyle(fontSize: 12, color: Color(0xFF888888)),
                        overflow: TextOverflow.ellipsis),
                  ])),
            ]),
            SizedBox(height: 12),
            Container(height: 1, color: _border),
            SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              childAspectRatio: 2.5,
              crossAxisSpacing: 12,
              mainAxisSpacing: 8,
              children: [
                _InfoItem(
                    label: 'Credits Earned',
                    value: '${referral['credits_earned'] ?? 0}'),
                _InfoItem(
                    label: 'Commission',
                    value: '${referral['commission_earned'] ?? 0}'),
                _InfoItem(
                    label: 'Rate',
                    value: '${referral['commission_percentage'] ?? 0}%'),
                _InfoItem(
                    label: 'Joined', value: fmtDate(referral['joined_at'])),
              ],
            ),
          ],
        ),
      );
}

class _InfoItem extends StatelessWidget {
  final String label, value;
  const _InfoItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: TextStyle(fontSize: 11, color: Color(0xFF888888))),
        SizedBox(height: 3),
        Text(value,
            style: TextStyle(
                fontSize: 14, fontWeight: FontWeight.w600, color: _primary)),
      ]);
}

class _EmptyState extends StatelessWidget {
  final String message;
  const _EmptyState({required this.message});

  @override
  Widget build(BuildContext context) => Container(
        padding: EdgeInsets.all(40),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: _border)),
        child: Column(children: [
          Text('📭', style: TextStyle(fontSize: 48)),
          SizedBox(height: 12),
          Text(message,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Color(0xFF888888))),
        ]),
      );
}
