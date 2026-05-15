import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { FiSliders, FiX } from "react-icons/fi";
import ExploreService from "../services/ExploreService";

import { toast } from "react-toastify";
import SelectOption from "../../../ui/select_option";

// Helper components
function SectionLabel({ children }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <div className="h-px flex-1" style={{ background: "rgba(27,77,62,0.1)" }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>
                {children}
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(27,77,62,0.1)" }} />
        </div>
    );
}

function CircularProgress({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
            <svg className="w-10 h-10 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="rgba(27,77,62,0.15)" strokeWidth="3" />
                <path d="M21 12a9 9 0 00-9-9" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
}

function SuccessDialog({ onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
            >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)" }}>
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Preferences Saved!</h3>
                <p className="text-sm text-gray-600">Your match preferences have been updated successfully.</p>
            </motion.div>
        </motion.div>
    );
}

function ToggleCard({ title, subtitle, value, onChange }) {
    return (
        <div
            onClick={() => onChange(!value)}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
        >
            <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
                type="button"
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: value ? "var(--color-primary)" : "#d1d5db" }}
            >
                <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                    style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
                />
            </button>
        </div>
    );
}

function RangeField({ label, value, onChange, min, max, displayFn }) {
    const pct = (v) => ((v - min) / (max - min)) * 100;
    const fmt = displayFn || ((v) => v);
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>
                    {fmt(value[0])} – {fmt(value[1])}
                </span>
            </div>
            <div className="relative h-5 flex items-center mb-1">
                <div className="absolute left-0 right-0 h-1.5 rounded-full bg-gray-200" />
                <div className="absolute h-1.5 rounded-full" style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%`, background: "var(--color-primary)" }} />
                <input type="range" min={min} max={max} value={value[0]}
                    onChange={e => onChange([Math.min(Number(e.target.value), value[1] - 1), value[1]])}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer" style={{ zIndex: value[0] > max - 5 ? 5 : 3 }} />
                <input type="range" min={min} max={max} value={value[1]}
                    onChange={e => onChange([value[0], Math.max(Number(e.target.value), value[0] + 1)])}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer" style={{ zIndex: 4 }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>{fmt(min)}</span><span>{fmt(max)}</span></div>
            <style>{`input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--color-primary,#a855f7);border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.2);cursor:pointer}input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--color-primary,#a855f7);border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.2);cursor:pointer}`}</style>
        </div>
    );
}

// Helper functions
const first = (val) => Array.isArray(val) ? val[0] : val;
const inchesToLabel = (inches) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
};
const FEET_RANGE = { min: 60, max: 90 };

