import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../services/settings_service.dart';
import '../widgets/settings_widgets.dart';

class SubscriptionDetailPage extends StatefulWidget {
  const SubscriptionDetailPage({Key? key}) : super(key: key);

  @override
  State<SubscriptionDetailPage> createState() => _SubscriptionDetailPageState();
}

class _SubscriptionDetailPageState extends State<SubscriptionDetailPage> {
  bool _loading = true;
  String _error = '';
  Map<String, dynamic>? _data;
  String _tab = 'Overview';
  bool _payLoading = false;

  static const _tabs = ['Overview', 'History', 'Transactions'];

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() { _loading = true; _error = ''; });
    try {
      final service = Get.find<UserSettingsService>();
      final res = await service.getMySubscriptions();
      if (res != null && res['success'] == true) {
        setState(() { _data = res['data']; });
      } else {
        setState(() { _error = res?['message'] ?? 'Failed to load'; });
      }
    } catch (_) {
      setState(() { _error = 'Failed to load subscription data'; });
    } finally {
      setState(() { _loading = false; });
    }
  }

  // ─── Payment launchers ────────────────────────────────────────────────────
  Future<void> _launchStripe(String planType) async {
    setState(() => _payLoading = true);
    try {
      final service = Get.find<UserSettingsService>();
      final res = await service.createPaymentSession({
        'planType': planType,
        'paymentMethod': 'stripe',
      });
      if (res != null && res['success'] == true && res['url'] != null) {
        // TODO: launch url via url_launcher
        Get.snackbar('Redirect', 'Opening payment page…', snackPosition: SnackPosition.BOTTOM);
      } else {
        Get.snackbar('Error', res?['error'] ?? 'Failed to start payment', snackPosition: SnackPosition.BOTTOM);
      }
    } catch (_) {
      Get.snackbar('Error', 'Payment failed', snackPosition: SnackPosition.BOTTOM);
    } finally {
      setState(() => _payLoading = false);
    }
  }

  void _launchGPay(String planType) {
    // TODO: integrate google_pay or pay package
    Get.snackbar('Google Pay', 'Processing $planType plan payment…', snackPosition: SnackPosition.BOTTOM);
  }

  void _launchApplePay(String planType) {
    // TODO: integrate apple_pay via pay package
    Get.snackbar('Apple Pay', 'Processing $planType plan payment…', snackPosition: SnackPosition.BOTTOM);
  }

  void _showPaymentSheet(String planType, String amount) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _PaymentSheet(
        planType: planType,
        amount: amount,
        onStripe: () { Get.back(); _launchStripe(planType); },
        onGPay: () { Get.back(); _launchGPay(planType); },
        onApplePay: () { Get.back(); _launchApplePay(planType); },
        loading: _payLoading,
      ),
    );
  }

  // ─── Restore ──────────────────────────────────────────────────────────────
  Future<void> _restorePurchases() async {
    Get.snackbar('Restoring…', 'Checking previous purchases', snackPosition: SnackPosition.BOTTOM);
    try {
      final service = Get.find<UserSettingsService>();
      final res = await service.restorePurchases({'userId': null});
      if (res != null && res['success'] == true) {
        Get.snackbar('Restored!', 'Your subscription has been restored', snackPosition: SnackPosition.BOTTOM);
        _fetch();
      } else {
        Get.snackbar('Not Found', res?['message'] ?? 'No purchases to restore', snackPosition: SnackPosition.BOTTOM);
      }
    } catch (_) {
      Get.snackbar('Error', 'Failed to restore purchases', snackPosition: SnackPosition.BOTTOM);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF0F5F3),
      body: Column(
        children: [
          SubPageHeader(
            title: 'Subscription',
            onBack: () => Get.back(),
            trailing: GestureDetector(
              onTap: _fetch,
              child: Container(
                width: 36, height: 36,
                decoration: BoxDecoration(color: Color(0xFFF0F5F3), shape: BoxShape.circle),
                child: Icon(Icons.refresh_rounded, size: 18, color: Color(0xFF1B4D3E)),
              ),
            ),
          ),

          Expanded(
            child: _loading
                ? Center(child: CircularProgressIndicator(strokeWidth: 2.5, color: Color(0xFF1B4D3E)))
                : _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_error.isNotEmpty) {
      return Center(child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 40, color: Color(0xFFEF4444)),
          SizedBox(height: 12),
          Text(_error, style: TextStyle(color: Color(0xFF9CA3AF))),
          SizedBox(height: 16),
          GestureDetector(onTap: _fetch, child: Text('Retry', style: TextStyle(color: Color(0xFF1B4D3E), fontWeight: FontWeight.w600))),
        ],
      ));
    }

    final activeSub = (_data?['subscriptions'] as List?)
        ?.cast<Map>()
        .firstWhereOrNull((s) => s['status'] == 'active');
    final pastSubs = (_data?['subscriptions'] as List?)
        ?.cast<Map<String, dynamic>>()
        .where((s) => s['status'] != 'active')
        .toList() ?? [];
    final transactions = (_data?['transactions'] as List?)
        ?.cast<Map<String, dynamic>>() ?? [];
    final user = _data?['user'] as Map?;

    return SingleChildScrollView(
      padding: EdgeInsets.only(top: 20, bottom: 48),
      child: Column(
        children: [
          // Active subscription card
          activeSub != null
              ? _ActiveSubCard(sub: activeSub, user: user)
              : _EmptySubCard(onUpgrade: () => _showPaymentSheet('monthly', '\$9.99')),

          // Quick stats
          if (_data != null)
            _StatsRow(user: user, activeSub: activeSub, txCount: transactions.length),

          // Tabs
          Container(
            margin: EdgeInsets.fromLTRB(16, 0, 16, 16),
            padding: EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 6)],
            ),
            child: Row(
              children: _tabs.map((t) => Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _tab = t),
                  child: AnimatedContainer(
                    duration: Duration(milliseconds: 200),
                    padding: EdgeInsets.symmetric(vertical: 9),
                    decoration: BoxDecoration(
                      color: _tab == t ? Color(0xFF1B4D3E) : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(child: Text(t,
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700,
                            color: _tab == t ? Colors.white : Color(0xFF9CA3AF)))),
                  ),
                ),
              )).toList(),
            ),
          ),

          // Tab content
          AnimatedSwitcher(
            duration: Duration(milliseconds: 200),
            child: _tab == 'Overview'
                ? _OverviewTab(activeSub: activeSub, onUpgrade: () => _showPaymentSheet('monthly', '\$9.99'))
                : _tab == 'History'
                    ? _HistoryTab(activeSub: activeSub, pastSubs: pastSubs)
                    : _TransactionsTab(transactions: transactions),
          ),

          // Restore purchases button
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: GestureDetector(
              onTap: _restorePurchases,
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.12)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.restore, size: 16, color: Color(0xFF1B4D3E)),
                    SizedBox(width: 8),
                    Text('Restore Purchases',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1B4D3E))),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Payment Sheet ────────────────────────────────────────────────────────────
