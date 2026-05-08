// routes/notification.routes.js
import express from 'express';

import db from '../models/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
const router = express.Router();

// Get notifications (protected)
router.get('/', authenticate, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;

        const notifications = await db.Notification.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
});

// Mark as read (protected)
router.post('/:id/read', authenticate, async (req, res) => {
    try {
        await db.Notification.update(
            { is_read: true },
            { where: { id: req.params.id } }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read.' });
    }
});
// controllers/notification.controller.js


export const markAllAsSeen = async (req, res) => {
    try {
        const userId = req.user.id; // assuming auth middleware sets this

        await db.Notification.update(
            { is_read: true },
            {
                where: {
                    user_id: userId,
                    is_read: false,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as seen",
        });
    } catch (error) {
        console.error("markAllAsSeen error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
export default router;