const express = require('express');
const router = express.Router();

const exploreController = require('../controllers/explore.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const {
    OPTIONS,
    COUNTRY_OPTIONS,
    SALARY_BY_CURRENCY,
    ALL_COUNTRIES,
    ALL_NATIONALITIES,
    ALL_CITIES,
    ALL_CURRENCIES,
    ALL_MOTHER_TONGUES,
    COUNTRY_TO_CURRENCY,
    CURRENCY_TO_COUNTRIES,
    COUNTRY_FLAGS,
    COUNTRY_CITIES,
    COUNTRY_SALARY_RANGES,
} = require('../config/profileOptions');

// ── Explore feed ──────────────────────────────────────────────────────────────
router.get('/get-explore', authenticate, exploreController.getExplore);

// ── Save partner preferences ──────────────────────────────────────────────────
router.post('/save-preferences', authenticate, exploreController.savePreferences);

// ── Global options (called once on filter open) ───────────────────────────────
router.get('/options', (req, res) => {
    res.json({
        success: true,

        // ── Country data ───────────────────────────────────────────────────
        countries: ALL_COUNTRIES,          // ["Pakistan", "UAE", ...]
        country_flags: COUNTRY_FLAGS,          // { Pakistan: "🇵🇰", ... }
        country_to_currency: COUNTRY_TO_CURRENCY,    // { Pakistan: "PKR", UAE: "AED", ... }
        currency_to_countries: CURRENCY_TO_COUNTRIES,  // { EUR: ["Germany", "France", ...], ... }
        country_salary_ranges: COUNTRY_SALARY_RANGES,  // { Pakistan: ["No preference", ...], ... }

        // ── Aggregated lists ───────────────────────────────────────────────
        all_nationalities: ALL_NATIONALITIES,      // every nationality sorted A-Z
        all_cities: ALL_CITIES,             // every city across all countries
        all_currencies: ALL_CURRENCIES,         // ["AED", "AUD", "BHD", ...]
        all_mother_tongues: ALL_MOTHER_TONGUES,     // every language across all countries

        // ── Profile field options ──────────────────────────────────────────
        religions: OPTIONS.religions,
        sects: OPTIONS.sects,          // { Muslim: [...], Christian: [...], ... }
        marital_statuses: OPTIONS.marital_statuses,
        education_levels: OPTIONS.education_levels,
        body_types: OPTIONS.body_types,
        employment_types: OPTIONS.employment_types,
        has_children: OPTIONS.has_children,
        practice_levels: OPTIONS.practice_levels,
        castes: OPTIONS.castes,
        interests: OPTIONS.interests,
        willing_to_relocate: OPTIONS.willing_to_relocate,
    });
});

// ── Country-specific options (called when user selects a country) ─────────────
router.get('/country/:country', (req, res) => {
    const country = req.params.country;
    const data = COUNTRY_OPTIONS[country];

    if (!data) {
        return res.status(404).json({
            success: false,
            message: `Country "${country}" not found.`,
        });
    }

    const currency = data.currencies?.[0] || "USD";
    const monthly_salaries = SALARY_BY_CURRENCY[currency] || SALARY_BY_CURRENCY["USD"];

    res.json({
        success: true,

        // ── Identity ───────────────────────────────────────────────────────
        country,
        flag: data.flag || "",
        nationalities: data.nationalities || ["Other"],
        currencies: data.currencies || ["USD"],
        currency,                                        // primary currency e.g. "PKR"

        // ── Location ───────────────────────────────────────────────────────
        cities: data.cities || ["Other"],

        // ── Language ───────────────────────────────────────────────────────
        mother_tongues: data.mother_tongues || [],

        // ── Salary ─────────────────────────────────────────────────────────
        monthly_salaries,
    });
});

module.exports = router;
