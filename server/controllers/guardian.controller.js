// @ts-nocheck
// controllers/guardian.controller.js

import db from '../models/index.js';
const { User, Profile, Interest, Guardian } = db;
import { Op } from 'sequelize';
import {
    notifyGuardianAssigned,
    notifyGuardianRemoved,
    notifyGuardianApproved,
    notifyGuardianRejected,
    notifyGuardianPendingCount,
    notifyInterestReceived,
    notifyInterestCount,
} from '../config/socket.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
};
// Profile fields to include in responses
const profileAttrs = ['individual_id', 'name', 'images', 'age', 'city', 'country', 'profession', 'education'];

const profileInclude = [
    { model: Profile, as: 'fromProfile', attributes: profileAttrs },
    { model: Profile, as: 'toProfile', attributes: profileAttrs },
];

const pushGuardianPendingCount = async (guardianUserId) => {
    const wardRows = await Guardian.findAll({
        where: { guardian_id: guardianUserId },
        attributes: ['individual_id'],
    });
    const wardIds = wardRows.map(g => g.individual_id);
    if (!wardIds.length) return;
    const count = await Interest.count({
        where: { to_user: { [Op.in]: wardIds }, status: 'pending', to_guardian_status: 'pending' },
    });
    notifyGuardianPendingCount(guardianUserId, count);
};

