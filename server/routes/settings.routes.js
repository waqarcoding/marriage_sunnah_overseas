import express from 'express';
import db from '../models/index.js';
const { Setting } = db;
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get ALL settings (public - no auth required)
router.get('/', async (req, res) => {
    try {
        console.log('📥 Settings request received');

        let settings = await Setting.getAllSettings();

        // If no settings exist, create default row
        if (!settings) {
            console.log('⚠️ No settings found, creating default settings');
            await Setting.create({
                site_name: 'Marriage Sunnah Overseas',
                site_tagline: 'Find your life partner following Islamic values',
                cost_send_interest: 5,
                cost_send_message: 2,
                cost_unlock_phone: 10,
                cost_unlock_email: 8,
                free_credits_on_signup: 10,
            });
            settings = await Setting.getAllSettings();
        }

        console.log('✅ Settings loaded, returning all fields');

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('❌ Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load settings'
        });
    }
});

// Get single setting value
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const value = await Setting.getSetting(key);

        res.json({
            success: true,
            data: { [key]: value }
        });
    } catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get setting'
        });
    }
});

// Update all settings (admin only)
router.put('/', authenticate, async (req, res) => {
    try {
        const updates = req.body;

        console.log('🔄 Updating settings:', Object.keys(updates));

        const row = await Setting.findOne({ order: [['id', 'ASC']] });
        if (row) {
            await row.update(updates);
        } else {
            await Setting.create(updates);
        }

        const settings = await Setting.getAllSettings();

        console.log('✅ Settings updated successfully');

        res.json({
            success: true,
            data: settings,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update settings'
        });
    }
});

// Update single setting (admin only)
router.patch('/:key', authenticate, async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        console.log(`🔄 Updating setting: ${key} = ${value}`);

        await Setting.setSetting(key, value);

        res.json({
            success: true,
            message: `Setting '${key}' updated successfully`,
            data: { [key]: value }
        });
    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update setting'
        });
    }
});

export default router;