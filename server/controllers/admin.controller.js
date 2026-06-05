import db from '../models/index.js';
const { User, Profile, Subscription, Transaction, Referral, Meeting, Interest, Match, Message, ContactReveal, Notification, Guardian, Setting, Option, Dislike, Preference } = db;
import { Op } from 'sequelize';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user with admin or staff role
        const user = await User.findOne({
            where: {
                email,
                role: { [Op.in]: ['admin', 'staff'] },
                is_deleted: false
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials or insufficient permissions'
            });
        }

        // Check if suspended
        if (user.is_suspended) {
            return res.status(403).json({
                success: false,
                error: 'Account suspended. Contact super admin.'
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const secret = process.env.JWT_SECRET || 'default_secret';
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: '7d' }
        );


        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar_url: user.avatar_url
                }
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const now = new Date();

        // User stats
        const [totalUsers, activeUsers, verifiedUsers, suspendedUsers, todaySignups] = await Promise.all([
            User.count({ where: { is_deleted: false } }),
            User.count({ where: { is_deleted: false, is_online: true } }),
            User.count({ where: { is_deleted: false, is_verified: true } }),
            User.count({ where: { is_deleted: false, is_suspended: true } }),
            User.count({ where: { is_deleted: false, created_at: { [Op.gte]: today } } })
        ]);

        // Subscription stats
        const [activeSubscriptions, expiringToday, proUsers] = await Promise.all([
            Subscription.count({ where: { status: 'active' } }),
            Subscription.count({
                where: {
                    status: 'active',
                    current_period_end: {
                        [Op.gte]: today,
                        [Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    }
                }
            }),
            User.count({ where: { is_deleted: false, is_pro: true } })
        ]);

        // Revenue stats (today)
        const todayRevenue = await Transaction.sum('amount', {
            where: {
                status: 'succeeded',
                created_at: { [Op.gte]: today }
            }
        }) || 0;

        // Engagement stats
        const [pendingInterests, todayMatches, todayMessages, pendingVerifications] = await Promise.all([
            Interest.count({ where: { status: 'pending' } }),
            Match.count({ where: { created_at: { [Op.gte]: today } } }),
            Message.count({ where: { created_at: { [Op.gte]: today } } }),
            User.count({
                where: {
                    is_deleted: false,
                    is_verified: false,
                    frontid_url: { [Op.ne]: null },
                    backid_url: { [Op.ne]: null }
                }
            })
        ]);

        // Meeting stats
        const [upcomingMeetings, todayMeetings, totalMeetings] = await Promise.all([
            Meeting.count({
                where: {
                    meeting_datetime: { [Op.gte]: now },
                    status: { [Op.in]: ['proposed', 'confirmed', 'in_progress'] }
                }
            }),
            Meeting.count({
                where: {
                    meeting_datetime: {
                        [Op.gte]: today,
                        [Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    },
                    status: { [Op.in]: ['proposed', 'confirmed', 'in_progress'] }
                }
            }),
            Meeting.count()
        ]);

        // Credits stats
        const [totalCredits, totalRcredits] = await Promise.all([
            User.sum('credits') || 0,
            User.sum('rcredits') || 0
        ]);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    verified: verifiedUsers,
                    suspended: suspendedUsers,
                    todaySignups
                },
                subscriptions: {
                    active: activeSubscriptions,
                    expiringToday,
                    proUsers
                },
                revenue: {
                    today: parseFloat(todayRevenue.toFixed(2))
                },
                engagement: {
                    pendingInterests,
                    todayMatches,
                    todayMessages
                },
                meetings: {
                    upcoming: upcomingMeetings,
                    today: todayMeetings,
                    total: totalMeetings
                },
                pending: {
                    verifications: pendingVerifications
                },
                credits: {
                    total: parseInt(totalCredits),
                    rcredits: parseInt(totalRcredits)
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to load dashboard stats' });
    }
};

export const getDashboardCharts = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // User growth
        const userGrowth = await User.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: startDate },
                is_deleted: false
            },
            group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
            order: [[db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // Revenue growth
        const revenueGrowth = await Transaction.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
                [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
            ],
            where: {
                created_at: { [Op.gte]: startDate },
                status: 'succeeded'
            },
            group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
            order: [[db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                userGrowth,
                revenueGrowth
            }
        });
    } catch (error) {
        console.error('Get dashboard charts error:', error);
        res.status(500).json({ success: false, error: 'Failed to load charts' });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const [recentUsers, recentTransactions, recentInterests] = await Promise.all([
            User.findAll({
                where: { is_deleted: false },
                order: [['created_at', 'DESC']],
                limit,
                attributes: ['id', 'name', 'email', 'created_at', 'avatar_url']
            }),
            Transaction.findAll({
                include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
                order: [['created_at', 'DESC']],
                limit
            }),
            Interest.findAll({
                include: [
                    { model: User, as: 'fromUser', attributes: ['id', 'name'] },
                    { model: User, as: 'toUser', attributes: ['id', 'name'] }
                ],
                order: [['created_at', 'DESC']],
                limit
            })
        ]);

        res.json({
            success: true,
            data: {
                recentUsers,
                recentTransactions,
                recentInterests
            }
        });
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({ success: false, error: 'Failed to load recent activity' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export const getUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            role = '',
            status = '',
            verified = '',
            isPro = '',
            country = ''
        } = req.query;

        const offset = (page - 1) * limit;
        const where = { is_deleted: false };

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { mobile: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role) where.role = role;
        if (status === 'suspended') where.is_suspended = true;
        if (status === 'active') where.is_suspended = false;
        if (verified !== '') where.is_verified = verified === 'true';
        if (isPro !== '') where.is_pro = isPro === 'true';

        const include = [{
            model: Profile,
            as: 'profile',
            attributes: ['id', 'gender', 'age', 'country', 'city', 'images'],
            required: false
        }];

        if (country) {
            include[0].where = { country };
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            distinct: true
        });

        res.json({
            success: true,
            data: {
                users: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                { model: Profile, as: 'profile' },
                { model: Preference, as: 'preference' },
                { model: Subscription, as: 'subscriptions', limit: 5, order: [['created_at', 'DESC']] },
                { model: Transaction, as: 'transactions', limit: 5, order: [['created_at', 'DESC']] },
                { model: Guardian, as: 'guardians', include: [{ model: User, as: 'guardianUser', attributes: ['id', 'name', 'email'] }] },
                { model: Interest, as: 'interestsSent', limit: 5, order: [['created_at', 'DESC']] },
                { model: Interest, as: 'interestsReceived', limit: 5, order: [['created_at', 'DESC']] }
            ]
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user details' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await user.update(updates);

        res.json({
            success: true,
            data: user,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
};

/*
Soft Delete
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await user.update({ is_deleted: true });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
};
*/
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'User permanently deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, error: 'Failed to permanently delete user' });
    }
};

export const banUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await user.update({ is_suspended: true });

        res.json({
            success: true,
            message: 'User banned successfully'
        });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ success: false, error: 'Failed to ban user' });
    }
};