class _PaymentSheet extends StatelessWidget {
  final String planType, amount;
  final VoidCallback onStripe, onGPay, onApplePay;
  final bool loading;

  const _PaymentSheet({
    required this.planType, required this.amount,
    required this.onStripe, required this.onGPay, required this.onApplePay,
    required this.loading,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
      ),
      padding: EdgeInsets.fromLTRB(24, 8, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            margin: EdgeInsets.only(top: 12, bottom: 20),
            width: 40, height: 4,
            decoration: BoxDecoration(color: Color(0xFFE5E7EB), borderRadius: BorderRadius.circular(2)),
          ),

          Text('Choose Payment Method',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF1B4D3E))),
          SizedBox(height: 6),
          Text('${planType[0].toUpperCase()}${planType.substring(1)} Plan · $amount',
              style: TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
          SizedBox(height: 24),

          // Google Pay
          _PayBtn(
            onTap: onGPay,
            color: Color(0xFF1A1A1A),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _GPayLogo(),
                SizedBox(width: 10),
                Text('Pay with Google Pay', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
              ],
            ),
          ),
          SizedBox(height: 10),

          // Apple Pay
          _PayBtn(
            onTap: onApplePay,
            color: Color(0xFF1A1A1A),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.apple, color: Colors.white, size: 22),
                SizedBox(width: 8),
                Text('Pay with Apple Pay', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
              ],
            ),
          ),
          SizedBox(height: 10),

          // Divider
          Row(children: [
            Expanded(child: Container(height: 1, color: Color(0xFFE5E7EB))),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 12),
              child: Text('or pay with card', style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
            ),
            Expanded(child: Container(height: 1, color: Color(0xFFE5E7EB))),
          ]),
          SizedBox(height: 10),

          // Stripe
          _PayBtn(
            onTap: onStripe,
            color: Color(0xFF1B4D3E),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.credit_card, color: Colors.white, size: 18),
                SizedBox(width: 8),
                Text('Credit / Debit Card', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
              ],
            ),
          ),
          SizedBox(height: 16),

          // Security note
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.lock_outline, size: 13, color: Color(0xFF9CA3AF)),
              SizedBox(width: 4),
              Text('Secured with 256-bit SSL encryption',
                  style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
            ],
          ),
        ],
      ),
    );
  }
}

