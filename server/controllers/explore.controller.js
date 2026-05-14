'use strict';

import db from '../models/index.js';
const { User, Profile, Interest, Dislike, Preference, Option, Guardian } = db;
import { Op } from 'sequelize';

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
                // ✅ constants fields
                family_backgrounds: _parse(row.family_backgrounds),
                about_me: _parse(row.about_me),
                relationship_options: _parse(row.relationship_options),
            };
        }
    }
    return _globalCache;
};

const loadAllCountries = async () => {
    if (_countryCache.__all) return _countryCache.__all;
    const rows = await Option.findAll({
        attributes: ['country', 'flag', 'currency', 'nationalities', 'mother_tongues', 'cities', 'monthly_salary'],
    });
    _countryCache.__all = rows
        .filter(r => r.country) // exclude global row (country IS NULL)
        .map(r => ({
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
// ─────────────────────────────────────────────────────────────────────────────
export const getOptions = async (req, res) => {
    try {
        const [global, allCountries, prefs] = await Promise.all([
            loadGlobal(),
            loadAllCountries(),
            Preference.findOne({ where: { individual_id: req.user.id } }),
        ]);

        if (!global) return res.status(500).json({ error: 'Options not configured' });

        const COUNTRY_FLAGS = Object.fromEntries(allCountries.map(c => [c.country, c.flag]));
        const COUNTRY_TO_CURRENCY = Object.fromEntries(allCountries.map(c => [c.country, c.currency]));
        const APP_COUNTRIES = allCountries.map(c => c.country);

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
            // ── App countries ──────────────────────────────────────────────
            countries: APP_COUNTRIES,
            country_flags: COUNTRY_FLAGS,
            country_to_currency: COUNTRY_TO_CURRENCY,
            country_data: COUNTRY_DATA,
            // ── World data ─────────────────────────────────────────────────
            all_countries: global.all_countries,
            all_nationalities: global.nationalities,
            all_mother_tongues: global.mother_tongues,
            // ── Global options ─────────────────────────────────────────────
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
            // ✅ constants from DB
            family_backgrounds: global.family_backgrounds,
            about_me: global.about_me,
            relationship_options: global.relationship_options,
            // ── Saved preferences ──────────────────────────────────────────
            preferences: parsedPrefs,
        });

    } catch (err) {
        console.error('getOptions error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /explore/country/:country
// ─────────────────────────────────────────────────────────────────────────────
export const getCountryOptions = async (req, res) => {
    try {
        const allCountries = await loadAllCountries();
        const global = await loadGlobal();
        const countryName = req.params.country;
        const data = allCountries.find(c => c.country === countryName);

        if (!data) return res.json({ success: false, message: `Country "${countryName}" not found.` });

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
export const getExplore = async (req, res) => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 GET EXPLORE - START');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser) return res.json({ error: 'User not found' });

        const currentProfile = await Profile.findOne({
            where: { individual_id: currentUser.id }
        });
        if (!currentProfile) return res.json({ error: 'Profile not found' });

        const prefs = await Preference.findOne({
            where: { individual_id: currentUser.id }
        });

        // ✅ Extract query parameters from request
        const {
            gender,
            city,
            country,      // Single country
            countries,    // Multiple countries (comma-separated)
            minAge,
            maxAge,
            isVerified,
            isPremium,
            isOnline
        } = req.query;

        console.log('📥 Filters received:', req.query);

        // Get exclusions
        const sentInterests = await Interest.findAll({
            where: { from_user: currentUser.id },
            attributes: ['to_user'],
            raw: true
        });

        const receivedInterests = await Interest.findAll({
            where: { to_user: currentUser.id },
            attributes: ['from_user'],
            raw: true
        });

        const dislikesSent = await Dislike.findAll({
            where: { user_id: currentUser.id },
            attributes: ['target_user_id'],
            raw: true
        });

        const excludeIds = [
            Number(currentUser.id),
            ...sentInterests.map(i => i.to_user),
            ...dislikesSent.map(d => d.target_user_id),
            ...receivedInterests.map(i => i.from_user),
        ].filter(id => id != null);

        console.log('🚫 Excluding', excludeIds.length, 'user IDs');

        // ✅ Build base where clause
        const baseWhere = {
            individual_id: { [Op.notIn]: excludeIds },
            is_profile_completed: 1
        };

        // Gender filter
        if (gender) {
            baseWhere.gender = gender;
        } else if (currentProfile.gender) {
            baseWhere.gender = currentProfile.gender === 'male' ? 'female' : 'male';
        }

        // ✅ COUNTRY FILTER - Handle single OR multiple countries
        if (country) {
            // Single country
            baseWhere.country = country;
            console.log('✅ Applied single country filter:', country);
        } else if (countries) {
            // Multiple countries - split by comma
            const countryList = countries.split(',').map(c => c.trim()).filter(Boolean);
            if (countryList.length > 0) {
                baseWhere.country = { [Op.in]: countryList };
                console.log('✅ Applied multiple countries filter:', countryList);
            }
        }

        // ✅ CITY FILTER (HARD CONDITION)
        if (city) {
            baseWhere.city = city;
            console.log('✅ Applied city filter:', city);
        }

        // ✅ Build User include conditions
        const userIncludeWhere = {};

        // ✅ VERIFIED FILTER (HARD CONDITION)
        if (isVerified === '1' || isVerified === 'true') {
            userIncludeWhere.is_verified = true;
            console.log('✅ Applied verified filter');
        }

        // ✅ PREMIUM FILTER (HARD CONDITION)
        if (isPremium === '1' || isPremium === 'true') {
            userIncludeWhere.is_pro = true;
            console.log('✅ Applied premium filter');
        }

        // ✅ ONLINE FILTER (HARD CONDITION - last seen within 1 hour)
        if (isOnline === '1' || isOnline === 'true') {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            userIncludeWhere.last_seen = { [Op.gte]: oneHourAgo };
            console.log('✅ Applied online filter');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Final WHERE clauses:');
        console.log('baseWhere:', JSON.stringify(baseWhere, null, 2));
        console.log('userIncludeWhere:', JSON.stringify(userIncludeWhere, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // ✅ Get all profiles with applied filters
        const allProfiles = await Profile.findAll({
            where: baseWhere,
            include: [
                {
                    model: User.unscoped(),
                    as: 'user',
                    where: Object.keys(userIncludeWhere).length > 0 ? userIncludeWhere : undefined,
                    required: true
                },
                {
                    model: Guardian,
                    as: 'asIndividual',
                    required: false,
                    attributes: ['id', 'guardian_id']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 100,
        });

        console.log('📊 Found', allProfiles.length, 'profiles before age filtering');

        // ✅ Helper function to calculate age from date_of_birth
        const calculateAge = (dateOfBirth) => {
            if (!dateOfBirth) return null;
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };

        // ✅ Helper function to check if age is valid
        const isValidAge = (age) => {
            return age !== null && age !== undefined && age > 0 && age <= 120;
        };

        // ✅ Filter by age if minAge/maxAge specified
        let filteredProfiles = allProfiles;

        if (minAge || maxAge) {
            filteredProfiles = allProfiles.filter(profile => {
                let profileAge = profile.age;

                if (profileAge === null || profileAge === undefined) {
                    profileAge = calculateAge(profile.date_of_birth);
                }

                // If age is invalid, INCLUDE the profile anyway
                if (!isValidAge(profileAge)) {
                    console.log(`⚠️ Invalid age for ${profile.name} (age: ${profileAge}), including anyway`);
                    return true;
                }

                // Check age range for valid ages
                const min = minAge ? parseInt(minAge) : 0;
                const max = maxAge ? parseInt(maxAge) : 999;

                const inRange = profileAge >= min && profileAge <= max;

                if (!inRange) {
                    console.log(`❌ Filtered out ${profile.name}: age ${profileAge} not in range ${min}-${max}`);
                } else {
                    console.log(`✅ Included ${profile.name}: age ${profileAge} in range ${min}-${max}`);
                }

                return inRange;
            });

            console.log(`📊 After age filtering: ${filteredProfiles.length} profiles (from ${allProfiles.length})`);
        }

        // Rest of preference matching code stays the same...
        const profilesWithMatchFlag = filteredProfiles.map(profile => {
            const profileData = profile.toJSON();

            if (!profileData.age && profileData.date_of_birth) {
                const calculatedAge = calculateAge(profileData.date_of_birth);
                if (isValidAge(calculatedAge)) {
                    profileData.age = calculatedAge;
                }
            }

            if (!prefs) {
                return { ...profileData, noPrefsMatch: false };
            }

            let matches = true;

            if (!minAge && !maxAge) {
                const profileAge = profileData.age || calculateAge(profileData.date_of_birth);
                if (isValidAge(profileAge)) {
                    if (prefs.pref_age_min && profileAge < prefs.pref_age_min) matches = false;
                    if (prefs.pref_age_max && profileAge > prefs.pref_age_max) matches = false;
                }
            }

            if (prefs.pref_height_min_inches && profile.height_inches < prefs.pref_height_min_inches) matches = false;
            if (prefs.pref_height_max_inches && profile.height_inches > prefs.pref_height_max_inches) matches = false;
            if (!city && prefs.pref_city && profile.city !== prefs.pref_city) matches = false;
            if (prefs.pref_religion && profile.religion !== prefs.pref_religion) matches = false;
            if (prefs.pref_religious_practice_level && profile.religious_practice_level !== prefs.pref_religious_practice_level) matches = false;
            if (prefs.pref_education && profile.education !== prefs.pref_education) matches = false;
            if (prefs.pref_monthly_salary && profile.monthly_salary < prefs.pref_monthly_salary) matches = false;
            if (prefs.pref_has_children !== null && profile.has_children !== prefs.pref_has_children) matches = false;
            if (prefs.pref_willing_to_relocate !== null && profile.willing_to_relocate !== prefs.pref_willing_to_relocate) matches = false;

            const checkJsonArray = (prefField, profileField) => {
                if (!prefField) return true;
                try {
                    const prefArray = typeof prefField === 'string' ? JSON.parse(prefField) : prefField;
                    if (!Array.isArray(prefArray) || prefArray.length === 0) return true;
                    return prefArray.includes(profileField);
                } catch {
                    return true;
                }
            };

            if (!checkJsonArray(prefs.pref_marital_status, profile.marital_status)) matches = false;
            if (!checkJsonArray(prefs.pref_nationality, profile.nationality)) matches = false;
            if (!country && !countries && !checkJsonArray(prefs.pref_country, profile.country)) matches = false;
            if (!checkJsonArray(prefs.pref_sect, profile.sect)) matches = false;
            if (!checkJsonArray(prefs.pref_body_type, profile.body_type)) matches = false;
            if (!checkJsonArray(prefs.pref_caste, profile.caste)) matches = false;
            if (!checkJsonArray(prefs.pref_mother_tongue, profile.mother_tongue)) matches = false;
            if (!checkJsonArray(prefs.pref_employment_type, profile.employment_type)) matches = false;

            return {
                ...profileData,
                noPrefsMatch: !matches
            };
        });

        const sortedProfiles = profilesWithMatchFlag.sort((a, b) => {
            if (a.noPrefsMatch === b.noPrefsMatch) return 0;
            return a.noPrefsMatch ? 1 : -1;
        });

        const finalProfiles = sortedProfiles.slice(0, 50);

        console.log('✅ Returning', finalProfiles.length, 'profiles');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return res.json({
            success: true,
            profiles: finalProfiles,
            applied_prefs: !!prefs,
            applied_filters: {
                gender: gender || null,
                city: city || null,
                country: country || null,
                countries: countries ? countries.split(',') : null,
                minAge: minAge || null,
                maxAge: maxAge || null,
                isVerified: isVerified === '1',
                isPremium: isPremium === '1',
                isOnline: isOnline === '1'
            }
        });

    } catch (err) {
        console.error('❌ ERROR:', err);
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err });
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// POST /explore/save-preferences
// ─────────────────────────────────────────────────────────────────────────────
export const savePreferences = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from JWT (e.g., 102)


        const {
            pref_gender, pref_age_min, pref_age_max,
            pref_height_min_inches, pref_height_max_inches,
            pref_country, pref_city, pref_nationality,
            pref_marital_status, pref_has_children,
            pref_religion, pref_sect, pref_religious_practice_level,
            pref_caste, pref_mother_tongue, pref_education,
            pref_employment_type, pref_monthly_salary,
            pref_body_type, pref_willing_to_relocate,
            pref_profession,
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


        // ✅ Use userId directly
        const [preference, created] = await Preference.findOrCreate({
            where: { individual_id: userId },
            defaults: { individual_id: userId, ...payload },
        });

        if (!created) {
            console.log('📝 Updating existing preference');
            await preference.update(payload);
        } else {
            console.log('✨ Created new preference');
        }


        return res.json({
            success: true,
            message: 'Preferences saved successfully',
            data: {
                created,
                preference: preference.toJSON()
            }
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: 'Server error',
            message: err,
        });
    }
};


// ─────────────────────────────────────────────────────────────────────────────
// GET /explore/get-preferences
// ─────────────────────────────────────────────────────────────────────────────
export const getPreferences = async (req, res) => {
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
// POST /explore/update-option (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateOption = async (req, res) => {
    try {
        const { country, field, value } = req.body;
        if (!field || value === undefined) return res.json({ error: 'field and value required' });
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

export default {
    getOptions,
    getCountryOptions,
    getExplore,
    savePreferences,
    getPreferences,
    updateOption,
};