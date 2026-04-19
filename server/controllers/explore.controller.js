'use strict';

const db = require('../models');
const { User, Profile, Interest, Dislike } = db;
const { Op, QueryTypes } = require('sequelize');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: load saved preferences for a user
// ─────────────────────────────────────────────────────────────────────────────
const getPreferences = async (individualId) => {
    const [rows] = await db.sequelize.query(
        `SELECT * FROM \`Prefs\` WHERE individual_id = :individualId LIMIT 1`,
        { replacements: { individualId }, type: QueryTypes.SELECT }
    );
    return rows || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /explore/get-explore
// Query params override saved preferences when provided
// ─────────────────────────────────────────────────────────────────────────────
exports.getExplore = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        // ── Load saved preferences (used as defaults) ──────────────────────
        const prefs = await getPreferences(currentUser.id);

        // ── Merge: query params win over saved prefs ───────────────────────
        // @ts-ignore
        const gender = req.query.gender || prefs?.pref_gender || null;
        // @ts-ignore
        const minAge = req.query.minAge || prefs?.pref_age_min || null;
        // @ts-ignore
        const maxAge = req.query.maxAge || prefs?.pref_age_max || null;
        // @ts-ignore
        const minHeight = req.query.minHeight || prefs?.pref_height_min_inches || null;
        // @ts-ignore
        const maxHeight = req.query.maxHeight || prefs?.pref_height_max_inches || null;
        // @ts-ignore
        const country = req.query.country || prefs?.pref_country || null;
        // @ts-ignore
        const city = req.query.city || prefs?.pref_city || null;
        // @ts-ignore
        const nationality = req.query.nationality || prefs?.pref_nationality || null;
        // @ts-ignore
        const maritalStatus = req.query.maritalStatus || prefs?.pref_marital_status || null;
        // @ts-ignore
        const hasChildren = req.query.hasChildren || prefs?.pref_has_children || null;
        // @ts-ignore
        const religion = req.query.religion || prefs?.pref_religion || null;
        // @ts-ignore
        const sect = req.query.sect || prefs?.pref_sect || null;
        // @ts-ignore
        const practiceLevel = req.query.practiceLevel || prefs?.pref_religious_practice_level || null;
        // @ts-ignore
        const caste = req.query.caste || prefs?.pref_caste || null;
        // @ts-ignore
        const motherTongue = req.query.motherTongue || prefs?.pref_mother_tongue || null;
        // @ts-ignore
        const education = req.query.education || prefs?.pref_education || null;
        // @ts-ignore
        const employmentType = req.query.employmentType || prefs?.pref_employment_type || null;
        // @ts-ignore
        const monthlySalary = req.query.monthlySalary || prefs?.pref_monthly_salary || null;
        // @ts-ignore
        const bodyType = req.query.bodyType || prefs?.pref_body_type || null;

        // ── Get excluded IDs (already liked / disliked) ────────────────────
        const [sentInterests, dislikesSent] = await Promise.all([
            Interest.findAll({
                where: { from_user: currentUser.id },
                attributes: ['to_user'],
                raw: true,
            }),
            Dislike.findAll({
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

        // ── Build profile WHERE clause ─────────────────────────────────────
        const profileWhere = {
            individual_id: { [Op.notIn]: excludeIds.length ? excludeIds : [0] },

            // ── Basic ──────────────────────────────────────────────────────
            ...(gender && { gender }),
            ...(maritalStatus && { marital_status: maritalStatus }),
            ...(hasChildren && { has_children: hasChildren }),
            ...(bodyType && { body_type: bodyType }),

            // ── Age range ──────────────────────────────────────────────────
            ...(minAge && maxAge && { age: { [Op.between]: [Number(minAge), Number(maxAge)] } }),
            ...(minAge && !maxAge && { age: { [Op.gte]: Number(minAge) } }),
            ...(maxAge && !minAge && { age: { [Op.lte]: Number(maxAge) } }),

            // ── Height range ───────────────────────────────────────────────
            ...(minHeight && maxHeight && { height_inches: { [Op.between]: [Number(minHeight), Number(maxHeight)] } }),
            ...(minHeight && !maxHeight && { height_inches: { [Op.gte]: Number(minHeight) } }),
            ...(maxHeight && !minHeight && { height_inches: { [Op.lte]: Number(maxHeight) } }),

            // ── Location ───────────────────────────────────────────────────
            ...(country && { country }),
            ...(city && { city }),
            ...(nationality && { nationality }),

            // ── Religion & background ──────────────────────────────────────
            ...(religion && { religion }),
            ...(sect && { sect }),
            ...(practiceLevel && { religious_practice_level: practiceLevel }),
            ...(caste && { caste }),
            ...(motherTongue && { mother_tongue: motherTongue }),

            // ── Career ─────────────────────────────────────────────────────
            ...(education && { education }),
            ...(employmentType && { employment_type: employmentType }),
            ...(monthlySalary && { monthly_salary: monthlySalary }),
        };

        // ── Query ──────────────────────────────────────────────────────────
        const profiles = await Profile.findAll({
            where: profileWhere,
            include: [{
                model: User.unscoped(),
                as: 'individual',
                attributes: ['id', 'is_online', 'is_premium'],
                required: true,
            }],
            order: [['created_at', 'DESC']],
            limit: 50,
        });

        return res.json({
            success: true,
            profiles,
            applied_prefs: prefs ? true : false,
        });

    } catch (err) {
        console.error('getExplore error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /explore/save-preferences
// Upserts the Prefs row for the current user
// ─────────────────────────────────────────────────────────────────────────────
exports.savePreferences = async (req, res) => {
    try {
        const individualId = req.user.id;

        const {
            pref_gender,
            pref_age_min,
            pref_age_max,
            pref_height_min_inches,
            pref_height_max_inches,
            pref_country,
            pref_city,
            pref_nationality,
            pref_marital_status,
            pref_has_children,
            pref_religion,
            pref_sect,
            pref_religious_practice_level,
            pref_caste,
            pref_mother_tongue,
            pref_education,
            pref_employment_type,
            pref_monthly_salary,
            pref_body_type,
            pref_willing_to_relocate,
        } = req.body;

        // ── Check if row already exists ────────────────────────────────────
        const existing = await getPreferences(individualId);

        if (existing) {
            // ── UPDATE ─────────────────────────────────────────────────────
            await db.sequelize.query(
                `UPDATE \`Prefs\` SET
                    pref_gender                   = :pref_gender,
                    pref_age_min                  = :pref_age_min,
                    pref_age_max                  = :pref_age_max,
                    pref_height_min_inches        = :pref_height_min_inches,
                    pref_height_max_inches        = :pref_height_max_inches,
                    pref_country                  = :pref_country,
                    pref_city                     = :pref_city,
                    pref_nationality              = :pref_nationality,
                    pref_marital_status           = :pref_marital_status,
                    pref_has_children             = :pref_has_children,
                    pref_religion                 = :pref_religion,
                    pref_sect                     = :pref_sect,
                    pref_religious_practice_level = :pref_religious_practice_level,
                    pref_caste                    = :pref_caste,
                    pref_mother_tongue            = :pref_mother_tongue,
                    pref_education                = :pref_education,
                    pref_employment_type          = :pref_employment_type,
                    pref_monthly_salary           = :pref_monthly_salary,
                    pref_body_type                = :pref_body_type,
                    pref_willing_to_relocate      = :pref_willing_to_relocate,
                    updated_at                    = NOW()
                WHERE individual_id = :individualId`,
                {
                    replacements: {
                        individualId,
                        pref_gender: pref_gender ?? null,
                        pref_age_min: pref_age_min ?? null,
                        pref_age_max: pref_age_max ?? null,
                        pref_height_min_inches: pref_height_min_inches ?? null,
                        pref_height_max_inches: pref_height_max_inches ?? null,
                        pref_country: pref_country ?? null,
                        pref_city: pref_city ?? null,
                        pref_nationality: pref_nationality ?? null,
                        pref_marital_status: pref_marital_status ?? null,
                        pref_has_children: pref_has_children ?? null,
                        pref_religion: pref_religion ?? null,
                        pref_sect: pref_sect ?? null,
                        pref_religious_practice_level: pref_religious_practice_level ?? null,
                        pref_caste: pref_caste ?? null,
                        pref_mother_tongue: pref_mother_tongue ?? null,
                        pref_education: pref_education ?? null,
                        pref_employment_type: pref_employment_type ?? null,
                        pref_monthly_salary: pref_monthly_salary ?? null,
                        pref_body_type: pref_body_type ?? null,
                        pref_willing_to_relocate: pref_willing_to_relocate ?? 0,
                    },
                    type: QueryTypes.UPDATE,
                }
            );
        } else {
            // ── INSERT ─────────────────────────────────────────────────────
            await db.sequelize.query(
                `INSERT INTO \`Prefs\` (
                    individual_id,
                    pref_gender,
                    pref_age_min,
                    pref_age_max,
                    pref_height_min_inches,
                    pref_height_max_inches,
                    pref_country,
                    pref_city,
                    pref_nationality,
                    pref_marital_status,
                    pref_has_children,
                    pref_religion,
                    pref_sect,
                    pref_religious_practice_level,
                    pref_caste,
                    pref_mother_tongue,
                    pref_education,
                    pref_employment_type,
                    pref_monthly_salary,
                    pref_body_type,
                    pref_willing_to_relocate,
                    created_at,
                    updated_at
                ) VALUES (
                    :individualId,
                    :pref_gender,
                    :pref_age_min,
                    :pref_age_max,
                    :pref_height_min_inches,
                    :pref_height_max_inches,
                    :pref_country,
                    :pref_city,
                    :pref_nationality,
                    :pref_marital_status,
                    :pref_has_children,
                    :pref_religion,
                    :pref_sect,
                    :pref_religious_practice_level,
                    :pref_caste,
                    :pref_mother_tongue,
                    :pref_education,
                    :pref_employment_type,
                    :pref_monthly_salary,
                    :pref_body_type,
                    :pref_willing_to_relocate,
                    NOW(),
                    NOW()
                )`,
                {
                    replacements: {
                        individualId,
                        pref_gender: pref_gender ?? null,
                        pref_age_min: pref_age_min ?? null,
                        pref_age_max: pref_age_max ?? null,
                        pref_height_min_inches: pref_height_min_inches ?? null,
                        pref_height_max_inches: pref_height_max_inches ?? null,
                        pref_country: pref_country ?? null,
                        pref_city: pref_city ?? null,
                        pref_nationality: pref_nationality ?? null,
                        pref_marital_status: pref_marital_status ?? null,
                        pref_has_children: pref_has_children ?? null,
                        pref_religion: pref_religion ?? null,
                        pref_sect: pref_sect ?? null,
                        pref_religious_practice_level: pref_religious_practice_level ?? null,
                        pref_caste: pref_caste ?? null,
                        pref_mother_tongue: pref_mother_tongue ?? null,
                        pref_education: pref_education ?? null,
                        pref_employment_type: pref_employment_type ?? null,
                        pref_monthly_salary: pref_monthly_salary ?? null,
                        pref_body_type: pref_body_type ?? null,
                        pref_willing_to_relocate: pref_willing_to_relocate ?? 0,
                    },
                    type: QueryTypes.INSERT,
                }
            );
        }

        return res.json({
            success: true,
            message: 'Preferences saved successfully',
        });

    } catch (err) {
        console.error('savePreferences error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};