// controllers/interest.controller.js

const db = require('../models');
const { User, Profile, Interest, Match, Guardian } = db;
const { Op } = require('sequelize');
const {
    notifyInterestReceived,
    notifyInterestAccepted,
    notifyInterestDeclined,
    notifyInterestCancelled,
    notifyInterestCount,
    notifyNewMatch,
    notifyGuardianPendingCount,
} = require('../config/socket');

// ── Helper: pending count for receiver ───────────────────────
const pushInterestCount = async (toUserId) => {
    const count = await Interest.count({
        where: { to_user: toUserId, status: 'pending' },
    });
    notifyInterestCount(toUserId, count);
};

// ── Helper: guardian pending count ───────────────────────────
const pushGuardianPendingCount = async (guardianUserId) => {
    const guardianRows = await Guardian.findAll({
        where: { guardian_id: guardianUserId },
        attributes: ['individual_id'],
    });
    const wardIds = guardianRows.map(g => g.individual_id);
    if (!wardIds.length) return;

    const count = await Interest.count({
        where: {
            to_user: { [Op.in]: wardIds },
            status: 'pending',
            guardian_approved: null,
        },
    });
    notifyGuardianPendingCount(guardianUserId, count);
};

// ── Helper: get guardian of a user ───────────────────────────
const getGuardianOf = async (userId) => {
    const row = await Guardian.findOne({
        where: { individual_id: userId },
        attributes: ['guardian_id'],
    });
    return row?.guardian_id || null;
};

// ── Profile include — uses "images" not "avatar" ──────────────
const profileInclude = [
    { model: Profile, as: 'fromProfile', attributes: ['individual_id', 'name', 'images', 'age', 'city', 'country'] },
    { model: Profile, as: 'toProfile', attributes: ['individual_id', 'name', 'images', 'age', 'city', 'country'] },
];

