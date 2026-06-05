import 'package:get/get.dart';
import '../providers/api_client.dart';
import '../models/settings_model.dart';

class SettingsService extends GetxService {
  final ApiClient _apiClient = Get.find<ApiClient>();
  
  final Rx<SettingsModel?> settings = Rx<SettingsModel?>(null);
  final RxBool isLoaded = false.obs;
  
  Future<SettingsService> init() async {
    try {
      final data = await _apiClient.get('/settings');
      
      if (data != null && data['success'] == true && data['data'] != null) {
        settings.value = SettingsModel.fromJson(data['data']);
        isLoaded.value = true;
        print('✅ Settings loaded');
      }
    } catch (e) {
      print('❌ Settings load error: $e');
      // Set defaults
      settings.value = SettingsModel.defaults();
      isLoaded.value = true;
    }
    
    return this;
  }
  
  // Site Information
  String get siteName => settings.value?.siteName ?? 'Marriage Sunnah Overseas';
  String get siteTagline => settings.value?.siteTagline ?? '';
  String? get siteLogo => settings.value?.siteLogo;
  bool get maintenanceMode => settings.value?.maintenanceMode ?? false;
  String get maintenanceMessage => settings.value?.maintenanceMessage ?? '';
  
  // Social Media
  String? get instagramUrl => settings.value?.instagramUrl;
  String? get facebookUrl => settings.value?.facebookUrl;
  String? get twitterUrl => settings.value?.twitterUrl;
  String? get linkedinUrl => settings.value?.linkedinUrl;
  String? get youtubeUrl => settings.value?.youtubeUrl;
  
  // Contact
  String get supportEmail => settings.value?.supportEmail ?? '';
  String get supportPhone => settings.value?.supportPhone ?? '';
  String get supportWhatsapp => settings.value?.supportWhatsapp ?? '';
  String? get officeAddress => settings.value?.officeAddress;
  
  // Legal
  String? get privacyPolicyUrl => settings.value?.privacyPolicyUrl;
  String? get termsOfServiceUrl => settings.value?.termsOfServiceUrl;
  String? get cookiePolicyUrl => settings.value?.cookiePolicyUrl;
  
  // Signup Settings
  bool get userVerificationRequired => settings.value?.userVerificationRequired ?? false;
  bool get guardianVerificationRequired => settings.value?.guardianVerificationRequired ?? false;
  bool get guardianLinkingRequired => settings.value?.guardianLinkingRequired ?? false;
  bool get allowSkipAfterSubmit => settings.value?.allowSkipAfterSubmit ?? true;
  bool get manualProfileApproval => settings.value?.manualProfileApproval ?? false;
  
  // Costs
  int get costSendInterest => settings.value?.costSendInterest ?? 5;
  int get costSendMessage => settings.value?.costSendMessage ?? 2;
  int get costUnlockPhone => settings.value?.costUnlockPhone ?? 10;
  int get costUnlockEmail => settings.value?.costUnlockEmail ?? 8;
  int get costUnlockBundle => settings.value?.costUnlockBundle ?? 15;
  int get costViewProfile => settings.value?.costViewProfile ?? 3;
  int get costBoostProfile => settings.value?.costBoostProfile ?? 50;
  int get costSuperLike => settings.value?.costSuperLike ?? 10;
  int get costUploadImage => settings.value?.costUploadImage ?? 5;
  int get costUploadVideo => settings.value?.costUploadVideo ?? 50;
  
  // Credits
  int get freeCreditsSignup => settings.value?.freeCreditsSignup ?? 10;
  int get freeCreditsVerification => settings.value?.freeCreditsVerification ?? 5;
  int get referralCreditsReferrer => settings.value?.referralCreditsReferrer ?? 20;
  int get referralCreditsReferee => settings.value?.referralCreditsReferee ?? 10;
  
  // Free Limits
  int get freeDailyInterests => settings.value?.freeDailyInterests ?? 5;
  int get freeDailyMessages => settings.value?.freeDailyMessages ?? 10;
  int get freeProfileViews => settings.value?.freeProfileViews ?? 20;
  
  // Premium Limits
  int get premiumDailyInterests => settings.value?.premiumDailyInterests ?? 50;
  int get premiumDailyMessages => settings.value?.premiumDailyMessages ?? 100;
  int get premiumProfileViews => settings.value?.premiumProfileViews ?? -1;
  
