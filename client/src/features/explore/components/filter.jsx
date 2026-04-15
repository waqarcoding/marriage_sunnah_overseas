import React, { useState, useRef, useEffect } from "react";
import { FiX, FiChevronDown, FiCheck } from "react-icons/fi";

// ─── Option Lists ──────────────────────────────────────────────────────────────
const RELIGIONS = ["Muslim", "Christian", "Hindu", "Other"];
const SECTS = ["Sunni", "Shia", "Deobandi", "Barelvi", "Ahmadi", "Other"];
const COUNTRIES = ["Pakistan", "UAE", "Saudi Arabia", "Qatar", "Bahrain", "Kuwait", "Oman", "USA", "UK", "Other"];
const MONTHLY_SALARIES = [
    "No preference",
    "Less than PKR 100,000",
    "PKR 100,000 – PKR 200,000",
    "PKR 200,000 – PKR 600,000",
    "PKR 600,000 – PKR 1,000,000",
    "PKR 1,000,000+"
];
const MARITAL_STATUSES = ["Never Married", "Divorced", "Widowed", "Separated"];
const EDUCATION_LEVELS = ["High School", "Intermediate", "Bachelor's", "Master's", "PhD", "Other"];
const BODY_TYPES = ["Slim", "Athletic", "Average", "Curvy", "Heavy"];
const CASTES = [
    "Abbasi", "Awan", "Ansari", "Arain", "Baloch", "Bhatti", "Butt", "Chaudhry", "Durrani", "Gujjar", "Jat",
    "Jatoi", "Kamboh", "Khan", "Khattak", "Mahmood", "Malik", "Memon", "Mughal", "Makhdoom", "Minhas", "Mirza",
    "Mir", "Niazi", "Paracha", "Pathan", "Qureshi", "Rajput", "Rana", "Rao", "Sheikh", "Sindhi", "Soomro",
    "Syed", "Shaikh", "Shah", "Shaikh", "Tanoli", "Tarar", "Warraich", "Yousafzai", "Zardari", "Punjabi", "Balochi",
    "Muhajir", "Agha", "Farooqi", "Hashmi", "Naqvi", "Zaidi", "Siddiqui", "Usmani", "Chishti", "Sulemani", "Qazi",
    "Dar", "Chishti", "Abbasi", "Alvi", "Kiyani", "Khokhar", "Rind", "Khar", "Awan", "Dasti", "Gillani", "Sharif",
    "Bhutto", "Other"
];
const MOTHER_TONGUES = ["Urdu", "Pashto", "Punjabi", "Sindhi", "Balochi", "English", "Arabic", "Other"];
const EMPLOYMENT_TYPES = ["Government", "Private", "Self-Employed", "Business Owner", "Student", "Unemployed"];
const HAS_CHILDREN_OPTIONS = ["No Children", "Has Children", "No Preference"];
const GENDERS = ["Male", "Female"];

const NATIONALITIES = [
    "Pakistani", "Emirati", "Saudi", "Qatari", "Bahraini", "Kuwaiti",
    "Omani", "American", "British", "Other"
];

const RELIGIOUS_PRACTICE_LEVELS = [
    "Very Religious", "Moderately Religious", "Somewhat Religious", "Not Religious"
];

const WILLING_TO_RELOCATE_OPTIONS = ["Yes", "No", "Maybe"];

const RELATIONSHIP_TYPES = [
    "Never Married", "Divorced", "Widowed", "Separated"
    // Or if this means "relationship sought":
    // "Marriage", "Nikah Only", "Open to Suggestions"
];
// ─── Height helpers (feet + inches) ───────────────────────────────────────────
// We store height as total inches internally (e.g. 60 = 5'0", 72 = 6'0")
const FEET_RANGE = { min: 56, max: 84 }; // 4'8" – 7'0"

function inchesToLabel(totalInches) {
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;
    return `${ft}'${inch}"`;
}