// ── Individual (ward) methods ─────────────────────────────────────────────────
export const searchGuardians = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: 'Query required' });

        const guardians = await User.findAll({
            where: {
                role: 'guardian',
                [Op.or]: [
                    { email: { [Op.like]: `%${q}%` } },
                    { mobile: { [Op.like]: `%${q}%` } },
                ],
            },
            attributes: ['id', 'email', 'mobile', 'role'],
            include: [{ model: Profile, as: 'profile', attributes: ['name', 'images', 'city', 'country'] }],
            limit: 20,
        });

        return res.json({ success: true, data: guardians });
    } catch (err) {
        console.error('searchGuardians error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const assignGuardian = async (req, res) => {
    try {
        const individualId = req.user.id;
        const { guardianUserId, relationship } = req.body;

        if (!guardianUserId)
            return res.status(400).json({ success: false, message: 'guardianUserId required' });

        const guardian = await User.findOne({
            where: { id: guardianUserId, role: 'guardian' },
            attributes: ['id', 'email'],
        });
        if (!guardian)
            return res.status(404).json({ success: false, message: 'Guardian not found' });

        const [row, created] = await Guardian.findOrCreate({
            where: { individual_id: individualId },
            defaults: { individual_id: individualId, guardian_id: guardianUserId, relationship },
        });
        if (!created) await row.update({ guardian_id: guardianUserId, relationship });

        const wardProfile = await Profile.findOne({
            where: { individual_id: individualId },
            attributes: ['name', 'images'],
        });
        const wardImages = parseImages(wardProfile?.images);

        notifyGuardianAssigned(guardianUserId, {
            ward_id: individualId,
            ward_name: wardProfile?.name || '',
            ward_avatar: wardImages[0] || null,
        });

        return res.json({ success: true, message: 'Guardian assigned' });
    } catch (err) {
        console.error('assignGuardian error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getMyGuardian = async (req, res) => {
    try {
        const row = await Guardian.findOne({
            where: { individual_id: req.user.id },
            include: [{
                model: User,
                as: 'guardian',
                attributes: ['id', 'email', 'mobile', 'role', 'is_online'],
                include: [{ model: Profile, as: 'profile', attributes: ['name', 'images', 'city', 'country'] }],
            }],
        });
        return res.json({ success: true, data: row || null });
    } catch (err) {
        console.error('getMyGuardian error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const removeGuardian = async (req, res) => {
    try {
        const individualId = req.user.id;
        const row = await Guardian.findOne({ where: { individual_id: individualId } });
        if (!row) return res.status(400).json({ success: false, message: 'No guardian assigned' });

        const guardianId = row.guardian_id;
        const wardProfile = await Profile.findOne({ where: { individual_id: individualId }, attributes: ['name'] });

        await row.destroy();

        notifyGuardianRemoved(guardianId, { ward_id: individualId, ward_name: wardProfile?.name || '' });

        return res.json({ success: true, message: 'Guardian removed' });
    } catch (err) {
        console.error('removeGuardian error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Guardian methods ──────────────────────────────────────────────────────────
export const getMyWards = async (req, res) => {
    try {
        const guardianId = req.user.id;
        const wards = await Guardian.findAll({
            where: { guardian_id: guardianId },
            include: [{
                model: User,
                as: 'individual',
                attributes: ['id', 'email', 'mobile', 'is_online'],
                include: [{ model: Profile, as: 'profile', attributes: ['name', 'images', 'city', 'country', 'age'] }],
            }],
        });
        return res.json({ success: true, data: wards });
    } catch (err) {
        console.error('getMyWards error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const addWard = async (req, res) => {
    try {
        const { wardUserId, relationship } = req.body;
        if (!wardUserId) return res.status(400).json({ success: false, message: 'wardUserId required' });

        const existing = await Guardian.findOne({
            where: { individual_id: wardUserId, guardian_id: req.user.id },
        });
        if (existing) return res.status(409).json({ success: false, message: 'Already managing this ward' });

        const ward = await Guardian.create({
            individual_id: wardUserId,
            guardian_id: req.user.id,
            relationship,
        });
        return res.json({ success: true, data: ward });
    } catch (err) {
        console.error('addWard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const removeWard = async (req, res) => {
    try {
        const { wardUserId } = req.body;
        if (!wardUserId) return res.status(400).json({ success: false, message: 'wardUserId required' });

        await Guardian.destroy({ where: { individual_id: wardUserId, guardian_id: req.user.id } });
        return res.json({ success: true, message: 'Ward removed' });
    } catch (err) {
        console.error('removeWard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const searchWards = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: 'Query required' });

        const users = await User.findAll({
            where: { role: 'individual' },
            attributes: ['id', 'email', 'mobile'],
            include: [{
                model: Profile,
                as: 'profile',
                where: { name: { [Op.like]: `%${q}%` } },
                attributes: ['name', 'images', 'city', 'country'],
                required: true,
            }],
            limit: 20,
        });
        return res.json({ success: true, data: users });
    } catch (err) {
        console.error('searchWards error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getPendingCount = async (req, res) => {
    try {
        const guardianRows = await Guardian.findAll({
            where: { guardian_id: req.user.id },
            attributes: ['individual_id'],
        });
        const wardIds = guardianRows.map(g => g.individual_id);
        const count = wardIds.length
            ? await Interest.count({ where: { to_user: { [Op.in]: wardIds }, status: 'pending' } })
            : 0;
        return res.json({ success: true, data: { count } });
    } catch (err) {
        console.error('getPendingCount error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Legacy methods (kept for backward compat) ─────────────────────────────────
export const assignChildren = async (req, res) => {
    try {
        const guardianId = req.user.id;
        const { ward_ids } = req.body;
        if (!Array.isArray(ward_ids) || !ward_ids.length)
            return res.status(400).json({ success: false, message: 'ward_ids array required' });

        await Promise.all(ward_ids.map(async (wardId) => {
            const [row, created] = await Guardian.findOrCreate({
                where: { individual_id: wardId },
                defaults: { individual_id: wardId, guardian_id: guardianId },
            });
            if (!created) await row.update({ guardian_id: guardianId });
        }));

        return res.json({ success: true, message: 'Wards assigned' });
    } catch (err) {
        console.error('assignChildren error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// GET /guardian/pending-interests  — for guardian dashboard
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// POST /guardian/reject-interest   (called by GUARDIAN)
// ─────────────────────────────────────────────────────────────────────────────
export const guardianRejectInterest = async (req, res) => {
    try {
        const guardianUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findByPk(Number(interestId));
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        // ✅ Look up via Guardian table
        const [fromGuardianRow, toGuardianRow] = await Promise.all([
            interest.from_user ? Guardian.findOne({ where: { individual_id: interest.from_user, guardian_id: guardianUserId } }) : null,
            interest.to_user ? Guardian.findOne({ where: { individual_id: interest.to_user, guardian_id: guardianUserId } }) : null,
        ]);

        const isFromGuardian = !!fromGuardianRow;
        const isToGuardian = !!toGuardianRow;

        if (!isFromGuardian && !isToGuardian)
            return res.status(403).json({ success: false, message: 'You are not a guardian for this interest' });

        // One guardian rejection kills the interest
        await interest.update({
            status: 'declined',
            both_guardians_approved: false,
            ...(isFromGuardian ? { from_guardian_status: 'declined' } : { to_guardian_status: 'declined' }),
        });

        notifyInterestDeclined(interest.from_user, {
            interest_id: interest.id,
            declined_by_id: guardianUserId,
            declined_by_name: 'Guardian',
        });

        await pushGuardianPendingCount(guardianUserId);

        return res.json({ success: true, message: 'Interest rejected by guardian' });

    } catch (err) {
        console.error('guardianRejectInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};
export const getGuardianPendingInterests = async (req, res) => {
    try {
        const guardianUserId = req.user.id;

        // Find all wards this guardian manages
        const guardianRows = await Guardian.findAll({
            where: { guardian_id: guardianUserId },
            attributes: ['individual_id'],
        });
        const wardIds = guardianRows.map(g => g.individual_id);

        if (!wardIds.length)
            return res.json({ success: true, data: [] });

        // Find all interests where guardian is involved
        const interests = await Interest.findAll({
            where: {
                [Op.or]: [
                    // Guardian is from_guardian
                    {
                        from_guardian: guardianUserId,
                        from_guardian_status: 'pending',
                        status: 'pending',
                    },
                    // Guardian is to_guardian
                    {
                        to_guardian: guardianUserId,
                        to_guardian_status: 'pending',
                        status: 'pending',
                    },
                    // Ward is involved (as from or to user)
                    {
                        from_user: { [Op.in]: wardIds },
                        status: 'pending',
                    },
                    {
                        to_user: { [Op.in]: wardIds },
                        status: 'pending',
                    },
                ],
            },
            include: profileInclude,
            order: [['created_at', 'DESC']],
        });

        return res.json({ success: true, data: interests });

    } catch (err) {
        console.error('getGuardianPendingInterests error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// POST /guardian/approve-interest   (called by GUARDIAN)
// ─────────────────────────────────────────────────────────────────────────────
export const guardianApproveInterest = async (req, res) => {
    try {
        const guardianUserId = req.user.id;
        const { interestId } = req.body;
        if (!interestId)
            return res.status(400).json({ success: false, message: 'interestId is required' });

        console.log("interest id :" + interestId);
        const interest = await Interest.findByPk(Number(interestId), {
            include: profileInclude,
        });
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        // ✅ Add this debug
        console.log('interest found:', {
            id: interest?.id,
            from_user: interest.get('from_user'),
            to_user: interest.get('to_user'),
            raw: interest?.dataValues,
        });




        // ── Check if this user is guardian of from_user or to_user ────────────
        const [fromGuardianRow, toGuardianRow] = await Promise.all([
            Guardian.findOne({ where: { individual_id: interest.from_user, guardian_id: guardianUserId } }),
            Guardian.findOne({ where: { individual_id: interest.to_user, guardian_id: guardianUserId } }),
        ]);

        const isFromGuardian = !!fromGuardianRow;
        const isToGuardian = !!toGuardianRow;

        if (!isFromGuardian && !isToGuardian)
            return res.status(403).json({ success: false, message: 'You are not a guardian for this interest' });

        // ── Update guardian status ────────────────────────────────────────────
        const update = isFromGuardian
            ? { from_guardian_status: 'accepted' }
            : { to_guardian_status: 'accepted' };

        await interest.update(update);
        await interest.reload();

        // ── Check if both guardians now approved ──────────────────────────────
        const fromOk = !interest.from_guardian || interest.from_guardian_status === 'accepted';
        const toOk = !interest.to_guardian || interest.to_guardian_status === 'accepted';
        const bothGuardiansOk = fromOk && toOk;

        if (bothGuardiansOk) {
            await interest.update({ both_guardians_approved: true });

            // If user already accepted — finalize match
            if (interest.both_users_approved) {
                await interest.update({ status: 'accepted', is_mutual: true });

                const match = await Match.create({
                    interest_id: interest.id,
                    user1: interest.from_user,
                    user2: interest.to_user,
                });

                notifyNewMatch(interest.from_user, interest.to_user, {
                    match_id: match.id,
                    user1_name: interest.fromProfile?.name,
                    user2_name: interest.toProfile?.name,
                });
            }
        }

        await pushGuardianPendingCount(guardianUserId);

        return res.json({
            success: true,
            message: bothGuardiansOk ? 'Both guardians approved!' : 'Guardian approval recorded',
            data: interest,
        });

    } catch (err) {
        console.error('guardianApproveInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};
export default {
    searchGuardians,
    assignGuardian,
    getMyGuardian,
    removeGuardian,
    assignChildren,
    guardianApproveInterest,
    getGuardianPendingInterests,
    guardianRejectInterest,
    getMyWards,
    addWard,
    removeWard,
    searchWards,
    getPendingCount,
};