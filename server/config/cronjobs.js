// jobs/subscription-expiry-notifier.js
import cron from 'node-cron';
import db from '../models/index.js';
import { Op } from 'sequelize';
import { sendMail } from '../mail/service.js'; // ✅ Named import

const { User, Subscription } = db;

export async function notifyExpiringSubscriptions() {
    try {
        console.log('🔔 [CRON] Running subscription expiry check...');

        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const now = new Date();

        const expiringSubscriptions = await Subscription.findAll({
            where: {
                status: 'active',
                is_auto_renewal: false,
                current_period_end: {
                    [Op.between]: [now, threeDaysFromNow]
                }
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'name', 'phone']
            }]
        });

        console.log(`📧 Found ${expiringSubscriptions.length} subscriptions expiring soon`);

        for (const subscription of expiringSubscriptions) {
            // ✅ Fixed: Proper date arithmetic
            const expiryDate = new Date(subscription.current_period_end);
            const currentDate = new Date();
            const timeDiff = expiryDate.getTime() - currentDate.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            await sendExpiryNotification(subscription, daysLeft);
            console.log(`✅ Sent expiry notification to ${subscription.user.email} (${daysLeft} days left)`);
        }

        return { success: true, count: expiringSubscriptions.length };
    } catch (error) {
        console.error('❌ [CRON] Error in expiry notifier:', error);
        return { success: false, error: error };
    }
}

async function sendExpiryNotification(subscription, daysLeft) {
    const { user, plan_type, current_period_end } = subscription;

    await sendMail({
        to: user.email,
        subject: `⏰ Your ${plan_type} subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1B4D3E;">Hi ${user.name},</h2>
                <p>Your <strong>${plan_type.toUpperCase()}</strong> subscription will expire on 
                <strong>${new Date(current_period_end).toLocaleDateString()}</strong>.</p>
                <p>You have <strong style="color: #f59e0b;">${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong> 
                left to renew and keep enjoying premium features.</p>
                <div style="margin: 30px 0;">
                    <a href="${process.env.CLIENT_URL}/subscription" 
                       style="background: linear-gradient(135deg, #1B4D3E, #2d7a5f); 
                              color: white; padding: 12px 24px; text-decoration: none; 
                              border-radius: 8px; display: inline-block; font-weight: bold;">
                        Renew Now
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">Thank you for being a premium member!</p>
            </div>
        `,
        text: `Hi ${user.name}, your ${plan_type} subscription expires in ${daysLeft} days. Renew now: ${process.env.CLIENT_URL}/subscription`
    });
}

export function scheduleExpiryNotifications() {
    cron.schedule('0 9 * * *', async () => {
        console.log('🕒 [CRON] Scheduled task triggered at', new Date().toISOString());
        await notifyExpiringSubscriptions();
    });
    console.log('✅ [CRON] Subscription expiry notifier scheduled (daily at 9:00 AM)');
}

export async function markExpiredSubscriptions() {
    try {
        console.log('🔔 [CRON] Checking for expired subscriptions...');
        const now = new Date();

        const expiredSubscriptions = await Subscription.findAll({
            where: {
                status: 'active',
                current_period_end: { [Op.lt]: now },
                is_auto_renewal: false
            },
            include: [{ model: User, as: 'user' }]
        });

        let expiredCount = 0;
        for (const subscription of expiredSubscriptions) {
            await subscription.update({ status: 'expired' });
            expiredCount++;

            const activeSubscription = await Subscription.findOne({
                where: {
                    user_id: subscription.user_id,
                    status: 'active',
                    current_period_end: { [Op.gt]: now }
                }
            });

            if (!activeSubscription) {
                await subscription.user.update({
                    is_pro: false,
                    subscription_expires_at: null
                });
                console.log(`👤 User ${subscription.user.email} marked as non-pro`);
            }
        }

        console.log(`✅ Marked ${expiredCount} subscriptions as expired`);
        return { success: true, count: expiredCount };
    } catch (error) {
        console.error('❌ [CRON] Error marking expired subscriptions:', error);
        return { success: false, error: error };
    }
}

export function scheduleExpiredSubscriptionChecker() {
    cron.schedule('0 * * * *', async () => {
        console.log('🕒 [CRON] Hourly expired subscription check at', new Date().toISOString());
        await markExpiredSubscriptions();
    });
    console.log('✅ [CRON] Expired subscription checker scheduled (every hour)');
}