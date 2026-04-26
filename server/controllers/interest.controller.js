// @ts-nocheck
// controllers/interest.controller.js
// Uses the full interests table schema:
// from_guardian, from_guardian_status, to_guardian, to_guardian_status,
// both_guardians_approved, both_users_approved, is_mutual

import db from '../models/index.js';
const { User, Profile, Interest, Match, Guardian } = db;
import { Op } from 'sequelize';
import {
    notifyInterestReceived,
    notifyInterestAccepted,
    notifyInterestDeclined,
    notifyInterestCancelled,
    notifyInterestCount,
    notifyNewMatch,
    notifyGuardianPendingCount,
} from '../config/socket.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// Push updated pending count to the receiver
const pushInterestCount = async (toUserId) => {
    const count = await Interest.count({
        where: { to_user: toUserId, status: 'pending' },
    });
    notifyInterestCount(toUserId, count);
};

// Push guardian pending count to a guardian user
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
            to_guardian_status: 'pending',
        },
    });
    notifyGuardianPendingCount(guardianUserId, count);
};

// Get guardian_id of a user (returns null if none)
const getGuardianIdOf = async (userId) => {
    const row = await Guardian.findOne({
        where: { individual_id: userId },
        attributes: ['guardian_id'],
    });
    return row?.guardian_id || null;
};

// Profile fields to include in responses
const profileAttrs = ['individual_id', 'name', 'images', 'age', 'city', 'country', 'profession', 'education'];

const profileInclude = [
    { model: Profile, as: 'fromProfile', attributes: profileAttrs },
    { model: Profile, as: 'toProfile', attributes: profileAttrs },
];

