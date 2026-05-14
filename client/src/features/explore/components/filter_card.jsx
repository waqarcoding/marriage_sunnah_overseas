import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiChevronDown, FiCheck, FiSliders } from "react-icons/fi";
import { motion, AnimatePresence } from "motion/react";
import ExploreService from "../services/ExploreService";

const FEET_RANGE = { min: 56, max: 84 };
const first = (val) => (!val ? "" : Array.isArray(val) ? (val[0] ?? "") : val);

function inchesToLabel(totalInches) {
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;
    return `${ft}'${inch}"`;
}

function CircularProgress({ message = "Loading…" }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative w-14 h-14">
                <svg className="w-14 h-14 animate-spin" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                    <circle cx="28" cy="28" r="22" fill="none" stroke="var(--color-primary)" strokeWidth="5"
                        strokeLinecap="round" strokeDasharray="138" strokeDashoffset="100" />
                </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium">{message}</p>
        </div>
    );
}

function SuccessDialog({ onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)", borderRadius: "inherit" }}>
            <div className="flex flex-col items-center gap-3 px-10 py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "color-mix(in srgb, var(--color-primary) 15%, transparent)" }}>
                    <FiCheck className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
                </motion.div>
                <p className="text-gray-800 font-bold text-lg">Preferences Saved!</p>
                <p className="text-gray-400 text-sm text-center">
                    Your filter preferences have been updated.<br />Showing matches based on your criteria.
                </p>
            </div>
        </motion.div>
    );
}

