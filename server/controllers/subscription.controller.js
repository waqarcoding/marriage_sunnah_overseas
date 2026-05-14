import Stripe from 'stripe';
import db from '../models/index.js';
import { Op } from 'sequelize';

import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const { User, Subscription, Transaction, Profile, Referral, Setting } = db;
import { applyReferralReward } from './referral.controller.js';



// Payment processor configurations
const PAYMENT_PROCESSORS = {
    STRIPE: 'stripe',
    EASYPAISA: 'easypaisa',
    JAZZCASH: 'jazzcash'
};

// subscriptionController.js

// subscriptionController.js

let PLANS = {}; // ✅ Keep PLANS variable for other functions to use


export const getPlans = async (req, res) => {
    try {
        // ✅ Get all settings from database
        const settings = await Setting.getAllSettings();

        if (!settings) {
            return res.status(404).json({
                success: false,
                error: 'Settings not found'
            });
        }

        const plans = [];

        // ✅ Basic Plan
        if (settings.basic_plan_enabled) {
            plans.push({
                id: 'basic',
                type: 'basic',
                name: settings.basic_plan_name,
                credits: settings.basic_plan_credits,
                durationDays: settings.basic_plan_duration_days,
                priceUSD: parseFloat(settings.basic_plan_price_usd),
                pricePKR: parseFloat(settings.basic_plan_price_pkr),
                priceAED: parseFloat(settings.basic_plan_price_aed),
                popular: settings.basic_plan_popular,
                stripePriceId: process.env.STRIPE_WEEKLY_PRICE_ID, // From env
            });
        }

        // ✅ Premium Plan
        if (settings.premium_plan_enabled) {
            plans.push({
                id: 'premium',
                type: 'premium',
                name: settings.premium_plan_name,
                credits: settings.premium_plan_credits,
                durationDays: settings.premium_plan_duration_days,
                priceUSD: parseFloat(settings.premium_plan_price_usd),
                pricePKR: parseFloat(settings.premium_plan_price_pkr),
                priceAED: parseFloat(settings.premium_plan_price_aed),
                popular: settings.premium_plan_popular,
                stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID, // From env
            });
        }

        // ✅ Platinum Plan
        if (settings.platinum_plan_enabled) {
            plans.push({
                id: 'platinum',
                type: 'platinum',
                name: settings.platinum_plan_name,
                credits: settings.platinum_plan_credits,
                durationDays: settings.platinum_plan_duration_days,
                priceUSD: parseFloat(settings.platinum_plan_price_usd),
                pricePKR: parseFloat(settings.platinum_plan_price_pkr),
                priceAED: parseFloat(settings.platinum_plan_price_aed),
                popular: settings.platinum_plan_popular,
                stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID, // From env
            });
        }

        console.log('✅ Plans loaded from settings:', plans.map(p => p.name));

        res.json({
            success: true,
            data: plans
        });

    } catch (error) {
        console.error('❌ Get plans error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch plans',
            message: error
        });
    }
};