class _PayBtn extends StatelessWidget {
  final VoidCallback onTap;
  final Color color;
  final Widget child;
  const _PayBtn({required this.onTap, required this.color, required this.child});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: double.infinity, height: 52,
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(16)),
      child: Center(child: child),
    ),
  );
}

class _GPayLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
    width: 26, height: 18,
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4)),
    child: Center(child: Text('G', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF4285F4)))),
  );
}

// ─── Active Subscription Card ─────────────────────────────────────────────────
class _ActiveSubCard extends StatelessWidget {
  final Map sub;
  final Map? user;
  const _ActiveSubCard({required this.sub, this.user});

  String _fmt(dynamic d) {
    if (d == null) return '—';
    try { return '${DateTime.parse(d.toString()).day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][DateTime.parse(d.toString()).month - 1]} ${DateTime.parse(d.toString()).year}'; }
    catch (_) { return '—'; }
  }

  int get _daysLeft {
    try { return math.max(0, DateTime.parse(sub['current_period_end'].toString()).difference(DateTime.now()).inDays); }
    catch (_) { return 0; }
  }

  bool get _expiringSoon => _daysLeft <= 7;

  @override
  Widget build(BuildContext context) {
    final planType = sub['plan_type']?.toString() ?? 'monthly';
    final credits = sub['credits_amount'] ?? 0;
    final userCredits = user?['credits'] ?? 0;
    final credPct = credits > 0 ? ((userCredits / credits) * 100).clamp(0.0, 100.0) : 0.0;

    return Container(
      margin: EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1B4D3E), Color(0xFF2d7a62)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.35), blurRadius: 32, offset: Offset(0, 8))],
      ),
      child: Stack(
        children: [
          Positioned(top: -20, right: -20, child: Container(width: 120, height: 120,
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), shape: BoxShape.circle))),
          Positioned(top: 10, right: 30, child: Container(width: 60, height: 60,
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), shape: BoxShape.circle))),
          Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                      child: Icon(Icons.workspace_premium, color: Color(0xFFFCD34D), size: 16),
                    ),
                    SizedBox(width: 8),
                    Text(planType.toUpperCase(),
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.7), letterSpacing: 0.1)),
                    Spacer(),
                    _SubStatusBadge(status: sub['status']?.toString() ?? 'active'),
                  ],
                ),
                SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text('${planType[0].toUpperCase()}${planType.substring(1)}',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
                ),
                Text('$credits credits included',
                    style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.6))),
                SizedBox(height: 16),

                // Credits bar
                Row(
                  children: [
                    Text('Credits remaining', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6))),
                    Spacer(),
                    Text('${userCredits.toString()}', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                  ],
                ),
                SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(99),
                  child: LinearProgressIndicator(
                    value: credPct / 100,
                    minHeight: 6,
                    backgroundColor: Colors.white.withOpacity(0.15),
                    valueColor: AlwaysStoppedAnimation(Color(0xFF4ADE80)),
                  ),
                ),
                SizedBox(height: 20),

                Row(
                  children: [
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('STARTED', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.5), letterSpacing: 0.08)),
                          SizedBox(height: 3),
                          Text(_fmt(sub['current_period_start']), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.8))),
                        ])),
                    Container(width: 1, height: 28, color: Colors.white.withOpacity(0.15)),
                    Expanded(child: Column(children: [
                      Text('DAYS LEFT', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.5), letterSpacing: 0.08)),
                      SizedBox(height: 3),
                      Text('$_daysLeft', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800,
                          color: _expiringSoon ? Color(0xFFFCD34D) : Colors.white)),
                    ])),
                    Container(width: 1, height: 28, color: Colors.white.withOpacity(0.15)),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('RENEWS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.5), letterSpacing: 0.08)),
                          SizedBox(height: 3),
                          Text(_fmt(sub['current_period_end']), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.8))),
                        ])),
                  ],
                ),

                if (_expiringSoon) ...[
                  SizedBox(height: 14),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Color(0xFFFBBF24).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Color(0xFFFBBF24).withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, size: 14, color: Color(0xFFFCD34D)),
                        SizedBox(width: 8),
                        Expanded(child: Text('Expiring soon — renew to keep your Pro access',
                            style: TextStyle(fontSize: 11, color: Color(0xFFE9D5A0), fontWeight: FontWeight.w500))),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SubStatusBadge extends StatelessWidget {
  final String status;
  const _SubStatusBadge({required this.status});

  Color get _color => status == 'active' ? Color(0xFF22C55E) : status == 'canceled' ? Color(0xFFEF4444) : Color(0xFF9CA3AF);
  Color get _bg => status == 'active' ? Color(0xFFF0FDF4) : status == 'canceled' ? Color(0xFFFFF1F2) : Color(0xFFF9FAFB);
  String get _label => status == 'active' ? 'Active' : status == 'canceled' ? 'Canceled' : 'Inactive';

  @override
  Widget build(BuildContext context) => Container(
    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(color: _bg, borderRadius: BorderRadius.circular(8)),
    child: Row(mainAxisSize: MainAxisSize.min, children: [
      Container(width: 6, height: 6, decoration: BoxDecoration(color: _color, shape: BoxShape.circle)),
      SizedBox(width: 4),
      Text(_label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _color)),
    ]),
  );
}

