'use strict';

const db = require('../models');
const { User, Profile, Interest, Dislike, Preference, Option } = db;
const { Op } = require('sequelize');

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache
// ─────────────────────────────────────────────────────────────────────────────
let _globalCache = null;
let _countryCache = {};

const loadGlobal = async () => {
    if (!_globalCache) {
        const row = await Option.findOne();
        if (row) {
            _globalCache = {
                religions: _parse(row.religions),
                sects: _parse(row.sects),
                castes: _parse(row.castes),
                marital_statuses: _parse(row.marital_statuses),
                education_levels: _parse(row.education_levels),
                body_types: _parse(row.body_types),
                employment_types: _parse(row.employment_types),
                has_children: _parse(row.has_children),
                practice_levels: _parse(row.practice_levels),
                willing_to_relocate: _parse(row.willing_to_relocate),
                interests: _parse(row.interests),
                professions: _parse(row.professions),
                monthly_salary: _parse(row.monthly_salary),
                nationalities: _parse(row.nationalities),
                all_countries: _parse(row.all_countries),
                mother_tongues: _parse(row.mother_tongues),
            };
        }
    }
    return _globalCache;
};

const loadAllCountries = async () => {
    // Only load once — cache in global
    if (_countryCache.__all) return _countryCache.__all;
    const rows = await Option.findAll({
        attributes: ['country', 'flag', 'currency', 'nationalities', 'mother_tongues', 'cities', 'monthly_salary'],
    });
    _countryCache.__all = rows.map(r => ({
        country: r.country,
        flag: r.flag,
        currency: r.currency,
        nationalities: _parse(r.nationalities),
        mother_tongues: _parse(r.mother_tongues),
        cities: _parse(r.cities),
        monthly_salary: _parse(r.monthly_salary),
    }));
    return _countryCache.__all;
};

const clearCache = () => { _globalCache = null; _countryCache = {}; };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const _parse = (value) => {
    if (!value) return [];
    try { return typeof value === 'string' ? JSON.parse(value) : value; }
    catch { return []; }
};

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
// Returns ALL global options + all country data + saved prefs in ONE call
// ─────────────────────────────────────────────────────────────────────────────
exports.getOptions = async (req, res) => {
    try {
        const [global, allCountries, prefs] = await Promise.all([
            loadGlobal(),
            loadAllCountries(),
            Preference.findOne({ where: { individual_id: req.user.id } }),
        ]);

        if (!global) return res.status(500).json({ error: 'Options not configured' });

        // ── Build country maps ─────────────────────────────────────────────
        const COUNTRY_FLAGS = Object.fromEntries(allCountries.map(c => [c.country, c.flag]));
        const COUNTRY_TO_CURRENCY = Object.fromEntries(allCountries.map(c => [c.country, c.currency]));
        const APP_COUNTRIES = allCountries.map(c => c.country);

        // ── Build country_data map { Pakistan: { cities, mother_tongues, nationalities, monthly_salaries } }
        const COUNTRY_DATA = {};
        for (const c of allCountries) {
            const salaryMap = global.monthly_salary || {};
            const monthly_salaries = salaryMap[c.currency] || salaryMap['USD'] || [];
            COUNTRY_DATA[c.country] = {
                flag: c.flag,
                currency: c.currency,
                cities: c.cities,
                mother_tongues: c.mother_tongues,
                nationalities: c.nationalities,
                monthly_salaries,
            };
        }

        // ── Parse saved prefs ──────────────────────────────────────────────
        const parsedPrefs = prefs ? {
            ...prefs.toJSON(),
            pref_marital_status: parseJsonPref(prefs.pref_marital_status),
            pref_nationality: parseJsonPref(prefs.pref_nationality),
            pref_country: parseJsonPref(prefs.pref_country),
            pref_sect: parseJsonPref(prefs.pref_sect),
            pref_body_type: parseJsonPref(prefs.pref_body_type),
            pref_caste: parseJsonPref(prefs.pref_caste),
            pref_mother_tongue: parseJsonPref(prefs.pref_mother_tongue),
            pref_employment_type: parseJsonPref(prefs.pref_employment_type),
        } : null;

        return res.json({
            success: true,

            // ── countries ──────────────────────────────────────────────────
            countries: APP_COUNTRIES,
            country_flags: COUNTRY_FLAGS,
            country_to_currency: COUNTRY_TO_CURRENCY,
            country_data: COUNTRY_DATA,   // ✅ all country details in one map

            // ── world data ─────────────────────────────────────────────────
            all_countries: global.all_countries,
            all_nationalities: global.nationalities,
            all_mother_tongues: global.mother_tongues,

            // ── global options ─────────────────────────────────────────────
            religions: global.religions,
            sects: global.sects,
            castes: global.castes,
            marital_statuses: global.marital_statuses,
            education_levels: global.education_levels,
            body_types: global.body_types,
            employment_types: global.employment_types,
            has_children: global.has_children,
            practice_levels: global.practice_levels,
            willing_to_relocate: global.willing_to_relocate,
            interests: global.interests,
            professions: global.professions,

            // ── saved prefs (null if none) ─────────────────────────────────
            preferences: parsedPrefs,
        });

    } catch (err) {
        console.error('getOptions error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /explore/country/:country  (kept for manual country change)
// ─────────────────────────────────────────────────────────────────────────────
exports.getCountryOptions = async (req, res) => {
    try {
        const allCountries = await loadAllCountries();
        const global = await loadGlobal();
        const countryName = req.params.country;
        const data = allCountries.find(c => c.country === countryName);

        if (!data) {
            return res.status(404).json({ success: false, message: `Country "${countryName}" not found.` });
        }

        const salaryMap = global?.monthly_salary || {};
        const monthly_salaries = salaryMap[data.currency] || salaryMap['USD'] || [];

        return res.json({
            success: true,
            country: data.country,
            flag: data.flag,
            currency: data.currency,
            nationalities: data.nationalities,
            cities: data.cities,
            mother_tongues: data.mother_tongues,
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
            include: [{ model: User.unscoped(), as: 'individual', attributes: ['id', 'is_online', 'is_premium'], required: true }],
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
                ? (pref_willing_to_relocate ? 1 : 0) : null,
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
// POST /explore/update-option  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateOption = async (req, res) => {
    try {
        const { country, field, value } = req.body;
        if (!field || value === undefined) return res.status(400).json({ error: 'field and value required' });
        const where = country ? { country } : {};
        const update = { [field]: JSON.stringify(value) };
        await Option.update(update, { where });
        clearCache();
        return res.json({ success: true, message: `"${field}" updated successfully` });
    } catch (err) {
        console.error('updateOption error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};