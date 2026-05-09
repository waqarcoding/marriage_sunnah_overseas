// controllers/referralController.js

import db from '../models/index.js';
const { User, Referral } = db;


/**
 * Helper function to create referral and award signup bonus
 * Called during user signup process
 */
/**
 * Helper function to create referral and award credits/commissions
 * Can be called during:
 * 1. User signup (isSignUp = true) - awards signup bonus + commission
 * 2. Subscription purchase (isSignUp = false) - awards subscription credits + commission
 * 
 * @param {number} newUserId - ID of the referred user
 * @param {number} referrerId - ID of the referrer
 * @param {number} subscriptionCredits - Credits from subscription (0 for signup only)
 * @param {boolean} isSignUp - True if this is signup, false if subscription purchase
 */
export async function applyReferralReward(newUserId, referrerId, subscriptionCredits = 0, isSignUp = false) {
    // If no referrerId provided, skip referral creation
    if (!referrerId) {
        console.log('No referrer provided for user:', newUserId);
        return null;
    }

    const transaction = await db.sequelize.transaction();

    try {
        // 1. Validate referrer exists
        const referrer = await User.findByPk(referrerId, { transaction });
        if (!referrer) {
            console.log('Invalid referrer ID:', referrerId);
            await transaction.rollback();
            return null;
        }

        // 2. Validate referred user exists
        const referredUser = await User.findByPk(newUserId, { transaction });
        if (!referredUser) {
            console.log('Invalid new user ID:', newUserId);
            await transaction.rollback();
            return null;
        }

        // 3. Prevent self-referral
        if (referrerId === newUserId) {
            console.log('User cannot refer themselves');
            await transaction.rollback();
            return null;
        }

        // Configuration
        const commissionPercentage = 10.00; // 10% commission
        const signupBonus = 50.00; // 50 credits signup bonus

        let referral;
        let totalCreditsAwarded = 0;
        let totalCommissionEarned = 0;

        // ============================================
        // SIGNUP FLOW - Create new referral record
        // ============================================
        if (isSignUp) {
            // 4. Check if user already has a referral
            const existingReferral = await Referral.findOne({
                where: { referred_user_id: newUserId },
                transaction
            });

            if (existingReferral) {
                console.log('User already has a referrer');
                await transaction.rollback();
                return null;
            }

            // 5. Generate unique referral code
            const referralCode = `REF-${referrerId}-${newUserId}-${Date.now()}`;

            // Calculate signup bonus + subscription credits
            totalCreditsAwarded = signupBonus + subscriptionCredits;
            totalCommissionEarned = (totalCreditsAwarded * commissionPercentage) / 100;

            // 6. Create the referral record
            referral = await Referral.create({
                referrer_id: referrerId,
                referred_user_id: newUserId,
                referral_code: referralCode,
                commission_percentage: commissionPercentage,
                credits_earned_by_referred: totalCreditsAwarded,
                commission_earned: totalCommissionEarned,
                activated_at: new Date()
            }, { transaction });

            // 7. Award credits to new user
            referredUser.credits = (parseFloat(referredUser.credits) || 0) + totalCreditsAwarded;
            await referredUser.save({ transaction });

            // 8. Award commission to referrer's rcredits
            referrer.rcredits = (parseFloat(referrer.rcredits) || 0) + totalCommissionEarned;
            await referrer.save({ transaction });

            await transaction.commit();

            console.log(`Signup Referral Created:
                - New User (ID: ${newUserId}) received ${totalCreditsAwarded} credits (${signupBonus} signup + ${subscriptionCredits} subscription)
                - Referrer (ID: ${referrerId}) received ${totalCommissionEarned.toFixed(2)} rcredits commission`);

            return {
                success: true,
                referral_id: referral.id,
                signup_bonus: signupBonus,
                subscription_credits: subscriptionCredits,
                total_credits_awarded: totalCreditsAwarded,
                commission_earned: totalCommissionEarned.toFixed(2),
                type: 'signup'
            };
        }
        // ============================================
        // SUBSCRIPTION FLOW - Update existing referral
        // ============================================
        else {
            // 4. Find existing referral
            referral = await Referral.findOne({
                where: { referred_user_id: newUserId },
                transaction
            });

            if (!referral) {
                console.log('No existing referral found for subscription credits');
                await transaction.rollback();
                return null;
            }

            // Verify the referrer matches
            if (referral.referrer_id !== referrerId) {
                console.log('Referrer ID mismatch');
                await transaction.rollback();
                return null;
            }

            // Calculate commission on subscription credits only
            totalCreditsAwarded = subscriptionCredits;
            totalCommissionEarned = (subscriptionCredits * commissionPercentage) / 100;

            // 5. Update referral record
            referral.credits_earned_by_referred = parseFloat(referral.credits_earned_by_referred) + totalCreditsAwarded;
            referral.commission_earned = parseFloat(referral.commission_earned) + totalCommissionEarned;
            await referral.save({ transaction });

            // 6. Award subscription credits to referred user
            // referredUser.credits = (parseFloat(referredUser.credits) || 0) + totalCreditsAwarded;
            // await referredUser.save({ transaction });
            //it is credited already in webhook  method

            // 7. Award commission to referrer's rcredits
            referrer.rcredits = (parseFloat(referrer.rcredits) || 0) + totalCommissionEarned;
            await referrer.save({ transaction });

            await transaction.commit();

            console.log(`Subscription Referral Updated:
                - Referred User (ID: ${newUserId}) received ${totalCreditsAwarded} subscription credits
                - Referrer (ID: ${referrerId}) received ${totalCommissionEarned.toFixed(2)} rcredits commission`);

            return {
                success: true,
                referral_id: referral.id,
                subscription_credits: totalCreditsAwarded,
                commission_earned: totalCommissionEarned.toFixed(2),
                total_credits_by_referred: referral.credits_earned_by_referred,
                total_commission: referral.commission_earned,
                type: 'subscription'
            };
        }

    } catch (error) {
        await transaction.rollback();
        console.error('Error applying referral reward:', error);
        return null;
    }
}

