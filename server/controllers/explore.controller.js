'use strict';

const db = require('../models');
const { User, Profile, Interest, Dislike } = db;
const { Op } = require('sequelize');

exports.getExplore = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        const { gender, minAge, maxAge, city, country } = req.query;

        // ── Get excluded IDs ──
        const [sentInterests, dislikesSent] = await Promise.all([
            db.Interest.findAll({
                where: { from_user: currentUser.id },
                attributes: ['to_user'],
                raw: true,
            }),
            db.Dislike.findAll({
                where: { user_id: currentUser.id },
                attributes: ['target_user_id'],
                raw: true,
            }),
        ]);

        const excludeIds = [
            Number(currentUser.id),
            ...sentInterests.map(i => i.to_user),
            ...dislikesSent.map(d => d.target_user_id),
        ].filter(id => id != null);

        // console.log("excludeIds count:", excludeIds.length);

        // ── Profile filters ──
        const profileWhere = {
            individual_id: { [Op.notIn]: excludeIds.length ? excludeIds : [0] }, // ✅
            ...(gender && { gender }),
            ...(city && { city }),
            ...(country && { country }),
            ...(minAge && maxAge && {
                age: { [Op.between]: [Number(minAge), Number(maxAge)] }
            }),
        };
        // console.log("currentUser.id:", currentUser.id);
        // console.log("excludeIds:", excludeIds);

        const testCount = await Profile.count({ where: profileWhere });
        // console.log("count with profileWhere:", testCount);
        const profiles = await Profile.findAll({
            where: profileWhere, // ✅ missing this
            include: [{
                model: User.unscoped(),
                as: 'individual',
                attributes: ['id', 'is_online', 'is_premium'],
                required: true,
            }],
            order: [['created_at', 'DESC']],
            limit: 50,
        });
        // console.log("profiles without any filter:", profiles.length);
        // console.log("profiles found:", profiles.length);
        res.json({ success: true, profiles });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};