export const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await user.update({ is_suspended: false });

        res.json({
            success: true,
            message: 'User unbanned successfully'
        });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({ success: false, error: 'Failed to unban user' });
    }
};

export const verifyUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const settings = await Setting.getAllSettings();
        const verificationBonus = settings?.free_credits_on_verification || 5;

        await user.update({
            is_verified: true,
            credits: user.credits + verificationBonus
        });

        res.json({
            success: true,
            data: user,
            message: `User verified and ${verificationBonus} credits added`
        });
    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify user' });
    }
};

export const adjustCredits = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type = 'credits', reason } = req.body;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ success: false, error: 'Invalid amount' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const field = type === 'rcredits' ? 'rcredits' : 'credits';
        const newValue = user[field] + parseInt(amount);

        await user.update({ [field]: Math.max(0, newValue) });

        res.json({
            success: true,
            data: user,
            message: `${type} adjusted successfully`
        });
    } catch (error) {
        console.error('Adjust credits error:', error);
        res.status(500).json({ success: false, error: 'Failed to adjust credits' });
    }
};
// Add this method to your admin.controller.js

export const getPendingInterests = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            status = '',
            guardianStatus = ''
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause
        const where = {};

        if (status) {
            where.status = status;
        }

        if (guardianStatus) {
            where[Op.or] = [
                { from_guardian_status: guardianStatus },
                { to_guardian_status: guardianStatus }
            ];
        }

        // Build user search where clause
        let userWhere = {};
        if (search) {
            userWhere = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Get interests with user details
        const { count, rows } = await Interest.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'fromUser',
                    attributes: ['id', 'name', 'email', 'avatar_url', 'is_verified', 'is_pro'],
                    where: search ? userWhere : undefined,
                    required: search ? true : false
                },
                {
                    model: User,
                    as: 'toUser',
                    attributes: ['id', 'name', 'email', 'avatar_url', 'is_verified', 'is_pro'],
                    where: search ? userWhere : undefined,
                    required: search ? true : false
                }
            ],
            attributes: [
                'id', 'status', 'from_guardian_status', 'to_guardian_status',
                'both_guardians_approved', 'both_users_approved',
                'is_super_like', 'is_mutual', 'is_seen', 'created_at'
            ],
            limit: parseInt(limit),
            // @ts-ignore
            offset: parseInt(offset),

            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                interests: rows,
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('❌ Get pending interests error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pending interests'
        });
    }
};
export const adjustSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPro, expiresAt } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const updates = {};
        if (typeof isPro !== 'undefined') updates.is_pro = isPro;
        if (expiresAt) updates.subscription_expires_at = new Date(expiresAt);

        await user.update(updates);

        res.json({
            success: true,
            data: user,
            message: 'Subscription updated successfully'
        });
    } catch (error) {
        console.error('Adjust subscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to adjust subscription' });
    }
};

export const getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const [interestsSent, interestsReceived, messagesSent, messagesReceived, matches] = await Promise.all([
            Interest.count({ where: { from_user: id } }),
            Interest.count({ where: { to_user: id } }),
            Message.count({ where: { sender_id: id } }),
            Message.count({ where: { receiver_id: id } }),
            Match.count({ where: { [Op.or]: [{ user1: id }, { user2: id }] } })
        ]);

        res.json({
            success: true,
            data: {
                interestsSent,
                interestsReceived,
                messagesSent,
                messagesReceived,
                matches
            }
        });
    } catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user activity' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION QUEUE
// ═══════════════════════════════════════════════════════════════════════════

export const getPendingVerifications = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                is_deleted: false,
                is_verified: false,
                frontid_url: { [Op.ne]: null },
                backid_url: { [Op.ne]: null }
            },
            include: [{
                model: Profile,
                as: 'profile',
                attributes: ['name', 'gender', 'age', 'country', 'city']
            }],
            order: [['created_at', 'ASC']]
        });

        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Get pending verifications error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch pending verifications' });
    }
};

export const approveVerification = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const settings = await Setting.getAllSettings();
        const verificationBonus = settings?.free_credits_on_verification || 5;

        await user.update({
            is_verified: true,
            credits: user.credits + verificationBonus
        });

        res.json({
            success: true,
            message: 'Verification approved and credits added'
        });
    } catch (error) {
        console.error('Approve verification error:', error);
        res.status(500).json({ success: false, error: 'Failed to approve verification' });
    }
};