// ─────────────────────────────────────────────────────────────
// POST /interest/send-interest
// body: { interestId (= to_user), isSuperLike }
// ─────────────────────────────────────────────────────────────
exports.sendInterest = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const { interestId, isSuperLike = false } = req.body; // interestId = to_user profile/user id

        if (!interestId)
            return res.status(400).json({ success: false, message: 'interestId is required' });

        const toUserId = Number(interestId);

        // Check duplicate
        const existing = await Interest.findOne({
            where: {
                from_user: fromUserId,
                to_user: toUserId,
                status: { [Op.in]: ['pending', 'accepted'] },
            },
        });
        if (existing)
            return res.status(409).json({ success: false, message: 'Interest already sent' });

        // Interest table has NO message field — only: from_user, to_user, status, is_super_like, is_mutual
        const interest = await Interest.create({
            from_user: fromUserId,
            to_user: toUserId,
            status: 'pending',
            is_super_like: isSuperLike,
            is_mutual: false,
        });

        const senderProfile = await Profile.findOne({
            where: { individual_id: fromUserId },
            attributes: ['name', 'images'],
        });

        // 🔔 Notify receiver
        notifyInterestReceived(toUserId, {
            interest_id: interest.id,
            sender_id: fromUserId,
            sender_name: senderProfile?.name || '',
            sender_avatar: senderProfile?.images ? senderProfile.images[0] : null,
        });

        // 🔢 Update receiver badge
        await pushInterestCount(toUserId);

        // 🕌 Update guardian badge
        const guardianId = await getGuardianOf(toUserId);
        if (guardianId) await pushGuardianPendingCount(guardianId);

        return res.status(201).json({ success: true, data: interest });
    } catch (err) {
        console.error('sendInterest error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /interest/cancel-interest
// body: { interestId }
// ─────────────────────────────────────────────────────────────
exports.cancelInterest = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findOne({
            where: { id: Number(interestId), from_user: fromUserId },
        });
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        await interest.update({ status: 'cancelled' });

        notifyInterestCancelled(interest.to_user, {
            interest_id: interest.id,
            cancelled_by: fromUserId,
        });

        await pushInterestCount(interest.to_user);
        const guardianId = await getGuardianOf(interest.to_user);
        if (guardianId) await pushGuardianPendingCount(guardianId);

        return res.json({ success: true, message: 'Interest cancelled' });
    } catch (err) {
        console.error('cancelInterest error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /interest/accept-interest
// body: { interestId }
// ─────────────────────────────────────────────────────────────
exports.acceptInterest = async (req, res) => {
    try {
        const toUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findOne({
            where: { id: Number(interestId), to_user: toUserId, status: 'pending' },
            include: profileInclude,
        });
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        await interest.update({ status: 'accepted', is_mutual: true });

        // Match table: only user1, user2 — NO interest_id
        const match = await Match.create({
            interest_id: interest.get('id'),
            user1: interest.from_user,
            user2: toUserId,
        });

        notifyInterestAccepted(interest.from_user, {
            interest_id: interest.id,
            accepted_by_id: toUserId,
            accepted_by_name: interest.toProfile?.name || '',
            accepted_by_avatar: interest.toProfile?.images ? interest.toProfile.images[0] : null,
        });

        notifyNewMatch(interest.from_user, toUserId, {
            match_id: match.id,
            user1_name: interest.fromProfile?.name,
            user1_avatar: interest.fromProfile?.images ? interest.fromProfile.images[0] : null,
            user2_name: interest.toProfile?.name,
            user2_avatar: interest.toProfile?.images ? interest.toProfile.images[0] : null,
        });

        await pushInterestCount(toUserId);
        const guardianId = await getGuardianOf(toUserId);
        if (guardianId) await pushGuardianPendingCount(guardianId);

        return res.json({ success: true, message: 'Interest accepted', data: match });
    } catch (err) {
        console.error('acceptInterest error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /interest/decline-interest
// body: { interestId }
// ─────────────────────────────────────────────────────────────
exports.declineInterest = async (req, res) => {
    try {
        const toUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findOne({
            where: { id: Number(interestId), to_user: toUserId, status: 'pending' },
            include: [{ model: Profile, as: 'toProfile', attributes: ['name'] }],
        });
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        await interest.update({ status: 'declined' });

        notifyInterestDeclined(interest.from_user, {
            interest_id: interest.id,
            declined_by_id: toUserId,
            declined_by_name: interest.toProfile?.name || '',
        });

        await pushInterestCount(toUserId);
        const guardianId = await getGuardianOf(toUserId);
        if (guardianId) await pushGuardianPendingCount(guardianId);

        return res.json({ success: true, message: 'Interest declined' });
    } catch (err) {
        console.error('declineInterest error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /interest/dislike
// body: { interestId }
// ─────────────────────────────────────────────────────────────
exports.sendDislike = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findOne({
            where: { id: Number(interestId) },
        });
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        await interest.update({ status: 'declined' });

        notifyInterestDeclined(interest.from_user, {
            interest_id: interest.id,
            declined_by_id: fromUserId,
            declined_by_name: '',
        });

        await pushInterestCount(interest.to_user);

        return res.json({ success: true, message: 'Disliked' });
    } catch (err) {
        console.error('sendDislike error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /interest/get-interests
// ─────────────────────────────────────────────────────────────
exports.getInterests = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id },
            include: [{ as: 'profile', model: Profile }]
        });

        // ── Null check ─────────────────────────────────────────────────────
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // ── Fetch interests ────────────────────────────────────────────────
        const [sentInterests, receivedInterests, matches] = await Promise.all([
            user.getInterestsSent({
                where: { status: 'pending' },
                include: [{ model: Profile, as: 'toProfile' }]
            }),
            user.getInterestsReceived({
                where: { status: 'pending' },
                include: [{ model: Profile, as: 'fromProfile' }]
            }),
            Interest.findAll({
                where: {
                    status: 'accepted',
                    [Op.or]: [
                        { from_user: req.user.id },
                        { to_user: req.user.id }
                    ]
                },
                include: [
                    { model: Profile, as: 'toProfile' },
                    { model: Profile, as: 'fromProfile' }
                ]
            })
        ]);

        // ── Counts ─────────────────────────────────────────────────────────
        const [likesSentCount, likesReceivedCount, matchesCount] = await Promise.all([
            Interest.count({ where: { from_user: req.user.id } }),
            Interest.count({ where: { to_user: req.user.id } }),
            Interest.count({
                where: {
                    status: 'accepted',
                    [Op.or]: [
                        { from_user: req.user.id },
                        { to_user: req.user.id }
                    ]
                }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                sent: sentInterests,
                received: receivedInterests,
                matches
            },
            counts: {
                likes_sent: likesSentCount,
                likes_received: likesReceivedCount,
                matches: matchesCount
            }
        });

    } catch (err) {
        console.error('getInterests error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /interest/pending-count
// ─────────────────────────────────────────────────────────────
exports.getPendingCount = async (req, res) => {
    try {
        const count = await Interest.count({
            where: { to_user: req.user.id, status: 'pending' },
        });
        return res.json({ success: true, data: { count } });
    } catch (err) {
        console.error('getPendingCount error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// Aliases
exports.getallInterests = exports.getInterests;
exports.pendingCount = exports.getPendingCount;
