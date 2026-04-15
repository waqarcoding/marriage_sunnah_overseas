import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Select from "@radix-ui/react-select";

import {
    ChevronLeft, ChevronDown, Check, Loader2, Shield, User, Baby,
    MapPin, BookOpen, Briefcase, Heart, Star, ChevronRight,
    Phone, Sparkles, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProfileService from "../api/ProfileService";

// ─── Option Lists ──────────────────────────────────────────────────────────────
const RELIGIONS = ["Islam", "Christian", "Hindu", "Other"];
const SECTS = ["Sunni", "Shia", "Deobandi", "Barelvi", "Ahmadi", "Other"];
const COUNTRIES = ["Pakistan", "UAE", "Saudi Arabia", "Qatar", "Bahrain", "Kuwait", "Oman", "USA", "UK", "Canada", "Australia", "Germany", "Other"];
const NATIONALITIES = ["Pakistani", "Emirati", "Saudi", "Qatari", "Bahraini", "Kuwaiti", "Omani", "American", "British", "Canadian", "Australian", "Other"];
const MARITAL_STATUSES = ["Never Married", "Divorced", "Widowed", "Separated"];
const EDUCATION_LEVELS = ["High School", "Intermediate", "Bachelor's", "Master's", "PhD", "Other"];
const BODY_TYPES = ["Slim", "Athletic", "Average", "Curvy", "Heavy"];
const CASTES = ["No Preference", "Abbasi", "Awan", "Ansari", "Arain", "Baloch", "Bhatti", "Butt", "Chaudhry", "Durrani", "Gujjar", "Jat", "Jatoi", "Kamboh", "Khan", "Khattak", "Mahmood", "Malik", "Memon", "Mughal", "Minhas", "Mirza", "Mir", "Niazi", "Paracha", "Pathan", "Qureshi", "Rajput", "Rana", "Rao", "Sheikh", "Sindhi", "Soomro", "Syed", "Shah", "Tanoli", "Tarar", "Warraich", "Yousafzai", "Zardari", "Punjabi", "Balochi", "Muhajir", "Agha", "Farooqi", "Hashmi", "Naqvi", "Zaidi", "Siddiqui", "Usmani", "Other"];
const MOTHER_TONGUES = ["Urdu", "Pashto", "Punjabi", "Sindhi", "Balochi", "English", "Arabic", "Other"];
const EMPLOYMENT_TYPES = ["Government", "Private", "Self-Employed", "Business Owner", "Student", "Unemployed"];
const MONTHLY_SALARIES = ["No preference", "Less than PKR 100,000", "PKR 100,000 – PKR 200,000", "PKR 200,000 – PKR 600,000", "PKR 600,000 – PKR 1,000,000", "PKR 1,000,000+"];
const HAS_CHILDREN_OPT = ["No Children", "Has Children"];
const PRACTICE_LEVELS = ["Very Religious", "Moderately Religious", "Somewhat Religious", "Not Religious"];
const EMPLOYMENT_PREF = ["No Preference", ...EMPLOYMENT_TYPES];
const BODY_TYPE_PREF = ["No Preference", ...BODY_TYPES];
const CASTE_PREF = ["No Preference", ...CASTES.filter(c => c !== "No Preference")];
const TONGUE_PREF = ["No Preference", ...MOTHER_TONGUES];
const EDU_PREF = ["No Preference", ...EDUCATION_LEVELS];
const SALARY_PREF = MONTHLY_SALARIES;
const HAS_CHILDREN_ALL = ["No Preference", "No Children", "Has Children"];

// feet/inches helper
const inchesToFtIn = (n) => { if (!n) return ""; const ft = Math.floor(n / 12); const i = n % 12; return `${ft}'${i}"`; };
const HEIGHT_OPTIONS = Array.from({ length: 31 }, (_, i) => ({ value: String(60 + i), label: `${inchesToFtIn(60 + i)} (${60 + i}")` }));

// ─── Shared UI ─────────────────────────────────────────────────────────────────
function RSelect({ label, value, onChange, options, placeholder, optional, note }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
                {optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
            <Select.Root value={value} onValueChange={onChange}>
                <Select.Trigger
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 text-sm transition-all outline-none ${value
                        ? "border-primary/5 bg-background text-secondary-foreground"
                        : "border-border bg-background text-muted-foreground"
                        }`}
                >
                    <Select.Value placeholder={placeholder} />
                    <Select.Icon><ChevronDown className="w-4 h-4 text-muted-foreground" /></Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content
                        position="popper"
                        sideOffset={6}
                        className="z-50 w-[var(--radix-select-trigger-width)] bg-popover rounded-2xl shadow-xl border border-border overflow-hidden max-h-64"
                    >
                        <Select.Viewport className="p-1">
                            {options.map((opt) => {
                                const v = typeof opt === "string" ? opt : opt.value;
                                const l = typeof opt === "string" ? opt : opt.label;
                                return (
                                    <Select.Item
                                        key={v}
                                        value={v}
                                        className="flex items-center justify-between px-4 py-3 text-sm text-popover-foreground rounded-xl cursor-pointer outline-none hover:bg-secondary hover:text-primary data-[highlighted]:bg-secondary data-[highlighted]:text-primary data-[state=checked]:text-primary data-[state=checked]:font-medium"
                                    >
                                        <Select.ItemText>{l}</Select.ItemText>
                                        <Select.ItemIndicator><Check className="w-4 h-4 text-accent" /></Select.ItemIndicator>
                                    </Select.Item>
                                );
                            })}
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, type = "text", optional, note, max }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
                {optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
            <input
                type={type}
                value={value}
                maxLength={max}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-border text-sm text-card-foreground focus:outline-none focus:border-primary/5 focus:bg-secondary transition-all placeholder:text-muted-foreground bg-background"
            />
        </div>
    );
}

function TextArea({ label, value, onChange, placeholder, optional, note, rows = 3 }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
                {optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
            <textarea
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-border text-sm text-card-foreground focus:outline-none focus:border-primary/5 focus:bg-secondary transition-all placeholder:text-muted-foreground bg-background resize-none"
            />
        </div>
    );
}

function ToggleGroup({ label, value, onChange, options, optional }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
                {optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            <div className="flex gap-2 flex-wrap">
                {options.map((opt) => {
                    const active = value === opt.value;
                    return (
                        <motion.button
                            key={opt.value}
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onChange(opt.value)}
                            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-medium transition-all ${active
                                ? (opt.activeClass || "border-primary/5 bg-secondary text-primary")
                                : "border-border bg-background text-muted-foreground"
                                }`}
                        >
                            {opt.icon && <opt.icon className="w-4 h-4" />}
                            {opt.label}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

function MultiChips({ label, value = [], onChange, options, optional, note }) {
    const toggle = (v) => {
        if (v === "No Preference") { onChange(["No Preference"]); return; }
        const filtered = value.filter(x => x !== "No Preference");
        onChange(filtered.includes(v) ? filtered.filter(x => x !== v) : [...filtered, v]);
    };
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
                {optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    const active = value.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${active
                                ? "border-primary/5 bg-secondary text-primary"
                                : "border-border bg-background text-muted-foreground"
                                }`}
                        >
                            {active && <span className="mr-1">✓</span>}{opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function RangeRow({ label, minVal, maxVal, onMinChange, onMaxChange, minOpts, maxOpts, optional }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
                {optional && <span className="ml-1 normal-case font-normal text-muted-foreground/60">(optional)</span>}
            </label>
            <div className="grid grid-cols-2 gap-3">
                <RSelect label="Min" value={minVal} onChange={onMinChange} options={minOpts} placeholder="Min" />
                <RSelect label="Max" value={maxVal} onChange={onMaxChange} options={maxOpts} placeholder="Max" />
            </div>
        </div>
    );
}

// ─── Steps Config ─────────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: "About You", icon: User, variant: "primary" },
    { id: 2, label: "Location", icon: MapPin, variant: "muted" },
    { id: 3, label: "Religion", icon: Star, variant: "accent" },
    { id: 4, label: "Physical", icon: Heart, variant: "primary" },
    { id: 5, label: "Career", icon: Briefcase, variant: "muted" },
    { id: 6, label: "Lifestyle", icon: Sparkles, variant: "primary" },
    { id: 7, label: "Guardian", icon: Shield, variant: "accent" },
    { id: 8, label: "Preferences", icon: Heart, variant: "primary" },
];
const TOTAL_STEPS = STEPS.length;

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }) {
    const pct = Math.round((step / total) * 100);
    return (
        <div className="px-4 pt-2 pb-3 bg-background border-b border-border">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">Step {step} of {total}</span>
                <span className="text-xs font-semibold text-primary">{pct}% complete</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                />
            </div>
            <div className="flex justify-between mt-2">
                {STEPS.map((s) => (
                    <div key={s.id} className={`flex flex-col items-center gap-0.5 flex-1 ${step >= s.id ? "opacity-100" : "opacity-30"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${step > s.id
                            ? "bg-primary/60"
                            : step === s.id
                                ? "bg-accent"
                                : "bg-border"
                            }`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Step Wrapper ─────────────────────────────────────────────────────────────
function StepCard({ icon: Icon, title, subtitle, variant = "primary", children }) {
    const variants = {
        primary: { bg: "bg-secondary", border: "border-primary/5", icon: "text-primary", iconBg: "bg-background" },
        accent: { bg: "bg-secondary", border: "border-accent/40", icon: "text-accent-foreground", iconBg: "bg-accent" },
        muted: { bg: "bg-muted", border: "border-border", icon: "text-muted-foreground", iconBg: "bg-background" },
    };
    const c = variants[variant] || variants.primary;
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-card rounded-3xl shadow-sm p-5 space-y-4"
        >
            <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${c.border} ${c.bg}`}>
                <div className={`w-10 h-10 rounded-full ${c.iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                    <div className="font-semibold text-card-foreground text-sm">{title}</div>
                    {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
                </div>
            </div>
            {children}
        </motion.div>
    );
}

// ─── Complete Screen ──────────────────────────────────────────────────────────
function CompleteScreen({ navigate }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-6"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "var(--gradient-primary)" }}
            >
                <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
            </motion.div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-card-foreground">Profile Complete!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Your profile is now live. Matches will be suggested based on your preferences.
                </p>
            </div>
            <div className="w-full max-w-xs space-y-3">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/verification")}
                    className="w-full py-4 rounded-2xl text-primary-foreground font-semibold shadow-lg"
                    style={{ background: "var(--gradient-primary)" }}
                >
                    View Matches
                </motion.button>
                <button
                    onClick={() => navigate("/profile")}
                    className="w-full py-3 text-sm text-muted-foreground underline underline-offset-2"
                >
                    Edit Profile
                </button>
            </div>
        </motion.div>
    );
}

// ─── Age from DOB ─────────────────────────────────────────────────────────────
const calcAge = (dob) => {
    if (!dob) return null;
    const b = new Date(dob); const t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
    return age > 0 ? age : null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CompleteProfile() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [done, setDone] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        profile_for: "self",
        name: "",
        gender: "",
        date_of_birth: "",
        marital_status: "",
        phone: "",
        country: "",
        city: "",
        nationality: "",
        religion: "",
        sect: "",
        religious_practice_level: "",
        caste: "",
        mother_tongue: "",
        height_inches: "",
        body_type: "",
        education: "",
        profession: "",
        employment_type: "",
        monthly_salary: "",
        bio: "",
        family_background: "",
        interests: "",
        has_children: "0",
        willing_to_relocate: "",
        relationship: "",
        contact_hidden: "0",
        is_guardian_required: "1",
        guardian_name: "",
        guardian_phone: "",
        guardian_email: "",
        guardian_relationship: "",
    });

    const [prefs, setPrefs] = useState({
        pref_gender: "",
        pref_age_min: "",
        pref_age_max: "",
        pref_marital_status: [],
        pref_nationality: [],
        pref_country: [],
        pref_city: "",
        pref_religion: "",
        pref_sect: [],
        pref_religious_practice_level: "",
        pref_height_min_inches: "",
        pref_height_max_inches: "",
        pref_body_type: [],
        pref_caste: [],
        pref_mother_tongue: [],
        pref_education: "",
        pref_employment_type: [],
        pref_monthly_salary: "",
        pref_has_children: "",
        pref_willing_to_relocate: "",
    });

    const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
    const setp = (k) => (v) => setPrefs(p => ({ ...p, [k]: v }));
    const age = calcAge(form.date_of_birth);

    const stepValid = () => {
        if (step === 1) return form.name && form.gender && form.date_of_birth && form.marital_status;
        if (step === 2) return form.country && form.city && form.nationality;
        if (step === 3) return form.religion && form.religious_practice_level;
        if (step === 7) return form.is_guardian_required === "0" || (form.guardian_name && form.guardian_phone);
        return true;
    };

    const next = async () => {


        if (!stepValid()) { toast.error("Please fill required fields"); return; }
        if (step < TOTAL_STEPS) setStep(s => s + 1);
        else handleSubmit();
    };

    const handleSubmit = async () => {



        setSaving(true);
        try {



            await ProfileService.updateProfile({
                name: form.name,
                gender: form.gender,
                date_of_birth: form.date_of_birth,
                age: age,
                marital_status: form.marital_status,
                phone: form.phone,
                country: form.country,
                city: form.city,
                nationality: form.nationality,
                religion: form.religion,
                sect: form.sect,
                religious_practice_level: form.religious_practice_level,
                caste: form.caste,
                mother_tongue: form.mother_tongue,
                height_inches: form.height_inches || null,
                body_type: form.body_type,
                education: form.education,
                profession: form.profession,
                employment_type: form.employment_type,
                monthly_salary: form.monthly_salary,
                bio: form.bio,
                family_background: form.family_background,
                interests: form.interests,
                has_children: form.has_children === "Has Children" ? 1 : 0,
                willing_to_relocate: form.willing_to_relocate === "Yes" ? 1 : form.willing_to_relocate === "No" ? 0 : null,
                relationship: form.relationship,
                contact_hidden: Number(form.contact_hidden),
                is_guardian_required: Number(form.is_guardian_required),
                guardian_name: form.guardian_name,
                guardian_phone: form.guardian_phone,
                guardian_email: form.guardian_email,
                guardian_relationship: form.guardian_relationship,
                is_profile_completed: 1,
            });

            const hasPrefs = prefs.pref_gender || prefs.pref_religion || prefs.pref_age_min || prefs.pref_age_max;
            if (hasPrefs) {



                await ProfileService.updatePrefs(prefs);

            }

            setDone(true);
        } catch {
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (done) return <div className="min-h-screen bg-background"><CompleteScreen navigate={navigate} /></div>;

    const ageOpts = Array.from({ length: 43 }, (_, i) => String(18 + i));

    return (
        <div className="min-h-screen bg-background">

            {/* ── Header ── */}
            <div className="sticky top-0 z-20 bg-background border-b border-border">
                <div className="px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
                        className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                    >
                        <ChevronLeft size={22} className="text-foreground" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-base font-semibold text-card-foreground">{STEPS[step - 1].label}</h1>
                        <p className="text-xs text-muted-foreground">Step {step} of {TOTAL_STEPS} — Required unless marked optional</p>
                    </div>
                </div>
                <ProgressBar step={step} total={TOTAL_STEPS} />
            </div>

            {/* ── Step Content ── */}
            <div className="max-w-lg mx-auto px-4 py-5 pb-36 space-y-4">
                <AnimatePresence mode="wait">

                    {/* ═══ STEP 1: About You ═══ */}
                    {step === 1 && (
                        <StepCard key="s1" icon={User} title="Personal Details" subtitle="Basic information about you" variant="primary">
                            <ToggleGroup
                                label="I am creating this profile for"
                                value={form.profile_for}
                                onChange={set("profile_for")}
                                options={[
                                    { value: "self", label: "Myself", icon: User, activeClass: "border-primary/5 bg-secondary text-primary" },
                                    { value: "child", label: "My Child / Ward", icon: Baby, activeClass: "border-accent  bg-secondary text-primary" },
                                ]}
                            />
                            <InputField label="Full Name" value={form.name} onChange={set("name")} placeholder="As on CNIC / Passport" max={255} />
                            <ToggleGroup
                                label="Gender"
                                value={form.gender}
                                onChange={set("gender")}
                                options={[
                                    { value: "Male", label: "♂  Male", activeClass: "border-primary/5 bg-secondary text-primary" },
                                    { value: "Female", label: "♀  Female", activeClass: "border-primary/5 bg-secondary text-primary" },
                                ]}
                            />
                            <InputField label="Date of Birth" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
                            {age && <p className="text-xs font-medium ml-1 text-primary">Age: {age} years</p>}
                            <RSelect
                                label="Marital Status"
                                value={form.marital_status}
                                onChange={set("marital_status")}
                                placeholder="Select marital status"
                                options={MARITAL_STATUSES}
                            />
                        </StepCard>
                    )}

                    {/* ═══ STEP 2: Location & Contact ═══ */}
                    {step === 2 && (
                        <StepCard key="s2" icon={MapPin} title="Location & Contact" subtitle="Where are you based?" variant="muted">
                            <InputField label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="+92 300 0000000" type="tel" optional max={20} />
                            <RSelect label="Country of Residence" value={form.country} onChange={set("country")} placeholder="Select country" options={COUNTRIES} />
                            <InputField label="City" value={form.city} onChange={set("city")} placeholder="e.g. Lahore, London" max={255} />
                            <RSelect label="Nationality" value={form.nationality} onChange={set("nationality")} placeholder="Select nationality" options={NATIONALITIES} />
                            <ToggleGroup
                                label="Hide Contact from Matches?"
                                value={form.contact_hidden}
                                onChange={set("contact_hidden")}
                                options={[
                                    { value: "0", label: "Visible", activeClass: "border-primary bg-secondary text-primary" },
                                    { value: "1", label: "Hidden", activeClass: "border-border  bg-muted   text-muted-foreground" },
                                ]}
                            />
                            < AutoLocationStepCard></AutoLocationStepCard>
                        </StepCard>
                    )}




                    {/* ═══ STEP 3: Religion & Background ═══ */}
                    {step === 3 && (
                        <StepCard key="s3" icon={Star} title="Religion & Background" subtitle="Faith and cultural background" variant="accent">
                            <RSelect label="Religion" value={form.religion} onChange={set("religion")} placeholder="Select religion" options={RELIGIONS} />
                            <RSelect label="Sect" value={form.sect} onChange={set("sect")} placeholder="Select sect" options={SECTS} optional />
                            <RSelect label="Religious Practice Level" value={form.religious_practice_level} onChange={set("religious_practice_level")} placeholder="Select level" options={PRACTICE_LEVELS} />
                            <RSelect label="Caste / Biradari" value={form.caste} onChange={set("caste")} placeholder="Select caste" options={CASTES} optional note="Optional — many families consider this" />
                            <RSelect label="Mother Tongue" value={form.mother_tongue} onChange={set("mother_tongue")} placeholder="Select language" options={MOTHER_TONGUES} optional />
                            <TextArea label="Family Background" value={form.family_background} onChange={set("family_background")} placeholder="Brief description of your family background, values and traditions..." optional rows={3} />
                        </StepCard>
                    )}

                    {/* ═══ STEP 4: Physical Details ═══ */}
                    {step === 4 && (
                        <StepCard key="s4" icon={Heart} title="Physical Details" subtitle="Your appearance details" variant="primary">
                            <RSelect label="Height" value={form.height_inches} onChange={set("height_inches")} placeholder="Select height" options={HEIGHT_OPTIONS} optional note='Total inches e.g. 68 = 5&apos;8"' />
                            <RSelect label="Body Type" value={form.body_type} onChange={set("body_type")} placeholder="Select body type" options={BODY_TYPES} optional />
                        </StepCard>
                    )}

                    {/* ═══ STEP 5: Education & Career ═══ */}
                    {step === 5 && (
                        <StepCard key="s5" icon={Briefcase} title="Education & Career" subtitle="Your professional background" variant="muted">
                            <RSelect label="Education Level" value={form.education} onChange={set("education")} placeholder="Select education" options={EDUCATION_LEVELS} optional />
                            <InputField label="Profession / Job Title" value={form.profession} onChange={set("profession")} placeholder="e.g. Software Engineer, Doctor" optional max={255} />
                            <RSelect label="Employment Type" value={form.employment_type} onChange={set("employment_type")} placeholder="Select employment type" options={EMPLOYMENT_TYPES} optional />
                            <RSelect label="Monthly Salary / Income" value={form.monthly_salary} onChange={set("monthly_salary")} placeholder="Select range" options={MONTHLY_SALARIES} optional />
                        </StepCard>
                    )}

                    {/* ═══ STEP 6: Lifestyle & About ═══ */}
                    {step === 6 && (
                        <StepCard key="s6" icon={Sparkles} title="Lifestyle & About You" subtitle="Let matches know who you are" variant="primary">
                            <TextArea label="About Me (Bio)" value={form.bio} onChange={set("bio")} placeholder="Tell potential matches about yourself, your personality, values and what you are looking for..." optional rows={4} />
                            <TextArea label="Interests & Hobbies" value={form.interests} onChange={set("interests")} placeholder="e.g. Reading, Travelling, Cooking, Sports..." optional rows={2} />
                            <RSelect label="Have Children?" value={form.has_children} onChange={set("has_children")} placeholder="Select" options={HAS_CHILDREN_OPT} optional />
                            <ToggleGroup
                                label="Willing to Relocate?"
                                value={form.willing_to_relocate}
                                onChange={set("willing_to_relocate")}
                                optional
                                options={[
                                    { value: "Yes", label: "Yes", activeClass: "border-primary/5 bg-secondary text-primary" },
                                    { value: "No", label: "No", activeClass: "border-destructive/50 bg-destructive/10 text-destructive" },
                                    { value: "Maybe", label: "Maybe", activeClass: "border-accent/60 bg-secondary text-accent-foreground" },
                                ]}
                            />
                            <InputField label="Relationship Status Detail" value={form.relationship} onChange={set("relationship")} placeholder="e.g. Open to nikah only, seeking serious proposal" optional max={255} />
                        </StepCard>
                    )}

                    {/* ═══ STEP 7: Guardian ═══ */}
                    {step === 7 && (
                        <StepCard key="s7" icon={Shield} title="Guardian (Wali) Details" subtitle="Required for a halal process" variant="accent">
                            <div className="bg-secondary border border-primary/5/20 rounded-2xl p-4 text-xs text-primary leading-relaxed">
                                🔒 Guardian details are kept private until mutual interest is confirmed by both families.
                            </div>
                            <ToggleGroup
                                label="Is Guardian Required?"
                                value={form.is_guardian_required}
                                onChange={set("is_guardian_required")}
                                options={[
                                    { value: "1", label: "Required", activeClass: "border-primary/5 bg-secondary text-primary" },
                                    { value: "0", label: "Not Required", activeClass: "border-border  bg-muted   text-muted-foreground" },
                                ]}
                            />
                            <InputField label="Guardian Full Name" value={form.guardian_name} onChange={set("guardian_name")} placeholder="Full name of Wali" optional={form.is_guardian_required === "0"} max={255} />
                            <RSelect
                                label="Relationship to Guardian"
                                value={form.guardian_relationship}
                                onChange={set("guardian_relationship")}
                                placeholder="Select relationship"
                                optional={form.is_guardian_required === "0"}
                                options={["Father", "Brother", "Uncle", "Son", "Other"]}
                            />
                            <InputField label="Guardian Phone" value={form.guardian_phone} onChange={set("guardian_phone")} placeholder="+92 300 0000000" type="tel" optional={form.is_guardian_required === "0"} max={50} />
                            <InputField label="Guardian Email" value={form.guardian_email} onChange={set("guardian_email")} placeholder="guardian@email.com" type="email" optional max={255} />
                        </StepCard>
                    )}

                    {/* ═══ STEP 8: Partner Preferences ═══ */}
                    {step === 8 && (
                        <motion.div key="s8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
                            {/* Banner */}
                            <div
                                className="rounded-3xl p-5 text-primary-foreground"
                                style={{ background: "var(--gradient-primary)" }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Heart className="w-5 h-5" />
                                    <span className="font-semibold text-base">Partner Preferences</span>
                                    <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full ml-auto text-primary-foreground">
                                        All optional
                                    </span>
                                </div>
                                <p className="text-xs text-primary-foreground/80 leading-relaxed">
                                    Set your ideal match criteria. Leave blank for "No Preference".
                                </p>
                            </div>

                            {/* Demographics */}
                            <StepCard icon={User} title="Demographics" subtitle="Age, gender, marital status" variant="primary">
                                <ToggleGroup
                                    label="Preferred Gender"
                                    value={prefs.pref_gender}
                                    onChange={setp("pref_gender")}
                                    optional
                                    options={[
                                        { value: "Male", label: "♂  Male", activeClass: "border-primary/5 bg-secondary text-primary" },
                                        { value: "Female", label: "♀  Female", activeClass: "border-primary/5 bg-secondary text-primary" },
                                        { value: "No Preference", label: "No Pref", activeClass: "border-border  bg-muted   text-muted-foreground" },
                                    ]}
                                />
                                <RangeRow
                                    label="Age Range" optional
                                    minVal={prefs.pref_age_min} maxVal={prefs.pref_age_max}
                                    onMinChange={setp("pref_age_min")} onMaxChange={setp("pref_age_max")}
                                    minOpts={ageOpts.map(a => ({ value: a, label: a }))}
                                    maxOpts={ageOpts.map(a => ({ value: a, label: a }))}
                                />
                                <MultiChips label="Marital Status" value={prefs.pref_marital_status} onChange={setp("pref_marital_status")} optional options={["No Preference", ...MARITAL_STATUSES]} />
                                <MultiChips label="Nationality" value={prefs.pref_nationality} onChange={setp("pref_nationality")} optional options={["No Preference", ...NATIONALITIES]} />
                                <MultiChips label="Country" value={prefs.pref_country} onChange={setp("pref_country")} optional options={["No Preference", ...COUNTRIES]} />
                                <InputField label="Preferred City" value={prefs.pref_city} onChange={setp("pref_city")} placeholder="e.g. Karachi, London" optional max={100} />
                            </StepCard>

                            {/* Religion */}
                            <StepCard icon={Star} title="Religion" subtitle="Faith & practice preferences" variant="accent">
                                <RSelect label="Religion" value={prefs.pref_religion} onChange={setp("pref_religion")} placeholder="No preference" options={["No Preference", ...RELIGIONS]} optional />
                                <MultiChips label="Sect" value={prefs.pref_sect} onChange={setp("pref_sect")} optional options={["No Preference", ...SECTS]} />
                                <RSelect label="Practice Level" value={prefs.pref_religious_practice_level} onChange={setp("pref_religious_practice_level")} placeholder="No preference" options={["No Preference", ...PRACTICE_LEVELS]} optional />
                            </StepCard>

                            {/* Physical */}
                            <StepCard icon={Heart} title="Physical" subtitle="Height & body type" variant="primary">
                                <RangeRow
                                    label="Height Range" optional
                                    minVal={prefs.pref_height_min_inches} maxVal={prefs.pref_height_max_inches}
                                    onMinChange={setp("pref_height_min_inches")} onMaxChange={setp("pref_height_max_inches")}
                                    minOpts={HEIGHT_OPTIONS} maxOpts={HEIGHT_OPTIONS}
                                />
                                <MultiChips label="Body Type" value={prefs.pref_body_type} onChange={setp("pref_body_type")} optional options={BODY_TYPE_PREF} />
                            </StepCard>

                            {/* Background */}
                            <StepCard icon={BookOpen} title="Background" subtitle="Caste & mother tongue" variant="muted">
                                <MultiChips label="Caste / Biradari" value={prefs.pref_caste} onChange={setp("pref_caste")} optional options={CASTE_PREF} note="Select multiple or choose No Preference" />
                                <MultiChips label="Mother Tongue" value={prefs.pref_mother_tongue} onChange={setp("pref_mother_tongue")} optional options={TONGUE_PREF} />
                            </StepCard>

                            {/* Career */}
                            <StepCard icon={Briefcase} title="Education & Career" subtitle="Qualifications & income" variant="muted">
                                <RSelect label="Min Education" value={prefs.pref_education} onChange={setp("pref_education")} placeholder="No preference" options={EDU_PREF} optional />
                                <MultiChips label="Employment Type" value={prefs.pref_employment_type} onChange={setp("pref_employment_type")} optional options={EMPLOYMENT_PREF} />
                                <RSelect label="Monthly Income (min)" value={prefs.pref_monthly_salary} onChange={setp("pref_monthly_salary")} placeholder="No preference" options={SALARY_PREF} optional />
                            </StepCard>

                            {/* Life */}
                            <StepCard icon={Sparkles} title="Life Situation" subtitle="Children & relocation" variant="primary">
                                <RSelect label="Has Children" value={prefs.pref_has_children} onChange={setp("pref_has_children")} placeholder="No preference" options={HAS_CHILDREN_ALL} optional />
                                <ToggleGroup
                                    label="Willing to Relocate"
                                    value={prefs.pref_willing_to_relocate}
                                    onChange={setp("pref_willing_to_relocate")}
                                    optional
                                    options={[
                                        { value: "No Preference", label: "Any", activeClass: "border-border  bg-muted   text-muted-foreground" },
                                        { value: "Yes", label: "Yes", activeClass: "border-primary/5 bg-secondary text-primary" },
                                        { value: "No", label: "No", activeClass: "border-destructive/50 bg-destructive/10 text-destructive" },
                                    ]}
                                />
                            </StepCard>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* ── Footer Buttons ── */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 space-y-2">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={next}
                    disabled={saving}
                    className="w-full py-4 rounded-2xl text-primary-foreground font-semibold text-base shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: "var(--gradient-primary)" }}
                >
                    {saving ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Saving...</>
                    ) : step === TOTAL_STEPS ? (
                        <><Check className="w-5 h-5" />Complete Profile</>
                    ) : (
                        <>Next — {STEPS[step].label}<ChevronRight className="w-5 h-5" /></>
                    )}
                </motion.button>
                {step === TOTAL_STEPS && (
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full py-2 text-sm text-muted-foreground text-center"
                    >
                        Skip preferences & complete
                    </button>
                )}
            </div>
        </div>
    );

    // --- AutoLocationStepCard component ---

    function AutoLocationStepCard() {
        const [locationError, setLocationError] = React.useState('');
        const locationRequestedRef = React.useRef(false);

        // Helper to fetch current location, with error handling
        const requestLocation = React.useCallback((showRequiredMsg = false) => {
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationError('');
                    const { latitude, longitude } = position.coords;
                    setForm(prev => ({
                        ...prev,
                        latitude,
                        longitude,
                    }));
                },
                (error) => {
                    if (error.code === 1) { // Permission denied
                        setLocationError('Permission is required to fetch your location.');
                        if (showRequiredMsg) {
                            toast.error("Location permission is required. Please allow access and try again.");
                        }
                    } else {
                        setLocationError('Unable to get location: ' + error.message);
                        toast.error("Unable to get location: " + error.message);
                    }
                }
            );
        }, [setForm]);

        // On mount, try to auto-fetch location only if not already set, just once
        React.useEffect(() => {
            if (!locationRequestedRef.current && !form.latitude && !form.longitude) {
                locationRequestedRef.current = true;
                requestLocation(true);
            }
            // eslint-disable-next-line
        }, []);

        return (
            <div className="rounded-xl border border-border p-3 bg-muted/40 mt-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-card-foreground">
                        Your Current Location
                    </span>
                    <button
                        type="button"
                        className="text-xs text-primary underline underline-offset-2"
                        onClick={() => requestLocation(true)}
                    >
                        Get My Location
                    </button>
                </div>
                {(form.latitude && form.longitude) ? (
                    <div className="mt-2 text-xs">
                        <span className="font-medium text-primary">Coordinates:</span>
                        <span className="ml-1 text-muted-foreground">
                            Lat: {form.latitude}, Lng: {form.longitude}
                        </span>
                    </div>
                ) : (
                    <div className="mt-2 text-xs text-muted-foreground">
                        {locationError
                            ? <span className="text-destructive">{locationError}</span>
                            : "Location not set yet."
                        }
                    </div>
                )}
            </div>
        );
    }
}