  // Guardian
  bool get guardianEnabled => settings.value?.guardianEnabled ?? true;
  bool get guardianApprovalRequired => settings.value?.guardianApprovalRequired ?? false;
  bool get guardianCanBrowse => settings.value?.guardianCanBrowse ?? true;
  bool get guardianCanSendInterests => settings.value?.guardianCanSendInterests ?? true;
  int get maxGuardiansPerUser => settings.value?.maxGuardiansPerUser ?? 2;
  int get guardianAutoApproveHours => settings.value?.guardianAutoApproveHours ?? 72;
  
  // Plans
  PlanInfo get basicPlan => PlanInfo(
    enabled: settings.value?.basicPlanEnabled ?? true,
    name: settings.value?.basicPlanName ?? 'Basic',
    credits: settings.value?.basicPlanCredits ?? 50,
    days: settings.value?.basicPlanDays ?? 7,
    priceUsd: settings.value?.basicPlanPriceUsd ?? 4.99,
    pricePkr: settings.value?.basicPlanPricePkr ?? 1400,
    priceAed: settings.value?.basicPlanPriceAed ?? 18,
    popular: settings.value?.basicPlanPopular ?? false,
  );
  
  PlanInfo get premiumPlan => PlanInfo(
    enabled: settings.value?.premiumPlanEnabled ?? true,
    name: settings.value?.premiumPlanName ?? 'Premium',
    credits: settings.value?.premiumPlanCredits ?? 250,
    days: settings.value?.premiumPlanDays ?? 30,
    priceUsd: settings.value?.premiumPlanPriceUsd ?? 12.99,
    pricePkr: settings.value?.premiumPlanPricePkr ?? 3600,
    priceAed: settings.value?.premiumPlanPriceAed ?? 48,
    popular: settings.value?.premiumPlanPopular ?? true,
  );
  
  PlanInfo get platinumPlan => PlanInfo(
    enabled: settings.value?.platinumPlanEnabled ?? true,
    name: settings.value?.platinumPlanName ?? 'Platinum',
    credits: settings.value?.platinumPlanCredits ?? 3500,
    days: settings.value?.platinumPlanDays ?? 365,
    priceUsd: settings.value?.platinumPlanPriceUsd ?? 71.88,
    pricePkr: settings.value?.platinumPlanPricePkr ?? 20000,
    priceAed: settings.value?.platinumPlanPriceAed ?? 264,
    popular: settings.value?.platinumPlanPopular ?? false,
  );
  
  List<PlanInfo> get activePlans {
    final plans = <PlanInfo>[];
    if (basicPlan.enabled) plans.add(basicPlan);
    if (premiumPlan.enabled) plans.add(premiumPlan);
    if (platinumPlan.enabled) plans.add(platinumPlan);
    return plans;
  }
  
  // Features
  bool get chatEnabled => settings.value?.chatEnabled ?? true;
  bool get videoCallEnabled => settings.value?.videoCallEnabled ?? false;
  bool get voiceCallEnabled => settings.value?.voiceCallEnabled ?? false;
  bool get blogEnabled => settings.value?.blogEnabled ?? true;
  bool get eventsEnabled => settings.value?.eventsEnabled ?? false;
  bool get successStoriesEnabled => settings.value?.successStoriesEnabled ?? true;
  
  // Chat
  bool get chatRequiresMatch => settings.value?.chatRequiresMatch ?? true;
  int get maxMessageLength => settings.value?.maxMessageLength ?? 1000;
  bool get fileSharingEnabled => settings.value?.fileSharingEnabled ?? true;
  int get maxFileSizeMb => settings.value?.maxFileSizeMb ?? 5;
  
  // Subscription
  bool get autoRenewEnabled => settings.value?.autoRenewEnabled ?? true;
  int get trialPeriodDays => settings.value?.trialPeriodDays ?? 0;
  int get refundWithinDays => settings.value?.refundWithinDays ?? 7;
  
  // Payment
  bool get stripeEnabled => settings.value?.stripeEnabled ?? true;
  bool get jazzcashEnabled => settings.value?.jazzcashEnabled ?? false;
  bool get easypaisaEnabled => settings.value?.easypaisaEnabled ?? false;
  bool get paypalEnabled => settings.value?.paypalEnabled ?? false;
  
  // Referral
  int get referralCommissionPercentage => settings.value?.referralCommissionPercentage ?? 10;
  
  // Refresh settings
  Future<void> refresh() async {
    isLoaded.value = false;
    await init();
  }
}

class PlanInfo {
  final bool enabled;
  final String name;
  final int credits;
  final int days;
  final double priceUsd;
  final int pricePkr;
  final int priceAed;
  final bool popular;
  
  PlanInfo({
    required this.enabled,
    required this.name,
    required this.credits,
    required this.days,
    required this.priceUsd,
    required this.pricePkr,
    required this.priceAed,
    required this.popular,
  });
}
