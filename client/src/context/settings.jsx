import Api from '../api/Api';
import AuthService from '../features/auth/services/AuthService';

class Settings {
    constructor() {
        this._data = null;
        this._loaded = false;
    }

    // Load settings once
    async load() {
        if (this._loaded) return this;

        try {
            const response = await Api.get('/settings');
            if (response.success) {
                this._data = response.data;
                this._loaded = true;




                console.log('✅ Settings loaded');
            }
        } catch (error) {
            console.error('❌ Settings load error:', error);
            this._data = this.getDefaults();
            this._loaded = true;
        }

        return this;
    }
    // SIGNUP SETTINGS
    get userVerificationRequired() { return this._data?.user_verification_required || false; }
    get guardianVerificationRequired() { return this._data?.guardian_verification_required || false; }
    get guardianLinkingRequired() { return this._data?.guardian_linking_required || false; }
    get allowSkipAfterSubmit() { return this._data?.allow_skip_after_submit || true; }
    get manualProfileApproval() { return this._data?.manual_profile_approval || false; }
    // ✅ Direct property access like Flutter
    get siteName() { return this._data?.site_name || 'Marriage Sunnah Overseas'; }
    get siteTagline() { return this._data?.site_tagline || ''; }
    get siteLogo() { return this._data?.site_logo_url || null; }
    get maintenanceMode() { return this._data?.maintenance_mode || false; }
    get maintenanceMessage() { return this._data?.maintenance_message || ''; }

    get instagramUrl() { return this._data?.instagram_url || null; }
    get facebookUrl() { return this._data?.facebook_url || null; }
    get twitterUrl() { return this._data?.twitter_url || null; }
    get linkedinUrl() { return this._data?.linkedin_url || null; }
    get youtubeUrl() { return this._data?.youtube_url || null; }

    get officeAddress() { return this._data?.office_address || null; }

    get privacyPolicyUrl() { return this._data?.privacy_policy_url || null; }
    get termsOfServiceUrl() { return this._data?.terms_of_service_url || null; }
    get cookiePolicyUrl() { return this._data?.cookie_policy_url || null; }
    // Contact
    get supportEmail() { return this._data?.support_email || ''; }
    get supportPhone() { return this._data?.support_phone || ''; }
    get supportWhatsapp() { return this._data?.support_whatsapp || ''; }

    // Costs
    get costSendInterest() { return this._data?.cost_send_interest || 5; }
    get costSendMessage() { return this._data?.cost_send_message || 2; }
    get costUnlockPhone() { return this._data?.cost_unlock_phone || 10; }
    get costUnlockEmail() { return this._data?.cost_unlock_email || 8; }
    get costUnlockBundle() { return this._data?.cost_unlock_contact_bundle || 15; }
    get costViewProfile() { return this._data?.cost_view_full_profile || 3; }
    get costBoostProfile() { return this._data?.cost_boost_profile || 50; }
    get costSuperLike() { return this._data?.cost_super_like || 10; }

    // Credits
    get freeCreditsSignup() { return this._data?.free_credits_on_signup || 10; }
    get freeCreditsVerification() { return this._data?.free_credits_on_verification || 5; }
    get referralCreditsReferrer() { return this._data?.referral_credits_referrer || 20; }
    get referralCreditsReferee() { return this._data?.referral_credits_referee || 10; }

    // Free Limits
    get freeDailyInterests() { return this._data?.free_daily_interests || 5; }
    get freeDailyMessages() { return this._data?.free_daily_messages || 10; }
    get freeProfileViews() { return this._data?.free_profile_views || 20; }

    // Premium Limits
    get premiumDailyInterests() { return this._data?.premium_daily_interests || 50; }
    get premiumDailyMessages() { return this._data?.premium_daily_messages || 100; }
    get premiumProfileViews() { return this._data?.premium_profile_views || -1; }

    // Guardian
    get guardianEnabled() { return this._data?.guardian_feature_enabled || true; }
    get guardianApprovalRequired() { return this._data?.guardian_approval_required || false; }
    get guardianCanBrowse() { return this._data?.guardian_can_browse || true; }
    get guardianCanSendInterests() { return this._data?.guardian_can_send_interests || true; }
    get maxGuardiansPerUser() { return this._data?.max_guardians_per_user || 2; }
    get guardianAutoApproveHours() { return this._data?.guardian_auto_approve_timeout_hours || 72; }

    // Basic Plan
    get basicPlanEnabled() { return this._data?.basic_plan_enabled || true; }
    get basicPlanName() { return this._data?.basic_plan_name || 'Basic'; }
    get basicPlanCredits() { return this._data?.basic_plan_credits || 50; }
    get basicPlanDays() { return this._data?.basic_plan_duration_days || 7; }
    get basicPlanPriceUSD() { return this._data?.basic_plan_price_usd || 4.99; }
    get basicPlanPricePKR() { return this._data?.basic_plan_price_pkr || 1400; }
    get basicPlanPriceAED() { return this._data?.basic_plan_price_aed || 18; }
    get basicPlanPopular() { return this._data?.basic_plan_popular || false; }

