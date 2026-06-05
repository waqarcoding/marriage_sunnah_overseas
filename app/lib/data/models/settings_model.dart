class SettingsModel {
  // Site Information
  final String siteName;
  final String siteTagline;
  final String? siteLogo;
  final bool maintenanceMode;
  final String maintenanceMessage;
  
  // Social Media
  final String? instagramUrl;
  final String? facebookUrl;
  final String? twitterUrl;
  final String? linkedinUrl;
  final String? youtubeUrl;
  
  // Contact
  final String supportEmail;
  final String supportPhone;
  final String supportWhatsapp;
  final String? officeAddress;
  
  // Legal
  final String? privacyPolicyUrl;
  final String? termsOfServiceUrl;
  final String? cookiePolicyUrl;
  
  // Signup Settings
  final bool userVerificationRequired;
  final bool guardianVerificationRequired;
  final bool guardianLinkingRequired;
  final bool allowSkipAfterSubmit;
  final bool manualProfileApproval;
  
  // Costs
  final int costSendInterest;
  final int costSendMessage;
  final int costUnlockPhone;
  final int costUnlockEmail;
  final int costUnlockBundle;
  final int costViewProfile;
  final int costBoostProfile;
  final int costSuperLike;
  final int costUploadImage;
  final int costUploadVideo;
  
  // Credits
  final int freeCreditsSignup;
  final int freeCreditsVerification;
  final int referralCreditsReferrer;
  final int referralCreditsReferee;
  
  // Free Limits
  final int freeDailyInterests;
  final int freeDailyMessages;
  final int freeProfileViews;
  
  // Premium Limits
  final int premiumDailyInterests;
  final int premiumDailyMessages;
  final int premiumProfileViews;
  
  // Guardian
  final bool guardianEnabled;
  final bool guardianApprovalRequired;
  final bool guardianCanBrowse;
  final bool guardianCanSendInterests;
  final int maxGuardiansPerUser;
  final int guardianAutoApproveHours;
  
  // Basic Plan
  final bool basicPlanEnabled;
  final String basicPlanName;
  final int basicPlanCredits;
  final int basicPlanDays;
  final double basicPlanPriceUsd;
  final int basicPlanPricePkr;
  final int basicPlanPriceAed;
  final bool basicPlanPopular;
  
  // Premium Plan
  final bool premiumPlanEnabled;
  final String premiumPlanName;
  final int premiumPlanCredits;
  final int premiumPlanDays;
  final double premiumPlanPriceUsd;
  final int premiumPlanPricePkr;
  final int premiumPlanPriceAed;
  final bool premiumPlanPopular;
  
  // Platinum Plan
  final bool platinumPlanEnabled;
  final String platinumPlanName;
  final int platinumPlanCredits;
  final int platinumPlanDays;
  final double platinumPlanPriceUsd;
  final int platinumPlanPricePkr;
  final int platinumPlanPriceAed;
  final bool platinumPlanPopular;
  
  // Features
  final bool chatEnabled;
  final bool videoCallEnabled;
  final bool voiceCallEnabled;
  final bool blogEnabled;
  final bool eventsEnabled;
  final bool successStoriesEnabled;
  
  // Chat
  final bool chatRequiresMatch;
  final int maxMessageLength;
  final bool fileSharingEnabled;
  final int maxFileSizeMb;
  
  // Subscription
  final bool autoRenewEnabled;
  final int trialPeriodDays;
  final int refundWithinDays;
  
  // Payment
  final bool stripeEnabled;
  final bool jazzcashEnabled;
  final bool easypaisaEnabled;
  final bool paypalEnabled;
  
  // Referral
  final int referralCommissionPercentage;
  
  SettingsModel({
    required this.siteName,
    required this.siteTagline,
    this.siteLogo,
    required this.maintenanceMode,
    required this.maintenanceMessage,
    this.instagramUrl,
    this.facebookUrl,
    this.twitterUrl,
    this.linkedinUrl,
    this.youtubeUrl,
    required this.supportEmail,
    required this.supportPhone,
    required this.supportWhatsapp,
    this.officeAddress,
    this.privacyPolicyUrl,
    this.termsOfServiceUrl,
    this.cookiePolicyUrl,
    required this.userVerificationRequired,
    required this.guardianVerificationRequired,
    required this.guardianLinkingRequired,
    required this.allowSkipAfterSubmit,
    required this.manualProfileApproval,
    required this.costSendInterest,
    required this.costSendMessage,
    required this.costUnlockPhone,
    required this.costUnlockEmail,
    required this.costUnlockBundle,
    required this.costViewProfile,
    required this.costBoostProfile,
    required this.costSuperLike,
    required this.costUploadImage,
    required this.costUploadVideo,
    required this.freeCreditsSignup,
    required this.freeCreditsVerification,
    required this.referralCreditsReferrer,
    required this.referralCreditsReferee,
    required this.freeDailyInterests,
    required this.freeDailyMessages,
    required this.freeProfileViews,
    required this.premiumDailyInterests,
    required this.premiumDailyMessages,
    required this.premiumProfileViews,
    required this.guardianEnabled,
    required this.guardianApprovalRequired,
    required this.guardianCanBrowse,
    required this.guardianCanSendInterests,
    required this.maxGuardiansPerUser,
    required this.guardianAutoApproveHours,
    required this.basicPlanEnabled,
    required this.basicPlanName,
    required this.basicPlanCredits,
    required this.basicPlanDays,
    required this.basicPlanPriceUsd,
    required this.basicPlanPricePkr,
    required this.basicPlanPriceAed,
    required this.basicPlanPopular,
    required this.premiumPlanEnabled,
    required this.premiumPlanName,
    required this.premiumPlanCredits,
    required this.premiumPlanDays,
    required this.premiumPlanPriceUsd,
    required this.premiumPlanPricePkr,
    required this.premiumPlanPriceAed,
    required this.premiumPlanPopular,
    required this.platinumPlanEnabled,
    required this.platinumPlanName,
    required this.platinumPlanCredits,
    required this.platinumPlanDays,
    required this.platinumPlanPriceUsd,
    required this.platinumPlanPricePkr,
    required this.platinumPlanPriceAed,
    required this.platinumPlanPopular,
    required this.chatEnabled,
    required this.videoCallEnabled,
    required this.voiceCallEnabled,
    required this.blogEnabled,
    required this.eventsEnabled,
    required this.successStoriesEnabled,
    required this.chatRequiresMatch,
    required this.maxMessageLength,
    required this.fileSharingEnabled,
    required this.maxFileSizeMb,
    required this.autoRenewEnabled,
    required this.trialPeriodDays,
    required this.refundWithinDays,
    required this.stripeEnabled,
    required this.jazzcashEnabled,
    required this.easypaisaEnabled,
    required this.paypalEnabled,
    required this.referralCommissionPercentage,
  });
  
  factory SettingsModel.fromJson(Map<String, dynamic> json) {
    return SettingsModel(
      siteName: json['site_name'] ?? 'Marriage Sunnah Overseas',
      siteTagline: json['site_tagline'] ?? '',
      siteLogo: json['site_logo_url'],
      maintenanceMode: json['maintenance_mode'] ?? false,
      maintenanceMessage: json['maintenance_message'] ?? '',
      instagramUrl: json['instagram_url'],
      facebookUrl: json['facebook_url'],
      twitterUrl: json['twitter_url'],
      linkedinUrl: json['linkedin_url'],
      youtubeUrl: json['youtube_url'],
      supportEmail: json['support_email'] ?? '',
      supportPhone: json['support_phone'] ?? '',
      supportWhatsapp: json['support_whatsapp'] ?? '',
      officeAddress: json['office_address'],
      privacyPolicyUrl: json['privacy_policy_url'],
      termsOfServiceUrl: json['terms_of_service_url'],
      cookiePolicyUrl: json['cookie_policy_url'],
      userVerificationRequired: json['user_verification_required'] ?? false,
      guardianVerificationRequired: json['guardian_verification_required'] ?? false,
      guardianLinkingRequired: json['guardian_linking_required'] ?? false,
      allowSkipAfterSubmit: json['allow_skip_after_submit'] ?? true,
      manualProfileApproval: json['manual_profile_approval'] ?? false,
      costSendInterest: json['cost_send_interest'] ?? 5,
      costSendMessage: json['cost_send_message'] ?? 2,
      costUnlockPhone: json['cost_unlock_phone'] ?? 10,
      costUnlockEmail: json['cost_unlock_email'] ?? 8,
      costUnlockBundle: json['cost_unlock_contact_bundle'] ?? 15,
      costViewProfile: json['cost_view_full_profile'] ?? 3,
      costBoostProfile: json['cost_boost_profile'] ?? 50,
      costSuperLike: json['cost_super_like'] ?? 10,
      costUploadImage: json['cost_upload_image'] ?? 5,
      costUploadVideo: json['cost_upload_video'] ?? 50,
      freeCreditsSignup: json['free_credits_on_signup'] ?? 10,
      freeCreditsVerification: json['free_credits_on_verification'] ?? 5,
      referralCreditsReferrer: json['referral_credits_referrer'] ?? 20,
      referralCreditsReferee: json['referral_credits_referee'] ?? 10,
      freeDailyInterests: json['free_daily_interests'] ?? 5,
      freeDailyMessages: json['free_daily_messages'] ?? 10,
      freeProfileViews: json['free_profile_views'] ?? 20,
      premiumDailyInterests: json['premium_daily_interests'] ?? 50,
      premiumDailyMessages: json['premium_daily_messages'] ?? 100,
      premiumProfileViews: json['premium_profile_views'] ?? -1,
      guardianEnabled: json['guardian_feature_enabled'] ?? true,
      guardianApprovalRequired: json['guardian_approval_required'] ?? false,
      guardianCanBrowse: json['guardian_can_browse'] ?? true,
      guardianCanSendInterests: json['guardian_can_send_interests'] ?? true,
      maxGuardiansPerUser: json['max_guardians_per_user'] ?? 2,
      guardianAutoApproveHours: json['guardian_auto_approve_timeout_hours'] ?? 72,
      basicPlanEnabled: json['basic_plan_enabled'] ?? true,
      basicPlanName: json['basic_plan_name'] ?? 'Basic',
      basicPlanCredits: json['basic_plan_credits'] ?? 50,
      basicPlanDays: json['basic_plan_duration_days'] ?? 7,
      basicPlanPriceUsd: (json['basic_plan_price_usd'] ?? 4.99).toDouble(),
      basicPlanPricePkr: json['basic_plan_price_pkr'] ?? 1400,
      basicPlanPriceAed: json['basic_plan_price_aed'] ?? 18,
      basicPlanPopular: json['basic_plan_popular'] ?? false,
      premiumPlanEnabled: json['premium_plan_enabled'] ?? true,
      premiumPlanName: json['premium_plan_name'] ?? 'Premium',
      premiumPlanCredits: json['premium_plan_credits'] ?? 250,
      premiumPlanDays: json['premium_plan_duration_days'] ?? 30,
      premiumPlanPriceUsd: (json['premium_plan_price_usd'] ?? 12.99).toDouble(),
      premiumPlanPricePkr: json['premium_plan_price_pkr'] ?? 3600,
      premiumPlanPriceAed: json['premium_plan_price_aed'] ?? 48,
      premiumPlanPopular: json['premium_plan_popular'] ?? true,
      platinumPlanEnabled: json['platinum_plan_enabled'] ?? true,
      platinumPlanName: json['platinum_plan_name'] ?? 'Platinum',
      platinumPlanCredits: json['platinum_plan_credits'] ?? 3500,
      platinumPlanDays: json['platinum_plan_duration_days'] ?? 365,
      platinumPlanPriceUsd: (json['platinum_plan_price_usd'] ?? 71.88).toDouble(),
      platinumPlanPricePkr: json['platinum_plan_price_pkr'] ?? 20000,
      platinumPlanPriceAed: json['platinum_plan_price_aed'] ?? 264,
      platinumPlanPopular: json['platinum_plan_popular'] ?? false,
      chatEnabled: json['chat_enabled'] ?? true,
      videoCallEnabled: json['video_call_enabled'] ?? false,
      voiceCallEnabled: json['voice_call_enabled'] ?? false,
      blogEnabled: json['blog_enabled'] ?? true,
      eventsEnabled: json['events_enabled'] ?? false,
      successStoriesEnabled: json['success_stories_enabled'] ?? true,
      chatRequiresMatch: json['chat_requires_match'] ?? true,
      maxMessageLength: json['max_message_length'] ?? 1000,
      fileSharingEnabled: json['file_sharing_enabled'] ?? true,
      maxFileSizeMb: json['max_file_size_mb'] ?? 5,
      autoRenewEnabled: json['auto_renew_enabled'] ?? true,
      trialPeriodDays: json['trial_period_days'] ?? 0,
      refundWithinDays: json['refund_within_days'] ?? 7,
      stripeEnabled: json['stripe_enabled'] ?? true,
      jazzcashEnabled: json['jazzcash_enabled'] ?? false,
      easypaisaEnabled: json['easypaisa_enabled'] ?? false,
      paypalEnabled: json['paypal_enabled'] ?? false,
      referralCommissionPercentage: json['referral_commission_percentage'] ?? 10,
    );
  }
  
  static SettingsModel defaults() {
    return SettingsModel(
      siteName: 'Marriage Sunnah Overseas',
      siteTagline: '',
      maintenanceMode: false,
      maintenanceMessage: '',
      supportEmail: '',
      supportPhone: '',
      supportWhatsapp: '',
      userVerificationRequired: false,
      guardianVerificationRequired: false,
      guardianLinkingRequired: false,
      allowSkipAfterSubmit: true,
      manualProfileApproval: false,
      costSendInterest: 5,
      costSendMessage: 2,
      costUnlockPhone: 10,
      costUnlockEmail: 8,
      costUnlockBundle: 15,
      costViewProfile: 3,
      costBoostProfile: 50,
      costSuperLike: 10,
      costUploadImage: 5,
      costUploadVideo: 50,
      freeCreditsSignup: 10,
      freeCreditsVerification: 5,
      referralCreditsReferrer: 20,
      referralCreditsReferee: 10,
      freeDailyInterests: 5,
      freeDailyMessages: 10,
      freeProfileViews: 20,
      premiumDailyInterests: 50,
      premiumDailyMessages: 100,
      premiumProfileViews: -1,
      guardianEnabled: true,
      guardianApprovalRequired: false,
      guardianCanBrowse: true,
      guardianCanSendInterests: true,
      maxGuardiansPerUser: 2,
      guardianAutoApproveHours: 72,
      basicPlanEnabled: true,
      basicPlanName: 'Basic',
      basicPlanCredits: 50,
      basicPlanDays: 7,
      basicPlanPriceUsd: 4.99,
      basicPlanPricePkr: 1400,
      basicPlanPriceAed: 18,
      basicPlanPopular: false,
      premiumPlanEnabled: true,
      premiumPlanName: 'Premium',
      premiumPlanCredits: 250,
      premiumPlanDays: 30,
      premiumPlanPriceUsd: 12.99,
      premiumPlanPricePkr: 3600,
      premiumPlanPriceAed: 48,
      premiumPlanPopular: true,
      platinumPlanEnabled: true,
      platinumPlanName: 'Platinum',
      platinumPlanCredits: 3500,
      platinumPlanDays: 365,
      platinumPlanPriceUsd: 71.88,
      platinumPlanPricePkr: 20000,
      platinumPlanPriceAed: 264,
      platinumPlanPopular: false,
      chatEnabled: true,
      videoCallEnabled: false,
      voiceCallEnabled: false,
      blogEnabled: true,
      eventsEnabled: false,
      successStoriesEnabled: true,
      chatRequiresMatch: true,
      maxMessageLength: 1000,
      fileSharingEnabled: true,
      maxFileSizeMb: 5,
      autoRenewEnabled: true,
      trialPeriodDays: 0,
      refundWithinDays: 7,
      stripeEnabled: true,
      jazzcashEnabled: false,
      easypaisaEnabled: false,
      paypalEnabled: false,
      referralCommissionPercentage: 10,
    );
  }
}
