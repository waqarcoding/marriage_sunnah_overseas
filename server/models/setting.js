'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Setting extends Model {
        static associate(models) {
            // no associations needed — global settings table
        }

        // ── Helper: get parsed profile_options ────────────────────────────
        static async getOptions() {
            const row = await this.findOne({ order: [['id', 'ASC']] });
            if (!row) return null;
            try {
                const value = row.get('profile_options');
                return typeof value === 'string' ? JSON.parse(value) : value;
            } catch {
                return null;
            }
        }

        // ── Helper: update profile_options ────────────────────────────────
        static async setOptions(value) {
            const stringified = typeof value === 'string' ? value : JSON.stringify(value);
            const row = await Setting.findOne({ order: [['id', 'ASC']] });
            if (row) {
                await row.update({ profile_options: stringified });
            } else {
                await Setting.create({ profile_options: stringified });
            }
        }

        // ── Helper: get single setting by key ────────────────────────────
        static async getSetting(key) {
            const row = await this.findOne({ order: [['id', 'ASC']] });
            return row ? row.get(key) : null;
        }

        // ── Helper: update single setting ────────────────────────────────
        static async setSetting(key, value) {
            const row = await this.findOne({ order: [['id', 'ASC']] });
            if (row) {
                await row.update({ [key]: value });
            } else {
                await this.create({ [key]: value });
            }
        }

        // ── Helper: get all settings as object ────────────────────────────
        static async getAllSettings() {
            const row = await this.findOne({ order: [['id', 'ASC']] });
            return row ? row.toJSON() : null;
        }
    }

    Setting.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        // ═════════════════════════════════════════════════════════════════
        // GENERAL SETTINGS
        // ═════════════════════════════════════════════════════════════════
        site_name: {
            type: DataTypes.STRING(255),
            defaultValue: 'Marriage Sunnah Overseas',
            comment: 'Website name displayed in header/footer',
        },
        site_tagline: {
            type: DataTypes.STRING(500),
            defaultValue: 'Find your life partner following Islamic values',
            comment: 'Short description/tagline',
        },
        site_logo_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'URL to site logo image',
        },
        site_favicon_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'URL to favicon',
        },
        maintenance_mode: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Enable/disable maintenance mode',
        },
        maintenance_message: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Message shown during maintenance',
        },

        // ═════════════════════════════════════════════════════════════════
        // CONTACT & SUPPORT
        // ═════════════════════════════════════════════════════════════════
        support_email: {
            type: DataTypes.STRING(255),
            defaultValue: 'support@marriagesunnaoverseas.com',
            comment: 'Support/contact email',
        },
        support_phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Support phone number',
        },
        support_whatsapp: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'WhatsApp number for support',
        },
        office_address: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Physical office address',
        },

        // ═════════════════════════════════════════════════════════════════
        // SOCIAL MEDIA LINKS
        // ═════════════════════════════════════════════════════════════════
        facebook_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Facebook page URL',
        },
        instagram_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Instagram profile URL',
        },
        twitter_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Twitter/X profile URL',
        },
        linkedin_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'LinkedIn company page URL',
        },
        youtube_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'YouTube channel URL',
        },




        // ═════════════════════════════════════════════════════════════════
        // SUBSCRIPTION PLANS - BASIC (WEEKLY)
        // ═════════════════════════════════════════════════════════════════
        basic_plan_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Enable/disable Basic plan',
        },
        basic_plan_name: {
            type: DataTypes.STRING(100),
            defaultValue: 'Basic',
            comment: 'Display name for Basic plan',
        },
        basic_plan_credits: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            comment: 'Credits included in Basic plan',
        },
        basic_plan_duration_days: {
            type: DataTypes.INTEGER,
            defaultValue: 7,
            comment: 'Duration in days (7 = weekly)',
        },
        basic_plan_price_usd: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 4.99,
            comment: 'Price in USD',
        },

        basic_plan_popular: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Mark as popular plan',
        },

        // ═════════════════════════════════════════════════════════════════
        // SUBSCRIPTION PLANS - PREMIUM (MONTHLY)
        // ═════════════════════════════════════════════════════════════════
        premium_plan_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Enable/disable Premium plan',
        },
        premium_plan_name: {
            type: DataTypes.STRING(100),
            defaultValue: 'Premium',
            comment: 'Display name for Premium plan',
        },
        premium_plan_credits: {
            type: DataTypes.INTEGER,
            defaultValue: 250,
            comment: 'Credits included in Premium plan',
        },
        premium_plan_duration_days: {
            type: DataTypes.INTEGER,
            defaultValue: 30,
            comment: 'Duration in days (30 = monthly)',
        },
        premium_plan_price_usd: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 12.99,
            comment: 'Price in USD',
        },

        premium_plan_popular: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Mark as popular plan',
        },

        // ═════════════════════════════════════════════════════════════════
        // SUBSCRIPTION PLANS - PLATINUM (YEARLY)
        // ═════════════════════════════════════════════════════════════════
        platinum_plan_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Enable/disable Platinum plan',
        },
        platinum_plan_name: {
            type: DataTypes.STRING(100),
            defaultValue: 'Platinum',
            comment: 'Display name for Platinum plan',
        },
        platinum_plan_credits: {
            type: DataTypes.INTEGER,
            defaultValue: 3500,
            comment: 'Credits included in Platinum plan',
        },
        platinum_plan_duration_days: {
            type: DataTypes.INTEGER,
            defaultValue: 365,
            comment: 'Duration in days (365 = yearly)',
        },
        platinum_plan_price_usd: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 71.88,
            comment: 'Price in USD',
        },

        platinum_plan_popular: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Mark as popular plan',
        },

        // ═════════════════════════════════════════════════════════════════
        // CREDIT COSTS (Actions)
        // ═════════════════════════════════════════════════════════════════
        cost_send_interest: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            comment: 'Credits required to send interest/like',
        },
        cost_send_message: {
            type: DataTypes.INTEGER,
            defaultValue: 2,
            comment: 'Credits required to send a message',
        },
        cost_unlock_phone: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            comment: 'Credits required to unlock phone number',
        },
        cost_unlock_email: {
            type: DataTypes.INTEGER,
            defaultValue: 8,
            comment: 'Credits required to unlock email address',
        },

        cost_boost_profile: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            comment: 'Credits to boost profile visibility for 7 days',
        },
        cost_upload_image: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            comment: 'Profile Photo upload',
        },
        cost_upload_video: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            comment: 'Profile video upload',
        },
        cost_super_like: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            comment: 'Credits for super like (stands out to recipient)',
        },
        cost_undo_action: {
            type: DataTypes.INTEGER,
            defaultValue: 3,
            comment: 'Credits to undo last swipe/action',
        },

        // ═════════════════════════════════════════════════════════════════
        // FREE USER LIMITS
        // ═════════════════════════════════════════════════════════════════
        free_daily_interests: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            comment: 'Max interests/likes free users can send per day',
        },
        free_daily_messages: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            comment: 'Max messages free users can send per day',
        },

        // ═════════════════════════════════════════════════════════════════
        // PREMIUM USER LIMITS
        // ═════════════════════════════════════════════════════════════════
        premium_daily_interests: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            comment: 'Max interests/likes premium users can send per day',
        },
        premium_daily_messages: {
            type: DataTypes.INTEGER,
            defaultValue: 100,
            comment: 'Max messages premium users can send per day',
        },

        // ═════════════════════════════════════════════════════════════════
        // CREDITS & REFERRAL SYSTEM
        // ═════════════════════════════════════════════════════════════════
        free_credits_on_signup: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            comment: 'Free credits given to new users on registration',
        },
        free_credits_on_verification: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            comment: 'Bonus credits when user completes ID verification',
        },
        free_credits_on_profile_complete: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            comment: 'Bonus credits when user fills 100% of profile',
        },
        referral_credits_referrer: {
            type: DataTypes.INTEGER,
            defaultValue: 20,
            comment: 'Credits given to referrer when someone signs up using their code',
        },
        referral_credits_referee: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            comment: 'Credits given to new user who used a referral code',
        },
        referral_commission_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 10.00,
            comment: 'Commission percentage for referrer when referee makes purchase',
        },

        // ═════════════════════════════════════════════════════════════════
        // USER REGISTRATION & VERIFICATION
        // ═════════════════════════════════════════════════════════════════


        user_verification_required: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Require users to verify email/phone on sign up',
        },
        guardian_verification_required: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Require guardians to verify their email/phone on sign up',
        },
        guardian_linking_required: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Require guardian to be linked during sign up',
        },
        allow_skip_after_submit: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Show skip option after submit for optional steps',
        },
        manual_profile_approval: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Admin must approve profiles before they go live',
        },

        // ═════════════════════════════════════════════════════════════════
        // PAYMENT PROCESSORS
        // ═════════════════════════════════════════════════════════════════
        stripe_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Enable Stripe payment processor',
        },
        jazzcash_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Enable JazzCash payment processor',
        },
        easypaisa_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Enable EasyPaisa payment processor',
        },
        paypal_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Enable PayPal payment processor',
        },





        // ═════════════════════════════════════════════════════════════════
        // PAYMENT & PRICING
        // ═════════════════════════════════════════════════════════════════
        currency_code: {
            type: DataTypes.STRING(3),
            defaultValue: 'USD',
            comment: 'Primary currency code (USD, PKR, etc)',
        },

        commission_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 10.00,
            comment: 'Referral commission percentage',
        },
        refund_policy_days: {
            type: DataTypes.INTEGER,
            defaultValue: 7,
            comment: 'Refund allowed within X days',
        },



        // ═════════════════════════════════════════════════════════════════
        // TERMS & POLICIES
        // ═════════════════════════════════════════════════════════════════
        terms_of_service_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Link to Terms of Service page',
        },
        privacy_policy_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Link to Privacy Policy page',
        },
        cookie_policy_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Link to Cookie Policy page',
        },
        refund_policy_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Link to Refund Policy page',
        },


        // ═════════════════════════════════════════════════════════════════
        // FEATURE FLAGS
        // ═════════════════════════════════════════════════════════════════
        video_call_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Enable video calling feature',
        },
        voice_call_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Enable voice calling feature',
        },
        success_stories_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Show success stories section',
        },

        events_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Enable events/meetups feature',
        },


    }, {
        sequelize,
        modelName: 'Setting',
        tableName: 'Settings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Setting;
};