    // Premium Plan
    get premiumPlanEnabled() { return this._data?.premium_plan_enabled || true; }
    get premiumPlanName() { return this._data?.premium_plan_name || 'Premium'; }
    get premiumPlanCredits() { return this._data?.premium_plan_credits || 250; }
    get premiumPlanDays() { return this._data?.premium_plan_duration_days || 30; }
    get premiumPlanPriceUSD() { return this._data?.premium_plan_price_usd || 12.99; }
    get premiumPlanPricePKR() { return this._data?.premium_plan_price_pkr || 3600; }
    get premiumPlanPriceAED() { return this._data?.premium_plan_price_aed || 48; }
    get premiumPlanPopular() { return this._data?.premium_plan_popular || true; }

    // Platinum Plan
    get platinumPlanEnabled() { return this._data?.platinum_plan_enabled || true; }
    get platinumPlanName() { return this._data?.platinum_plan_name || 'Platinum'; }
    get platinumPlanCredits() { return this._data?.platinum_plan_credits || 3500; }
    get platinumPlanDays() { return this._data?.platinum_plan_duration_days || 365; }
    get platinumPlanPriceUSD() { return this._data?.platinum_plan_price_usd || 71.88; }
    get platinumPlanPricePKR() { return this._data?.platinum_plan_price_pkr || 20000; }
    get platinumPlanPriceAED() { return this._data?.platinum_plan_price_aed || 264; }
    get platinumPlanPopular() { return this._data?.platinum_plan_popular || false; }

    // Features
    get chatEnabled() { return this._data?.chat_enabled || true; }
    get videoCallEnabled() { return this._data?.video_call_enabled || false; }
    get voiceCallEnabled() { return this._data?.voice_call_enabled || false; }
    get blogEnabled() { return this._data?.blog_enabled || true; }
    get eventsEnabled() { return this._data?.events_enabled || false; }
    get successStoriesEnabled() { return this._data?.success_stories_enabled || true; }

    // Chat
    get chatRequiresMatch() { return this._data?.chat_requires_match || true; }
    get maxMessageLength() { return this._data?.max_message_length || 1000; }
    get fileSharingEnabled() { return this._data?.file_sharing_enabled || true; }
    get maxFileSizeMB() { return this._data?.max_file_size_mb || 5; }

    // Subscription
    get autoRenewEnabled() { return this._data?.auto_renew_enabled || true; }
    get trialPeriodDays() { return this._data?.trial_period_days || 0; }
    get refundWithinDays() { return this._data?.refund_within_days || 7; }

    // Payment Processors
    get stripeEnabled() { return this._data?.stripe_enabled || true; }
    get jazzcashEnabled() { return this._data?.jazzcash_enabled || false; }
    get easypaisaEnabled() { return this._data?.easypaisa_enabled || false; }
    get paypalEnabled() { return this._data?.paypal_enabled || false; }
    // Add to Settings class
    get referralCommissionPercentage() { return this._data?.referral_commission_percentage || 10; }
    // Add to Settings class
    get costUploadImage() { return this._data?.cost_upload_image || 5; }
    get costUploadVideo() { return this._data?.cost_upload_video || 50; }
    // Helper: Get plan by type
    getPlan(type) {
        return {
            enabled: this._data?.[`${type}_plan_enabled`] || true,
            name: this._data?.[`${type}_plan_name`] || type,
            credits: this._data?.[`${type}_plan_credits`] || 0,
            days: this._data?.[`${type}_plan_duration_days`] || 0,
            priceUSD: this._data?.[`${type}_plan_price_usd`] || 0,
            pricePKR: this._data?.[`${type}_plan_price_pkr`] || 0,
            priceAED: this._data?.[`${type}_plan_price_aed`] || 0,
            popular: this._data?.[`${type}_plan_popular`] || false,
        };
    }

    // Helper: Get all active plans
    getActivePlans() {
        const plans = [];
        ['basic', 'premium', 'platinum'].forEach(type => {
            const plan = this.getPlan(type);
            if (plan.enabled) {
                plans.push({ type, ...plan });
            }
        });
        return plans;
    }

    // Refresh settings
    async refresh() {
        this._loaded = false;
        await this.load();
    }

    getDefaults() {
        return {
            site_name: 'Marriage Sunnah Overseas',
            cost_send_interest: 5,
            cost_send_message: 2,
            // ... add more defaults
        };
    }
}

// ✅ Export singleton instance
export default new Settings();