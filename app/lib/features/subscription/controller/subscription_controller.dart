import 'dart:io';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/theme/constants.dart';
import 'package:app/features/auth/services/auth_service.dart';
import 'package:app/features/userprofile/services/user_profile_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SettingsController extends GetxController {
  // Subscription state
  final RxBool isPremium = false.obs;
  final RxBool isLoadingSubscription = false.obs;
  final RxList<Package> availablePackages = <Package>[].obs;
  final RxString currentPlanLabel = 'Free'.obs;

  /// Returns the number of credits assigned based on the package type.
  int getCreditsForPackage(Package package) {
    switch (package.packageType) {
      case PackageType.weekly:
        return 800;
      case PackageType.monthly:
        return 3000;
      case PackageType.annual:
        return 6000;
      default:
        return 0;
    }
  }

  // Settings
  final RxString apiKey = ''.obs;
  final RxBool notificationsEnabled = true.obs;
  final RxBool hapticEnabled = true.obs;
  final RxString appVersion = '1.0.0'.obs;

  // Supabase client shortcut
  final _db = Supabase.instance.client;

  @override
  void onInit() {
    super.onInit();
    _initRevenueCat();
    _checkSubscriptionStatus();
  }

  // ─────────────────────────────────────────────────────────
  // REVENUECAT INIT
  // ─────────────────────────────────────────────────────────

  Future<void> _initRevenueCat() async {
    try {
      final AuthService _authService = Get.find<AuthService>();

      final key = Platform.isIOS
          ? AppConstants.revenueCatApiKeyIOS
          : AppConstants.revenueCatApiKeyAndroid;

      await Purchases.configure(PurchasesConfiguration(key));

      // Tie RevenueCat customer to Supabase user so receipts are linked

      final userId = await _authService.userId;
      if (userId != null) {
        await Purchases.logIn(userId.toString());
      }

      await _loadOfferings();
    } catch (e) {
      print('RevenueCat init error: $e');
    }
  }

  // ─────────────────────────────────────────────────────────
  // OFFERINGS
  // ─────────────────────────────────────────────────────────

  Future<void> _loadOfferings() async {
    try {
      isLoadingSubscription.value = true;

      final offerings = await Purchases.getOfferings();

      final all = <Package>[];
      final seen = <String>{};

      offerings.all.forEach((_, offering) {
        for (final pkg in offering.availablePackages) {
          final id = pkg.storeProduct.identifier;
          if (seen.add(id)) all.add(pkg);
        }
      });

      const order = [
        PackageType.weekly,
        PackageType.monthly,
        PackageType.annual,
        PackageType.lifetime,
        PackageType.custom,
      ];
      all.sort((a, b) {
        final ai = order.indexOf(a.packageType);
        final bi = order.indexOf(b.packageType);
        return (ai < 0 ? 999 : ai).compareTo(bi < 0 ? 999 : bi);
      });

      availablePackages.value = all;

      print('📦 ${all.length} packages loaded:');
      for (final p in all) {
        print('  • ${p.packageType.name} — '
            '${p.storeProduct.identifier} — '
            '${p.storeProduct.priceString}');
      }
    } catch (e) {
      print('Load offerings error: $e');
    } finally {
      isLoadingSubscription.value = false;
    }
  }

  // ─────────────────────────────────────────────────────────
  // CHECK STATUS ON APP OPEN
  // ─────────────────────────────────────────────────────────

  Future<void> _checkSubscriptionStatus() async {
    try {
      final info = await Purchases.getCustomerInfo();
      _updateSubscriptionStatus(info);
    } catch (e) {
      print('Subscription check error: $e');
    }
  }

  // ─────────────────────────────────────────────────────────
  // PURCHASE
  // ─────────────────────────────────────────────────────────

  Future<bool> purchasePackage(Package package) async {
    try {
      isLoadingSubscription.value = true;

      final result = await Purchases.purchasePackage(package);
      final info = result.customerInfo;

      _updateSubscriptionStatus(info);

      if (isPremium.value) {
        // ── Sync to Supabase ──────────────────────────────
        await _syncToSupabase(info, package);

        Get.snackbar(
          '🎉 Welcome to Premium!',
          'You now have unlimited video generation',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppTheme.primary.withOpacity(0.9),
          colorText: Colors.white,
          duration: const Duration(seconds: 4),
        );
      }

      return isPremium.value;
    } catch (e) {
      print('Purchase error: $e');
      return false;
    } finally {
      isLoadingSubscription.value = false;
    }
  }

  // ─────────────────────────────────────────────────────────
  // RESTORE
  // ─────────────────────────────────────────────────────────

  Future<void> restorePurchases() async {
    try {
      isLoadingSubscription.value = true;

      final info = await Purchases.restorePurchases();
      _updateSubscriptionStatus(info);

      if (isPremium.value) {
        await _syncToSupabase(info, null);
        Get.snackbar('Purchases Restored', 'Premium plan re-activated',
            snackPosition: SnackPosition.BOTTOM);
      } else {
        Get.snackbar(
            'No Purchases Found', 'No active subscription found to restore',
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      Get.snackbar('Error', 'Could not restore purchases',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoadingSubscription.value = false;
    }
  }

  // ─────────────────────────────────────────────────────────
  // SUPABASE SYNC  ← new
  // Updates: subscription_status, subscription_plan,
  //          subscription_expiry, rc_customer_id
  // ─────────────────────────────────────────────────────────

  Future<void> _syncToSupabase(CustomerInfo info, Package? package) async {
    try {
      final AuthService _authService = Get.find<AuthService>();

      final userId = await _authService.userId;
      if (userId == null) {
        print('⚠️ Supabase sync skipped — no logged-in user');
        return;
      }

      final entitlement =
          info.entitlements.active[AppConstants.premiumEntitlement];

      // Expiry date from the entitlement (null = lifetime / non-expiring)
      final expiry = entitlement?.expirationDate;

      // Plan label derived the same way as currentPlanLabel
      final plan = currentPlanLabel.value
          .toLowerCase(); // "weekly" / "monthly" / "annual"

      // Fetch previous credits from Supabase first
      int previousCredits = 0;
      try {
        final response =
            await _db.from('users').select('credits').eq('id', userId).single();
        if (response != null && response['credits'] is int) {
          previousCredits = response['credits'];
        }
      } catch (e) {
        print('⚠️ Could not fetch previous credits from Supabase: $e');
      }

      final int credits = (package != null)
          ? previousCredits + getCreditsForPackage(package)
          : previousCredits;

      final payload = {
        'subscription_status': isPremium.value ? 'active' : 'free',
        'subscription_plan': isPremium.value ? plan : null,
        'subscription_expiry': expiry,
        'rc_customer_id': info.originalAppUserId, // RevenueCat customer ID
        'credits': credits
      };

      await _db.from('users').update(payload).eq('id', userId);
    } catch (e) {
      // Non-fatal — purchase already succeeded, just log
      print('❌ Supabase sync error: $e');
    }
  }

  // ─────────────────────────────────────────────────────────
  // LOCAL STATUS UPDATE
  // ─────────────────────────────────────────────────────────

  void _updateSubscriptionStatus(CustomerInfo info) {
    final entitlement =
        info.entitlements.active[AppConstants.premiumEntitlement];
    isPremium.value = entitlement != null && entitlement.isActive;

    if (isPremium.value) {
      final productId = entitlement?.productIdentifier ?? '';
      if (productId.contains('annual') || productId.contains('yearly')) {
        currentPlanLabel.value = 'Annual';
      } else if (productId.contains('weekly')) {
        currentPlanLabel.value = 'Weekly';
      } else {
        currentPlanLabel.value = 'Monthly';
      }
    } else {
      currentPlanLabel.value = 'Free';
    }
  }

  // ─────────────────────────────────────────────────────────
  // MISC
  // ─────────────────────────────────────────────────────────

  void saveApiKey(String key) {
    apiKey.value = key;
    Get.snackbar('API Key Saved', 'kie.ai API key updated',
        snackPosition: SnackPosition.BOTTOM);
  }

  void toggleNotifications() =>
      notificationsEnabled.value = !notificationsEnabled.value;
  void toggleHaptic() => hapticEnabled.value = !hapticEnabled.value;
}