// ─── Custom Dropdown ───────────────────────────────────────────────────────────
function CustomDropdown({ label, value, onChange, options, placeholder = "Any" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-150 bg-white"
                style={{
                    border: open ? "1.5px solid var(--color-primary)" : "1.5px solid #e5e7eb",
                    boxShadow: open ? "0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent)" : "none",
                }}
            >
                <span style={{ color: !value ? "#9ca3af" : "#111827", fontSize: "0.9rem" }}>
                    {value || placeholder}
                </span>
                <FiChevronDown
                    className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                    style={{ color: "var(--color-primary)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            {open && (
                <div
                    className="absolute left-0 right-0 mt-2 rounded-2xl bg-white overflow-hidden"
                    style={{
                        zIndex: 99999,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 1.5px 6px rgba(0,0,0,0.07)",
                        border: "1.5px solid #f0f0f0",
                        maxHeight: "210px",
                        overflowY: "auto",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => { onChange(""); setOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                        style={{ fontSize: "0.9rem", color: !value ? "var(--color-primary)" : "#6b7280" }}
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
                                    fontSize: "0.9rem",
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
                <label className="text-sm font-medium text-gray-600">{label}</label>
                <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}
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
                    -webkit-appearance: none;
                    width: 20px; height: 20px;
                    border-radius: 50%;
                    background: var(--color-primary, #a855f7);
                    border: 3px solid #fff;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.2);
                    cursor: pointer;
                }
                input[type=range]::-moz-range-thumb {
                    width: 20px; height: 20px;
                    border-radius: 50%;
                    background: var(--color-primary, #a855f7);
                    border: 3px solid #fff;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.2);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}

// ─── Section Divider ───────────────────────────────────────────────────────────
function SectionLabel({ children }) {
    return (
        <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>{children}</span>
            <div className="flex-1 h-px bg-gray-100" />
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FilterRow({ isOpen, onClose, onApply }) {
    const [ageRange, setAgeRange] = useState([18, 35]);
    const [heightRange, setHeightRange] = useState([56, 72]); // 4.8 feet = 58 inches
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [maritalStatus, setMaritalStatus] = useState("");
    const [hasChildren, setHasChildren] = useState("");
    const [religion, setReligion] = useState("");
    const [sect, setSect] = useState("");
    const [caste, setCaste] = useState("");
    const [motherTongue, setMotherTongue] = useState("");
    const [education, setEducation] = useState("");
    const [profession, setProfession] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [monthlySalary, setMonthlySalary] = useState("");
    const [bodyType, setBodyType] = useState("");
    const [nearby, setNearby] = useState(false);
    const [willingToRelocate, setWillingToRelocate] = useState(false);

    if (!isOpen) return null;

    const handleReset = () => {
        setAgeRange([22, 35]); setHeightRange([60, 72]); setCity(""); setCountry("");
        setMaritalStatus(""); setHasChildren(""); setReligion(""); setSect(""); setCaste("");
        setMotherTongue(""); setEducation(""); setProfession(""); setEmploymentType("");
        setMonthlySalary(""); setBodyType(""); setNearby(false); setWillingToRelocate(false);
    };

    const handleApply = () => {
        onApply({
            ageRange, heightRange: [inchesToLabel(heightRange[0]), inchesToLabel(heightRange[1])],
            city, country, maritalStatus, hasChildren, religion, sect, caste,
            motherTongue, education, profession, employmentType,
            monthlySalary, bodyType, nearby, willingToRelocate,
        });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", padding: "80px 16px" }}
        >
            <div
                className="bg-white w-full max-w-md flex flex-col"
                style={{ borderRadius: "24px", maxHeight: "100%", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Filter Profiles</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Narrow down your matches</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <FiX className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* Basic */}
                    <SectionLabel>Basic</SectionLabel>

                    <RangeField
                        label="Age (years)"
                        value={ageRange} onChange={setAgeRange}
                        min={18} max={70}
                    />

                    <RangeField
                        label="Height"
                        value={heightRange} onChange={setHeightRange}
                        min={FEET_RANGE.min} max={FEET_RANGE.max}
                        displayFn={inchesToLabel}
                    />

                    <CustomDropdown label="Marital Status" value={maritalStatus} onChange={setMaritalStatus} options={MARITAL_STATUSES} />
                    <CustomDropdown label="Has Children" value={hasChildren} onChange={setHasChildren} options={HAS_CHILDREN_OPTIONS} placeholder="No preference" />
                    <CustomDropdown label="Body Type" value={bodyType} onChange={setBodyType} options={BODY_TYPES} />

                    {/* Location */}
                    <SectionLabel>Location</SectionLabel>

                    <CustomDropdown label="Country" value={country} onChange={setCountry} options={COUNTRIES} />

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">City</label>
                        <input
                            type="text" value={city} onChange={e => setCity(e.target.value)}
                            placeholder="Enter city"
                            className="w-full px-4 py-2.5 rounded-2xl text-sm focus:outline-none transition-all"
                            style={{ border: "1.5px solid #e5e7eb" }}
                            onFocus={e => { e.target.style.border = "1.5px solid var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent)"; }}
                            onBlur={e => { e.target.style.border = "1.5px solid #e5e7eb"; e.target.style.boxShadow = "none"; }}
                        />
                    </div>

                    {/* Toggle: Nearby */}
                    <ToggleCard
                        title="Nearby Profiles Only"
                        subtitle="Matches close to your location"
                        value={nearby} onChange={setNearby}
                    />

                    {/* Toggle: Willing to Relocate */}
                    <ToggleCard
                        title="Willing to Relocate"
                        subtitle="Include profiles open to relocating"
                        value={willingToRelocate} onChange={setWillingToRelocate}
                    />

                    {/* Religion & Background */}
                    <SectionLabel>Religion & Background</SectionLabel>

                    <CustomDropdown label="Religion" value={religion} onChange={v => { setReligion(v); setSect(""); }} options={RELIGIONS} />
                    {religion === "Muslim" && (
                        <CustomDropdown label="Sect" value={sect} onChange={setSect} options={SECTS} />
                    )}
                    <CustomDropdown label="Caste / Ethnicity" value={caste} onChange={setCaste} options={CASTES} />
                    <CustomDropdown label="Mother Tongue" value={motherTongue} onChange={setMotherTongue} options={MOTHER_TONGUES} />

                    {/* Career & Education */}
                    <SectionLabel>Career & Education</SectionLabel>

                    <CustomDropdown label="Education Level" value={education} onChange={setEducation} options={EDUCATION_LEVELS} />

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Profession</label>
                        <input
                            type="text" value={profession} onChange={e => setProfession(e.target.value)}
                            placeholder="e.g. Doctor, Engineer"
                            className="w-full px-4 py-2.5 rounded-2xl text-sm focus:outline-none transition-all"
                            style={{ border: "1.5px solid #e5e7eb" }}
                            onFocus={e => { e.target.style.border = "1.5px solid var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent)"; }}
                            onBlur={e => { e.target.style.border = "1.5px solid #e5e7eb"; e.target.style.boxShadow = "none"; }}
                        />
                    </div>

                    <CustomDropdown label="Employment Type" value={employmentType} onChange={setEmploymentType} options={EMPLOYMENT_TYPES} />
                    <CustomDropdown label="Monthly Salary" value={monthlySalary} onChange={setMonthlySalary} options={MONTHLY_SALARIES} placeholder="Any salary" />

                </div>

                {/* ── Footer ── */}
                <div
                    className="flex items-center justify-between gap-3 px-6 py-4 flex-shrink-0"
                    style={{ borderTop: "1px solid #f3f4f6" }}
                >
                    <button onClick={handleReset} className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
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
                            onClick={handleApply}
                            className="px-6 py-2.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--color-primary)" }}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
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
                <p className="text-xs text-gray-400">{subtitle}</p>
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