class _EmptySubCard extends StatelessWidget {
  final VoidCallback onUpgrade;
  const _EmptySubCard({required this.onUpgrade});

  @override
  Widget build(BuildContext context) => Container(
    margin: EdgeInsets.fromLTRB(16, 0, 16, 16),
    padding: EdgeInsets.all(24),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.15), width: 2, style: BorderStyle.solid),
      boxShadow: [BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 12)],
    ),
    child: Column(children: [
      Container(width: 56, height: 56,
          decoration: BoxDecoration(color: Color(0xFFF0F5F3), borderRadius: BorderRadius.circular(16)),
          child: Icon(Icons.workspace_premium_outlined, color: Color(0xFF1B4D3E), size: 24)),
      SizedBox(height: 12),
      Text('No Active Subscription', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF1A1A1A))),
      SizedBox(height: 6),
      Text('Upgrade to Pro to unlock premium features', style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
      SizedBox(height: 18),
      GestureDetector(
        onTap: onUpgrade,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 24, vertical: 10),
          decoration: BoxDecoration(color: Color(0xFF1B4D3E), borderRadius: BorderRadius.circular(14)),
          child: Text('Upgrade to Pro', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
        ),
      ),
    ]),
  );
}

class _StatsRow extends StatelessWidget {
  final Map? user, activeSub;
  final int txCount;
  const _StatsRow({this.user, this.activeSub, required this.txCount});