/**
 * Create a new referral when user B signs up via user A's referral link
 */
export const createReferral = async (req, res) => {
    try {
        const {
            referrer_id,      // User A who shared the link
            referred_user_id, // User B who clicked the link and signed up
            commission_percentage = 10.00
        } = req.body;

        // 1. Validate referrer exists
        const referrer = await User.findByPk(referrer_id);
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: 'Referrer user not found'
            });
        }

        // 2. Validate referred user exists
        const referredUser = await User.findByPk(referred_user_id);
        if (!referredUser) {
            return res.status(404).json({
                success: false,
                message: 'Referred user not found'
            });
        }

        // 3. Check if user already has a referral (can only be referred once)
        const existingReferral = await Referral.findOne({
            where: { referred_user_id: referred_user_id }
        });

        if (existingReferral) {
            return res.status(400).json({
                success: false,
                message: 'User already has a referrer'
            });
        }

        // 4. Prevent self-referral
        if (referrer_id === referred_user_id) {
            return res.status(400).json({
                success: false,
                message: 'Users cannot refer themselves'
            });
        }

        // 5. Generate unique referral code for record keeping
        const referralCode = `REF-${referrer_id}-${referred_user_id}-${Date.now()}`;

        // 6. Create the referral
        const referral = await Referral.create({
            referrer_id: referrer_id,
            referred_user_id: referred_user_id,
            referral_code: referralCode,
            commission_percentage: commission_percentage,
            activated_at: new Date()
        });

        return res.status(201).json({
            success: true,
            message: 'Referral created successfully',
            data: {
                referral_id: referral.id,
                referrer: {
                    id: referrer.id,
                    username: referrer.username
                },
                referred_user: {
                    id: referredUser.id,
                    username: referredUser.username
                },
                commission_percentage: referral.commission_percentage,
                activated_at: referral.activated_at
            }
        });

    } catch (error) {
        console.error('Error creating referral:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create referral',
            error: error
        });
    }
};

/**
 * Award credits to referred user and calculate commission for referrer
 * Commission is automatically added to referrer's rcredits field
 */