export const getPaymentMethods = async (req, res) => {
    try {
        // ✅ Get payment processor settings from database
        const settings = await Setting.getAllSettings();

        const methods = [
            {
                id: 'stripe',
                name: 'Credit/Debit Card',
                description: 'Pay with Visa, Mastercard, or American Express',
                icon: 'credit-card',
                enabled: settings?.stripe_enabled && !!process.env.STRIPE_SECRET_KEY,
                currencies: ['USD', 'PKR', 'AED'],
                fees: 'No additional fees',
                autoRenewal: true,
                renewalNote: 'Automatically renews each period'
            },
            {
                id: 'easypaisa',
                name: 'EasyPaisa',
                description: 'Pay with EasyPaisa Mobile Account',
                icon: 'easypaisa',
                enabled: settings?.easypaisa_enabled && !!process.env.EASYPAISA_STORE_ID,
                currencies: ['PKR'],
                fees: 'Standard EasyPaisa charges apply',
                autoRenewal: false,
                renewalNote: 'Manual renewal required when subscription expires'
            },
            {
                id: 'jazzcash',
                name: 'JazzCash',
                description: 'Pay with JazzCash Mobile Account',
                icon: 'jazzcash',
                enabled: settings?.jazzcash_enabled && !!process.env.JAZZCASH_MERCHANT_ID,
                currencies: ['PKR'],
                fees: 'Standard JazzCash charges apply',
                autoRenewal: false,
                renewalNote: 'Manual renewal required when subscription expires'
            },
            {
                id: 'paypal',
                name: 'PayPal',
                description: 'Pay with PayPal account',
                icon: 'paypal',
                enabled: settings?.paypal_enabled && !!process.env.PAYPAL_CLIENT_ID,
                currencies: ['USD', 'AED'],
                fees: 'Standard PayPal charges apply',
                autoRenewal: true,
                renewalNote: 'Automatically renews each period'
            }
        ];

        res.json({
            success: true,
            data: methods.filter(m => m.enabled)
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
};



const createStripeSession = async (req, res, user, planType, planConfig) => {
    try {
        const { priceId } = req.body;

        console.log('💳 Creating Stripe session:', { userId: user.id, planType, priceId });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}&processor=stripe`,
            cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,

            client_reference_id: user.id.toString(),
            metadata: {
                userId: user.id.toString(),
                planType: planType,
                credits: planConfig.credits,
                durationDays: planConfig.durationDays
            },
            billing_address_collection: 'required',
        });

        console.log('✅ Stripe session created:', session.id);

        return res.json({
            success: true,
            url: session.url,
            sessionId: session.id
        });

    } catch (error) {
        console.error('❌ Stripe session error:', error);
        return res.status(500).json({
            success: false,
            error: error || 'Failed to create Stripe session'
        });
    }
};
const createEasyPaisaSession = async (req, res, user, planType, planConfig) => {
    // TODO: Implement EasyPaisa integration
    return res.status(501).json({
        success: false,
        error: 'EasyPaisa integration coming soon'
    });
};

const createJazzCashSession = async (req, res, user, planType, planConfig) => {
    // TODO: Implement JazzCash integration
    return res.status(501).json({
        success: false,
        error: 'JazzCash integration coming soon'
    });
};
// ══════════════════════════════════════════════════════════════════════════════
// EASYPAISA INTEGRATION
// ══════════════════════════════════════════════════════════════════════════════

// ✅ EasyPaisa Callback Handler
export const handleEasyPaisaCallback = async (req, res) => {
    try {
        const {
            orderId,
            storeId,
            transactionAmount,
            transactionId,
            transactionStatus,
            secureHash
        } = req.body;

        console.log('📱 EasyPaisa callback received:', { orderId, transactionStatus });

        // Verify hash
        const hashString = `${process.env.EASYPAISA_HASH_KEY}&${transactionAmount}&${orderId}&${storeId}`;
        const expectedHash = crypto.createHash('sha256').update(hashString).digest('hex');

        if (secureHash !== expectedHash) {
            console.error('❌ EasyPaisa hash verification failed');
            return res.status(400).json({ success: false, error: 'Invalid hash' });
        }

        // Find transaction
        const transaction = await Transaction.findOne({
            where: { transaction_id: orderId }
        });

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        // Update transaction
        await transaction.update({
            status: transactionStatus === '0000' ? 'succeeded' : 'failed',
            payment_method_details: JSON.stringify({
                transactionId,
                transactionStatus
            })
        });

        if (transactionStatus === '0000') {
            // Payment successful - activate subscription
            const metadata = JSON.parse(transaction.metadata);
            await activateSubscription(
                transaction.user_id,
                metadata.planType,
                metadata.credits,
                metadata.durationDays,
                PAYMENT_PROCESSORS.EASYPAISA,
                orderId
            );

            res.redirect(`${process.env.CLIENT_URL}/subscription/success?processor=easypaisa&order_id=${orderId}`);
        } else {
            res.redirect(`${process.env.CLIENT_URL}/subscription/failed?processor=easypaisa&order_id=${orderId}`);
        }

    } catch (error) {
        console.error('❌ EasyPaisa callback error:', error);
        res.status(500).json({ success: false, error: error });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// JAZZCASH INTEGRATION
// ══════════════════════════════════════════════════════════════════════════════

// ✅ JazzCash Callback Handler
export const handleJazzCashCallback = async (req, res) => {
    try {
        const {
            pp_TxnRefNo,
            pp_Amount,
            pp_ResponseCode,
            pp_ResponseMessage,
            pp_SecureHash,
            pp_TxnDateTime
        } = req.body;

        console.log('📱 JazzCash callback received:', { pp_TxnRefNo, pp_ResponseCode });

        // Verify hash
        const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
        const hashData = Object.keys(req.body)
            .filter(key => key !== 'pp_SecureHash')
            .sort()
            .map(key => req.body[key])
            .join('&');

        if (!integritySalt) {
            throw new Error('JAZZCASH_INTEGRITY_SALT environment variable is not set');
        }
        const expectedHash = crypto
            .createHmac('sha256', Buffer.from(integritySalt, 'utf8'))
            .update(`${integritySalt}&${hashData}`)
            .digest('hex')
            .toUpperCase();


        if (pp_SecureHash !== expectedHash) {
            console.error('❌ JazzCash hash verification failed');
            return res.status(400).send('Invalid hash');
        }

        // Find transaction
        const transaction = await Transaction.findOne({
            where: { transaction_id: pp_TxnRefNo }
        });

        if (!transaction) {
            return res.status(404).send('Transaction not found');
        }

        // Update transaction
        await transaction.update({
            status: pp_ResponseCode === '000' ? 'succeeded' : 'failed',
            payment_method_details: JSON.stringify({
                responseCode: pp_ResponseCode,
                responseMessage: pp_ResponseMessage,
                txnDateTime: pp_TxnDateTime
            })
        });

        if (pp_ResponseCode === '000') {
            // Payment successful - activate subscription
            const metadata = JSON.parse(transaction.metadata);
            await activateSubscription(
                transaction.user_id,
                metadata.planType,
                metadata.credits,
                metadata.durationDays,
                PAYMENT_PROCESSORS.JAZZCASH,
                pp_TxnRefNo
            );

            res.redirect(`${process.env.CLIENT_URL}/subscription/success?processor=jazzcash&order_id=${pp_TxnRefNo}`);
        } else {
            res.redirect(`${process.env.CLIENT_URL}/subscription/failed?processor=jazzcash&order_id=${pp_TxnRefNo}`);
        }

    } catch (error) {
        console.error('❌ JazzCash callback error:', error);
        res.status(500).send('Internal server error');
    }
};





// ✅ Updated activateSubscription - handle auto-renewal flag
async function activateSubscription(userId, planType, credits, durationDays, processor, transactionId) {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        // Check for existing active subscription
        const activeSubscription = await Subscription.findOne({
            where: {
                user_id: userId,
                status: 'active',
                current_period_end: { [Op.gt]: new Date() }
            }
        });

        const isUpgrade = !!activeSubscription;

        // Mark old subscriptions as upgraded
        if (isUpgrade) {
            await Subscription.update(
                { status: 'upgraded' },
                {
                    where: {
                        user_id: userId,
                        status: 'active'
                    }
                }
            );
        }

        // ✅ Determine if auto-renewal is supported
        const isAutoRenewal = processor === PAYMENT_PROCESSORS.STRIPE; // Only Stripe auto-renews

        // Create new subscription
        await Subscription.create({
            user_id: userId,
            transaction_id: transactionId,
            plan_type: planType,
            credits_amount: credits,
            status: 'active',
            current_period_start: new Date(),
            current_period_end: expiresAt,
            payment_processor: processor,
            is_auto_renewal: isAutoRenewal, // ✅ Set auto-renewal flag
            previous_credits_carried: isUpgrade ? user.credits : 0
        });

        // Update user
        const totalCredits = isUpgrade ? user.credits + credits : credits;
        await user.update({
            is_pro: true,
            credits: totalCredits,
            subscription_expires_at: expiresAt
        });

        // Apply referral rewards if applicable
        const existingReferral = await Referral.findOne({
            where: { referred_user_id: userId }
        });

        if (existingReferral) {
            await applyReferralReward(
                userId,
                existingReferral.referrer_id,
                credits,
                false
            );
            console.log('🎁 Referral reward applied');
        }

        console.log(`✅ Subscription activated via ${processor} for user ${userId}: ${planType} (${totalCredits} credits)`);
        console.log(`   Auto-renewal: ${isAutoRenewal ? 'YES (Stripe)' : 'NO (Manual renewal required)'}`);

    } catch (error) {
        console.error('❌ Error activating subscription:', error);
        throw error;
    }
}




export const createPaymentSession = async (req, res) => {
    console.log('🚀 createPaymentSession called!');
    console.log('📦 Body:', req.body);

    try {
        const { planType, userId, paymentMethod, priceId } = req.body;

        // Validate
        if (!planType || !userId || !priceId) {
            console.log('❌ Missing fields');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: planType, userId, priceId'
            });
        }

        console.log('✅ Validation passed');

        // Get user
        const user = await User.findByPk(userId);
        if (!user) {
            console.log('❌ User not found:', userId);
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        console.log('✅ User found:', user.id);

        // Load plans if empty
        if (Object.keys(PLANS).length === 0) {
            console.log('⚠️ PLANS empty, loading...');
            await getPlans();
        }

        console.log('📋 Available plans:', Object.keys(PLANS));

        const planConfig = PLANS[planType];
        if (!planConfig) {
            console.log('❌ Invalid plan:', planType);
            return res.status(400).json({
                success: false,
                error: `Invalid plan: ${planType}`
            });
        }

        console.log('✅ Plan found:', planConfig);

        // Route to payment method
        if (paymentMethod === 'stripe') {
            console.log('💳 Routing to Stripe...');
            return await createStripeSession(req, res, user, planType, planConfig);
        } else {
            console.log('⚠️ Unsupported payment method:', paymentMethod);
            return res.status(501).json({
                success: false,
                error: `${paymentMethod} integration coming soon`
            });
        }

    } catch (error) {
        console.error('❌ createPaymentSession error:', error);
        return res.status(500).json({
            success: false,
            error: error || 'Failed to create payment session'
        });
    }
};

// ── Handle Stripe Webhook ─────────────────────────────────────────────────────
export const handleWebhook = async (req, res) => {
    console.log('🔔 Webhook hit received'); // add this
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        // @ts-ignore
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.send(`Webhook Error: ${err}`);
    }



    try {
        switch (event.type) {
            case 'checkout.session.completed':
                try {
                    await handleCheckoutCompleted(event.data.object);
                } catch (err) {
                    // @ts-ignore
                    console.error('handleCheckoutCompleted failed:', err.message, err.stack);
                    throw err; // still 500, but now you'll see the actual error
                }
                break;

            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: error });
    }
};

// ── Handle Checkout Completed ─────────────────────────────────────────────────

async function handleCheckoutCompleted(session) {
    try {
        await getPlans();
        const userId = parseInt(session.metadata.userId);
        const planType = session.metadata.planType;
        const credits = parseInt(session.metadata.credits);
        const isUpgrade = session.metadata.isUpgrade === 'true';
        const previousCredits = parseInt(session.metadata.previousCredits || '0');
        const priceId = session.metadata.priceId;

        console.log('📝 Processing checkout for user:', userId, 'Plan:', planType);

        // Expand session to get payment_intent and invoice
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['payment_intent', 'invoice', 'subscription', 'invoice.payment_intent']
        });

        let paymentIntentId = null;
        let invoiceId = null;

        // Get invoice ID
        if (fullSession.invoice) {
            invoiceId = typeof fullSession.invoice === 'string'
                ? fullSession.invoice
                : fullSession.invoice.id;

            // Retrieve full invoice with payment_intent expanded
            const fullInvoice = await stripe.invoices.retrieve(invoiceId, {
                expand: ['payment_intent']
            });

            // Get payment_intent from invoice
            // @ts-ignore
            if (fullInvoice.payment_intent) {
                // @ts-ignore
                paymentIntentId = typeof fullInvoice.payment_intent === 'string'
                    // @ts-ignore
                    ? fullInvoice.payment_intent
                    // @ts-ignore
                    : fullInvoice.payment_intent.id;
            }
        }

        // Fallback: Try to get from payment_intent directly (one-time payments)
        if (!paymentIntentId && fullSession.payment_intent) {
            paymentIntentId = typeof fullSession.payment_intent === 'string'
                ? fullSession.payment_intent
                : fullSession.payment_intent.id;
        }

        console.log('💳 Payment Intent ID:', paymentIntentId);
        console.log('🧾 Invoice ID:', invoiceId);

        const user = await User.findByPk(userId);
        if (!user) {
            console.error(`User ${userId} not found in handleCheckoutCompleted`);
            return;
        }

        const planConfig = PLANS[planType];
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + planConfig.durationDays);

        // Handle upgrade logic
        if (isUpgrade) {
            await Subscription.update(
                { status: 'upgraded' },
                {
                    where: {
                        user_id: userId,
                        status: 'active'
                    }
                }
            );

            const oldSubscriptions = await stripe.subscriptions.list({
                customer: user.stripe_customer_id,
                status: 'active',
                limit: 10
            });

            for (const sub of oldSubscriptions.data) {
                // @ts-ignore
                if (sub.id !== fullSession.subscription?.id && sub.id !== session.subscription) {
                    await stripe.subscriptions.cancel(sub.id);
                }
            }
        }

        // Create new subscription record
        await Subscription.create({
            user_id: userId,
            // @ts-ignore
            stripe_subscription_id: fullSession.subscription?.id || session.subscription,
            stripe_price_id: priceId,
            plan_type: planType,
            credits_amount: credits,
            status: 'active',
            current_period_start: new Date(),
            current_period_end: expiresAt,
            previous_credits_carried: isUpgrade ? previousCredits : 0
        });

        // Debugging old credits vs new credits
        console.log(`[DEBUG] Previous Credits: ${user.credits}, Credits to Add: ${credits}, isUpgrade: ${isUpgrade}`);

        // const totalCredits = isUpgrade ? user.credits + credits : credits; //if updrade logic keep
        const totalCredits = user.credits + credits;
        console.log(`[DEBUG] New totalCredits to set: ${totalCredits}`);

        await user.update({
            is_pro: true,
            credits: totalCredits,
            subscription_expires_at: expiresAt
        });


        console.log('💾 Creating transaction with:', {
            paymentIntentId,
            invoiceId,
            // @ts-ignore
            amount: fullSession.amount_total / 100
        });

        // Create transaction
        await Transaction.create({
            user_id: userId,

            stripe_invoice_id: invoiceId,
            // @ts-ignore
            amount: fullSession.amount_total / 100,
            currency: fullSession.currency,
            credits_added: credits,
            type: 'subscription',
            status: 'succeeded',
            description: `${planType} subscription - ${isUpgrade ? 'Upgrade' : 'New'}`
        });

        const existingReferral = await Referral.findOne({
            where: { referred_user_id: user.id }
        });

        let referralResult = null;
        if (existingReferral) {
            referralResult = await applyReferralReward(
                user.id,
                existingReferral.referrer_id,
                credits,
                false  // isSignUp = false (subscription renewal)
            );
            console.log('🎁 Referral reward applied for user:', user.id, 'Referrer:', existingReferral.referrer_id, 'Credits:', totalCredits);

        }
        else {
            console.log('🔎 Referral not found for user:', user.id);

        }

        console.log(`✅ Subscription activated for user ${userId}: ${planType} (${totalCredits} credits)`);
        console.log(`   Payment Intent: ${paymentIntentId || 'N/A'}`);
        console.log(`   Invoice: ${invoiceId || 'N/A'}`);

    } catch (error) {
        console.error('❌ Error in handleCheckoutCompleted:', error);
        throw error;
    }
}
// ── Add to subscription.controller.js ────────────────────────────────────────

// GET /subscription/my — returns active subscriptions + transaction history for logged-in user
export const getMySubscriptions = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'is_pro', 'credits', 'subscription_expires_at']
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // All subscriptions ordered newest first
        const subscriptions = await Subscription.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
        });

        // All transactions ordered newest first
        const transactions = await Transaction.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 50,
        });

        return res.json({
            success: true,
            data: {
                user: {
                    is_pro: user.is_pro,
                    credits: user.credits,
                    subscription_expires_at: user.subscription_expires_at,
                },
                subscriptions,
                transactions,
            }
        });

    } catch (error) {
        console.error('getMySubscriptions error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch subscription data' });
    }
};


// ── Add to subscription routes ────────────────────────────────────────────────
// router.get('/my', authenticate, subscriptionController.getMySubscriptions);
// ── Handle Recurring Payment Succeeded ────────────────────────────────────────
async function handlePaymentSucceeded(invoice) {
    try {
        await getPlans();
        if (!invoice.subscription) {
            console.log('⚠️ Invoice has no subscription, skipping');
            return;
        }

        console.log('💰 Processing payment for invoice:', invoice.id);

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const customerId = subscription.customer;

        const user = await User.findOne({
            where: { stripe_customer_id: customerId }
        });

        if (!user) {
            console.error(`User not found for customer ${customerId}`);
            return;
        }

        const activeSubscription = await Subscription.findOne({
            where: {
                stripe_subscription_id: subscription.id,
                user_id: user.id
            }
        });

        if (!activeSubscription) {
            console.error(`Subscription not found for ${subscription.id}`);
            return;
        }

        const planConfig = PLANS[activeSubscription.plan_type];
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + planConfig.durationDays);

        await activeSubscription.update({
            // @ts-ignore
            current_period_start: new Date(subscription.current_period_start * 1000),
            // @ts-ignore
            current_period_end: new Date(subscription.current_period_end * 1000),
            status: 'active'
        });

        await user.update({
            credits: user.credits + activeSubscription.credits_amount,
            subscription_expires_at: newExpiresAt,
            is_pro: true
        });
        // Check if user has a referrer and apply credits accordingly

        // Check if user has a referrer and apply referral commission

        //ON EACH RENEWAL REFFERER GETS COMMISSION
        const existingReferral = await Referral.findOne({
            where: { referred_user_id: user.id }
        });

        let referralResult = null;
        if (existingReferral) {
            referralResult = await applyReferralReward(
                user.id,
                existingReferral.referrer_id,
                activeSubscription.credits_amount,
                false  // isSignUp = false (subscription renewal)
            );
            console.log('🎁 Referral reward applied for user:', user.id, 'Referrer:', existingReferral.referrer_id, 'Credits:', activeSubscription.credits_amount);

        }
        else {
            console.log('🔎 Referral not found for user:', user.id);

        }



        // Get payment_intent ID from invoice
        const paymentIntentId = invoice.payment_intent || null;

        console.log('💾 Creating renewal transaction with:', {
            paymentIntentId,
            invoiceId: invoice.id,
            amount: invoice.amount_paid / 100
        });

        await Transaction.create({
            user_id: user.id,

            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            credits_added: activeSubscription.credits_amount,
            type: 'subscription',
            status: 'succeeded',
            description: `${activeSubscription.plan_type} subscription renewal`
        });

        console.log(`✅ Subscription renewed for user ${user.id}: +${activeSubscription.credits_amount} credits`);
        console.log(`   Payment Intent: ${paymentIntentId}`);
        console.log(`   Invoice: ${invoice.id}`);

    } catch (error) {
        console.error('❌ Error in handlePaymentSucceeded:', error);
        throw error;
    }
}

// ── Handle Subscription Deleted ───────────────────────────────────────────────
async function handleSubscriptionDeleted(subscription) {
    try {
        console.log('🔴 Subscription deleted event for:', subscription.id);

        const user = await User.findOne({
            where: { stripe_customer_id: subscription.customer }
        });

        if (!user) {
            console.log('⚠️ User not found for customer:', subscription.customer);
            return;
        }

        await Subscription.update(
            { status: 'canceled' },
            {
                where: {
                    stripe_subscription_id: subscription.id,
                    user_id: user.id
                }
            }
        );

        // Only set is_pro to false if subscription has actually expired
        const now = new Date();
        const expiresAt = user.subscription_expires_at ? new Date(user.subscription_expires_at) : null;

        if (!expiresAt || now > expiresAt) {
            await user.update({ is_pro: false });
            console.log(`❌ Subscription canceled and expired for user ${user.id}`);
        } else {
            console.log(`⚠️ Subscription canceled but still active until ${expiresAt} for user ${user.id}`);
        }

    } catch (error) {
        console.error('❌ Error in handleSubscriptionDeleted:', error);
        throw error;
    }
}

// ── Handle Subscription Updated ───────────────────────────────────────────────
async function handleSubscriptionUpdated(subscription) {
    try {
        console.log('🔄 Subscription updated event for:', subscription.id, 'Status:', subscription.status);

        const user = await User.findOne({
            where: { stripe_customer_id: subscription.customer }
        });

        if (!user) {
            console.log('⚠️ User not found for customer:', subscription.customer);
            return;
        }

        const activeSubscription = await Subscription.findOne({
            where: {
                stripe_subscription_id: subscription.id,
                user_id: user.id
            }
        });

        if (!activeSubscription) {
            console.log('⚠️ Subscription not found in DB:', subscription.id);
            return;
        }

        await activeSubscription.update({
            status: subscription.status === 'active' ? 'active' : subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end
        });

        // Don't remove pro status unless subscription is actually canceled AND expired
        if (subscription.status === 'canceled') {
            const expiresAt = new Date(subscription.current_period_end * 1000);
            const now = new Date();

            if (now > expiresAt) {
                await user.update({ is_pro: false });
                console.log(`❌ Subscription canceled and expired for user ${user.id}`);
            } else {
                console.log(`⚠️ Subscription will expire at ${expiresAt} for user ${user.id}`);
            }
        }

        console.log(`🔄 Subscription updated for user ${user.id}: status=${subscription.status}`);

    } catch (error) {
        console.error('❌ Error in handleSubscriptionUpdated:', error);
        throw error;
    }
}

// ── Get Subscription Status ───────────────────────────────────────────────────
export const getSubscriptionStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            include: [{
                model: Subscription,
                as: 'subscriptions',
                where: {
                    status: { [Op.in]: ['active', 'past_due'] }
                },
                required: false,
                order: [['created_at', 'DESC']],
                limit: 1
            }]
        });

        if (!user) {
            return res.json({ error: 'User not found' });
        }

        const isExpired = user.isSubscriptionExpired ? user.isSubscriptionExpired() : true;
        const isCreditsEmpty = user.isCreditsEmpty ? user.isCreditsEmpty() : true;
        const shouldShowSubscriptionPage = user.shouldShowSubscriptionPage ? user.shouldShowSubscriptionPage() : false;

        res.json({
            isPro: user.is_pro,
            credits: user.credits,
            subscriptionExpiresAt: user.subscription_expires_at,
            isExpired,
            isCreditsEmpty,
            shouldShowSubscriptionPage,
            activeSubscription: user.subscriptions?.[0] || null
        });
    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ error: error });
    }
};

// ── Restore Purchases ─────────────────────────────────────────────────────────
export const restorePurchases = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.stripe_customer_id) {
            return res.json({
                success: false,
                message: 'No Stripe customer found for this user'
            });
        }

        // Get active subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_customer_id,
            status: 'active',
            limit: 10,
            expand: ['data.default_payment_method']
        });

        if (subscriptions.data.length === 0) {
            return res.json({
                success: false,
                message: 'No active subscriptions found in Stripe'
            });
        }

        // Get the most recent active subscription
        const stripeSub = subscriptions.data[0];

        // Properly convert Unix timestamp to JavaScript Date
        // @ts-ignore
        const currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
        // @ts-ignore
        const currentPeriodStart = new Date(stripeSub.current_period_start * 1000);

        // Validate dates
        if (isNaN(currentPeriodEnd.getTime()) || isNaN(currentPeriodStart.getTime())) {
            console.error('Invalid date from Stripe:', {
                // @ts-ignore
                current_period_end: stripeSub.current_period_end,
                // @ts-ignore
                current_period_start: stripeSub.current_period_start
            });
            return res.status(500).json({
                success: false,
                message: 'Invalid subscription dates from Stripe'
            });
        }

        // Find or create local subscription record
        let localSub = await Subscription.findOne({
            where: {
                stripe_subscription_id: stripeSub.id
            }
        });

        // Determine plan type from price
        const priceId = stripeSub.items.data[0].price.id;
        let planType = 'monthly';
        let creditsAmount = 250;

        if (priceId === process.env.STRIPE_WEEKLY_PRICE_ID) {
            planType = 'weekly';
            creditsAmount = 50;
        } else if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) {
            planType = 'monthly';
            creditsAmount = 250;
        } else if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
            planType = 'yearly';
            creditsAmount = 3500;
        }



        if (localSub) {
            // Update existing subscription
            await localSub.update({
                status: 'active',
                current_period_start: currentPeriodStart,
                current_period_end: currentPeriodEnd,
                cancel_at_period_end: stripeSub.cancel_at_period_end || false
            });
            console.log(`✅ Updated existing subscription ${stripeSub.id} for user ${userId}`);
        } else {
            // Create new subscription record
            localSub = await Subscription.create({
                user_id: userId,
                stripe_subscription_id: stripeSub.id,
                stripe_price_id: priceId,
                plan_type: planType,
                credits_amount: creditsAmount,
                status: 'active',
                current_period_start: currentPeriodStart,
                current_period_end: currentPeriodEnd,
                cancel_at_period_end: stripeSub.cancel_at_period_end || false,
                previous_credits_carried: 0
            });
            console.log(`✅ Created new subscription ${stripeSub.id} for user ${userId}`);
        }

        // Update user status
        await user.update({
            is_pro: true,
            subscription_expires_at: currentPeriodEnd,
            stripe_customer_id: user.stripe_customer_id || stripeSub.customer
        });

        // Return success with subscription details
        res.json({
            success: true,
            message: 'Purchases restored successfully',
            subscription: {
                id: localSub.id,
                plan_type: localSub.plan_type,
                credits_amount: localSub.credits_amount,
                current_period_end: currentPeriodEnd,
                status: localSub.status
            },
            user: {
                is_pro: user.is_pro,
                credits: user.credits,
                subscription_expires_at: user.subscription_expires_at
            }
        });

    } catch (error) {
        console.error('Restore purchases error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore purchases',
            error: error
        });
    }
};

// ── Verify Session ────────────────────────────────────────────────────────────
export const verifySession = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.json({
                success: false,
                error: 'Session ID is required'
            });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        res.json({
            success: true,
            session: {
                id: session.id,
                status: session.status,
                customer: session.customer,
                subscription: session.subscription
            }
        });
    } catch (error) {
        console.error('Verify session error:', error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
};