export default function FilterRow({ isOpen, onClose, onApply }) {
    const [ageRange, setAgeRange] = useState([18, 35]);
    const [heightRange, setHeightRange] = useState([FEET_RANGE.min, FEET_RANGE.max]);
    const [gender, setGender] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [nationality, setNationality] = useState("");
    const [maritalStatus, setMaritalStatus] = useState("");
    const [hasChildren, setHasChildren] = useState("");
    const [bodyType, setBodyType] = useState("");
    const [willingToRelocate, setWillingToRelocate] = useState(false);
    const [religion, setReligion] = useState("");
    const [sect, setSect] = useState("");
    const [practiceLevel, setPracticeLevel] = useState("");
    const [ethnicity, setEthnicity] = useState("");
    const [motherTongue, setMotherTongue] = useState("");
    const [education, setEducation] = useState("");
    const [profession, setProfession] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [monthlySalary, setMonthlySalary] = useState("");

    const [opts, setOpts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [defaultCountry, setDefaultCountry] = useState("");

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            if (!isMountedRef.current) return;

            setLoading(true);
            try {
                const authData = JSON.parse(localStorage.getItem("authData") || "{}");
                const profileCountry = authData?.profile?.country || "";

                if (!isMountedRef.current) return;
                setDefaultCountry(profileCountry);

                const data = await ExploreService.getOptions();

                if (!isMountedRef.current) return;
                setOpts(data);

                const prefs = data.preferences;

                if (prefs) {
                    if (prefs.pref_gender) setGender(prefs.pref_gender);
                    if (prefs.pref_age_min != null && prefs.pref_age_max != null)
                        setAgeRange([Number(prefs.pref_age_min), Number(prefs.pref_age_max)]);
                    if (prefs.pref_height_min_inches != null && prefs.pref_height_max_inches != null)
                        setHeightRange([Number(prefs.pref_height_min_inches), Number(prefs.pref_height_max_inches)]);
                    if (prefs.pref_religion) setReligion(prefs.pref_religion);
                    if (prefs.pref_sect) setSect(first(prefs.pref_sect));
                    if (prefs.pref_religious_practice_level) setPracticeLevel(prefs.pref_religious_practice_level);
                    if (prefs.pref_education) setEducation(prefs.pref_education);
                    if (prefs.pref_has_children) setHasChildren(prefs.pref_has_children);
                    if (prefs.pref_willing_to_relocate != null)
                        setWillingToRelocate(Boolean(Number(prefs.pref_willing_to_relocate)));
                    if (prefs.pref_marital_status) setMaritalStatus(first(prefs.pref_marital_status));
                    if (prefs.pref_nationality) setNationality(first(prefs.pref_nationality));
                    if (prefs.pref_body_type) setBodyType(first(prefs.pref_body_type));
                    if (prefs.pref_caste) setEthnicity(first(prefs.pref_caste));
                    if (prefs.pref_mother_tongue) setMotherTongue(first(prefs.pref_mother_tongue));
                    if (prefs.pref_employment_type) setEmploymentType(first(prefs.pref_employment_type));
                    if (prefs.pref_monthly_salary) setMonthlySalary(prefs.pref_monthly_salary);
                    if (prefs.pref_city) setCity(prefs.pref_city);

                    const savedCountry = first(prefs.pref_country);
                    if (savedCountry) setCountry(savedCountry);
                } else if (profileCountry) {
                    setCountry(profileCountry);
                }

            } catch (err) {
                console.error("Filter init error:", err);
                if (isMountedRef.current) {
                    toast.error("Failed to load preferences");
                }
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        };

        init();
    }, [isOpen]);

    if (!isOpen) return null;

    const COUNTRIES = opts?.countries ?? [];
    const COUNTRY_FLAGS = opts?.country_flags ?? {};
    const COUNTRY_DATA = opts?.country_data ?? {};
    const ALL_NATS = opts?.all_nationalities ?? [];
    const ALL_TONGUES = opts?.all_mother_tongues ?? [];
    const RELIGIONS = opts?.religions ?? [];
    const SECTS = opts?.sects ?? [];
    const CASTES = opts?.castes ?? [];
    const MARITAL = opts?.marital_statuses ?? [];
    const EDUCATION = opts?.education_levels ?? [];
    const BODY_TYPES = opts?.body_types ?? [];
    const EMPLOYMENT = opts?.employment_types ?? [];
    const HAS_CHILDREN = opts?.has_children ?? [];
    const PRACTICE_LVLS = opts?.practice_levels ?? [];
    const PROFESSIONS = opts?.professions ?? [];

    const currentCountryData = country ? (COUNTRY_DATA[country] ?? null) : null;
    const CITIES = currentCountryData?.cities ?? [];
    const COUNTRY_TONGUES = currentCountryData?.mother_tongues ?? ALL_TONGUES;
    const SALARY_OPTIONS = currentCountryData?.monthly_salaries ?? [];
    const CURRENCY = currentCountryData?.currency ?? "";
    const NATIONALITIES = currentCountryData?.nationalities ?? ALL_NATS;

    // ✅ Convert arrays to SelectOption format
    const countryOptions = COUNTRIES.map(c => ({
        value: c,
        label: `${COUNTRY_FLAGS[c] ?? "🌍"} ${c}`
    }));

    const cityOptions = CITIES.map(c => ({ value: c, label: c }));
    const nationalityOptions = NATIONALITIES.map(n => ({ value: n, label: n }));
    const maritalOptions = MARITAL.map(m => ({ value: m, label: m }));
    const hasChildrenOptions = HAS_CHILDREN.map(h => ({ value: h, label: h }));
    const bodyTypeOptions = BODY_TYPES.map(b => ({ value: b, label: b }));
    const religionOptions = RELIGIONS.map(r => ({ value: r, label: r }));
    const sectOptions = SECTS.map(s => ({ value: s, label: s }));
    const practiceLevelOptions = PRACTICE_LVLS.map(p => ({ value: p, label: p }));
    const ethnicityOptions = CASTES.map(c => ({ value: c, label: c }));
    const motherTongueOptions = COUNTRY_TONGUES.map(m => ({ value: m, label: m }));
    const educationOptions = EDUCATION.map(e => ({ value: e, label: e }));
    const professionOptions = PROFESSIONS.map(p => ({ value: p, label: p }));
    const employmentOptions = EMPLOYMENT.map(e => ({ value: e, label: e }));
    const salaryOptions = SALARY_OPTIONS.map(s => ({ value: s, label: s }));

    const handleCountryChange = (val) => {
        setCountry(val);
        setCity("");
        setMonthlySalary("");
    };

    const handleReset = () => {
        if (!isMountedRef.current) return;

        setAgeRange([18, 35]);
        // @ts-ignore
        setHeightRange(FEET_RANGE);
        setGender("");
        setCountry(defaultCountry);
        setCity("");
        setNationality("");
        setMaritalStatus("");
        setHasChildren("");
        setBodyType("");
        setWillingToRelocate(false);
        setReligion("");
        setSect("");
        setPracticeLevel("");
        setEthnicity("");
        setMotherTongue("");
        setEducation("");
        setProfession("");
        setEmploymentType("");
        setMonthlySalary("");
        setSaveError("");
    };

    const handleSubmitFilters = async () => {
        if (!isMountedRef.current) return;

        setSaving(true);
        setSaveError("");

        try {
            const payload = {
                pref_gender: gender || null,
                pref_age_min: ageRange[0],
                pref_age_max: ageRange[1],
                pref_height_min_inches: heightRange[0],
                pref_height_max_inches: heightRange[1],
                pref_country: country || null,
                pref_city: city || null,
                pref_nationality: nationality || null,
                pref_marital_status: maritalStatus || null,
                pref_has_children: hasChildren || null,
                pref_body_type: bodyType || null,
                pref_willing_to_relocate: willingToRelocate ? 1 : 0,
                pref_religion: religion || null,
                pref_sect: sect || null,
                pref_religious_practice_level: practiceLevel || null,
                pref_caste: ethnicity || null,
                pref_mother_tongue: motherTongue || null,
                pref_education: education || null,
                pref_employment_type: employmentType || null,
                pref_monthly_salary: monthlySalary || null,
                pref_profession: profession || null,
            };

            const result = await ExploreService.savePreferences(payload);

            if (!isMountedRef.current) return;

            setShowSuccess(true);

            setTimeout(() => {
                if (!isMountedRef.current) return;

                setShowSuccess(false);
                onClose();

                if (onApply) {
                    onApply(payload);
                }
            }, 2000);

        } catch (err) {
            console.error("❌ Save error:", err);
            if (isMountedRef.current) {
                setSaveError(err.message || "Failed to save preferences. Please try again.");
            }
        } finally {
            if (isMountedRef.current) {
                setSaving(false);
            }
        }
    };

    try {
        return createPortal(
            <div
                className="flex items-center justify-center"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    backdropFilter: "blur(4px)",
                    padding: 15,
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white w-full sm:max-w-md flex flex-col relative"
                    style={{
                        borderRadius: "24px",
                        maxHeight: "88vh",
                        overflow: "hidden",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.18)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <AnimatePresence>
                        {showSuccess && <SuccessDialog onClose={() => setShowSuccess(false)} />}
                    </AnimatePresence>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0"
                        style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
                                <FiSliders className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Partner Preferences</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Refine your match criteria</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FiX className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        {loading ? (
                            <CircularProgress message="Loading your preferences…" />
                        ) : (
                            <>
                                <SectionLabel>Basic</SectionLabel>
                                <RangeField
                                    label="Age Range"
                                    value={ageRange}
                                    onChange={setAgeRange}
                                    min={18}
                                    max={70} displayFn={undefined} />
                                <RangeField
                                    label="Height"
                                    value={heightRange}
                                    onChange={setHeightRange}
                                    min={FEET_RANGE.min}
                                    max={FEET_RANGE.max}
                                    displayFn={inchesToLabel}
                                />
                                <SelectOption
                                    label="Marital Status"
                                    value={maritalStatus}
                                    onChange={setMaritalStatus}
                                    options={maritalOptions}
                                    placeholder="No preference"
                                    searchable={false}
                                />
                                <SelectOption
                                    label="Has Children"
                                    value={hasChildren}
                                    onChange={setHasChildren}
                                    options={hasChildrenOptions}
                                    placeholder="No preference"
                                    searchable={false}
                                />
                                <SelectOption
                                    label="Body Type"
                                    value={bodyType}
                                    onChange={setBodyType}
                                    options={bodyTypeOptions}
                                    placeholder="No preference"
                                    searchable={false}
                                />

                                <SectionLabel>Location</SectionLabel>
                                <SelectOption
                                    label="Country"
                                    value={country}
                                    onChange={handleCountryChange}
                                    options={countryOptions}
                                    placeholder="Any country"
                                    searchable={true}
                                />
                                {country && (
                                    <SelectOption
                                        label="City"
                                        value={city}
                                        onChange={setCity}
                                        options={cityOptions}
                                        placeholder="Any city"
                                        searchable={true}
                                    />
                                )}
                                <SelectOption
                                    label="Nationality"
                                    value={nationality}
                                    onChange={setNationality}
                                    options={nationalityOptions}
                                    placeholder="Any nationality"
                                    searchable={true}
                                />
                                <ToggleCard
                                    title="Willing to Relocate"
                                    subtitle="Include profiles open to relocating"
                                    value={willingToRelocate}
                                    onChange={setWillingToRelocate}
                                />

                                <SectionLabel>Religion & Background</SectionLabel>
                                <SelectOption
                                    label="Religion"
                                    value={religion}
                                    onChange={(val) => {
                                        setReligion(val);
                                        setSect("");
                                    }}
                                    options={religionOptions}
                                    placeholder="No preference"
                                    searchable={false}
                                />
                                <SelectOption
                                    label="Sect"
                                    value={sect}
                                    onChange={setSect}
                                    options={sectOptions}
                                    placeholder="Any sect"
                                    searchable={true}
                                />
                                <SelectOption
                                    label="Religious Practice Level"
                                    value={practiceLevel}
                                    onChange={setPracticeLevel}
                                    options={practiceLevelOptions}
                                    placeholder="No preference"
                                    searchable={false}
                                />
                                <SelectOption
                                    label="Ethnicity / Caste"
                                    value={ethnicity}
                                    onChange={setEthnicity}
                                    options={ethnicityOptions}
                                    placeholder="Any ethnicity"
                                    searchable={true}
                                />
                                <SelectOption
                                    label="Mother Tongue"
                                    value={motherTongue}
                                    onChange={setMotherTongue}
                                    options={motherTongueOptions}
                                    placeholder="No preference"
                                    searchable={true}
                                />

                                <SectionLabel>Career & Education</SectionLabel>
                                <SelectOption
                                    label="Education Level"
                                    value={education}
                                    onChange={setEducation}
                                    options={educationOptions}
                                    placeholder="No preference"
                                    searchable={false}
                                />
                                <SelectOption
                                    label="Profession"
                                    value={profession}
                                    onChange={setProfession}
                                    options={professionOptions}
                                    placeholder="Any profession"
                                    searchable={true}
                                />
                                <SelectOption
                                    label="Employment Type"
                                    value={employmentType}
                                    onChange={setEmploymentType}
                                    options={employmentOptions}
                                    placeholder="No preference"
                                    searchable={false}
                                />
                                {country && salaryOptions.length > 0 && (
                                    <SelectOption
                                        label={`Monthly Salary${CURRENCY ? ` (${CURRENCY})` : ""}`}
                                        value={monthlySalary}
                                        onChange={setMonthlySalary}
                                        options={salaryOptions}
                                        placeholder="Any salary"
                                        searchable={false}
                                    />
                                )}

                                {saveError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-4 py-3 rounded-2xl text-sm text-red-600 font-medium flex items-center gap-2"
                                        style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}
                                    >
                                        <FiX className="w-4 h-4 flex-shrink-0" />
                                        {saveError}
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && (
                        <div className="flex items-center justify-between gap-3 px-6 py-4 flex-shrink-0"
                            style={{ borderTop: "1px solid #f3f4f6" }}>
                            <button
                                onClick={handleReset}
                                className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Reset all
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 rounded-2xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitFilters}
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all flex items-center gap-2"
                                    style={{
                                        background: "var(--color-primary)",
                                        opacity: saving ? 0.75 : 1,
                                        cursor: saving ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {saving ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                                <path d="M21 12a9 9 0 00-9-9" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                            Saving…
                                        </>
                                    ) : (
                                        "Save Preferences"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>,
            document.body
        );
    } catch (error) {
        console.error("FilterRow portal render error:", error);
        return null;
    }
}