export const awardCredits = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { referred_user_id, credits_amount } = req.body;

        // 1. Find referral
        const referral = await Referral.findOne({
            where: {
                referred_user_id: referred_user_id
            },
            include: [
                { model: User, as: 'referrer' },
                { model: User, as: 'referredUser' }
            ],
            transaction
        });

        if (!referral) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'No referral found for this user'
            });
        }

        // 2. Update referred user's credits
        const referredUser = referral.referredUser;
        if (referredUser.total_credits !== undefined) {
            referredUser.total_credits = (parseFloat(referredUser.total_credits) || 0) + parseFloat(credits_amount);
            await referredUser.save({ transaction });
        }

        // 3. Calculate commission
        const commissionEarned = (parseFloat(credits_amount) * parseFloat(referral.commission_percentage)) / 100;

        // 4. Update referral record (hook will auto-calculate commission)
        referral.credits_earned_by_referred = parseFloat(referral.credits_earned_by_referred) + parseFloat(credits_amount);
        await referral.save({ transaction });

        // 5. Update referrer's rcredits (add commission to existing rcredits)
        const referrer = referral.referrer;
        referrer.rcredits = (parseFloat(referrer.rcredits) || 0) + commissionEarned;
        await referrer.save({ transaction });

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: 'Credits awarded successfully',
            data: {
                referred_user: {
                    id: referredUser.id,
                    username: referredUser.username,
                    credits_awarded: credits_amount,
                    total_credits: referredUser.total_credits
                },
                referrer: {
                    id: referrer.id,
                    username: referrer.username,
                    commission_earned: commissionEarned.toFixed(2),
                    total_rcredits: referrer.rcredits
                },
                referral: {
                    total_credits_by_referred: referral.credits_earned_by_referred,
                    total_commission: referral.commission_earned
                }
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error awarding credits:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to award credits',
            error: error
        });
    }
};

/**
 * Get all users referred by a specific referrer
 */
export const getReferredUsers = async (req, res) => {
    try {
        const { referrer_id } = req.params;

        const referrals = await Referral.findAll({
            where: { referrer_id: referrer_id },
            include: [
                {
                    model: User,
                    as: 'referredUser',
                    attributes: ['id', 'name', 'email', 'created_at']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Get referrer's rcredits
        const referrer = await User.findByPk(referrer_id, {
            attributes: ['id', 'name', 'rcredits']
        });

        const stats = {
            referrer: {
                id: referrer.id,
                name: referrer.name,
                total_rcredits: referrer.rcredits
            },
            total_referrals: referrals.length,
            total_commission_earned: referrals.reduce((sum, r) => sum + parseFloat(r.commission_earned || 0), 0).toFixed(2),
            total_credits_generated: referrals.reduce((sum, r) => sum + parseFloat(r.credits_earned_by_referred || 0), 0).toFixed(2),
            referred_users: referrals.map(r => ({
                referral_id: r.id,
                user_id: r.referredUser.id,
                name: r.referredUser.name,
                email: r.referredUser.email,
                commission_percentage: r.commission_percentage,
                credits_earned: r.credits_earned_by_referred,
                commission_earned: r.commission_earned,
                joined_at: r.referredUser.created_at,
                activated_at: r.activated_at
            }))
        };

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error getting referred users:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get referred users',
            error: error
        });
    }
};

/**
 * Get who referred a specific user
 */
export const getUserReferrer = async (req, res) => {
    try {
        const { user_id } = req.params;

        const referral = await Referral.findOne({
            where: { referred_user_id: user_id },
            include: [
                {
                    model: User,
                    as: 'referrer',
                    attributes: ['id', 'name', 'email', 'rcredits']
                }
            ]
        });



        return res.status(200).json({
            success: true,
            data: {
                referred_user_id: parseInt(user_id),
                referrer: {
                    id: referral.referrer.id,
                    name: referral.referrer.name,
                    email: referral.referrer.email,
                    total_rcredits: referral.referrer.rcredits
                },
                commission_percentage: referral.commission_percentage,
                activated_at: referral.activated_at,
                total_credits_earned: referral.credits_earned_by_referred,
                total_commission_given: referral.commission_earned
            }
        });

    } catch (error) {
        console.error('Error getting user referrer:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get user referrer',
            error: error
        });
    }
};

/**
 * Check if a referral relationship exists between two users
 */
export const checkReferralExists = async (req, res) => {
    try {
        const { referrer_id, referred_user_id } = req.body;

        const referral = await Referral.findOne({
            where: {
                referrer_id: referrer_id,
                referred_user_id: referred_user_id
            }
        });

        return res.status(200).json({
            success: true,
            exists: !!referral,
            data: referral ? {
                referral_id: referral.id,
                commission_percentage: referral.commission_percentage,
                credits_earned_by_referred: referral.credits_earned_by_referred,
                commission_earned: referral.commission_earned,
                created_at: referral.created_at
            } : null
        });

    } catch (error) {
        console.error('Error checking referral:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check referral',
            error: error
        });
    }
};

