'use strict';

const db = require('../models');
const { User, Profile, Interest, Guardian } = db;
const { Op } = require('sequelize');

const profileAttrs = ['name', 'image', 'city', 'country'];
const profileFull = ['name', 'image', 'city', 'country', 'age', 'profession', 'individual_id'];

// ── Guardian assigns a ward ───────────────────────────────────
exports.assignChildren = async (req, res) => {
    try {
        const { childUserId, relationship } = req.body;

        if (req.user.role !== 'guardian')
            return res.status(403).json({ error: 'Only guardians allowed' });

        const guardianUser = await User.findByPk(req.user.id);
        const child = await User.findOne({ where: { id: childUserId, role: 'individual' } });
        if (!child) return res.status(404).json({ error: 'Individual not found' });

        // Magic method: guardianUser.getChildren() — from belongsToMany as 'Children'
        const existing = await guardianUser.getChildren({ where: { id: child.id } });
        if (existing.length > 0)
            return res.status(400).json({ error: 'Already assigned' });

        // Magic method: guardianUser.addChild()
        await guardianUser.addChild(child, {
            through: { relationship: relationship ?? 'Guardian' }
        });

        res.json({ success: true, message: 'Child assigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ── Individual assigns a guardian ─────────────────────────────
exports.assignGuardian = async (req, res) => {
    try {
        const { guardianUserId, relationship } = req.body;

        if (!guardianUserId)
            return res.status(400).json({ error: 'guardianUserId is required' });

        const individualUser = await User.findByPk(req.user.id);
        const guardianUser = await User.findOne({ where: { id: guardianUserId, role: 'guardian' } });
        if (!guardianUser) return res.status(404).json({ error: 'Guardian not found' });

        // Magic method: individualUser.getGuardians() — from belongsToMany as 'Guardians'
        const existing = await individualUser.getGuardians({ where: { id: guardianUserId } });
        if (existing.length > 0)
            return res.status(400).json({ error: 'Already assigned' });

        // Magic method: individualUser.addGuardian()
        await individualUser.addGuardian(guardianUser, {
            through: { relationship: relationship ?? 'Guardian' }
        });

        // Magic method: guardianUser.getProfile()
        const profile = await guardianUser.getProfile({ attributes: profileAttrs });

        res.json({
            success: true,
            message: 'Guardian assigned successfully',
            data: {
                id: guardianUser.id,
                email: guardianUser.email,
                relationship: relationship ?? 'Guardian',
                profile,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ── Individual removes their guardian ────────────────────────
// guardian.controller.js — update removeGuardian
exports.removeGuardian = async (req, res) => {
    try {
        const individualUser = await User.findByPk(req.user.id);
        const { guardianUserId } = req.body;

        if (!guardianUserId)
            return res.status(400).json({ error: 'guardianUserId is required' });

        const guardianUser = await User.findByPk(guardianUserId);
        if (!guardianUser)
            return res.status(404).json({ error: 'Guardian not found' });

        // Magic method — remove specific guardian
        await individualUser.removeGuardian(guardianUser);

        res.json({ success: true, message: 'Guardian removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


// guardian.controller.js — update getMyGuardian
exports.getMyGuardian = async (req, res) => {
    try {
        const individualUser = await User.findByPk(req.user.id);

        // Magic method — get ALL guardians
        const guardians = await individualUser.getGuardians({
            attributes: ['id', 'email'],
            include: [{
                model: Profile,
                as: 'profile',
                attributes: ['name', 'images', 'city', 'country'],
            }],
        });

        const data = guardians.map(g => ({
            id: g.id,
            email: g.email,
            relationship: g.Guardian?.dataValues?.relationship ?? 'Guardian',
            profile: g.profile,
        }));

        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
// ── Search users with guardian role ──────────────────────────
exports.searchGuardians = async (req, res) => {
    try {
        const { q } = req.query;

        const guardians = await User.findAll({
            where: { role: 'guardian' },
            attributes: ['id', 'email'],
            include: [{
                model: Profile,
                as: 'profile',
                attributes: profileAttrs,
                ...(q ? { where: { name: { [Op.like]: `%${q}%` } } } : {}),
                required: !!q,
            }],
            limit: 20,
        });

        res.json({ success: true, data: guardians });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ── Guardian approves interest (old route) ────────────────────
exports.guardianApprove = async (req, res) => {
    try {
        const interest = await Interest.findOne({
            where: { to_user: req.params.interestId },
        });
        if (!interest) return res.status(404).json({ error: 'Interest not found' });

        interest.guardian_approved = true;
        await interest.save();

        res.json({ success: true, interest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ── Get all interests for guardian's wards ────────────────────
exports.getPendingInterests = async (req, res) => {
    try {
        const guardianUser = await User.findByPk(req.user.id);

        // Magic method: guardianUser.getChildren() — all wards
        const wards = await guardianUser.getChildren({ attributes: ['id'] });
        const wardIds = wards.map(w => w.id);

        if (wardIds.length === 0)
            return res.json({ success: true, data: [] });

        const interests = await Interest.findAll({
            where: {
                [Op.or]: [
                    { from_user: { [Op.in]: wardIds } },
                    { to_user: { [Op.in]: wardIds } },
                ],
            },
            include: [
                { model: Profile, as: 'fromProfile', attributes: profileFull },
                { model: Profile, as: 'toProfile', attributes: profileFull },
            ],
            order: [['created_at', 'DESC']],
        });

        res.json({ success: true, data: interests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ── Approve interest ──────────────────────────────────────────
exports.approveInterest = async (req, res) => {
    try {
        const { interestId } = req.params;
        const guardianUser = await User.findByPk(req.user.id);

        const interest = await Interest.findByPk(interestId);
        if (!interest) return res.status(404).json({ error: 'Interest not found' });

        // Magic method: guardianUser.getChildren() — verify ownership
        const wards = await guardianUser.getChildren({ attributes: ['id'] });
        const wardIds = wards.map(w => w.id);

        const authorized = wardIds.includes(Number(interest.from_user)) ||
            wardIds.includes(Number(interest.to_user));

        if (!authorized)
            return res.status(403).json({ error: 'Not authorized for this interest' });

        interest.guardian_approved = true;
        await interest.save();

        res.json({ success: true, message: 'Approved', data: interest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ── Reject interest ───────────────────────────────────────────
exports.rejectInterest = async (req, res) => {
    try {
        const { interestId } = req.params;
        const guardianUser = await User.findByPk(req.user.id);

        const interest = await Interest.findByPk(interestId);
        if (!interest) return res.status(404).json({ error: 'Interest not found' });

        // Magic method: guardianUser.getChildren()
        const wards = await guardianUser.getChildren({ attributes: ['id'] });
        const wardIds = wards.map(w => w.id);

        const authorized = wardIds.includes(Number(interest.from_user)) ||
            wardIds.includes(Number(interest.to_user));

        if (!authorized)
            return res.status(403).json({ error: 'Not authorized for this interest' });

        interest.guardian_approved = false;
        interest.status = 'rejected';
        await interest.save();

        res.json({ success: true, message: 'Rejected', data: interest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};