export const rejectVerification = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await user.update({
            frontid_url: null,
            backid_url: null
        });

        res.json({
            success: true,
            message: 'Verification rejected'
        });
    } catch (error) {
        console.error('Reject verification error:', error);
        res.status(500).json({ success: false, error: 'Failed to reject verification' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// PROFILES
// ═══════════════════════════════════════════════════════════════════════════

export const getProfiles = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            gender = '',
            country = '',
            completed = ''
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        if (gender) where.gender = gender;
        if (country) where.country = country;
        if (completed !== '') where.is_profile_completed = completed === 'true';

        const { count, rows } = await Profile.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'is_verified', 'is_pro', 'created_at'],
                where: { is_deleted: false }
            }],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                profiles: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get profiles error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch profiles' });
    }
};

export const getProfileDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await Profile.findByPk(id, {
            include: [
                { model: User, as: 'user' },
                { model: Preference, as: 'preference' }
            ]
        });

        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Get profile details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch profile details' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const profile = await Profile.findByPk(id);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        await profile.update(updates);

        res.json({
            success: true,
            data: profile,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
};

export const deleteProfilePhoto = async (req, res) => {
    try {
        const { id, index } = req.params;

        const profile = await Profile.findByPk(id);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        const images = JSON.parse(profile.images || '[]');
        if (index < 0 || index >= images.length) {
            return res.status(400).json({ success: false, error: 'Invalid photo index' });
        }

        images.splice(index, 1);
        await profile.update({ images: JSON.stringify(images) });

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        console.error('Delete profile photo error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete photo' });
    }
};

export const deleteProfileVideo = async (req, res) => {
    try {
        const { id, index } = req.params;

        const profile = await Profile.findByPk(id);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        const videos = JSON.parse(profile.videos || '[]');
        if (index < 0 || index >= videos.length) {
            return res.status(400).json({ success: false, error: 'Invalid video index' });
        }

        videos.splice(index, 1);
        await profile.update({ videos: JSON.stringify(videos) });

        res.json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Delete profile video error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete video' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// GUARDIANS
// ═══════════════════════════════════════════════════════════════════════════

export const getGuardians = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Guardian.findAndCountAll({
            include: [
                { model: User, as: 'individual', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'guardianUser', attributes: ['id', 'name', 'email'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                guardians: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get guardians error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch guardians' });
    }
};

export const getGuardianDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const guardian = await Guardian.findByPk(id, {
            include: [
                { model: User, as: 'individual', include: [{ model: Profile, as: 'profile' }] },
                { model: User, as: 'guardianUser', include: [{ model: Profile, as: 'profile' }] }
            ]
        });

        if (!guardian) {
            return res.status(404).json({ success: false, error: 'Guardian not found' });
        }

        res.json({ success: true, data: guardian });
    } catch (error) {
        console.error('Get guardian details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch guardian details' });
    }
};

export const removeGuardian = async (req, res) => {
    try {
        const { id } = req.params;

        const guardian = await Guardian.findByPk(id);
        if (!guardian) {
            return res.status(404).json({ success: false, error: 'Guardian not found' });
        }

        await guardian.destroy();

        res.json({
            success: true,
            message: 'Guardian removed successfully'
        });
    } catch (error) {
        console.error('Remove guardian error:', error);
        res.status(500).json({ success: false, error: 'Failed to remove guardian' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getSubscriptions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = '',
            planType = '',
            processor = ''
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) where.status = status;
        if (planType) where.plan_type = planType;
        if (processor) where.payment_processor = processor;

        const { count, rows } = await Subscription.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email'],
                where: { is_deleted: false }
            }],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                subscriptions: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch subscriptions' });
    }
};

export const getSubscriptionDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                include: [{ model: Profile, as: 'profile' }]
            }]
        });

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        res.json({ success: true, data: subscription });
    } catch (error) {
        console.error('Get subscription details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch subscription details' });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findByPk(id);
        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        await subscription.update({ status: 'canceled' });

        res.json({
            success: true,
            message: 'Subscription canceled successfully'
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to cancel subscription' });
    }
};

export const extendSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { days, credits = 0 } = req.body;

        if (!days || days <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid days' });
        }

        const subscription = await Subscription.findByPk(id);
        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        // Extend subscription end date
        const newEnd = new Date(subscription.current_period_end);
        newEnd.setDate(newEnd.getDate() + parseInt(days));
        await subscription.update({ current_period_end: newEnd });

        // Add credits to user if provided
        const creditsToAdd = parseInt(credits) || 0;
        if (creditsToAdd > 0) {
            await User.increment('credits', {
                by: creditsToAdd,
                where: { id: subscription.user_id },
            });
        }

        const parts = [`Subscription extended by ${days} days`];
        if (creditsToAdd > 0) parts.push(`${creditsToAdd} credits added`);

        res.json({
            success: true,
            data: subscription,
            message: parts.join(' · '),
        });
    } catch (error) {
        console.error('Extend subscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to extend subscription' });
    }
};
export const refundSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        // Mark subscription as canceled
        await subscription.update({ status: 'canceled' });

        // Remove pro status from user
        await subscription.user.update({ is_pro: false, subscription_expires_at: null });

        res.json({
            success: true,
            message: 'Subscription refunded successfully'
        });
    } catch (error) {
        console.error('Refund subscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to refund subscription' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = '',
            type = '',
            processor = ''
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) where.status = status;
        if (type) where.type = type;
        if (processor) where.payment_processor = processor;

        const { count, rows } = await Transaction.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email'],
                where: { is_deleted: false }
            }],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                transactions: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
    }
};

export const getTransactionDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                include: [{ model: Profile, as: 'profile' }]
            }]
        });

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        res.json({ success: true, data: transaction });
    } catch (error) {
        console.error('Get transaction details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transaction details' });
    }
};