  @override
  Widget build(BuildContext context) {
    final items = [
      {'label': 'Credits', 'value': '${user?['credits'] ?? 0}', 'icon': Icons.bolt, 'color': Color(0xFF3B82F6)},
      {'label': 'Plan', 'value': activeSub?['plan_type']?.toString() ?? 'Free', 'icon': Icons.workspace_premium, 'color': Color(0xFFF59E0B)},
      {'label': 'Transactions', 'value': '$txCount', 'icon': Icons.receipt_outlined, 'color': Color(0xFF8B5CF6)},
    ];
    return Container(
      margin: EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Row(
        children: items.map((item) => Expanded(
          child: Container(
            margin: EdgeInsets.only(right: items.indexOf(item) < 2 ? 8 : 0),
            padding: EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 6)],
            ),
            child: Column(children: [
              Container(width: 28, height: 28,
                  decoration: BoxDecoration(color: (item['color'] as Color).withOpacity(0.1), borderRadius: BorderRadius.circular(9)),
                  child: Icon(item['icon'] as IconData, size: 14, color: item['color'] as Color)),
              SizedBox(height: 8),
              Text(item['value']!.toString(), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF1A1A1A))),
              SizedBox(height: 2),
              Text(item['label']!.toString(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Color(0xFF9CA3AF))),
            ]),
          ),
        )).toList(),
      ),
    );
  }
}

// ─── Tab content ──────────────────────────────────────────────────────────────
class _OverviewTab extends StatelessWidget {
  final Map? activeSub;
  final VoidCallback onUpgrade;
  const _OverviewTab({this.activeSub, required this.onUpgrade});

  @override
  Widget build(BuildContext context) {
    final features = [
      {'label': 'See Who Likes You', 'desc': 'See everyone who has liked your profile'},
      {'label': 'Priority Matching', 'desc': 'Get shown to more compatible profiles'},
      {'label': 'Contact Reveals', 'desc': 'Reveal contact details with credit cost'},
      {'label': 'Show Last Seen', 'desc': 'Control your visibility to others'},
      {'label': 'Credits Included', 'desc': '${activeSub?['credits_amount'] ?? 0} credits per cycle'},
    ];
    return Container(
      margin: EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 8)],
        border: Border.all(color: Color(0xFF1B4D3E).withOpacity(0.07)),
      ),
      child: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(16),
            child: Row(children: [
              Container(width: 24, height: 24,
                  decoration: BoxDecoration(color: Color(0xFFF0F5F3), borderRadius: BorderRadius.circular(8)),
                  child: Icon(Icons.auto_awesome, size: 14, color: Color(0xFFF59E0B))),
              SizedBox(width: 8),
              Text('PRO FEATURES', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF9CA3AF), letterSpacing: 0.08)),
            ]),
          ),
          Divider(height: 1, color: Color(0xFF1B4D3E).withOpacity(0.07)),
          Padding(
            padding: EdgeInsets.fromLTRB(16, 4, 16, 16),
            child: Column(
              children: features.map((f) {
                final active = activeSub != null;
                return Container(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.06)))),
                  child: Row(
                    children: [
                      Container(width: 20, height: 20,
                          decoration: BoxDecoration(color: active ? Color(0xFFF0FDF4) : Color(0xFFF9FAFB), shape: BoxShape.circle),
                          child: Icon(active ? Icons.check_circle : Icons.cancel,
                              size: 16, color: active ? Color(0xFF22C55E) : Color(0xFFD1D5DB))),
                      SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(f['label']!, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
                            color: active ? Color(0xFF1A1A1A) : Color(0xFF9CA3AF))),
                        Text(f['desc']!, style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                      ])),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _HistoryTab extends StatelessWidget {
  final Map? activeSub;
  final List<Map<String, dynamic>> pastSubs;
  const _HistoryTab({this.activeSub, required this.pastSubs});

  String _fmt(dynamic d) {
    if (d == null) return '—';
    try { return '${DateTime.parse(d.toString()).day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][DateTime.parse(d.toString()).month - 1]} ${DateTime.parse(d.toString()).year}'; }
    catch (_) { return '—'; }
  }

  @override
  Widget build(BuildContext context) {
    final all = [if (activeSub != null) Map<String, dynamic>.from(activeSub!), ...pastSubs];
    return Container(
      margin: EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 8)],
      ),
      child: all.isEmpty
          ? Padding(padding: EdgeInsets.all(40), child: Center(child: Text('No subscription history', style: TextStyle(color: Color(0xFF9CA3AF)))))
          : Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Column(children: all.asMap().entries.map((e) {
                final s = e.value;
                final planType = s['plan_type']?.toString() ?? 'monthly';
                return Container(
                  padding: EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.06)))),
                  child: Row(children: [
                    Container(width: 36, height: 36,
                        decoration: BoxDecoration(color: Color(0xFFF0F5F3), borderRadius: BorderRadius.circular(12)),
                        child: Icon(Icons.workspace_premium, size: 18, color: Color(0xFF1B4D3E))),
                    SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('${planType[0].toUpperCase()}${planType.substring(1)} Plan',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1A1A1A))),
                      Text('${_fmt(s['current_period_start'])} → ${_fmt(s['current_period_end'])}',
                          style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                    ])),
                    Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                      _SubStatusBadge(status: s['status']?.toString() ?? 'active'),
                      SizedBox(height: 3),
                      Text('${s['credits_amount'] ?? 0} credits', style: TextStyle(fontSize: 10, color: Color(0xFF9CA3AF))),
                    ]),
                  ]),
                );
              }).toList()),
            ),
    );
  }
}

