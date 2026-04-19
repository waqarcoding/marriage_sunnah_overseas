import React, { useState, useRef, useEffect } from "react";
import { FiX, FiChevronDown, FiCheck, FiSliders } from "react-icons/fi";
import ExploreService from "../api/ExploreService";

// ─── Height helpers ────────────────────────────────────────────────────────────
const FEET_RANGE = { min: 56, max: 84 };
function inchesToLabel(totalInches) {
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;
    return `${ft}'${inch}"`;
}

// ─── Circular Progress ─────────────────────────────────────────────────────────
function CircularProgress() {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative w-14 h-14">
                <svg className="w-14 h-14 animate-spin" viewBox="0 0 56 56">
                    <circle
                        cx="28" cy="28" r="22"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="5"
                    />
                    <circle
                        cx="28" cy="28" r="22"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="138"
                        strokeDashoffset="100"
                    />
                </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium">Loading filters…</p>
        </div>
    );
}

// ─── Custom Dropdown ───────────────────────────────────────────────────────────
function CustomDropdown({ label, value, onChange, options = [], placeholder = "Any", disabled = false }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                {label}
            </label>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-150 bg-white"
                style={{
                    border: open ? "1.5px solid var(--color-primary)" : "1.5px solid #e5e7eb",
                    boxShadow: open ? "0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent)" : "none",
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                }}
            >
                <span style={{ color: !value ? "#9ca3af" : "#111827", fontSize: "0.875rem" }}>
                    {value || placeholder}
                </span>
                <FiChevronDown
                    className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                    style={{ color: "var(--color-primary)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            {open && (
                <div
                    className="absolute left-0 right-0 mt-2 rounded-2xl bg-white"
                    style={{
                        zIndex: 99999,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 1.5px 6px rgba(0,0,0,0.07)",
                        border: "1.5px solid #f0f0f0",
                        maxHeight: "220px",
                        overflowY: "auto",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => { onChange(""); setOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                        style={{ fontSize: "0.875rem", color: !value ? "var(--color-primary)" : "#6b7280" }}
                    >
                        <span>{placeholder}</span>
                        {!value && <FiCheck className="w-4 h-4" style={{ color: "var(--color-primary)" }} />}
                    </button>
                    <div style={{ height: "1px", background: "#f3f4f6", margin: "0 12px" }} />
                    {options.map((opt) => {
                        const selected = value === opt;
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => { onChange(opt); setOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                                style={{
                                    fontSize: "0.875rem",
                                    color: selected ? "var(--color-primary)" : "#374151",
                                    fontWeight: selected ? 600 : 400,
                                    background: selected ? "color-mix(in srgb, var(--color-primary) 6%, transparent)" : "transparent",
                                }}
                            >
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

// ─── Dual Range Slider ─────────────────────────────────────────────────────────
function RangeField({ label, value, onChange, min, max, displayFn }) {
    const pct = (v) => ((v - min) / (max - min)) * 100;
    const fmt = displayFn || ((v) => v);
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{
                        background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                        color: "var(--color-primary)",
                    }}
                >
                    {fmt(value[0])} – {fmt(value[1])}
                </span>
            </div>
            <div className="relative h-5 flex items-center mb-1">
                <div className="absolute left-0 right-0 h-1.5 rounded-full bg-gray-200" />
                <div
                    className="absolute h-1.5 rounded-full"
                    style={{
                        left: `${pct(value[0])}%`,
                        right: `${100 - pct(value[1])}%`,
                        background: "var(--color-primary)",
                    }}
                />
                <input
                    type="range" min={min} max={max} value={value[0]}
                    onChange={e => onChange([Math.min(Number(e.target.value), value[1] - 1), value[1]])}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer"
                    style={{ zIndex: value[0] > max - 5 ? 5 : 3 }}
                />
                <input
                    type="range" min={min} max={max} value={value[1]}
                    onChange={e => onChange([value[0], Math.max(Number(e.target.value), value[0] + 1)])}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer"
                    style={{ zIndex: 4 }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{fmt(min)}</span>
                <span>{fmt(max)}</span>
            </div>
            <style>{`
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none; width: 20px; height: 20px;
                    border-radius: 50%; background: var(--color-primary, #a855f7);
                    border: 3px solid #fff; box-shadow: 0 1px 5px rgba(0,0,0,0.2); cursor: pointer;
                }
                input[type=range]::-moz-range-thumb {
                    width: 20px; height: 20px; border-radius: 50%;
                    background: var(--color-primary, #a855f7);
                    border: 3px solid #fff; box-shadow: 0 1px 5px rgba(0,0,0,0.2); cursor: pointer;
                }
            `}</style>
        </div>
    );
}

// ─── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>
                {children}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
        </div>
    );
}

// ─── Toggle Card ───────────────────────────────────────────────────────────────
function ToggleCard({ title, subtitle, value, onChange }) {
    return (
        <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all"
            style={{
                background: value ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : "#f9fafb",
                border: "1.5px solid",
                borderColor: value ? "var(--color-primary)" : "#f3f4f6",
            }}
            onClick={() => onChange(v => !v)}
        >
            <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
            <div
                className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
                style={{ background: value ? "var(--color-primary)" : "#d1d5db" }}
            >
                <div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ transform: value ? "translateX(21px)" : "translateX(2px)" }}
                />
            </div>
        </div>
    );
}

// ─── Main FilterRow Component ──────────────────────────────────────────────────
export default function FilterRow({ isOpen, onClose, onApply }) {

    // ── filter state ──────────────────────────────────────────────────────────
    const [ageRange, setAgeRange] = useState([18, 35]);
    const [heightRange, setHeightRange] = useState([56, 72]);
    const [gender, setGender] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [nationality, setNationality] = useState("");
    const [maritalStatus, setMaritalStatus] = useState("");
    const [hasChildren, setHasChildren] = useState("");
    const [religion, setReligion] = useState("");
    const [sect, setSect] = useState("");
    const [practiceLevel, setPracticeLevel] = useState("");
    const [caste, setCaste] = useState("");
    const [motherTongue, setMotherTongue] = useState("");
    const [education, setEducation] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [monthlySalary, setMonthlySalary] = useState("");
    const [bodyType, setBodyType] = useState("");
    const [willingToRelocate, setWillingToRelocate] = useState(false);

    // ── API data state ────────────────────────────────────────────────────────
    const [globalOptions, setGlobalOptions] = useState(null);
    const [countryOptions, setCountryOptions] = useState(null);
    const [loadingGlobal, setLoadingGlobal] = useState(true);
    const [loadingCountry, setLoadingCountry] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [defaultCountry, setDefaultCountry] = useState("");

    // ── 1. Load global options on mount ───────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const authData = JSON.parse(localStorage.getItem("authData") || "{}");
                const profileCountry = authData?.profile?.country || "";
                setDefaultCountry(profileCountry);

                const opts = await ExploreService.getOptions();
                setGlobalOptions(opts);

                if (profileCountry) {
                    setCountry(profileCountry);
                }
            } catch (err) {
                console.error("Failed to load global options:", err);
            } finally {
                setLoadingGlobal(false);
            }
        };
        init();
    }, []);

    // ── 2. Load country options when country changes ───────────────────────────
    useEffect(() => {
        if (!country) {
            setCountryOptions(null);
            setCity("");
            setMonthlySalary("");
            return;
        }
        const fetch = async () => {
            setLoadingCountry(true);
            try {
                const co = await ExploreService.getCountryOptions(country);
                setCountryOptions(co);
            } catch (err) {
                console.error(`Failed to load options for ${country}:`, err);
            } finally {
                setLoadingCountry(false);
                setCity("");
                setMonthlySalary("");
            }
        };
        fetch();
    }, [country]);

    // ── reset sect when religion changes ──────────────────────────────────────
    useEffect(() => { setSect(""); }, [religion]);

    if (!isOpen) return null;

    // ── unpack global options ─────────────────────────────────────────────────
    const COUNTRIES = globalOptions?.countries ?? [];
    const COUNTRY_FLAGS = globalOptions?.country_flags ?? {};
    const ALL_TONGUES = globalOptions?.all_mother_tongues ?? [];
    const ALL_NATS = globalOptions?.all_nationalities ?? [];
    const RELIGIONS = globalOptions?.religions ?? [];
    const ALL_SECTS = globalOptions?.sects ?? {};
    const CASTES = globalOptions?.castes ?? [];
    const EDUCATION = globalOptions?.education_levels ?? [];
    const EMPLOYMENT = globalOptions?.employment_types ?? [];
    const MARITAL = globalOptions?.marital_statuses ?? [];
    const BODY_TYPES = globalOptions?.body_types ?? [];
    const HAS_CHILDREN = globalOptions?.has_children ?? [];
    const PRACTICE_LVLS = globalOptions?.practice_levels ?? [];

    // ── unpack country options ────────────────────────────────────────────────
    const CITIES = countryOptions?.cities ?? [];
    const COUNTRY_TONGUES = countryOptions?.mother_tongues ?? ALL_TONGUES;
    const SALARY_OPTIONS = countryOptions?.monthly_salaries ?? [];
    const CURRENCY = countryOptions?.currency ?? "";
    const NATIONALITIES = countryOptions?.nationalities ?? ALL_NATS;

    // ── sects for selected religion ───────────────────────────────────────────
    const SECT_OPTIONS = religion ? (ALL_SECTS[religion] ?? []) : [];

    // ── country list with flag ────────────────────────────────────────────────
    const COUNTRY_LIST = COUNTRIES.map(c => `${COUNTRY_FLAGS[c] ?? "🌍"} ${c}`);
    const handleCountryChange = (val) => setCountry(val.replace(/^\S+\s/, ""));
    const countryDisplay = country ? `${COUNTRY_FLAGS[country] ?? "🌍"} ${country}` : "";

    // ── reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setAgeRange([18, 35]);
        setHeightRange([56, 72]);
        setGender("");
        setCountry(defaultCountry);
        setCity("");
        setNationality("");
        setMaritalStatus("");
        setHasChildren("");
        setReligion("");
        setSect("");
        setPracticeLevel("");
        setCaste("");
        setMotherTongue("");
        setEducation("");
        setEmploymentType("");
        setMonthlySalary("");
        setBodyType("");
        setWillingToRelocate(false);
        setSaveError("");
    };

    // ── submit preferences to backend ─────────────────────────────────────────
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
                pref_religion: religion || null,
                pref_sect: sect || null,
                pref_religious_practice_level: practiceLevel || null,
                pref_caste: caste || null,
                pref_mother_tongue: motherTongue || null,
                pref_education: education || null,
                pref_employment_type: employmentType || null,
                pref_monthly_salary: monthlySalary || null,
                pref_body_type: bodyType || null,
                pref_willing_to_relocate: willingToRelocate ? 1 : 0,
            };

            await ExploreService.savePreferences(payload);

            // also call onApply so parent can re-fetch explore with new filters
            onApply(payload);
            onClose();
        } catch (err) {
            console.error("Failed to save preferences:", err);
            setSaveError("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
            <div
                className="bg-white w-full sm:max-w-md flex flex-col"
                style={{
                    borderRadius: "24px 24px 0 0",
                    maxHeight: "92vh",
                    overflow: "hidden",
                    boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
                    // desktop: full rounded
                    ...(window.innerWidth >= 640 && { borderRadius: "24px", maxHeight: "88vh" }),
                }}
            >
                {/* ── Header ── */}
                <div
                    className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0"
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
                        >
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

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {loadingGlobal ? (
                        <CircularProgress />
                    ) : (
                        <>
                            {/* ── Basic ── */}
                            <SectionLabel>Basic</SectionLabel>

                            <CustomDropdown
                                label="Interested In"
                                value={gender} onChange={setGender}
                                options={["Male", "Female"]}
                                placeholder="Any gender"
                            />
                            <RangeField
                                label="Age Range"
                                value={ageRange} onChange={setAgeRange}
                                min={18} max={70}
                            />
                            <RangeField
                                label="Height"
                                value={heightRange} onChange={setHeightRange}
                                min={FEET_RANGE.min} max={FEET_RANGE.max}
                                displayFn={inchesToLabel}
                            />
                            <CustomDropdown
                                label="Marital Status"
                                value={maritalStatus} onChange={setMaritalStatus}
                                options={MARITAL}
                            />
                            <CustomDropdown
                                label="Has Children"
                                value={hasChildren} onChange={setHasChildren}
                                options={HAS_CHILDREN}
                                placeholder="No preference"
                            />
                            <CustomDropdown
                                label="Body Type"
                                value={bodyType} onChange={setBodyType}
                                options={BODY_TYPES}
                            />

                            {/* ── Location ── */}
                            <SectionLabel>Location</SectionLabel>

                            <CustomDropdown
                                label="Country"
                                value={countryDisplay}
                                onChange={handleCountryChange}
                                options={COUNTRY_LIST}
                                placeholder="Any country"
                            />
                            {country && (
                                <CustomDropdown
                                    label="City"
                                    value={city} onChange={setCity}
                                    options={CITIES}
                                    placeholder={loadingCountry ? "Loading cities…" : "Any city"}
                                    disabled={loadingCountry}
                                />
                            )}
                            <CustomDropdown
                                label="Nationality"
                                value={nationality} onChange={setNationality}
                                options={NATIONALITIES}
                                placeholder="Any nationality"
                            />
                            <ToggleCard
                                title="Willing to Relocate"
                                subtitle="Include profiles open to relocating"
                                value={willingToRelocate} onChange={setWillingToRelocate}
                            />

                            {/* ── Religion ── */}
                            <SectionLabel>Religion & Background</SectionLabel>

                            <CustomDropdown
                                label="Religion"
                                value={religion} onChange={setReligion}
                                options={RELIGIONS}
                            />
                            {SECT_OPTIONS.length > 0 && (
                                <CustomDropdown
                                    label="Sect"
                                    value={sect} onChange={setSect}
                                    options={SECT_OPTIONS}
                                />
                            )}
                            <CustomDropdown
                                label="Religious Practice Level"
                                value={practiceLevel} onChange={setPracticeLevel}
                                options={PRACTICE_LVLS}
                            />
                            <CustomDropdown
                                label="Caste / Ethnicity"
                                value={caste} onChange={setCaste}
                                options={CASTES}
                            />
                            <CustomDropdown
                                label="Mother Tongue"
                                value={motherTongue} onChange={setMotherTongue}
                                options={COUNTRY_TONGUES}
                            />

                            {/* ── Career ── */}
                            <SectionLabel>Career & Education</SectionLabel>

                            <CustomDropdown
                                label="Education Level"
                                value={education} onChange={setEducation}
                                options={EDUCATION}
                            />
                            <CustomDropdown
                                label="Employment Type"
                                value={employmentType} onChange={setEmploymentType}
                                options={EMPLOYMENT}
                            />
                            {country && SALARY_OPTIONS.length > 0 && (
                                <CustomDropdown
                                    label={`Monthly Salary${CURRENCY ? ` (${CURRENCY})` : ""}`}
                                    value={monthlySalary} onChange={setMonthlySalary}
                                    options={SALARY_OPTIONS}
                                    placeholder={loadingCountry ? "Loading…" : "Any salary"}
                                    disabled={loadingCountry}
                                />
                            )}

                            {/* ── Error ── */}
                            {saveError && (
                                <div className="px-4 py-3 rounded-2xl text-sm text-red-600 font-medium"
                                    style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}>
                                    {saveError}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                {!loadingGlobal && (
                    <div
                        className="flex items-center justify-between gap-3 px-6 py-4 flex-shrink-0"
                        style={{ borderTop: "1px solid #f3f4f6" }}
                    >
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
                                    cursor: saving ? "not-allowed" : "pointer",
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
                                ) : "Save Preferences"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