// Check if interest is fully approved (both guardians + both users)
const checkFullApproval = async (interest) => {
    const fromGuardianOk = !interest.from_guardian || interest.from_guardian_status === 'accepted';
    const toGuardianOk = !interest.to_guardian || interest.to_guardian_status === 'accepted';
    return fromGuardianOk && toGuardianOk;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /interest/send
// ─────────────────────────────────────────────────────────────────────────────
export const sendInterest = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const { interestId, isSuperLike = false } = req.body;

        if (!interestId)
            return res.status(400).json({ success: false, message: 'interestId is required' });

        const toUserId = Number(interestId);

        if (fromUserId === toUserId)
            return res.status(400).json({ success: false, message: 'Cannot send interest to yourself' });

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

        // ── Get guardians of both users ───────────────────────────────────
        const [fromGuardianId, toGuardianId] = await Promise.all([
            getGuardianIdOf(fromUserId),
            getGuardianIdOf(toUserId),
        ]);

        // ── Create interest with guardian info ────────────────────────────
        const interest = await Interest.create({
            from_user: fromUserId,
            to_user: toUserId,
            status: 'pending',
            is_super_like: isSuperLike,
            is_mutual: false,
            both_users_approved: false,
            both_guardians_approved: false,
            // Guardian fields
            from_guardian: fromGuardianId || null,
            from_guardian_status: fromGuardianId ? 'pending' : 'accepted', // no guardian = auto accepted
            to_guardian: toGuardianId || null,
            to_guardian_status: toGuardianId ? 'pending' : 'accepted', // no guardian = auto accepted
        });

        // ── Notify receiver ───────────────────────────────────────────────
        const senderProfile = await Profile.findOne({
            where: { individual_id: fromUserId },
            attributes: ['name', 'images'],
        });

        notifyInterestReceived(toUserId, {
            interest_id: interest.id,
            sender_id: fromUserId,
            sender_name: senderProfile?.name || '',
            sender_avatar: senderProfile?.images ? JSON.parse(senderProfile.images || '[]')[0] : null,
        });

        await pushInterestCount(toUserId);

        // ── Notify guardian of receiver ───────────────────────────────────
        if (toGuardianId) await pushGuardianPendingCount(toGuardianId);

        return res.status(201).json({ success: true, data: interest });

    } catch (err) {
        console.error('sendInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /interest/cancel
// ─────────────────────────────────────────────────────────────────────────────
export const cancelInterest = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findOne({
            where: { id: Number(interestId), from_user: fromUserId },
        });
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        await interest.update({ status: 'declined' });

        notifyInterestCancelled(interest.to_user, {
            interest_id: interest.id,
            cancelled_by: fromUserId,
        });

        await pushInterestCount(interest.to_user);
        if (interest.to_guardian) await pushGuardianPendingCount(interest.to_guardian);

        return res.json({ success: true, message: 'Interest cancelled' });

    } catch (err) {
        console.error('cancelInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /interest/accept   (called by the RECEIVER / to_user)
// ─────────────────────────────────────────────────────────────────────────────
export const acceptInterest = async (req, res) => {
    try {
        const toUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findOne({
            where: { id: Number(interestId), to_user: toUserId, status: 'pending' },
            include: profileInclude,
        });
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        // ── Mark both_users_approved ──────────────────────────────────────
        const guardiansOk = await checkFullApproval(interest);

        await interest.update({
            both_users_approved: true,
            status: guardiansOk ? 'accepted' : 'pending', // only accept if guardians also ok
            is_mutual: guardiansOk,
            both_guardians_approved: guardiansOk,
        });

        // ── Create match only if fully approved ───────────────────────────
        if (guardiansOk) {
            const match = await Match.create({
                interest_id: interest.id,
                user1: interest.from_user,
                user2: toUserId,
            });

            notifyInterestAccepted(interest.from_user, {
                interest_id: interest.id,
                accepted_by_id: toUserId,
                accepted_by_name: interest.toProfile?.name || '',
                accepted_by_avatar: interest.toProfile?.images
                    ? JSON.parse(interest.toProfile.images || '[]')[0] : null,
            });

            notifyNewMatch(interest.from_user, toUserId, {
                match_id: match.id,
                user1_name: interest.fromProfile?.name,
                user2_name: interest.toProfile?.name,
            });

            return res.json({ success: true, message: 'Interest accepted — match created!', data: match });
        }

        // Waiting for guardian approval
        return res.json({
            success: true,
            message: 'You accepted — waiting for guardian approval',
            data: interest,
        });

    } catch (err) {
        console.error('acceptInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /interest/decline   (called by the RECEIVER / to_user)
// ─────────────────────────────────────────────────────────────────────────────
export const declineInterest = async (req, res) => {
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
        if (interest.to_guardian) await pushGuardianPendingCount(interest.to_guardian);

        return res.json({ success: true, message: 'Interest declined' });

    } catch (err) {
        console.error('declineInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};





// ─────────────────────────────────────────────────────────────────────────────
// GET /interest/all   — sent, received, matches
// ─────────────────────────────────────────────────────────────────────────────
export const getInterests = async (req, res) => {
    try {
        const userId = req.user.id;

        const [sent, received, matches] = await Promise.all([
            // Sent by me
            Interest.findAll({
                where: { from_user: userId },
                include: [{ model: Profile, as: 'toProfile', attributes: profileAttrs }],
                order: [['created_at', 'DESC']],
            }),
            // Received by me
            Interest.findAll({
                where: { to_user: userId, status: 'pending' },
                include: [{ model: Profile, as: 'fromProfile', attributes: profileAttrs }],
                order: [['created_at', 'DESC']],
            }),
            // Matches (accepted)
            Interest.findAll({
                where: {
                    status: 'accepted',
                    [Op.or]: [{ from_user: userId }, { to_user: userId }],
                },
                include: profileInclude,
                order: [['created_at', 'DESC']],
            }),
        ]);

        return res.json({
            success: true,
            data: { sent, received, matches },
            counts: {
                sent: sent.length,
                received: received.length,
                matches: matches.length,
            },
        });

    } catch (err) {
        console.error('getInterests error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};






// ─────────────────────────────────────────────────────────────────────────────
// GET /interest/pending-count
// ─────────────────────────────────────────────────────────────────────────────
export const getPendingCount = async (req, res) => {
    try {
        const count = await Interest.count({
            where: { to_user: req.user.id, status: 'pending' },
        });
        return res.json({ success: true, data: { count } });
    } catch (err) {
        console.error('getPendingCount error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Aliases for backward compat
// ─────────────────────────────────────────────────────────────────────────────
export const sendDislike = declineInterest;
export const getallInterests = getInterests;
export const pendingCount = getPendingCount;

export default {
    sendInterest,
    cancelInterest,
    acceptInterest,
    declineInterest,
    sendDislike,
    getInterests,
    getallInterests,
    getPendingCount,
    pendingCount,
};