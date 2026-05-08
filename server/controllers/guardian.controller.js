// @ts-nocheck
// controllers/guardian.controller.js

import db from '../models/index.js';
const { User, Profile, Interest, Guardian } = db;
import { Op } from 'sequelize';
import {
    notifyGuardianAssigned,
    notifyGuardianRemoved,
    notifyGuardianPendingCount,
    notifyWardAdded,
    notifyWardRemoved,
    notifyGuardianApproved,
    notifyGuardianRejected,
} from '../config/socket.js';
import {
    guardianApproveInterest,
    guardianRejectInterest,
    getGuardianPendingInterests,
} from './interest.controller.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
};

const profileAttrs = ['individual_id', 'name', 'images', 'age', 'city', 'country', 'profession'];

const pushGuardianPendingCount = async (guardianUserId) => {
    const rows = await Guardian.findAll({ where: { guardian_id: guardianUserId }, attributes: ['individual_id'] });
    const wardIds = rows.map(r => r.individual_id);
    if (!wardIds.length) return;
    const count = await Interest.count({
        where: { to_user: { [Op.in]: wardIds }, status: 'pending', to_guardian_status: 'pending' },
    });
    notifyGuardianPendingCount(guardianUserId, count);
};

// ── Ward methods ──────────────────────────────────────────────────────────────
export const searchGuardians = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: false, message: 'Query required' });

        const guardians = await User.findAll({
            where: {
                role: 'guardian',
                [Op.or]: [{ email: { [Op.like]: `%${q}%` } }, { mobile: { [Op.like]: `%${q}%` } }],
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
            return res.json({ success: false, message: 'guardianUserId required' });

        const guardian = await User.findOne({
            where: { id: guardianUserId, role: 'guardian' },
            attributes: ['id', 'email', 'avatar_url'],
        });
        if (!guardian)
            return res.json({ success: false, message: 'Guardian not found' });

        const [row, created] = await Guardian.findOrCreate({
            where: { individual_id: individualId },
            defaults: { individual_id: individualId, guardian_id: guardianUserId, relationship },
        });
        if (!created) await row.update({ guardian_id: guardianUserId, relationship });

        const wardUser = await User.findByPk(individualId, { attributes: ['avatar_url'] });
        const wardProfile = await Profile.findOne({ where: { individual_id: individualId }, attributes: ['name'] });

        // ✅ ward_avatar_url → socket.js reads this as sender_image for guardian
        notifyGuardianAssigned(guardianUserId, {
            ward_id: individualId,
            ward_name: wardProfile?.name || '',
            ward_avatar_url: wardUser?.avatar_url || null,
            guardianEmail: guardian.email,
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
            include: [
                {
                    model: User,
                    as: 'guardianUser',
                    attributes: ['id', 'email', 'mobile', 'role', 'is_online', 'avatar_url'],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: ['name', 'images', 'city', 'country'],
                        },
                    ],
                },
            ],
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

        const row = await Guardian.findOne({
            where: { individual_id: individualId },
            include: [{
                model: User,
                as: 'guardianUser',
                attributes: ['id', 'email', 'avatar_url'],
            }],
        });

        if (!row)
            return res.json({ success: false, message: 'No guardian assigned' });

        const guardianId = row.guardian_id;
        const guardianUser = row.guardianUser;

        const wardUser = await User.findByPk(individualId, { attributes: ['avatar_url'] });
        const wardProfile = await Profile.findOne({ where: { individual_id: individualId }, attributes: ['name'] });

        await row.destroy();

        // ✅ ward_avatar_url → socket.js reads this as sender_image for guardian
        notifyGuardianRemoved(guardianId, {
            ward_id: individualId,
            ward_name: wardProfile?.name || '',
            ward_avatar_url: wardUser?.avatar_url || null,
            guardianEmail: guardianUser?.email || null,
        });

        return res.json({ success: true, message: 'Guardian removed' });
    } catch (err) {
        console.error('removeGuardian error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Guardian methods ──────────────────────────────────────────────────────────
export const getMyWards = async (req, res) => {
    try {
        const wards = await Guardian.findAll({
            where: { guardian_id: req.user.id },
            include: [{ model: Profile, as: 'individualProfile', attributes: profileAttrs }],
        });

        return res.json({ success: true, data: wards });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const removeWard = async (req, res) => {
    try {
        const { wardId } = req.body;
        if (!wardId) return res.json({ success: false, message: 'wardId required' });

        const guardianUser = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'avatar_url'] });
        const wardUser = await User.findByPk(wardId, { attributes: ['id', 'email'] });

        await Guardian.destroy({ where: { individual_id: wardId, guardian_id: req.user.id } });

        // ✅ guardian_avatar_url → socket.js reads this as sender_image for ward
        notifyWardRemoved(wardId, {
            guardian_id: req.user.id,
            guardian_name: guardianUser?.name || '',
            guardian_avatar_url: guardianUser?.avatar_url || null,
            wardEmail: wardUser?.email || null,
        });

        return res.json({ success: true, message: 'Ward removed' });
    } catch (err) {
        console.error('removeWard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const searchWards = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: false, message: 'Query required' });

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
        const rows = await Guardian.findAll({ where: { guardian_id: req.user.id }, attributes: ['individual_id'] });
        const wardIds = rows.map(r => r.individual_id);
        const count = wardIds.length
            ? await Interest.count({ where: { to_user: { [Op.in]: wardIds }, status: 'pending' } })
            : 0;
        return res.json({ success: true, data: { count } });
    } catch (err) {
        console.error('getPendingCount error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── PIN methods ───────────────────────────────────────────────────────────────
export const generateGuardianPin = async (req, res) => {
    try {
        const userId = req.user.id;
        const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

        await User.update({ user_pin: pinCode }, { where: { id: userId } });

        console.log(`✅ Generated PIN ${pinCode} for user ${userId}`);

        res.json({
            success: true,
            data: { pin: pinCode, message: 'Share this PIN with your guardian' },
        });
    } catch (error) {
        console.error('❌ Generate PIN error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate PIN' });
    }
};

export const verifyGuardianPin = async (req, res) => {
    try {
        const { pin } = req.body;

        if (!pin || pin.length !== 6)
            return res.json({ success: false, error: 'Please enter a valid 6-digit PIN' });

        const ward = await User.findOne({
            where: { user_pin: pin, role: 'individual' },
            attributes: ['id', 'name', 'email', 'mobile', 'avatar_url'],
            include: [{
                model: Profile,
                as: 'profile',
                attributes: ['name', 'images', 'age', 'gender', 'city', 'country'],
            }],
        });

        if (!ward)
            return res.json({ success: false, error: 'Invalid PIN. Please check and try again.' });

        res.json({
            success: true,
            data: {
                wardId: ward.id,
                name: ward.profile?.name || ward.name,
                email: ward.email,
                mobile: ward.mobile,
                age: ward.profile?.age,
                gender: ward.profile?.gender,
                city: ward.profile?.city,
                country: ward.profile?.country,
                avatar_url: ward.avatar_url || null,        // ✅ plain avatar_url
            },
        });
    } catch (error) {
        console.error('❌ Verify PIN error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify PIN' });
    }
};

export const linkGuardianWithPin = async (req, res) => {
    try {
        const guardianUserId = req.user.id;
        const { pin, relationship } = req.body;

        if (!pin || pin.length !== 6)
            return res.json({ success: false, error: 'Please enter a valid 6-digit PIN' });

        const guardianUser = await User.findByPk(guardianUserId, {
            attributes: ['id', 'name', 'email', 'mobile', 'avatar_url'],
            include: [{ model: Profile, as: 'profile', attributes: ['name'] }],
        });

        if (!guardianUser)
            return res.json({ success: false, error: 'Guardian user not found' });

        const ward = await User.findOne({
            where: { user_pin: pin, role: 'individual' },
            attributes: ['id', 'email', 'name', 'avatar_url'],
            include: [{ model: Profile, as: 'profile', attributes: ['name', 'images'] }],
        });

        if (!ward)
            return res.json({ success: false, error: 'Invalid PIN' });

        const wardId = ward.id;

        const existingGuardian = await Guardian.findOne({ where: { individual_id: wardId } });
        if (existingGuardian)
            return res.json({ success: false, error: 'This ward already has a guardian assigned' });

        const guardianLink = await Guardian.create({
            individual_id: wardId,
            guardian_id: guardianUserId,
            relationship: relationship || 'Guardian',
            guardian_name: guardianUser.profile?.name || guardianUser.name || null,
            guardian_phone: guardianUser.mobile || null,
            guardian_email: guardianUser.email || null,
            guardian_relationship: relationship || 'Guardian',
            guardian_image: guardianUser.avatar_url || null,  // ✅ plain avatar_url
            contact_hidden: false,
            created_at: new Date(),
            updated_at: new Date(),
        });

        await User.update({ user_pin: null }, { where: { id: wardId } });

        // ✅ guardian_avatar_url → socket.js reads this as sender_image for ward
        notifyWardAdded(wardId, {
            guardian_id: guardianUserId,
            guardian_name: guardianUser.profile?.name || guardianUser.name || 'Guardian',
            guardian_avatar_url: guardianUser.avatar_url || null,
            guardian_email: guardianUser.email || null,
            guardian_phone: guardianUser.mobile || null,
            relationship: relationship || 'Guardian',
            wardEmail: ward.email,
            wardName: ward.profile?.name || ward.name || null,
        });

        console.log(`✅ Guardian ${guardianUserId} linked to ward ${wardId} using PIN`);

        res.json({
            success: true,
            message: 'Successfully linked to ward',
            data: {
                guardian: guardianLink,
                ward: {
                    id: wardId,
                    name: ward.profile?.name || ward.name,
                    email: ward.email,
                    avatar_url: ward.avatar_url || null,      // ✅ plain avatar_url
                },
            },
        });
    } catch (error) {
        console.error('❌ Link guardian error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to link guardian' });
    }
};

export const getMyPin = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ['user_pin'] });
        res.json({ success: true, data: { pin: user.user_pin || null } });
    } catch (error) {
        console.error('❌ Get PIN error:', error);
        res.status(500).json({ success: false, error: 'Failed to get PIN' });
    }
};

// ── Re-export interest approval methods ───────────────────────────────────────
export { guardianApproveInterest, guardianRejectInterest, getGuardianPendingInterests };

export default {
    searchGuardians,
    assignGuardian,
    getMyGuardian,
    removeGuardian,
    getMyWards,
    removeWard,
    searchWards,
    getPendingCount,
    guardianApproveInterest,
    guardianRejectInterest,
    getGuardianPendingInterests,
    generateGuardianPin,
    verifyGuardianPin,
    linkGuardianWithPin,
    getMyPin,
};