export const refundTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        if (transaction.status !== 'succeeded') {
            return res.status(400).json({ success: false, error: 'Only succeeded transactions can be refunded' });
        }

        // Mark as failed (refunded)
        await transaction.update({ status: 'failed', description: 'Refunded by admin' });

        // Deduct credits from user
        const user = transaction.user;
        await user.update({ credits: Math.max(0, user.credits - transaction.credits_added) });

        res.json({
            success: true,
            message: 'Transaction refunded successfully'
        });
    } catch (error) {
        console.error('Refund transaction error:', error);
        res.status(500).json({ success: false, error: 'Failed to refund transaction' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// REFERRALS
// ═══════════════════════════════════════════════════════════════════════════

export const getReferrals = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Referral.findAndCountAll({
            include: [
                { model: User, as: 'referrer', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'referredUser', attributes: ['id', 'name', 'email'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                referrals: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch referrals' });
    }
};

export const getReferralStats = async (req, res) => {
    try {
        const [totalReferrals, totalCommission, totalCreditsGenerated] = await Promise.all([
            Referral.count(),
            Referral.sum('commission_earned') || 0,
            Referral.sum('credits_earned_by_referred') || 0
        ]);

        // Top referrers
        const topReferrers = await Referral.findAll({
            attributes: [
                'referrer_id',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'referral_count'],
                [db.sequelize.fn('SUM', db.sequelize.col('commission_earned')), 'total_commission']
            ],
            include: [{
                model: User,
                as: 'referrer',
                attributes: ['id', 'name', 'email']
            }],
            group: ['referrer_id'],
            order: [[db.sequelize.fn('SUM', db.sequelize.col('commission_earned')), 'DESC']],
            limit: 10,
            raw: false
        });

        res.json({
            success: true,
            data: {
                totalReferrals,
                totalCommission: parseFloat(totalCommission.toFixed(2)),
                totalCreditsGenerated: parseFloat(totalCreditsGenerated.toFixed(2)),
                topReferrers
            }
        });
    } catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch referral stats' });
    }
};

export const getReferralDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const referral = await Referral.findByPk(id, {
            include: [
                { model: User, as: 'referrer', include: [{ model: Profile, as: 'profile' }] },
                { model: User, as: 'referredUser', include: [{ model: Profile, as: 'profile' }] }
            ]
        });

        if (!referral) {
            return res.status(404).json({ success: false, error: 'Referral not found' });
        }

        res.json({ success: true, data: referral });
    } catch (error) {
        console.error('Get referral details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch referral details' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERESTS & MATCHES
// ═══════════════════════════════════════════════════════════════════════════

export const getInterests = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = ''
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) where.status = status;

        const { count, rows } = await Interest.findAndCountAll({
            where,
            include: [
                { model: User, as: 'fromUser', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'toUser', attributes: ['id', 'name', 'email'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                interests: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get interests error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch interests' });
    }
};

export const deleteInterest = async (req, res) => {
    try {
        const { id } = req.params;

        const interest = await Interest.findByPk(id);
        if (!interest) {
            return res.status(404).json({ success: false, error: 'Interest not found' });
        }

        await interest.destroy();

        res.json({
            success: true,
            message: 'Interest deleted successfully'
        });
    } catch (error) {
        console.error('Delete interest error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete interest' });
    }
};

// Add these methods to your admin.controller.js

export const getMatches = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = ''
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause for search
        let userWhere = {};
        if (search) {
            userWhere = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Get matches with user details
        const { count, rows } = await Match.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'user_one',
                    attributes: ['id', 'name', 'email', 'avatar_url', 'is_verified', 'is_pro'],
                    where: search ? userWhere : undefined,
                    required: search ? true : false
                },
                {
                    model: User,
                    as: 'user_two',
                    attributes: ['id', 'name', 'email', 'avatar_url', 'is_verified', 'is_pro'],
                    where: search ? userWhere : undefined,
                    required: search ? true : false
                }
            ],
            limit: parseInt(limit),
            offset: Number(offset),

            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                matches: rows,
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('❌ Get matches error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch matches'
        });
    }
};

export const deleteMatch = async (req, res) => {
    try {
        const { id } = req.params;

        const match = await Match.findByPk(id);
        if (!match) {
            return res.status(404).json({ success: false, error: 'Match not found' });
        }

        await match.destroy();

        res.json({
            success: true,
            message: 'Match deleted successfully'
        });
    } catch (error) {
        console.error('Delete match error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete match' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════════════════

export const getMessages = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where.message = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Message.findAndCountAll({
            where,
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatar_url'] },
                { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'avatar_url'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                messages: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Message.findByPk(id);
        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        await message.destroy();

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete message' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT REVEALS
// ═══════════════════════════════════════════════════════════════════════════

export const getContactReveals = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await ContactReveal.findAndCountAll({
            include: [
                { model: User, as: 'revealer', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'revealed', attributes: ['id', 'name', 'email'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [['revealed_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                contactReveals: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get contact reveals error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch contact reveals' });
    }
};

export const getContactRevealStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalReveals, todayReveals, phoneReveals, emailReveals, bothReveals] = await Promise.all([
            ContactReveal.count(),
            ContactReveal.count({ where: { revealed_at: { [Op.gte]: today } } }),
            ContactReveal.count({ where: { reveal_type: 'phone' } }),
            ContactReveal.count({ where: { reveal_type: 'email' } }),
            ContactReveal.count({ where: { reveal_type: 'both' } })
        ]);

        res.json({
            success: true,
            data: {
                totalReveals,
                todayReveals,
                byType: {
                    phone: phoneReveals,
                    email: emailReveals,
                    both: bothReveals
                }
            }
        });
    } catch (error) {
        console.error('Get contact reveal stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch contact reveal stats' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, userId = '', type = '' } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (userId) where.user_id = userId;
        if (type) where.type = type;

        const { count, rows } = await Notification.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                notifications: rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
};

export const sendNotification = async (req, res) => {
    try {
        const { userId, type, title, message, data } = req.body;

        if (!userId || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'userId, type, title, and message are required'
            });
        }

        const notification = await Notification.create({
            user_id: userId,
            type,
            title,
            message,
            data: data || null
        });

        res.json({
            success: true,
            data: notification,
            message: 'Notification sent successfully'
        });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ success: false, error: 'Failed to send notification' });
    }
};

export const broadcastNotification = async (req, res) => {
    try {
        const { type, title, message, data, filter = {} } = req.body;

        if (!type || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'type, title, and message are required'
            });
        }

        // Build user filter
        const userWhere = { is_deleted: false };
        if (filter.verified) userWhere.is_verified = true;
        if (filter.pro) userWhere.is_pro = true;
        if (filter.role) userWhere.role = filter.role;

        // Get all matching users
        const users = await User.findAll({
            where: userWhere,
            attributes: ['id']
        });

        // Create notifications for all users
        const notifications = users.map(user => ({
            user_id: user.id,
            type,
            title,
            message,
            data: data || null
        }));

        await Notification.bulkCreate(notifications);

        res.json({
            success: true,
            message: `Broadcast sent to ${users.length} users`
        });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        res.status(500).json({ success: false, error: 'Failed to broadcast notification' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.getAllSettings();

        if (!settings) {
            return res.status(404).json({
                success: false,
                error: 'Settings not found'
            });
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const updates = req.body;

        const row = await Setting.findOne({ order: [['id', 'ASC']] });
        if (row) {
            await row.update(updates);
        } else {
            await Setting.create(updates);
        }

        const settings = await Setting.getAllSettings();

        res.json({
            success: true,
            data: settings,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getOptions = async (req, res) => {
    try {
        const globalOptions = await Option.getGlobal();

        if (!globalOptions) {
            return res.status(404).json({
                success: false,
                error: 'Global options not found'
            });
        }

        res.json({
            success: true,
            data: globalOptions
        });
    } catch (error) {
        console.error('Get options error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch options' });
    }
};

export const updateGlobalOptions = async (req, res) => {
    try {
        const updates = req.body;

        const row = await Option.findOne({ where: { country: null } });
        if (row) {
            await row.update(updates);
        } else {
            await Option.create({ ...updates, country: null });
        }

        const globalOptions = await Option.getGlobal();

        res.json({
            success: true,
            data: globalOptions,
            message: 'Global options updated successfully'
        });
    } catch (error) {
        console.error('Update global options error:', error);
        res.status(500).json({ success: false, error: 'Failed to update global options' });
    }
};

export const getCountryOptions = async (req, res) => {
    try {
        const countries = await Option.getAllCountries();

        res.json({
            success: true,
            data: countries
        });
    } catch (error) {
        console.error('Get country options error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch country options' });
    }
};

export const updateCountryOptions = async (req, res) => {
    try {
        const { country } = req.params;
        const updates = req.body;

        const row = await Option.findOne({ where: { country } });
        if (row) {
            await row.update(updates);
        } else {
            await Option.create({ ...updates, country });
        }

        const countryOptions = await Option.getCountry(country);

        res.json({
            success: true,
            data: countryOptions,
            message: 'Country options updated successfully'
        });
    } catch (error) {
        console.error('Update country options error:', error);
        res.status(500).json({ success: false, error: 'Failed to update country options' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

export const getUserAnalytics = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Users by country
        const usersByCountry = await Profile.findAll({
            attributes: [
                'country',
                [db.sequelize.fn('COUNT', db.sequelize.col('Profile.id')), 'count']
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: [],
                where: { is_deleted: false }
            }],
            where: {
                country: { [Op.ne]: null }
            },
            group: ['country'],
            order: [[db.sequelize.fn('COUNT', db.sequelize.col('Profile.id')), 'DESC']],
            limit: 10,
            raw: true
        });

        // Users by gender
        const usersByGender = await Profile.findAll({
            attributes: [
                'gender',
                [db.sequelize.fn('COUNT', db.sequelize.col('Profile.id')), 'count']
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: [],
                where: { is_deleted: false }
            }],
            group: ['gender'],
            raw: true
        });

        // Verification rate
        const [totalUsers, verifiedUsers] = await Promise.all([
            User.count({ where: { is_deleted: false } }),
            User.count({ where: { is_deleted: false, is_verified: true } })
        ]);
        const verificationRate = totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : 0;

        res.json({
            success: true,
            data: {
                usersByCountry,
                usersByGender,
                verificationRate: Number(verificationRate)

            }
        });
    } catch (error) {
        console.error('Get user analytics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user analytics' });
    }
};

export const getRevenueAnalytics = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Revenue by plan
        const revenueByPlan = await Transaction.findAll({
            attributes: [
                [db.sequelize.fn('JSON_EXTRACT', db.sequelize.col('metadata'), '$.plan_type'), 'plan'],
                [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
            ],
            where: {
                status: 'succeeded',
                created_at: { [Op.gte]: startDate }
            },
            group: [db.sequelize.fn('JSON_EXTRACT', db.sequelize.col('metadata'), '$.plan_type')],
            raw: true
        });

        // Revenue by processor
        const revenueByProcessor = await Transaction.findAll({
            attributes: [
                'payment_processor',
                [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
            ],
            where: {
                status: 'succeeded',
                created_at: { [Op.gte]: startDate }
            },
            group: ['payment_processor'],
            raw: true
        });

        // Total revenue
        const totalRevenue = await Transaction.sum('amount', {
            where: {
                status: 'succeeded',
                created_at: { [Op.gte]: startDate }
            }
        }) || 0;

        // Average revenue per user
        const totalUsers = await User.count({
            where: {
                is_deleted: false,
                created_at: { [Op.gte]: startDate }
            }
        });
        const avgRevenuePerUser = totalUsers > 0 ? (totalRevenue / totalUsers).toFixed(2) : 0;

        res.json({
            success: true,
            data: {
                revenueByPlan,
                revenueByProcessor,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                avgRevenuePerUser: typeof avgRevenuePerUser === 'string' ? parseFloat(avgRevenuePerUser) : avgRevenuePerUser

            }
        });
    } catch (error) {
        console.error('Get revenue analytics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch revenue analytics' });
    }
};

export const getEngagementAnalytics = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Interests over time
        const interests = await Interest.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: startDate }
            },
            group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
            order: [[db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // Matches over time
        const matches = await Match.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: startDate }
            },
            group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
            order: [[db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // Messages over time
        const messages = await Message.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: startDate }
            },
            group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
            order: [[db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                interests,
                matches,
                messages
            }
        });
    } catch (error) {
        console.error('Get engagement analytics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch engagement analytics' });
    }
};