function CustomDropdown({ label, value, onChange, options = [], placeholder = "Any", disabled = false }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    return (
        <div ref={ref} className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
            <button type="button" disabled={disabled} onClick={() => !disabled && setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-150 bg-white"
                style={{ border: open ? "1.5px solid var(--color-primary)" : "1.5px solid #e5e7eb", boxShadow: open ? "0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent)" : "none", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
                <span style={{ color: !value ? "#9ca3af" : "#111827", fontSize: "0.875rem" }}>{value || placeholder}</span>
                <FiChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                    style={{ color: "var(--color-primary)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            {open && (
                <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white"
                    style={{ zIndex: 99999, boxShadow: "0 8px 32px rgba(0,0,0,0.13)", border: "1.5px solid #f0f0f0", maxHeight: "220px", overflowY: "auto" }}>
                    <button type="button" onClick={() => { onChange(""); setOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                        style={{ fontSize: "0.875rem", color: !value ? "var(--color-primary)" : "#6b7280" }}>
                        <span>{placeholder}</span>
                        {!value && <FiCheck className="w-4 h-4" style={{ color: "var(--color-primary)" }} />}
                    </button>
                    <div style={{ height: "1px", background: "#f3f4f6", margin: "0 12px" }} />
                    {options.map((opt) => {
                        const selected = value === opt;
                        return (
                            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                                style={{ fontSize: "0.875rem", color: selected ? "var(--color-primary)" : "#374151", fontWeight: selected ? 600 : 400, background: selected ? "color-mix(in srgb, var(--color-primary) 6%, transparent)" : "transparent" }}>
                                <span>{opt}</span>
                                {selected && <FiCheck className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-primary)" }} />}
                            </button>
                        );
                    })}
                </div>
            )}
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

function SectionLabel({ children }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>{children}</span>
            <div className="flex-1 h-px bg-gray-100" />
        </div>
    );
}

function ToggleCard({ title, subtitle, value, onChange }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all"
            style={{ background: value ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : "#f9fafb", border: "1.5px solid", borderColor: value ? "var(--color-primary)" : "#f3f4f6" }}
            onClick={() => onChange(v => !v)}>
            <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
            <div className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200" style={{ background: value ? "var(--color-primary)" : "#d1d5db" }}>
                <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200" style={{ transform: value ? "translateX(21px)" : "translateX(2px)" }} />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FilterRow({ isOpen, onClose, onApply }) {

    const [ageRange, setAgeRange] = useState([18, 35]);
    const [heightRange, setHeightRange] = useState([56, 72]);
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
    const [mounted, setMounted] = useState(false);

    // ✅ Add mount/unmount tracking
    useEffect(() => {
        if (isOpen) {
            setMounted(true);
        } else {
            // Delay unmount to allow exit animation
            const timer = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // ✅ Don't render portal if not mounted
    if (!mounted && !isOpen) return null;
    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
            setLoading(true);
            try {
                const authData = JSON.parse(localStorage.getItem("authData") || "{}");
                const profileCountry = authData?.profile?.country || "";
                setDefaultCountry(profileCountry);

                const data = await ExploreService.getOptions();
                setOpts(data);

                const prefs = data.preferences;

                if (prefs) {
                    if (prefs.pref_gender) setGender(prefs.pref_gender);
                    if (prefs.pref_age_min && prefs.pref_age_max)
                        setAgeRange([Number(prefs.pref_age_min), Number(prefs.pref_age_max)]);
                    if (prefs.pref_height_min_inches && prefs.pref_height_max_inches)
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
            } finally {
                setLoading(false);
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

    const COUNTRY_LIST = COUNTRIES.map(c => `${COUNTRY_FLAGS[c] ?? "🌍"} ${c}`);
    const countryDisplay = country ? `${COUNTRY_FLAGS[country] ?? "🌍"} ${country}` : "";

    const handleCountryChange = (val) => {
        setCountry(val.replace(/^\S+\s/, ""));
        setCity("");
        setMonthlySalary("");
    };

    const handleReset = () => {
        setAgeRange([18, 35]); setHeightRange([56, 72]);
        setGender(""); setCountry(defaultCountry);
        setCity(""); setNationality("");
        setMaritalStatus(""); setHasChildren("");
        setBodyType(""); setWillingToRelocate(false);
        setReligion(""); setSect(""); setPracticeLevel("");
        setEthnicity(""); setMotherTongue("");
        setEducation(""); setProfession("");
        setEmploymentType(""); setMonthlySalary("");
        setSaveError("");
    };

    const handleSubmitFilters = async () => {
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

            console.log('💾 Saving preferences:', payload);

            const result = await ExploreService.savePreferences(payload);

            console.log('✅ Save successful:', result);

            // ✅ Show success dialog
            setShowSuccess(true);

            // ✅ After 2 seconds, close filter and trigger reload in parent
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
                // ✅ This will trigger parent to reload profiles
                if (onApply) {
                    onApply(payload);
                }
            }, 2000);

        } catch (err) {
            console.error("❌ Save error:", err);
            setSaveError(err.message || "Failed to save preferences. Please try again.");
        } finally {
            setSaving(false);
        }
    };
    // ✅ Portal renders outside your component tree, above the app bar
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

                backdropFilter: "blur(4px)",
                padding: 15,
            }}

        >
            <div className="bg-white w-full sm:max-w-md flex flex-col relative"
                style={{ borderRadius: "24px", maxHeight: "88vh", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
                <AnimatePresence>
                    {showSuccess && <SuccessDialog onClose={() => setShowSuccess(false)} />}
                </AnimatePresence>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
                            <FiSliders className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Partner Preferences</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Refine your match criteria</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <FiX className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {loading ? <CircularProgress message="Loading your preferences…" /> : (
                        <>
                            <SectionLabel>Basic</SectionLabel>
                            <RangeField label="Age Range" value={ageRange} onChange={setAgeRange} min={18} max={70} displayFn={undefined} />
                            <RangeField label="Height" value={heightRange} onChange={setHeightRange} min={FEET_RANGE.min} max={FEET_RANGE.max} displayFn={inchesToLabel} />
                            <CustomDropdown label="Marital Status" value={maritalStatus} onChange={setMaritalStatus} options={MARITAL} />
                            <CustomDropdown label="Has Children" value={hasChildren} onChange={setHasChildren} options={HAS_CHILDREN} placeholder="No preference" />
                            <CustomDropdown label="Body Type" value={bodyType} onChange={setBodyType} options={BODY_TYPES} />

                            <SectionLabel>Location</SectionLabel>
                            <CustomDropdown label="Country" value={countryDisplay} onChange={handleCountryChange} options={COUNTRY_LIST} placeholder="Any country" />
                            {country && <CustomDropdown label="City" value={city} onChange={setCity} options={CITIES} placeholder="Any city" />}
                            <CustomDropdown label="Nationality" value={nationality} onChange={setNationality} options={NATIONALITIES} placeholder="Any nationality" />
                            <ToggleCard title="Willing to Relocate" subtitle="Include profiles open to relocating" value={willingToRelocate} onChange={setWillingToRelocate} />

                            <SectionLabel>Religion & Background</SectionLabel>
                            <CustomDropdown label="Religion" value={religion} onChange={(val) => { setReligion(val); setSect(""); }} options={RELIGIONS} />
                            <CustomDropdown label="Sect" value={sect} onChange={setSect} options={SECTS} placeholder="Any sect" />
                            <CustomDropdown label="Religious Practice Level" value={practiceLevel} onChange={setPracticeLevel} options={PRACTICE_LVLS} />
                            <CustomDropdown label="Ethnicity / Caste" value={ethnicity} onChange={setEthnicity} options={CASTES} placeholder="Any ethnicity" />
                            <CustomDropdown label="Mother Tongue" value={motherTongue} onChange={setMotherTongue} options={COUNTRY_TONGUES} />

                            <SectionLabel>Career & Education</SectionLabel>
                            <CustomDropdown label="Education Level" value={education} onChange={setEducation} options={EDUCATION} />
                            <CustomDropdown label="Profession" value={profession} onChange={setProfession} options={PROFESSIONS} placeholder="Any profession" />
                            <CustomDropdown label="Employment Type" value={employmentType} onChange={setEmploymentType} options={EMPLOYMENT} />
                            {country && SALARY_OPTIONS.length > 0 && (
                                <CustomDropdown label={`Monthly Salary${CURRENCY ? ` (${CURRENCY})` : ""}`}
                                    value={monthlySalary} onChange={setMonthlySalary} options={SALARY_OPTIONS} placeholder="Any salary" />
                            )}

                            {saveError && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                    className="px-4 py-3 rounded-2xl text-sm text-red-600 font-medium flex items-center gap-2"
                                    style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}>
                                    <FiX className="w-4 h-4 flex-shrink-0" />{saveError}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!loading && (
                    <div className="flex items-center justify-between gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid #f3f4f6" }}>
                        <button onClick={handleReset} className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">Reset all</button>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="px-5 py-2.5 rounded-2xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={handleSubmitFilters} disabled={saving}
                                className="px-6 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all flex items-center gap-2"
                                style={{ background: "var(--color-primary)", opacity: saving ? 0.75 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
                                {saving ? (<><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                    <path d="M21 12a9 9 0 00-9-9" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                </svg>Saving…</>) : "Save Preferences"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body  // ✅ Mounts at document root, above everything including the app bar
    );
}