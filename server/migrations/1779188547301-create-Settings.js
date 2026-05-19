
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      site_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      site_tagline: {
        type: Sequelize.STRING,
        allowNull: true
      },
      site_logo_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      site_favicon_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      maintenance_mode: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      maintenance_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      support_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      support_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      support_whatsapp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      office_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      facebook_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      instagram_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      twitter_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      linkedin_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      youtube_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      manual_profile_approval: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      basic_plan_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      basic_plan_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      basic_plan_credits: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      basic_plan_duration_days: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      basic_plan_price_usd: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      basic_plan_popular: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      premium_plan_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      premium_plan_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      premium_plan_credits: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      premium_plan_duration_days: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      premium_plan_price_usd: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      premium_plan_popular: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      platinum_plan_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      platinum_plan_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      platinum_plan_credits: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      platinum_plan_duration_days: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      platinum_plan_price_usd: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      platinum_plan_popular: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      cost_send_interest: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cost_send_message: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cost_unlock_phone: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cost_unlock_email: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cost_boost_profile: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cost_upload_image: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cost_upload_video: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cost_super_like: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cost_undo_action: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      free_daily_interests: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      free_daily_messages: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      premium_daily_interests: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      premium_daily_messages: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      free_credits_on_signup: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      free_credits_on_verification: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      free_credits_on_profile_complete: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      referral_credits_referrer: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      referral_credits_referee: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      referral_commission_percentage: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      guardian_verification_required: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      stripe_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      jazzcash_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      easypaisa_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      paypal_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      currency_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      commission_percentage: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      refund_policy_days: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      terms_of_service_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      privacy_policy_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cookie_policy_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      refund_policy_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      video_call_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      voice_call_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      success_stories_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      events_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Settings');
  }
};