export const getReferralAnalytics = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Referrals over time
        const referralGrowth = await Referral.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: startDate }
            },
            group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
            order: [[db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // Commission paid over time
        const commissionPaid = await Referral.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
                [db.sequelize.fn('SUM', db.sequelize.col('commission_earned')), 'total']
            ],
            where: {
                created_at: { [Op.gte]: startDate }
            },
            group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
            order: [[db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                referralGrowth,
                commissionPaid
            }
        });
    } catch (error) {
        console.error('Get referral analytics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch referral analytics' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const exportUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { is_deleted: false },
            include: [{
                model: Profile,
                as: 'profile',
                attributes: ['gender', 'age', 'country', 'city']
            }],
            attributes: ['id', 'name', 'email', 'mobile', 'role', 'is_verified', 'is_pro', 'credits', 'created_at']
        });

        // Convert to CSV format
        const csv = [
            ['ID', 'Name', 'Email', 'Mobile', 'Role', 'Verified', 'Pro', 'Credits', 'Gender', 'Age', 'Country', 'City', 'Created At'].join(','),
            ...users.map(u => [
                u.id,
                u.name,
                u.email,
                u.mobile,
                u.role,
                u.is_verified,
                u.is_pro,
                u.credits,
                u.profile?.gender || '',
                u.profile?.age || '',
                u.profile?.country || '',
                u.profile?.city || '',
                u.created_at
            ].join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export users error:', error);
        res.status(500).json({ success: false, error: 'Failed to export users' });
    }
};

