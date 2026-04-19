'use strict';

const db = require('../models');
const { User, Profile, Interest, Dislike, Preference, Setting } = db;
const { Op } = require('sequelize');

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache
// ─────────────────────────────────────────────────────────────────────────────
let _cachedOptions = null;

const loadOptions = async () => {
    if (!_cachedOptions) {
        const data = await Setting.getOptions();
        if (data) _cachedOptions = data;
    }
    return _cachedOptions;
};

const clearCache = () => { _cachedOptions = null; };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const parseJsonPref = (value) => {
    if (!value) return null;
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch {
        return value ? [value] : null;
    }
};

const toJsonPref = (value) => {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) return value.length > 0 ? JSON.stringify(value) : null;
    if (typeof value === 'string' && value.trim() !== '') return JSON.stringify([value]);
    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /explore/options
// ─────────────────────────────────────────────────────────────────────────────
exports.getOptions = async (req, res) => {
    try {
        const data = await loadOptions();
        if (!data) return res.status(500).json({ error: 'Options not configured in Settings table' });

        const { OPTIONS, COUNTRY_OPTIONS } = data;

        const ALL_COUNTRIES = Object.keys(COUNTRY_OPTIONS || {});
        const COUNTRY_FLAGS = Object.fromEntries(ALL_COUNTRIES.map(c => [c, COUNTRY_OPTIONS[c].flag]));
        const COUNTRY_TO_CURRENCY = Object.fromEntries(ALL_COUNTRIES.map(c => [c, COUNTRY_OPTIONS[c].currencies?.[0]]));
        const ALL_MOTHER_TONGUES = [...new Set(ALL_COUNTRIES.flatMap(c => COUNTRY_OPTIONS[c].mother_tongues || []))].sort();
        const ALL_NATIONALITIES = [...new Set(ALL_COUNTRIES.flatMap(c => COUNTRY_OPTIONS[c].nationalities || []))].sort();

        // ── sects: flatten object → unique flat array for filter dropdown ──
        // DB stores sect as plain string e.g. "Sunni", "Shia"
        // We extract all unique values from the sects object
        const SECTS_OBJ = OPTIONS?.sects ?? {};
        const SECTS_FLAT = [...new Set(Object.values(SECTS_OBJ).flat())].sort();

        return res.json({
            success: true,

            // countries
            countries: ALL_COUNTRIES,
            country_flags: COUNTRY_FLAGS,
            country_to_currency: COUNTRY_TO_CURRENCY,
            all_nationalities: ALL_NATIONALITIES,
            all_mother_tongues: ALL_MOTHER_TONGUES,

            // profile options
            religions: OPTIONS?.religions ?? [],
            sects: SECTS_OBJ,               // object { Muslim: [...] } for religion-based filtering
            sects_flat: SECTS_FLAT,              // flat array for standalone sect dropdown
            marital_statuses: OPTIONS?.marital_statuses ?? [],
            education_levels: OPTIONS?.education_levels ?? [],
            body_types: OPTIONS?.body_types ?? [],
            employment_types: OPTIONS?.employment_types ?? [],
            has_children: OPTIONS?.has_children ?? [],
            practice_levels: OPTIONS?.practice_levels ?? [],
            castes: OPTIONS?.castes ?? [],  // ✅ flat array ["Arain", "Butt", ...]
            interests: OPTIONS?.interests ?? [],
            willing_to_relocate: OPTIONS?.willing_to_relocate ?? [],
        });

    } catch (err) {
        console.error('getOptions error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /explore/country/:country
// ─────────────────────────────────────────────────────────────────────────────
exports.getCountryOptions = async (req, res) => {
    try {
        const data = await loadOptions();
        if (!data) return res.status(500).json({ error: 'Options not configured in Settings table' });

        const { COUNTRY_OPTIONS, SALARY_BY_CURRENCY } = data;
        const countryName = req.params.country;
        const countryData = COUNTRY_OPTIONS?.[countryName];

        if (!countryData) {
            return res.status(404).json({ success: false, message: `Country "${countryName}" not found.` });
        }

        const currency = countryData.currencies?.[0] || 'USD';
        const monthly_salaries = SALARY_BY_CURRENCY?.[currency] || SALARY_BY_CURRENCY?.['USD'] || [];

        return res.json({
            success: true,
            country: countryName,
            flag: countryData.flag || '',
            nationalities: countryData.nationalities || ['Other'],
            currencies: countryData.currencies || ['USD'],
            currency,
            cities: countryData.cities || ['Other'],
            mother_tongues: countryData.mother_tongues || [],
            monthly_salaries,
        });

    } catch (err) {
        console.error('getCountryOptions error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /explore/get-explore
// ─────────────────────────────────────────────────────────────────────────────
exports.getExplore = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        const prefs = await Preference.findOne({ where: { individual_id: currentUser.id } });

        // scalar fields
        const gender = req.query.gender || prefs?.pref_gender || null;
        const minAge = req.query.minAge || prefs?.pref_age_min || null;
        const maxAge = req.query.maxAge || prefs?.pref_age_max || null;
        const minHeight = req.query.minHeight || prefs?.pref_height_min_inches || null;
        const maxHeight = req.query.maxHeight || prefs?.pref_height_max_inches || null;
        const city = req.query.city || prefs?.pref_city || null;
        const religion = req.query.religion || prefs?.pref_religion || null;
        const practiceLevel = req.query.practiceLevel || prefs?.pref_religious_practice_level || null;
        const education = req.query.education || prefs?.pref_education || null;
        const monthlySalary = req.query.monthlySalary || prefs?.pref_monthly_salary || null;
        const hasChildren = req.query.hasChildren || prefs?.pref_has_children || null;
        const willingToRelocate = req.query.willingToRelocate || null;

        // JSON array fields
        const parseQuery = (key) => {
            const q = req.query[key];
            if (q) return Array.isArray(q) ? q : q.split(',').map(s => s.trim()).filter(Boolean);
            return null;
        };

        const maritalStatus = parseQuery('maritalStatus') || parseJsonPref(prefs?.pref_marital_status);
        const nationality = parseQuery('nationality') || parseJsonPref(prefs?.pref_nationality);
        const country = parseQuery('country') || parseJsonPref(prefs?.pref_country);
        const sect = parseQuery('sect') || parseJsonPref(prefs?.pref_sect);
        const bodyType = parseQuery('bodyType') || parseJsonPref(prefs?.pref_body_type);
        const caste = parseQuery('caste') || parseJsonPref(prefs?.pref_caste);
        const motherTongue = parseQuery('motherTongue') || parseJsonPref(prefs?.pref_mother_tongue);
        const employmentType = parseQuery('employmentType') || parseJsonPref(prefs?.pref_employment_type);

        // excluded IDs
        const [sentInterests, dislikesSent] = await Promise.all([
            Interest.findAll({ where: { from_user: currentUser.id }, attributes: ['to_user'], raw: true }),
            Dislike.findAll({ where: { user_id: currentUser.id }, attributes: ['target_user_id'], raw: true }),
        ]);

        const excludeIds = [
            Number(currentUser.id),
            ...sentInterests.map(i => i.to_user),
            ...dislikesSent.map(d => d.target_user_id),
        ].filter(id => id != null);

        const profileWhere = {
            individual_id: { [Op.notIn]: excludeIds.length ? excludeIds : [0] },
            ...(gender && { gender }),
            ...(city && { city }),
            ...(religion && { religion }),
            ...(practiceLevel && { religious_practice_level: practiceLevel }),
            ...(education && { education }),
            ...(monthlySalary && { monthly_salary: monthlySalary }),
            ...(hasChildren != null && hasChildren !== '' && { has_children: hasChildren }),
            ...(willingToRelocate != null && { willing_to_relocate: willingToRelocate }),
            ...(minAge && maxAge && { age: { [Op.between]: [Number(minAge), Number(maxAge)] } }),
            ...(minAge && !maxAge && { age: { [Op.gte]: Number(minAge) } }),
            ...(maxAge && !minAge && { age: { [Op.lte]: Number(maxAge) } }),
            ...(minHeight && maxHeight && { height_inches: { [Op.between]: [Number(minHeight), Number(maxHeight)] } }),
            ...(minHeight && !maxHeight && { height_inches: { [Op.gte]: Number(minHeight) } }),
            ...(maxHeight && !minHeight && { height_inches: { [Op.lte]: Number(maxHeight) } }),
            ...(maritalStatus?.length && { marital_status: { [Op.in]: maritalStatus } }),
            ...(nationality?.length && { nationality: { [Op.in]: nationality } }),
            ...(country?.length && { country: { [Op.in]: country } }),
            ...(sect?.length && { sect: { [Op.in]: sect } }),
            ...(bodyType?.length && { body_type: { [Op.in]: bodyType } }),
            ...(caste?.length && { caste: { [Op.in]: caste } }),
            ...(motherTongue?.length && { mother_tongue: { [Op.in]: motherTongue } }),
            ...(employmentType?.length && { employment_type: { [Op.in]: employmentType } }),
        };

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

        return res.json({ success: true, profiles, applied_prefs: !!prefs });

    } catch (err) {
        console.error('getExplore error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /explore/save-preferences
// ─────────────────────────────────────────────────────────────────────────────
exports.savePreferences = async (req, res) => {
    try {
        const individualId = req.user.id;

        const {
            pref_gender, pref_age_min, pref_age_max,
            pref_height_min_inches, pref_height_max_inches,
            pref_country, pref_city, pref_nationality,
            pref_marital_status, pref_has_children,
            pref_religion, pref_sect, pref_religious_practice_level,
            pref_caste, pref_mother_tongue, pref_education,
            pref_employment_type, pref_monthly_salary,
            pref_body_type, pref_willing_to_relocate,
        } = req.body;

        const payload = {
            pref_gender: pref_gender ?? null,
            pref_age_min: pref_age_min ?? null,
            pref_age_max: pref_age_max ?? null,
            pref_height_min_inches: pref_height_min_inches ?? null,
            pref_height_max_inches: pref_height_max_inches ?? null,
            pref_city: pref_city ?? null,
            pref_religion: pref_religion ?? null,
            pref_religious_practice_level: pref_religious_practice_level ?? null,
            pref_education: pref_education ?? null,
            pref_monthly_salary: pref_monthly_salary ?? null,
            pref_has_children: pref_has_children ?? null,
            pref_willing_to_relocate: pref_willing_to_relocate != null
                ? (pref_willing_to_relocate ? 1 : 0)
                : null,
            pref_marital_status: toJsonPref(pref_marital_status),
            pref_nationality: toJsonPref(pref_nationality),
            pref_country: toJsonPref(pref_country),
            pref_sect: toJsonPref(pref_sect),
            pref_body_type: toJsonPref(pref_body_type),
            pref_caste: toJsonPref(pref_caste),
            pref_mother_tongue: toJsonPref(pref_mother_tongue),
            pref_employment_type: toJsonPref(pref_employment_type),
        };

        const [preference, created] = await Preference.findOrCreate({
            where: { individual_id: individualId },
            defaults: { individual_id: individualId, ...payload },
        });

        if (!created) await preference.update(payload);

        return res.json({ success: true, message: 'Preferences saved successfully', created, preference });

    } catch (err) {
        console.error('savePreferences error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /explore/get-preferences
// ─────────────────────────────────────────────────────────────────────────────
exports.getPreferences = async (req, res) => {
    try {
        const prefs = await Preference.findOne({ where: { individual_id: req.user.id } });
        if (!prefs) return res.json({ success: true, preferences: null });

        const parsed = {
            ...prefs.toJSON(),
            pref_marital_status: parseJsonPref(prefs.pref_marital_status),
            pref_nationality: parseJsonPref(prefs.pref_nationality),
            pref_country: parseJsonPref(prefs.pref_country),
            pref_sect: parseJsonPref(prefs.pref_sect),
            pref_body_type: parseJsonPref(prefs.pref_body_type),
            pref_caste: parseJsonPref(prefs.pref_caste),
            pref_mother_tongue: parseJsonPref(prefs.pref_mother_tongue),
            pref_employment_type: parseJsonPref(prefs.pref_employment_type),
        };

        return res.json({ success: true, preferences: parsed });

    } catch (err) {
        console.error('getPreferences error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /explore/update-settings  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateSettings = async (req, res) => {
    try {
        const { profile_options } = req.body;
        if (!profile_options) return res.status(400).json({ error: 'profile_options required' });
        await Setting.setOptions(profile_options);
        clearCache();
        return res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        console.error('updateSettings error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};