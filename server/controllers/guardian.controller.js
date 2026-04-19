// controllers/guardian.controller.js

const db = require('../models');
const { User, Profile, Interest, Guardian } = db;
const { Op } = require('sequelize');
const {
    notifyGuardianAssigned,
    notifyGuardianRemoved,
    notifyGuardianApproved,
    notifyGuardianRejected,
    notifyGuardianPendingCount,
    notifyInterestReceived,
    notifyInterestCount,
} = require('../config/socket');

// ── Guardian table fields (latest): 
// id, individual_id, guardian_id, image, contact_hidden, created_at, updated_at,
// guardian_name, guardian_phone, guardian_email, guardian_relationship, guardian_image

// ── Helper: guardian pending count ───────────────────────────
const pushGuardianPendingCount = async (guardianUserId) => {
    const wardRows = await Guardian.findAll({
        where: { guardian_id: guardianUserId },
        attributes: ['individual_id'],
    });
    const wardIds = wardRows.map(g => g.individual_id);
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

// ─────────────────────────────────────────────────────────────
// GET /guardian/search?q=
// ─────────────────────────────────────────────────────────────
exports.searchGuardians = async (req, res) => {
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
            limit: 20,
        });

        return res.json({ success: true, data: guardians });
    } catch (err) {
        console.error('searchGuardians error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /guardian/assign
// ─────────────────────────────────────────────────────────────
exports.assignGuardian = async (req, res) => {
    try {
        const individualId = req.user.id;
        const { guardian_id } = req.body;

        if (!guardian_id)
            return res.status(400).json({ success: false, message: 'guardian_id required' });

        const guardian = await User.findOne({
            where: { id: guardian_id, role: 'guardian' },
            attributes: ['id', 'email'],
        });
        if (!guardian)
            return res.status(404).json({ success: false, message: 'Guardian not found' });

        // Upsert Guardian row
        const [row, created] = await Guardian.findOrCreate({
            where: { individual_id: individualId },
            defaults: { individual_id: individualId, guardian_id },
        });
        if (!created) await row.update({ guardian_id });

        // Get ward profile for notification
        const wardProfile = await Profile.findOne({
            where: { individual_id: individualId },
            attributes: ['name', 'images'],
        });

        // 🔔 Notify guardian
        notifyGuardianAssigned(guardian_id, {
            ward_id: individualId,
            ward_name: wardProfile?.name || '',
            ward_avatar: wardProfile?.images ? wardProfile.images[0] : null,
        });

        return res.json({ success: true, message: 'Guardian assigned' });
    } catch (err) {
        console.error('assignGuardian error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /guardian/my-guardian
// ─────────────────────────────────────────────────────────────
exports.getMyGuardian = async (req, res) => {
    try {
        // Guardian table now has extended fields
        const row = await Guardian.findOne({
            where: { individual_id: req.user.id },
            attributes: [
                // Full guardian record including latest fields
                'id',
                'individual_id',
                'guardian_id',
                'image',
                'contact_hidden',
                'created_at',
                'updated_at',
                'guardian_name',
                'guardian_phone',
                'guardian_email',
                'guardian_relationship',
                'guardian_image',
            ],
            include: [{
                model: User,
                as: 'guardian',
                attributes: ['id', 'email', 'mobile', 'role', 'is_online'],
            }],
        });

        return res.json({ success: true, data: row || null });
    } catch (err) {
        console.error('getMyGuardian error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /guardian/remove
// ─────────────────────────────────────────────────────────────
exports.removeGuardian = async (req, res) => {
    try {
        const individualId = req.user.id;

        const row = await Guardian.findOne({
            where: { individual_id: individualId },
        });
        if (!row)
            return res.status(400).json({ success: false, message: 'No guardian assigned' });

        const guardianId = row.guardian_id;

        const wardProfile = await Profile.findOne({
            where: { individual_id: individualId },
            attributes: ['name'],
        });

        await row.destroy();

        // 🔔 Notify guardian
        notifyGuardianRemoved(guardianId, {
            ward_id: individualId,
            ward_name: wardProfile?.name || '',
        });

        return res.json({ success: true, message: 'Guardian removed' });
    } catch (err) {
        console.error('removeGuardian error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /guardian/assign-children
// ─────────────────────────────────────────────────────────────
exports.assignChildren = async (req, res) => {
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
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /guardian/pending-interests
// ─────────────────────────────────────────────────────────────
exports.getPendingInterests = async (req, res) => {
    try {
        const guardianId = req.user.id;

        const wardRows = await Guardian.findAll({
            where: { guardian_id: guardianId },
            attributes: ['individual_id'],
        });
        const wardIds = wardRows.map(g => g.individual_id);

        if (!wardIds.length)
            return res.json({ success: true, data: [] });

        const interests = await Interest.findAll({
            where: {
                to_user: { [Op.in]: wardIds },
                status: 'pending',
                guardian_approved: null,
            },
            include: [
                { model: Profile, as: 'fromProfile', attributes: ['individual_id', 'name', 'images', 'age', 'city'] },
                { model: Profile, as: 'toProfile', attributes: ['individual_id', 'name', 'images', 'age', 'city'] },
            ],
            order: [['created_at', 'DESC']],
        });

        return res.json({ success: true, data: interests });
    } catch (err) {
        console.error('getPendingInterests error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// PUT /guardian/interests/:interestId/approve
// ─────────────────────────────────────────────────────────────
exports.approveInterest = async (req, res) => {
    try {
        const guardianId = req.user.id;
        const { interestId } = req.params;

        const wardRows = await Guardian.findAll({
            where: { guardian_id: guardianId },
            attributes: ['individual_id'],
        });
        const wardIds = wardRows.map(g => g.individual_id);

        const interest = await Interest.findOne({
            where: { id: interestId, to_user: { [Op.in]: wardIds } },
            include: [
                { model: Profile, as: 'fromProfile', attributes: ['name', 'images'] },
                { model: Profile, as: 'toProfile', attributes: ['name', 'images'] },
            ],
        });
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        // The Guardian table contains the latest guardian info fields per ward.
        const guardianRow = await Guardian.findOne({
            where: { guardian_id: guardianId, individual_id: interest.to_user },
            attributes: [
                'guardian_name',
                'guardian_phone',
                'guardian_email',
                'guardian_relationship',
                'guardian_image',
                'name', // legacy support
                'image', // legacy support
            ],
        });

        await interest.update({
            guardian_approved: true,
            guardian_approved_at: new Date(),
        });

        // 🔔 Notify ward
        notifyGuardianApproved(interest.to_user, {
            interest_id: interest.id,
            guardian_id: guardianId,
            guardian_name: guardianRow?.guardian_name || guardianRow?.name || '',
            guardian_phone: guardianRow?.guardian_phone || '',
            guardian_email: guardianRow?.guardian_email || '',
            guardian_relationship: guardianRow?.guardian_relationship || '',
            guardian_avatar: guardianRow?.guardian_image || guardianRow?.image || null,
            approved_for: 'accept',
        });


        // 🔔 Notify receiver the interest is now active
        notifyInterestReceived(interest.to_user, {
            interest_id: interest.id,
            sender_id: interest.from_user,
            sender_name: interest.fromProfile?.name || '',
            sender_avatar: interest.fromProfile?.images ? interest.fromProfile.images[0] : null,
        });

        // 🔢 Update badges
        const count = await Interest.count({
            where: { to_user: interest.to_user, status: 'pending' },
        });
        notifyInterestCount(interest.to_user, count);

        await pushGuardianPendingCount(guardianId);

        return res.json({ success: true, message: 'Interest approved' });
    } catch (err) {
        console.error('approveInterest error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// ─────────────────────────────────────────────────────────────
// PUT /guardian/interests/:interestId/reject
// ─────────────────────────────────────────────────────────────
exports.rejectInterest = async (req, res) => {
    try {
        const guardianId = req.user.id;
        const { interestId } = req.params;

        const wardRows = await Guardian.findAll({
            where: { guardian_id: guardianId },
            attributes: ['individual_id'],
        });
        const wardIds = wardRows.map(g => g.individual_id);

        const interest = await Interest.findOne({
            where: { id: interestId, to_user: { [Op.in]: wardIds } },
        });
        if (!interest)
            return res.status(404).json({ success: false, message: 'Interest not found' });

        const guardianRow = await Guardian.findOne({
            where: { guardian_id: guardianId, individual_id: interest.to_user },
            attributes: [
                'guardian_name',
                'guardian_phone',
                'guardian_email',
                'guardian_relationship',
                'guardian_image',
                'name', // legacy support
                'image', // legacy support
            ],
        });

        await interest.update({ guardian_approved: false, status: 'declined' });

        // 🔔 Notify ward
        notifyGuardianRejected(interest.to_user, {
            interest_id: interest.id,
            guardian_id: guardianId,
            guardian_name: guardianRow?.guardian_name || guardianRow?.name || '',
            guardian_avatar: guardianRow?.guardian_image || guardianRow?.image || null,
        });

        await pushGuardianPendingCount(guardianId);

        return res.json({ success: true, message: 'Interest rejected' });
    } catch (err) {
        console.error('rejectInterest error:', err);
        return res.status(500).json({ success: false, message: err });
    }
};

// Alias
exports.guardianApprove = (req, res) => exports.approveInterest(req, res);
