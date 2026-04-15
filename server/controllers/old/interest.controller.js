'use strict';

const db = require('../models');
const { User, Profile, Interest, Dislike, Match } = db;
const { Op } = require('sequelize');

module.exports = {


    sendInterest: async (req, res) => {
        const { interestId, isSuperLike = false } = req.body;
        try {
            if (!interestId) return res.status(400).json({ error: 'interestId is required' });

            const [fromUser, toUser] = await Promise.all([
                User.findByPk(req.user.id),
                User.findByPk(interestId),
            ]);
            if (!fromUser || !toUser) return res.status(404).json({ error: 'User not found' });

            const existing = await Interest.findOne({
                where: { from_user: req.user.id, to_user: interestId }
            });
            if (existing) return res.status(400).json({ error: 'Interest already sent' });

            const interest = await Interest.create({
                from_user: req.user.id,
                to_user: interestId,
                is_super_like: isSuperLike,
            });

            return res.status(200).json({ success: true, data: interest }); // ✅ was missing
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },

    sendDislike: async (req, res) => {
        const { interestId } = req.body; // ✅ was target_user_id
        try {
            const existing = await Dislike.findOne({
                where: { user_id: req.user.id, target_user_id: interestId }
            });
            if (existing) return res.json({ success: true, message: "Already disliked" });

            await Dislike.create({
                user_id: req.user.id,
                target_user_id: interestId, // ✅
            });

            return res.json({ success: true, message: "Passed" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err });
        }
    },

    // 2️⃣ Cancel interest
    cancelInterest: async (req, res) => {
        try {
            const fromUser = await User.findByPk(req.user.id);
            const interest = await Interest.findOne({ where: { id: req.params.interestId, from_user: fromUser.id } });

            if (!interest) return res.status(404).json({ error: 'Interest not found' });

            await interest.destroy();
            res.status(200).json({ success: true, message: 'Interest canceled' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },

    getInterests: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id);
            // Fetch interests sent, received, and matches as in previous code
            const sentInterests = await user.getInterestsSent({
                where: { status: "pending" },
                include: [{ model: Profile, as: 'toProfile' }]
            });
            const receivedInterests = await user.getInterestsReceived({
                where: { status: "pending" },
                include: [{ model: Profile, as: 'fromProfile' }]
            });
            // For matches, get mutual accepted interests
            const matches = await Interest.findAll({
                where: {
                    is_mutual: true,
                    [Op.or]: [
                        { from_user: req.user.id },
                        { to_user: req.user.id }
                    ]
                },
                include: [
                    { model: Profile, as: 'toProfile' },
                    { model: Profile, as: 'fromProfile' }
                ]
            });

            // Counts summary
            const [likesSentCount, likesReceivedCount, matchesCount] = await Promise.all([
                Interest.count({ where: { from_user: req.user.id } }),
                Interest.count({ where: { to_user: req.user.id } }),
                Interest.count({
                    where: {
                        is_mutual: true,
                        [Op.or]: [
                            { from_user: req.user.id },
                            { to_user: req.user.id }
                        ]
                    }
                }),
            ]);

            res.status(200).json({
                success: true,
                data: {
                    sent: sentInterests,
                    received: receivedInterests,
                    matches: matches
                },
                counts: {
                    likes_sent: likesSentCount,
                    likes_received: likesReceivedCount,
                    matches: matchesCount
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },


    acceptInterest: async (req, res) => {
        const { interestId } = req.body;
        try {
            const interest = await Interest.findByPk(interestId);
            if (!interest) return res.status(404).json({ error: "Interest not found" });

            await interest.update({ status: "accepted" });

            // ✅ Create match
            const existingMatch = await Match.findOne({
                where: {
                    [Op.or]: [
                        { user1: interest.from_user, user2: interest.to_user },
                        { user1: interest.to_user, user2: interest.from_user },
                    ]
                }
            });

            if (!existingMatch) {
                await Match.create({
                    user1: interest.from_user,
                    user2: interest.to_user,
                });
            }

            res.json({ success: true, data: interest });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },

    declineInterest: async (req, res) => {
        const { interestId } = req.body;
        try {
            const interest = await Interest.findByPk(interestId);
            if (!interest) return res.status(404).json({ error: "Interest not found" });

            await interest.update({ status: "declined" });
            res.json({ success: true, data: interest });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },





    // 9️⃣ Count pending interests
    getPendingCount: async (req, res) => {
        try {

            const count = await Interest.count({
                where: {
                    from_user: req.user.id,
                    status: 'pending'
                }
            });

            res.status(200).json({ success: true, pendingCount: count });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },


};