class _TransactionsTab extends StatelessWidget {
  final List<Map<String, dynamic>> transactions;
  const _TransactionsTab({required this.transactions});

  String _fmtAmt(dynamic amt, dynamic cur) {
    try { return '\$${(amt as num).toStringAsFixed(2)}'; } catch (_) { return '\$0.00'; }
  }

  String _fmtDate(dynamic d) {
    if (d == null) return '—';
    try { final dt = DateTime.parse(d.toString()); return '${dt.day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.month - 1]} ${dt.year}'; }
    catch (_) { return '—'; }
  }

  @override
  Widget build(BuildContext context) => Container(
    margin: EdgeInsets.fromLTRB(16, 0, 16, 16),
    decoration: BoxDecoration(
      color: Colors.white, borderRadius: BorderRadius.circular(20),
      boxShadow: [BoxShadow(color: Color(0xFF1B4D3E).withOpacity(0.06), blurRadius: 8)],
    ),
    child: transactions.isEmpty
        ? Padding(padding: EdgeInsets.all(40), child: Center(child: Text('No transactions yet', style: TextStyle(color: Color(0xFF9CA3AF)))))
        : Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: Column(children: transactions.map((tx) {
              final ok = tx['status'] == 'succeeded';
              return Container(
                padding: EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFF1B4D3E).withOpacity(0.06)))),
                child: Row(children: [
                  Container(width: 36, height: 36,
                      decoration: BoxDecoration(color: ok ? Color(0xFFF0FDF4) : Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(12)),
                      child: Icon(Icons.receipt_outlined, size: 16, color: ok ? Color(0xFF22C55E) : Color(0xFFEF4444))),
                  SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(tx['description']?.toString() ?? 'Subscription payment',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1A1A1A)),
                        overflow: TextOverflow.ellipsis),
                    Text('${_fmtDate(tx['created_at'])} · +${tx['credits_added'] ?? 0} credits',
                        style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                  ])),
                  Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text(_fmtAmt(tx['amount'], tx['currency']),
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700,
                            color: ok ? Color(0xFF15803D) : Color(0xFFEF4444))),
                    SizedBox(height: 3),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: ok ? Color(0xFFF0FDF4) : Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(6)),
                      child: Text(ok ? 'Paid' : 'Failed',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700,
                              color: ok ? Color(0xFF22C55E) : Color(0xFFEF4444))),
                    ),
                  ]),
                ]),
              );
            }).toList()),
          ),
  );
}