/**
 * Get referral statistics with user images and names (Enhanced for frontend)
 */
export const getReferredUsersWithDetails = async (req, res) => {
    try {
        const { referrer_id } = req.params;

        const referrals = await Referral.findAll({
            where: { referrer_id: referrer_id },
            include: [
                {
                    model: User,
                    as: 'referredUser',
                    attributes: ['id', 'name', 'email', 'avatar_url', 'created_at']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Get referrer's details - USE rcredits (with 's')
        const referrer = await User.findByPk(referrer_id, {
            attributes: ['id', 'name', 'email', 'avatar_url', 'rcredits']  // ✅ Changed to rcredits
        });

        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: 'Referrer not found'
            });
        }

        const stats = {
            referrer: {
                id: referrer.id,
                name: referrer.name,
                email: referrer.email,
                avatar_url: referrer.avatar_url,
                total_rcredit: parseFloat(referrer.rcredits || 0).toFixed(2)  // ✅ Changed to rcredits
            },
            total_referrals: referrals.length,
            total_commission_earned: referrals.reduce((sum, r) => sum + parseFloat(r.commission_earned || 0), 0).toFixed(2),
            total_credits_generated: referrals.reduce((sum, r) => sum + parseFloat(r.credits_earned_by_referred || 0), 0).toFixed(2),
            referred_users: referrals.map(r => ({
                referral_id: r.id,
                user_id: r.referredUser.id,
                name: r.referredUser.name,
                email: r.referredUser.email,
                avatar_url: r.referredUser.avatar_url,
                commission_percentage: parseFloat(r.commission_percentage).toFixed(2),
                credits_earned: parseFloat(r.credits_earned_by_referred).toFixed(2),
                commission_earned: parseFloat(r.commission_earned).toFixed(2),
                joined_at: r.referredUser.created_at,
                activated_at: r.activated_at
            }))
        };

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error getting referred users:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get referred users',
            error: error
        });
    }
};

/**
 * Get who referred a specific user with details
 */
export const getUserReferrerWithDetails = async (req, res) => {
    try {
        const { user_id } = req.params;

        const referral = await Referral.findOne({
            where: { referred_user_id: user_id },
            include: [
                {
                    model: User,
                    as: 'referrer',
                    attributes: ['id', 'name', 'email', 'avatar_url']
                }
            ]
        });

        if (!referral) {
            return res.status(201).json({
                success: true,
                message: 'User was not referred by anyone'
            });
        }

        // Get referrer's rcredits separately
        const referrer = await User.findByPk(referral.referrer.id, {
            attributes: ['rcredits']  // ✅ Changed to rcredits
        });

        return res.status(200).json({
            success: true,
            data: {
                referred_user_id: parseInt(user_id),
                referrer: {
                    id: referral.referrer.id,
                    name: referral.referrer.name,
                    email: referral.referrer.email,
                    avatar_url: referral.referrer.avatar_url,
                    total_rcredit: parseFloat(referrer.rcredits || 0).toFixed(2)  // ✅ Changed to rcredits
                },
                commission_percentage: parseFloat(referral.commission_percentage).toFixed(2),
                activated_at: referral.activated_at,
                total_credits_earned: parseFloat(referral.credits_earned_by_referred).toFixed(2),
                total_commission_given: parseFloat(referral.commission_earned).toFixed(2)
            }
        });

    } catch (error) {
        console.error('Error getting user referrer:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get user referrer',
            error: error
        });
    }
};