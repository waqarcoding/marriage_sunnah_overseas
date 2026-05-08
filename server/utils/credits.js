// utils/credits.js
import db from '../models/index.js';
import { notifyCreditUpdate } from '../config/socket.js';

const { User } = db;

/**
 * Deduct credits from a user
 */
export async function deductCredits(userId, amount, reason = 'Unknown') {
    console.log(`🔍 deductCredits called: userId=${userId}, amount=${amount}, reason=${reason}`);

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            console.log('❌ User not found:', userId);
            return {
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            };
        }

        console.log(`👤 User found: ${user.id}, current credits: ${user.credits}`);

        if (user.credits < amount) {
            console.log(`❌ Insufficient credits: has ${user.credits}, needs ${amount}`);
            return {
                success: false,
                error: 'Insufficient credits',
                code: 'INSUFFICIENT_CREDITS',
                currentBalance: user.credits,
                required: amount,
                deficit: amount - user.credits
            };
        }

        const previousBalance = user.credits;
        const newBalance = user.credits - amount;

        await user.update({ credits: newBalance });

        console.log(`💳 Credits deducted: User ${userId} | -${amount} credits | Reason: ${reason} | ${previousBalance} → ${newBalance}`);

        // ✅ Notify user via socket
        notifyCreditUpdate(userId, newBalance);

        return {
            success: true,
            previousBalance,
            deducted: amount,
            newBalance,
            reason
        };

    } catch (error) {
        console.error('❌ Error deducting credits:', error);
        return {
            success: false,
            error: error,
            code: 'DEDUCTION_ERROR'
        };
    }
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId, amount) {
    console.log(`🔍 hasEnoughCredits called: userId=${userId}, amount=${amount}`);

    try {
        const user = await User.findByPk(userId);
        const hasEnough = user ? user.credits >= amount : false;

        console.log(`✅ hasEnoughCredits result: ${hasEnough} (user credits: ${user?.credits || 0})`);

        return hasEnough;
    } catch (error) {
        console.error('❌ Error checking credits:', error);
        return false;
    }
}

/**
 * Add credits to a user
 */
export async function addCredits(userId, amount, reason = 'Unknown') {
    console.log(`🔍 addCredits called: userId=${userId}, amount=${amount}, reason=${reason}`);

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            console.log('❌ User not found:', userId);
            return {
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            };
        }

        const previousBalance = user.credits;
        const newBalance = user.credits + amount;

        await user.update({ credits: newBalance });

        console.log(`💰 Credits added: User ${userId} | +${amount} credits | Reason: ${reason} | ${previousBalance} → ${newBalance}`);

        // ✅ Notify user via socket
        notifyCreditUpdate(userId, newBalance);

        return {
            success: true,
            previousBalance,
            added: amount,
            newBalance,
            reason
        };

    } catch (error) {
        console.error('❌ Error adding credits:', error);
        return {
            success: false,
            error: error,
            code: 'ADDITION_ERROR'
        };
    }
}

/**
 * Get user's current credit balance
 */
export async function getCredits(userId) {
    try {
        const user = await User.findByPk(userId);
        return user?.credits ?? 0;
    } catch (error) {
        console.error('❌ Error getting credits:', error);
        return 0;
    }
}