export const exportTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'email']
            }],
            order: [['created_at', 'DESC']]
        });

        const csv = [
            ['ID', 'User Name', 'User Email', 'Amount', 'Currency', 'Credits', 'Type', 'Status', 'Processor', 'Created At'].join(','),
            ...transactions.map(t => [
                t.id,
                t.user?.name || '',
                t.user?.email || '',
                t.amount,
                t.currency,
                t.credits_added,
                t.type,
                t.status,
                t.payment_processor,
                t.created_at
            ].join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export transactions error:', error);
        res.status(500).json({ success: false, error: 'Failed to export transactions' });
    }
};

export const exportReferrals = async (req, res) => {
    try {
        const referrals = await Referral.findAll({
            include: [
                { model: User, as: 'referrer', attributes: ['name', 'email'] },
                { model: User, as: 'referredUser', attributes: ['name', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });

        const csv = [
            ['ID', 'Referrer Name', 'Referrer Email', 'Referred Name', 'Referred Email', 'Credits Earned', 'Commission', 'Created At'].join(','),
            ...referrals.map(r => [
                r.id,
                r.referrer?.name || '',
                r.referrer?.email || '',
                r.referredUser?.name || '',
                r.referredUser?.email || '',
                r.credits_earned_by_referred,
                r.commission_earned,
                r.created_at
            ].join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=referrals.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export referrals error:', error);
        res.status(500).json({ success: false, error: 'Failed to export referrals' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN USER MANAGEMENT (SUPERADMIN ONLY)
// ═══════════════════════════════════════════════════════════════════════════

export const getAdmins = async (req, res) => {
    try {
        const admins = await User.findAll({
            where: {
                role: { [Op.in]: ['admin', 'staff'] },
                is_deleted: false
            },
            attributes: ['id', 'name', 'email', 'role', 'avatar_url', 'is_suspended', 'created_at'],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch admins' });
    }
};

export const createAdmin = async (req, res) => {
    try {
        const { name, email, password, role = 'staff' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required'
            });
        }

        if (!['admin', 'staff'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Role must be admin or staff'
            });
        }

        // Check if email exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create admin user
        const admin = await User.create({
            name,
            email,
            mobile: `admin_${Date.now()}`, // Dummy mobile since it's required
            password_hash,
            role,
            is_verified: true
        });

        res.json({
            success: true,
            data: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            },
            message: 'Admin created successfully'
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ success: false, error: 'Failed to create admin' });
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        const admin = await User.findByPk(id);
        if (!admin || !['admin', 'staff'].includes(admin.role)) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (role && ['admin', 'staff'].includes(role)) updates.role = role;
        if (password) updates.password_hash = await bcrypt.hash(password, 10);

        await admin.update(updates);

        res.json({
            success: true,
            data: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            },
            message: 'Admin updated successfully'
        });
    } catch (error) {
        console.error('Update admin error:', error);
        res.status(500).json({ success: false, error: 'Failed to update admin' });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await User.findByPk(id);
        if (!admin || !['admin', 'staff'].includes(admin.role)) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        await admin.update({ is_deleted: true });

        res.json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete admin' });
    }
};



// Get user complete details with profile, media, and linked users
export const getUserDetailsByAdmin = async (req, res) => {
    try {
        const userId = req.params.id;  // CORRECT
        console.log(userId);

        // Get user with profile
        const user = await User.findByPk(userId, {
            include: [{
                model: Profile,
                as: 'profile',
                required: false
            }],

        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found ' + userId
            });
        }

        const profile = user.profile || null;

        // Parse images and videos from JSON if they exist
        if (profile) {
            if (profile.images && typeof profile.images === 'string') {
                profile.images = JSON.parse(profile.images);
            }
            if (profile.videos && typeof profile.videos === 'string') {
                profile.videos = JSON.parse(profile.videos);
            }
        }

        // Get linked guardians (if user is individual)
        let guardians = [];
        if (user.role === 'individual') {
            const guardianLinks = await Guardian.findAll({
                where: { individual_id: userId },
                include: [{
                    model: User,
                    as: 'guardianUser', // Make sure this alias matches your Guardian model association

                }]
            });
            guardians = guardianLinks.map(link => link.guardian);
        }

        // Get linked wards (if user is guardian)  
        let wards = [];
        if (user.role === 'guardian') {
            const wardLinks = await Guardian.findAll({
                where: { guardian_id: userId },
                include: [{
                    model: User,
                    as: 'individual', // Make sure this alias matches your Guardian model association

                }]
            });
            wards = wardLinks.map(link => link.individual);
        }

        res.json({
            success: true,
            data: {
                user: user.toJSON(),
                profile: profile ? profile.toJSON() : null,
                guardians,
                wards
            }
        });

    } catch (error) {
        console.error('❌ Get user details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user details '
        });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profileData = req.body;

        // Find profile
        const profile = await Profile.findOne({
            where: { individual_id: userId }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        // Allowed fields to update (matching your Profile model)
        const allowedFields = [
            'name', 'gender', 'date_of_birth', 'age', 'marital_status',
            'country', 'city', 'nationality',
            'education', 'profession', 'employment_type', 'monthly_salary',
            'religion', 'sect', 'religious_practice_level', 'caste', 'mother_tongue',
            'height_inches', 'body_type',
            'has_children', 'willing_to_relocate', 'relationship',
            'bio', 'interests', 'family_background',
            'father_occupation', 'mother_occupation', 'brothers', 'sisters',
            'phone', 'contact_hidden',
            'is_guardian_required', 'is_blurred_images', 'is_show_last_seen',
            'notifications', 'email_updates'
        ];

        // Build update object with only allowed fields
        const updates = {};
        allowedFields.forEach(field => {
            if (profileData.hasOwnProperty(field)) {
                updates[field] = profileData[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        // Update profile
        await profile.update(updates);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: profile
        });

    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

// Delete user image
export const deleteUserImage = async (req, res) => {
    try {
        const { userId } = req.params;
        const { imageUrl } = req.body;

        // Find profile
        const profile = await Profile.findOne({
            where: { individual_id: userId }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        // Parse images array
        let images = profile.images ? JSON.parse(profile.images) : [];

        // Remove the image
        images = images.filter(img => img !== imageUrl);

        // Update profile
        await profile.update({
            images: JSON.stringify(images)
        });

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete image error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete image'
        });
    }
};

// Delete user video
export const deleteUserVideo = async (req, res) => {
    try {
        const { userId } = req.params;
        const { videoUrl } = req.body;

        // Find profile
        const profile = await Profile.findOne({
            where: { individual_id: userId }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        // Parse videos array
        let videos = profile.videos ? JSON.parse(profile.videos) : [];

        // Remove the video
        videos = videos.filter(vid => vid !== videoUrl);

        // Update profile
        await profile.update({
            videos: JSON.stringify(videos)
        });

        res.json({
            success: true,
            message: 'Video deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete video error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete video'
        });
    }
};

// Remove guardian link
export const removeGuardianByAdmin = async (req, res) => {
    try {
        const { userId, guardianId } = req.params;

        // Delete the guardian link
        await Guardian.destroy({
            where: {
                individual_id: userId,
                guardian_id: guardianId
            }
        });

        res.json({
            success: true,
            message: 'Guardian link removed successfully'
        });

    } catch (error) {
        console.error('❌ Remove guardian error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove guardian link'
        });
    }
};

// Remove ward link
export const removeWard = async (req, res) => {
    try {
        const { userId, wardId } = req.params;

        // Delete the ward link
        await Guardian.destroy({
            where: {
                guardian_id: userId,
                individual_id: wardId
            }
        });

        res.json({
            success: true,
            message: 'Ward link removed successfully'
        });

    } catch (error) {
        console.error('❌ Remove ward error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove ward link'
        });
    }
};

// UPDATED: server/controllers/meeting.controller.js

/**
 * Admin: Get all meetings with filters
 * - Super Admin: Sees ALL meetings
 * - Staff/Admin: Only sees meetings where platform_team_attending = true
 */
export const adminGetAllMeetings = async (req, res) => {
    try {
        const { status, from_date, to_date, user_id, page = 1, limit = 20 } = req.query;
        const adminRole = req.user.role; // From JWT token

        const whereClause = {};

        // ✅ Role-based filtering
        if (adminRole === 'staff' || adminRole === 'admin') {
            // Staff and Admin only see meetings they're moderating
            whereClause.platform_team_attending = true;
        }
        // Super Admin sees all meetings (no additional filter)

        // ✅ Hide expired meetings - only show future or ongoing meetings
        const now = new Date();
        whereClause.meeting_datetime = {
            [Op.gte]: now  // Only meetings >= current time
        };

        // Filter by status
        if (status && status !== 'all') {
            whereClause.status = status;
        }

        // Filter by date range (override the default future filter if provided)
        if (from_date && to_date) {
            // @ts-ignore
            whereClause.meeting_datetime = {
                [Op.between]: [new Date(from_date), new Date(to_date)]
            };
        } else if (from_date) {
            // @ts-ignore
            whereClause.meeting_datetime = {
                [Op.and]: [
                    { [Op.gte]: new Date(from_date) },
                    { [Op.gte]: now }  // Still enforce future filter
                ]
            };
        } else if (to_date) {
            // @ts-ignore
            whereClause.meeting_datetime = {
                [Op.and]: [
                    { [Op.lte]: new Date(to_date) },
                    { [Op.gte]: now }  // Still enforce future filter
                ]
            };
        }

        // Filter by user (either participant)
        if (user_id) {
            whereClause[Op.or] = [
                { user1_id: user_id },
                { user2_id: user_id }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: meetings } = await Meeting.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'user1', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'user2', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'user1Guardian', attributes: ['id', 'name', 'email'], required: false },
                { model: User, as: 'user2Guardian', attributes: ['id', 'name', 'email'], required: false }
            ],
            order: [['meeting_datetime', 'ASC']],  // ✅ Changed to ASC (earliest first)
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            success: true,
            data: meetings,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(count / parseInt(limit))
            },
            role_info: {
                role: adminRole,
                viewing: adminRole === 'super_admin' ? 'all_meetings' : 'moderated_meetings_only'
            }
        });

    } catch (error) {
        console.error('Admin get all meetings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meetings'
        });
    }
};
/**
 * Admin: Get meeting statistics
 * - Super Admin: Stats for ALL meetings
 * - Staff/Admin: Stats for moderated meetings only
 */
export const adminGetMeetingStats = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const adminRole = req.user.role;

        // ✅ Base filter for role
        const roleFilter = {};
        if (adminRole === 'staff' || adminRole === 'admin') {
            roleFilter.platform_team_attending = true;
        }

        // Total meetings
        const totalMeetings = await Meeting.count({ where: roleFilter });

        // Meetings by status
        const proposed = await Meeting.count({
            where: { ...roleFilter, status: 'proposed' }
        });
        const confirmed = await Meeting.count({
            where: { ...roleFilter, status: 'confirmed' }
        });
        const completed = await Meeting.count({
            where: { ...roleFilter, status: 'completed' }
        });
        const cancelled = await Meeting.count({
            where: { ...roleFilter, status: 'cancelled' }
        });

        // Upcoming meetings
        const upcoming = await Meeting.count({
            where: {
                ...roleFilter,
                status: {
                    [Op.in]: ['proposed', 'confirmed']
                },
                meeting_datetime: {
                    [Op.gt]: now
                }
            }
        });

        // Meetings in last 30 days
        const recentMeetings = await Meeting.count({
            where: {
                ...roleFilter,
                created_at: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        // Meetings with platform team (always 100% for staff/admin)
        const withPlatformTeam = await Meeting.count({
            where: { ...roleFilter, platform_team_attending: true }
        });

        // Meetings with guardians
        const withGuardians = await Meeting.count({
            where: {
                ...roleFilter,
                [Op.or]: [
                    { user1_guardian_attending: true },
                    { user2_guardian_attending: true }
                ]
            }
        });

        res.json({
            success: true,
            data: {
                total: totalMeetings,
                by_status: {
                    proposed,
                    confirmed,
                    completed,
                    cancelled
                },
                upcoming,
                recent_30_days: recentMeetings,
                with_platform_team: withPlatformTeam,
                with_guardians: withGuardians
            },
            role_info: {
                role: adminRole,
                scope: adminRole === 'super_admin' ? 'all_meetings' : 'moderated_meetings_only'
            }
        });

    } catch (error) {
        console.error('Admin get meeting stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meeting statistics'
        });
    }
};

/**
 * Admin: Update meeting status
 * - Super Admin: Can update ANY meeting
 * - Staff/Admin: Can only update meetings they're moderating
 */
export const adminUpdateMeetingStatus = async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const { status, admin_notes } = req.body;
        const adminRole = req.user.role;

        const whereClause = { id: meeting_id };

        // ✅ Staff/Admin can only update their moderated meetings
        if (adminRole === 'staff' || adminRole === 'admin') {
            whereClause.platform_team_attending = true;
        }

        const meeting = await Meeting.findOne({ where: whereClause });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: adminRole === 'super_admin'
                    ? 'Meeting not found'
                    : 'Meeting not found or you are not a moderator'
            });
        }

        meeting.status = status;
        if (admin_notes) {
            meeting.admin_notes = admin_notes;
        }

        await meeting.save();

        res.json({
            success: true,
            data: meeting,
            message: 'Meeting status updated successfully'
        });

    } catch (error) {
        console.error('Admin update meeting status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update meeting status'
        });
    }
};

/**
 * Admin: Delete meeting
 * - Super Admin: Can delete ANY meeting
 * - Staff/Admin: Can only delete meetings they're moderating
 */
export const adminDeleteMeeting = async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const adminRole = req.user.role;

        const whereClause = { id: meeting_id };

        // ✅ Staff/Admin can only delete their moderated meetings
        if (adminRole === 'staff' || adminRole === 'admin') {
            whereClause.platform_team_attending = true;
        }

        const meeting = await Meeting.findOne({ where: whereClause });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: adminRole === 'super_admin'
                    ? 'Meeting not found'
                    : 'Meeting not found or you are not a moderator'
            });
        }

        await meeting.destroy();

        res.json({
            success: true,
            message: 'Meeting deleted successfully'
        });

    } catch (error) {
        console.error('Admin delete meeting error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete meeting'
        });
    }
};