// @ts-nocheck
// features/profile/pages/CompleteProfile.jsx

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

import {
    ChevronLeft, ChevronDown, Check, Loader2, Shield, User, Baby,
    MapPin, BookOpen, Briefcase, Heart, Star, ChevronRight,
    Sparkles, CheckCircle2, Camera, RefreshCw,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import AppToaster from "../../../ui/toaster"
import {
    CompleteProfileController,
    defaultForm,
    defaultPrefs,
} from "../services/CompleteProfileService"
import ProfileService from "../services/ProfileService"
import ExploreService from "../../explore/services/ExploreService"
import InputField from "../../../ui/input_field"
import Input from "../../../ui/input"
import MultiChips from "../../../ui/multi_chips"
import RangeRow from "../../../ui/range_row"
import RangeSelect from "../../../ui/range_select"
import SelectOption from "../../../ui/select_option"
import { StepCard } from "../../../ui/step_card"
import TextArea from "../../../ui/text_area"
import { ToggleGroup } from "../../../ui/toggle_group"


// ─── Helpers ─────────────────────────────────────────────────────────────────
const first = (val) => (!val ? "" : Array.isArray(val) ? (val[0] ?? "") : val)
const inchesToFtIn = (n) => { if (!n) return ""; const ft = Math.floor(n / 12); const i = n % 12; return `${ft}'${i}"` }
const HEIGHT_OPTIONS = Array.from({ length: 31 }, (_, i) => ({ value: String(60 + i), label: `${inchesToFtIn(60 + i)} (${60 + i}")` }))

// ─── Helpers — arrays fetched from DB via opts ────────────────────────────────
// getRandomFamilyBackground, getRandomAboutMe, getRandomRelationship
// use opts from DB (family_backgrounds, about_me, relationship_options)
// See: opts?.family_backgrounds, opts?.about_me, opts?.relationship_options

const getRandomFromOpts = (arr) => {
    if (!arr || arr.length === 0) return ""
    return arr[Math.floor(Math.random() * arr.length)]
}

// ─── #22 Country religion mapping ─────────────────────────────────────────────
const getCountryReligion = (country) => {
    const MUSLIM_COUNTRIES = ["Pakistan", "UAE", "Saudi Arabia", "Qatar", "Bahrain", "Kuwait", "Oman", "Turkey", "Malaysia", "Indonesia", "Egypt", "Jordan", "Morocco", "Tunisia", "Afghanistan"]
    return MUSLIM_COUNTRIES.includes(country) ? "Muslim" : ""
}

const STEPS = [
    { id: 1, label: "About You", icon: User },
    { id: 2, label: "Location", icon: MapPin },
    { id: 3, label: "Religion", icon: Star },
    { id: 4, label: "Physical", icon: Heart },
    { id: 5, label: "Career", icon: Briefcase },
    { id: 6, label: "Lifestyle", icon: Sparkles },
    { id: 7, label: "Preferences", icon: Heart },
]
const TOTAL_STEPS = STEPS.length

function ProgressBar({ step, total }) {
    return (
        <div className="h-1 bg-muted w-full">
            <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-primary)" }}
                animate={{ width: `${(step / total) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
    )
}

function OptionsLoader() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-14 h-14">
                <svg className="w-14 h-14 animate-spin" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                    <circle cx="28" cy="28" r="22" fill="none" stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" strokeDasharray="138" strokeDashoffset="100" />
                </svg>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Loading profile options…</p>
        </div>
    )
}

function CompleteScreen({ navigate }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "var(--gradient-primary)" }}>
                <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
            </motion.div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-card-foreground">Profile Complete!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">Your profile is now live. Matches will be suggested based on your preferences.</p>
            </div>
            <div className="w-full max-w-xs space-y-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/individual/verification")}
                    className="w-full py-4 rounded-2xl text-primary-foreground font-semibold shadow-lg"
                    style={{ background: "var(--gradient-primary)" }}>View Matches</motion.button>
                <button onClick={() => navigate("/profile")} className="w-full py-3 text-sm text-muted-foreground underline underline-offset-2">Edit Profile</button>
            </div>
        </motion.div>
    )
}

function AutoLocationCard({ form, setForm }) {
    const [locationError, setLocationError] = useState("")
    const requestedRef = useRef(false)
    const request = useCallback(() => {
        const ctrl = new CompleteProfileController({ setForm })
        ctrl.requestLocation(setForm, setLocationError)
    }, [setForm])
    useEffect(() => {
        if (!requestedRef.current && !form.latitude && !form.longitude) { requestedRef.current = true; request() }
    }, [])
    return (
        <div className="rounded-xl border border-border p-3 bg-muted/40 mt-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-card-foreground">Your Current Location</span>
                <button type="button" className="text-xs text-primary underline underline-offset-2" onClick={request}>Get My Location</button>
            </div>
            {form.latitude && form.longitude ? (
                <div className="mt-2 text-xs"><span className="font-medium text-primary">Coordinates:</span><span className="ml-1 text-muted-foreground">Lat: {form.latitude}, Lng: {form.longitude}</span></div>
            ) : (
                <div className="mt-2 text-xs text-muted-foreground">{locationError ? <span className="text-destructive">{locationError}</span> : "Location not set yet."}</div>
            )}
        </div>
    )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function CompleteProfile() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [done, setDone] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(defaultForm)
    const [prefs, setPrefs] = useState(defaultPrefs)
    const [uploadingIdx, setUploadingIdx] = useState(null)
    const [optsLoading, setOptsLoading] = useState(true)
    const [opts, setOpts] = useState(null)
    const photoInputRef = useRef(null)
    const pendingIdxRef = useRef(null)
    const defaultsSetRef = useRef(false)

    const ctrl = new CompleteProfileController({ setForm, setPrefs, setSaving, setDone, setStep, navigate })

    useEffect(() => {
        ctrl.loadProfile()
        const loadOptions = async () => {
            setOptsLoading(true)
            try {
                const data = await ExploreService.getOptions()
                setOpts(data)
                const p = data.preferences
                if (p) {
                    setPrefs(prev => ({
                        ...prev,
                        ...(p.pref_gender && { pref_gender: p.pref_gender }),
                        ...(p.pref_age_min && p.pref_age_max && { pref_age_min: String(p.pref_age_min), pref_age_max: String(p.pref_age_max) }),
                        ...(p.pref_height_min_inches && p.pref_height_max_inches && { pref_height_min_inches: String(p.pref_height_min_inches), pref_height_max_inches: String(p.pref_height_max_inches) }),
                        ...(p.pref_religion && { pref_religion: p.pref_religion }),
                        ...(p.pref_sect && { pref_sect: first(p.pref_sect) }),
                        ...(p.pref_religious_practice_level && { pref_religious_practice_level: p.pref_religious_practice_level }),
                        ...(p.pref_education && { pref_education: p.pref_education }),
                        ...(p.pref_has_children && { pref_has_children: p.pref_has_children }),
                        ...(p.pref_willing_to_relocate != null && { pref_willing_to_relocate: p.pref_willing_to_relocate == 1 ? "Yes" : "No" }),
                        ...(p.pref_marital_status && { pref_marital_status: first(p.pref_marital_status) }),
                        ...(p.pref_body_type && { pref_body_type: first(p.pref_body_type) }),
                        ...(p.pref_employment_type && { pref_employment_type: first(p.pref_employment_type) }),
                        ...(p.pref_monthly_salary && { pref_monthly_salary: p.pref_monthly_salary }),
                        ...(p.pref_city && { pref_city: p.pref_city }),
                        ...(p.pref_country && { pref_country: first(p.pref_country) }),
                    }))
                }

                if (!defaultsSetRef.current) {
                    defaultsSetRef.current = true
                    const marital = data?.marital_statuses ?? []
                    const educ = data?.education_levels ?? []
                    const employ = data?.employment_types ?? []
                    const hasChild = data?.has_children ?? []
                    const practice = data?.practice_levels ?? []
                    const bodyTypes = data?.body_types ?? []

                    setForm(prev => {
                        // ── Step 2 defaults: Pakistan, Islamabad, Pakistani ──
                        const pakData = (data?.country_data ?? {})["Pakistan"]
                        const defaultCity = pakData?.cities?.find(c => c === "Islamabad") ?? pakData?.cities?.[0] ?? ""
                        const defaultNat = pakData?.nationalities?.[0] ?? "Pakistani"
                        // ── Step 3 defaults: Muslim, Sunni, Moderately Religious, Punjabi ──
                        const tongues = pakData?.mother_tongues ?? []
                        const defaultTongue = tongues.find(t => t === "Punjabi") ?? tongues[0] ?? ""
                        // ── Family background + relationship from DB ──
                        const fbList = data?.family_backgrounds?.muslim ?? []
                        const relList = data?.relationship_options?.muslim ?? []
                        const fb = prev.family_background || getRandomFromOpts(fbList)
                        const rel = prev.relationship || getRandomFromOpts(relList)
                        return {
                            ...prev,
                            // Step 1
                            marital_status: !prev.marital_status ? (marital[0] ?? "") : prev.marital_status,
                            height_inches: !prev.height_inches ? "68" : prev.height_inches,
                            body_type: !prev.body_type ? (bodyTypes.find(b => b === "Average") ?? bodyTypes[2] ?? "") : prev.body_type,
                            has_children: !prev.has_children ? (hasChild[0] ?? "") : prev.has_children,
                            // Step 2
                            country: !prev.country ? "Pakistan" : prev.country,
                            city: !prev.city ? defaultCity : prev.city,
                            nationality: !prev.nationality ? (defaultNat || "Pakistani") : prev.nationality,
                            contact_hidden: prev.contact_hidden ?? "1",
                            // Step 3
                            religion: !prev.religion ? "Muslim" : prev.religion,
                            sect: !prev.sect ? "Sunni" : prev.sect,
                            religious_practice_level: !prev.religious_practice_level ? (practice[2] ?? practice[1] ?? "Moderately Religious") : prev.religious_practice_level,
                            mother_tongue: !prev.mother_tongue ? defaultTongue : prev.mother_tongue,
                            family_background: fb,
                            relationship: rel,
                            // Family details defaults
                            mother_occupation: !prev.mother_occupation ? "Housewife" : prev.mother_occupation,
                            // Step 5
                            education: !prev.education ? (educ.find(e => e === "Intermediate") ?? educ[4] ?? "") : prev.education,
                            employment_type: !prev.employment_type ? (employ.find(e => e === "Private") ?? employ[1] ?? "") : prev.employment_type,
                            // Step 6
                            willing_to_relocate: !prev.willing_to_relocate ? "No" : prev.willing_to_relocate,
                        }
                    })

                    if (!p) {
                        // Set defaults for prefs on first load
                        const pakCountryData = (data?.country_data ?? {})["Pakistan"]
                        setPrefs(prev => ({
                            ...prev,
                            pref_education: educ.find(e => e === "Intermediate") ?? educ[4] ?? "",
                            pref_has_children: hasChild[0] ?? "",
                            pref_willing_to_relocate: "No",
                            pref_country: "Pakistan",
                            pref_city: pakCountryData?.cities?.[0] ?? "",
                            pref_religion: "Muslim",
                            pref_sect: ["Sunni"],
                            pref_age_min: ageOpts[0] ?? "18",
                            pref_age_max: ageOpts[ageOpts.length - 1] ?? "60",
                            pref_height_min_inches: HEIGHT_OPTIONS[0]?.value ?? "60",
                            pref_height_max_inches: HEIGHT_OPTIONS[HEIGHT_OPTIONS.length - 1]?.value ?? "90",
                            pref_body_type: ["Average"],
                        }))
                    }
                }
            } catch (err) {
                console.error("Options load error:", err)
                toast.error("Failed to load profile options")
            } finally {
                setOptsLoading(false)
            }
        }
        loadOptions()
    }, [])

    // ── Unpack ───────────────────────────────────────────────────────────────
    const COUNTRIES = opts?.countries ?? []
    const COUNTRY_FLAGS = opts?.country_flags ?? {}
    const COUNTRY_DATA = opts?.country_data ?? {}
    const ALL_NATS = opts?.all_nationalities ?? []
    const ALL_TONGUES = opts?.all_mother_tongues ?? []
    const RELIGIONS = opts?.religions ?? []
    const SECTS = opts?.sects ?? []
    const CASTES = opts?.castes ?? []
    const MARITAL = opts?.marital_statuses ?? []
    const EDUCATION = opts?.education_levels ?? []
    const BODY_TYPES = opts?.body_types ?? []
    const EMPLOYMENT = opts?.employment_types ?? []
    const HAS_CHILDREN = opts?.has_children ?? []
    const PRACTICE_LVLS = opts?.practice_levels ?? []
    const PROFESSIONS = opts?.professions ?? []
    const currentCountryData = form.country ? (COUNTRY_DATA[form.country] ?? null) : null
    const CITIES = currentCountryData?.cities ?? []
    const COUNTRY_TONGUES = currentCountryData?.mother_tongues ?? ALL_TONGUES
    const SALARY_OPTIONS = currentCountryData?.monthly_salaries ?? []
    const CURRENCY = currentCountryData?.currency ?? ""
    const NATIONALITIES = currentCountryData?.nationalities ?? ALL_NATS
    const prefCountryData = prefs.pref_country && prefs.pref_country !== "No Preference" ? (COUNTRY_DATA[prefs.pref_country] ?? null) : null
    const PREF_CITIES = prefCountryData?.cities ?? []
    const PREF_SALARIES = prefCountryData?.monthly_salaries ?? []
    const PREF_CURRENCY = prefCountryData?.currency ?? ""
    const COUNTRY_LIST = COUNTRIES.map(c => ({ value: c, label: `${COUNTRY_FLAGS[c] ?? "🌍"} ${c}` }))
    const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
    const setp = (k) => (v) => setPrefs(p => ({ ...p, [k]: v }))
    const age = ctrl.calcAge(form.date_of_birth)
    const ageOpts = Array.from({ length: 43 }, (_, i) => String(18 + i))

    // ── #2 Country change — auto city[0], nationality[0], tongue[0], salary[1] ──
    const handleCountryChange = (country) => {
        const cd = COUNTRY_DATA[country]
        setForm(prev => ({
            ...prev,
            country,
            city: cd?.cities?.[0] ?? "",
            nationality: cd?.nationalities?.[0] ?? "",
            mother_tongue: cd?.mother_tongues?.find(t => t === "Punjabi") ?? cd?.mother_tongues?.[0] ?? "",
            monthly_salary: cd?.monthly_salaries?.[1] ?? cd?.monthly_salaries?.[0] ?? "",
            religion: prev.religion || getCountryReligion(country),
        }))
    }

    // ── #21 Pref country change — auto city[0] ──────────────────────────────
    const handlePrefCountryChange = (v) => {
        const cd = COUNTRY_DATA[v]
        setp("pref_country")(v)
        setp("pref_city")(cd?.cities?.[0] ?? "")
        setp("pref_monthly_salary")("")
    }

    // ── #18 Auto preferred gender ────────────────────────────────────────────
    const autoPreferredGender = form.gender === "Male" ? "Female" : form.gender === "Female" ? "Male" : ""

    // ── #19 Age validation ───────────────────────────────────────────────────
    const handlePrefAgeMin = (v) => {
        if (prefs.pref_age_max && Number(v) >= Number(prefs.pref_age_max)) { toast.warn("Min age must be less than max age"); return }
        setp("pref_age_min")(v)
    }
    const handlePrefAgeMax = (v) => {
        if (prefs.pref_age_min && Number(v) <= Number(prefs.pref_age_min)) { toast.warn("Max age must be greater than min age"); return }
        setp("pref_age_max")(v)
    }

    // ── Photo handlers ───────────────────────────────────────────────────────
    const handlePhotoClick = (idx) => { pendingIdxRef.current = idx; photoInputRef.current?.click() }
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0]; e.target.value = ""; if (!file) return
        const idx = pendingIdxRef.current
        const blobUrl = URL.createObjectURL(file)
        setForm(prev => { const p = [...(prev.photos || [])]; p[idx] = blobUrl; return { ...prev, photos: p } })
        setUploadingIdx(idx)
        try {
            const data = await ProfileService.uploadImage(file, idx)
            if (data.success) {
                const url = data.imageUrl?.startsWith("http") ? data.imageUrl : `${import.meta.env.VITE_BASE_URL}${data.imageUrl}`
                setForm(prev => { const p = [...(prev.photos || [])]; p[idx] = url; return { ...prev, photos: p } })
            } else { toast.error(data.message || "Upload failed") }
        } catch { toast.error("Upload failed") }
        finally { setUploadingIdx(null) }
    }

    if (done) return <div className="min-h-screen bg-background"><CompleteScreen navigate={navigate} /></div>

    return (
        <div className="min-h-screen bg-background">
            <AppToaster></AppToaster>
            <div className="sticky top-0 z-20 bg-background border-b border-border">
                <div className="px-4 py-3 flex items-center gap-3">
                    <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
                        className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                        <ChevronLeft size={22} className="text-foreground" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-base font-semibold text-card-foreground">{STEPS[step - 1].label}</h1>
                        <p className="text-xs text-muted-foreground">Step {step} of {TOTAL_STEPS}</p>
                    </div>
                </div>
                <ProgressBar step={step} total={TOTAL_STEPS} />
            </div>

            <div className="max-w-lg mx-auto px-4 py-5 pb-36 space-y-4">
                {optsLoading && step === 7 ? <OptionsLoader /> : (
                    <AnimatePresence mode="wait">

                        {/* ═══ STEP 1 ═══ */}
                        {step === 1 && (
                            <StepCard key="s1" icon={User} title="Personal Details" subtitle="Basic information about you" variant="primary">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Profile Photos</label>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                        {[0, 1, 2, 3].map((idx) => {
                                            const photo = form.photos?.[idx] || null; const isUploading = uploadingIdx === idx; const isFirst = idx === 0
                                            return (
                                                <motion.div key={idx} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => handlePhotoClick(idx)}
                                                    style={{ borderRadius: 16, overflow: "hidden", position: "relative", aspectRatio: "3/4", backgroundColor: "#f0f0f0", cursor: "pointer", border: photo ? "2px solid var(--primary)" : "2px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                                                    {photo ? (
                                                        <>
                                                            <img src={photo} alt={`Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: form.photos_blurred ? "blur(3px)" : "none", transition: "filter 0.3s ease" }} />
                                                            {isFirst && <div style={{ position: "absolute", top: 6, right: 6, padding: "2px 6px", borderRadius: 6, background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 9, fontWeight: 600 }}>Main</div>}
                                                            <div style={{ position: "absolute", bottom: 6, left: 6, width: 26, height: 26, borderRadius: "50%", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}><Camera style={{ width: 12, height: 12, color: "#555" }} /></div>
                                                        </>
                                                    ) : (
                                                        <><Camera style={{ width: 22, height: 22, color: "#bbb" }} /><span style={{ fontSize: 9, color: "#bbb" }}>{isFirst ? "Main Photo" : `Photo ${idx + 1}`}</span></>
                                                    )}
                                                    {isUploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 style={{ width: 22, height: 22, color: "#fff" }} className="animate-spin" /></div>}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                                        <p className="text-xs text-muted-foreground">First photo is your main profile photo.</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{form.photos_blurred ? "Photos blurred" : "Photos visible"}</span>
                                            <div onClick={() => set("photos_blurred")(!form.photos_blurred)} style={{ width: 40, height: 22, borderRadius: 99, background: form.photos_blurred ? "var(--primary)" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.25s ease", flexShrink: 0 }}>
                                                <div style={{ position: "absolute", top: 3, left: form.photos_blurred ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.25s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <InputField label="Date of Birth" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
                                {age && <p className="text-xs font-medium ml-1 text-primary">Age: {age} years</p>}
                                {/* #4 Marital status default index 0 */}
                                <RangeSelect label="Marital Status" value={form.marital_status} onChange={(v) => { set("marital_status")(v); if (!["Divorced", "Widowed", "Separated"].includes(v)) { set("has_children")(""); set("no_of_children")("") } }}
                                    placeholder="Select marital status"
                                    options={MARITAL.length ? MARITAL : ["Never Married", "Divorced", "Widowed", "Separated"]} />
                                {/* Show has children + no of children only if divorced/widowed/separated */}
                                {["Divorced", "Widowed", "Separated"].includes(form.marital_status) && (<>
                                    <RangeSelect label="Have Children?" value={form.has_children} onChange={set("has_children")} placeholder="Select"
                                        options={HAS_CHILDREN.length ? HAS_CHILDREN : ["No Children", "Has Children"]} />
                                    {form.has_children === "Has Children" && (
                                        <InputField label="Number of Children" value={form.no_of_children} onChange={set("no_of_children")} placeholder="e.g. 2" type="number" optional max={2} />
                                    )}
                                </>)}
                            </StepCard>
                        )}

                        {/* ═══ STEP 2 ═══ */}
                        {step === 2 && (
                            <StepCard key="s2" icon={MapPin} title="Location & Contact" subtitle="Where are you based?" variant="muted">
                                <InputField label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="+92 300 0000000" type="tel" optional max={20} />
                                {/* Country — default Pakistan */}
                                <RangeSelect label="Country of Residence" value={form.country || "Pakistan"} onChange={handleCountryChange} placeholder="Select country"
                                    options={COUNTRY_LIST.length ? COUNTRY_LIST : ["Pakistan", "UAE", "UK", "USA", "Canada"]} />
                                {/* City — default Islamabad (first index) */}
                                {(form.country || "Pakistan") && CITIES.length > 0 ? (
                                    <RangeSelect label="City" value={form.city || CITIES[0]} onChange={set("city")} placeholder="Select city" options={CITIES} />
                                ) : (
                                    <InputField label="City" value={form.city} onChange={set("city")} placeholder="e.g. Lahore, London" max={255} />
                                )}
                                {/* Nationality — default Pakistani (first index) */}
                                <RangeSelect label="Nationality" value={form.nationality || NATIONALITIES[0] || "Pakistani"} onChange={set("nationality")} placeholder="Select nationality"
                                    options={NATIONALITIES.length ? NATIONALITIES : ALL_NATS} />
                                {/* Contact hidden — default Hidden */}
                                <ToggleGroup label="Hide Contact from Matches?" value={form.contact_hidden ?? "1"} onChange={set("contact_hidden")}
                                    options={[
                                        { value: "0", label: "Visible", activeClass: "border-primary bg-secondary text-primary" },
                                        { value: "1", label: "Hidden", activeClass: "border-border bg-muted text-muted-foreground" },
                                    ]} />
                                <AutoLocationCard form={form} setForm={setForm} />
                            </StepCard>
                        )}

                        {/* ═══ STEP 3 ═══ */}
                        {step === 3 && (
                            <StepCard key="s3" icon={Star} title="Religion & Background" subtitle="Faith and cultural background" variant="accent">
                                {/* Religion — default Muslim */}
                                <RangeSelect label="Religion" value={form.religion || "Muslim"}
                                    onChange={(v) => { set("religion")(v); if (v !== "Muslim") { set("sect")("") } else { if (!form.sect) set("sect")("Sunni") } }}
                                    placeholder="Select religion"
                                    options={RELIGIONS.length ? RELIGIONS : ["Muslim", "Christian", "Hindu", "Other"]} />
                                {/* Sect — show only if Muslim, default Sunni */}
                                {(form.religion || "Muslim") === "Muslim" && (
                                    <RangeSelect label="Sect" value={form.sect || "Sunni"} onChange={set("sect")} placeholder="Select sect" optional
                                        options={SECTS.length ? SECTS : ["Sunni", "Shia", "Deobandi", "Barelvi", "Other"]} />
                                )}
                                {/* Practice level — default Moderately Religious (index 1) */}
                                <RangeSelect label="Religious Practice Level" value={form.religious_practice_level || (PRACTICE_LVLS[1] ?? "Moderately Religious")}
                                    onChange={set("religious_practice_level")} placeholder="Select level"
                                    options={PRACTICE_LVLS.length ? PRACTICE_LVLS : ["Very Religious", "Moderately Religious", "Somewhat Religious", "Not Religious"]} />
                                <RangeSelect label="Caste / Biradari" value={form.caste} onChange={set("caste")} placeholder="Select caste" optional
                                    note="Optional — many families consider this"
                                    options={CASTES.length ? CASTES : []} />
                                {/* Mother tongue — default Punjabi or first from country list */}
                                <RangeSelect label="Mother Tongue" value={form.mother_tongue || (COUNTRY_TONGUES.find(t => t === "Punjabi") ?? COUNTRY_TONGUES[0] ?? "")} onChange={set("mother_tongue")} placeholder="Select language" optional
                                    options={COUNTRY_TONGUES.length ? COUNTRY_TONGUES : ALL_TONGUES} />
                                {/* ── Family Details ── */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Family Details</label>

                                    {/* Father Occupation */}
                                    <RangeSelect label="Father's Occupation" value={form.father_occupation} onChange={set("father_occupation")}
                                        placeholder="Select profession"
                                        options={["Passed Away", ...(PROFESSIONS.length ? PROFESSIONS : ["Doctor", "Engineer", "Teacher", "Business Owner", "Other"])]}
                                        note="Select 'Passed Away' if applicable" />

                                    {/* Mother Occupation */}
                                    <RangeSelect label="Mother's Occupation" value={form.mother_occupation || "Housewife"}
                                        onChange={set("mother_occupation")}
                                        placeholder="Select profession"
                                        options={["Housewife", "Passed Away", ...(PROFESSIONS.length ? PROFESSIONS : ["Doctor", "Engineer", "Teacher", "Other"])]}
                                        note="Default: Housewife" />

                                    {/* Brothers & Sisters */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField label="No. of Brothers" value={form.brothers} onChange={set("brothers")}
                                            placeholder="e.g. 2" type="number" />
                                        <InputField label="No. of Sisters" value={form.sisters} onChange={set("sisters")}
                                            placeholder="e.g. 1" type="number" />
                                    </div>
                                </div>

                                {/* Family background — from DB opts */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Family Background</label>
                                        <button type="button" onClick={() => {
                                            const fbList = (form.religion || "Muslim") === "Muslim"
                                                ? (opts?.family_backgrounds?.muslim ?? [])
                                                : (opts?.family_backgrounds?.other ?? [])
                                            set("family_background")(getRandomFromOpts(fbList))
                                        }} className="flex items-center gap-1 text-xs text-primary underline underline-offset-2">
                                            <RefreshCw className="w-3 h-3" /> Random
                                        </button>
                                    </div>
                                    <TextArea value={form.family_background} onChange={set("family_background")}
                                        placeholder="Brief description of your family background, values and traditions..." optional rows={3} />
                                </div>
                            </StepCard>
                        )}

                        {/* ═══ STEP 4 ═══ */}
                        {step === 4 && (
                            <StepCard key="s4" icon={Heart} title="Physical Details" subtitle="Your appearance details" variant="primary">
                                {/* #9 Height default 68", Body type default Average */}
                                <RangeSelect label="Height" value={form.height_inches} onChange={set("height_inches")}
                                    placeholder="Select height" options={HEIGHT_OPTIONS} note='Total inches e.g. 68 = 5&apos;8"' />
                                <RangeSelect label="Body Type" value={form.body_type} onChange={set("body_type")}
                                    placeholder="Select body type"
                                    options={BODY_TYPES.length ? BODY_TYPES : ["Slim", "Athletic", "Average", "Curvy", "Heavy"]} />
                            </StepCard>
                        )}

                        {/* ═══ STEP 5 ═══ */}
                        {step === 5 && (
                            <StepCard key="s5" icon={Briefcase} title="Education & Career" subtitle="Your professional background" variant="muted">
                                {/* #10 Education default Intermediate */}
                                <RangeSelect label="Education Level" value={form.education} onChange={set("education")} placeholder="Select education"
                                    options={EDUCATION.length ? EDUCATION : ["High School", "Bachelor's", "Master's", "PhD", "Other"]} />
                                {/* #10 Profession from options dropdown */}
                                <RangeSelect label="Profession / Job Title" value={form.profession} onChange={set("profession")} placeholder="Select profession"
                                    options={PROFESSIONS.length ? PROFESSIONS : ["Doctor", "Software Engineer", "Teacher", "Other"]} />
                                {/* #11 Employment default Private */}
                                <RangeSelect label="Employment Type" value={form.employment_type} onChange={set("employment_type")} placeholder="Select employment type"
                                    options={EMPLOYMENT.length ? EMPLOYMENT : ["Government", "Private", "Self-Employed", "Business Owner", "Student"]} />
                                {/* #12 Salary default index 1 */}
                                {SALARY_OPTIONS.length > 0 && (
                                    <RangeSelect label={`Monthly Salary${CURRENCY ? ` (${CURRENCY})` : ""}`}
                                        value={form.monthly_salary} onChange={set("monthly_salary")}
                                        placeholder="Select range" options={SALARY_OPTIONS} optional />
                                )}
                            </StepCard>
                        )}

                        {/* ═══ STEP 6 ═══ */}
                        {step === 6 && (
                            <StepCard key="s6" icon={Sparkles} title="Lifestyle & About You" subtitle="Let matches know who you are" variant="primary">
                                {/* About me — random from DB by profession */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About Me (Bio)</label>
                                        <button type="button" onClick={() => {
                                            const rel = form.religion === "Muslim" ? "muslim" : "other"
                                            const byProf = opts?.about_me?.[rel]?.[form.profession] || opts?.about_me?.[rel]?.default || []
                                            set("bio")(getRandomFromOpts(byProf))
                                        }} className="flex items-center gap-1 text-xs text-primary underline underline-offset-2">
                                            <RefreshCw className="w-3 h-3" /> Random
                                        </button>
                                    </div>
                                    <TextArea value={form.bio} onChange={set("bio")} placeholder="Tell potential matches about yourself..." rows={4} />
                                </div>
                                {/* Interests — from DB opts */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Interests & Hobbies</label>
                                    <MultiChips label="" optional
                                        value={Array.isArray(form.interests) ? form.interests : (form.interests ? form.interests.split(",").map(s => s.trim()).filter(Boolean) : [])}
                                        onChange={(v) => set("interests")(v)}
                                        options={opts?.interests ?? []} />
                                </div>
                                {/* Has children REMOVED — moved to Step 1 (Personal Details) */}
                                {/* Willing to relocate — primary colour instead of red */}
                                <ToggleGroup label="Willing to Relocate?" value={form.willing_to_relocate} onChange={set("willing_to_relocate")}
                                    options={[
                                        { value: "Yes", label: "Yes", activeClass: "border-primary/5 bg-secondary text-primary" },
                                        { value: "No", label: "No", activeClass: "border-primary/5 bg-secondary text-primary" },
                                        { value: "Maybe", label: "Maybe", activeClass: "border-primary/5 bg-secondary text-primary" },
                                    ]} />
                                {/* Relationship intent — from DB opts */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Relationship Intent</label>
                                        <button type="button" onClick={() => {
                                            const rel = (form.religion || "Muslim") === "Muslim" ? "muslim" : "other"
                                            const list = opts?.relationship_options?.[rel] ?? []
                                            set("relationship")(getRandomFromOpts(list))
                                        }} className="flex items-center gap-1 text-xs text-primary underline underline-offset-2">
                                            <RefreshCw className="w-3 h-3" /> Random
                                        </button>
                                    </div>
                                    <RangeSelect label="" value={form.relationship} onChange={set("relationship")} placeholder="Select relationship intent" optional
                                        options={(form.religion || "Muslim") === "Muslim"
                                            ? (opts?.relationship_options?.muslim ?? [])
                                            : (opts?.relationship_options?.other ?? [])} />
                                </div>
                            </StepCard>
                        )}

                        {/* ═══ STEP 7: Preferences ═══ */}
                        {step === 7 && !optsLoading && (
                            <motion.div key="s7" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
                                <div className="rounded-3xl p-5 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Heart className="w-5 h-5" />
                                        <span className="font-semibold text-base">Partner Preferences</span>
                                        <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full ml-auto text-primary-foreground">All optional</span>
                                    </div>
                                    <p className="text-xs text-primary-foreground/80 leading-relaxed">Set your ideal match criteria. Leave blank for "No Preference".</p>
                                </div>

                                <StepCard icon={User} title="Demographics" subtitle="Age, gender, marital status" variant="primary">
                                    {/* #18 Preferred gender — one selected based on user gender, disabled */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Preferred Gender</label>
                                        <div className="flex gap-2">
                                            {["Male", "Female"].map(g => (
                                                <div key={g}
                                                    style={{
                                                        flex: 1, padding: "10px 0", borderRadius: 12, textAlign: "center",
                                                        fontSize: 13, fontWeight: 600, cursor: "not-allowed",
                                                        background: autoPreferredGender === g ? "var(--primary)" : "var(--muted)",
                                                        color: autoPreferredGender === g ? "var(--primary-foreground)" : "var(--muted-foreground)",
                                                        border: "1.5px solid",
                                                        borderColor: autoPreferredGender === g ? "var(--primary)" : "transparent",
                                                        opacity: autoPreferredGender === g ? 1 : 0.4,
                                                    }}>
                                                    {g === "Male" ? "♂ Male" : "♀ Female"}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Auto-selected based on your gender — not editable</p>
                                    </div>
                                    {/* #19 Age range — min first index (18), max last index (60) */}
                                    <RangeRow label="Age Range" optional
                                        minVal={prefs.pref_age_min || ageOpts[0]}
                                        maxVal={prefs.pref_age_max || ageOpts[ageOpts.length - 1]}
                                        onMinChange={handlePrefAgeMin} onMaxChange={handlePrefAgeMax}
                                        minOpts={ageOpts.map(a => ({ value: a, label: a }))}
                                        maxOpts={ageOpts.map(a => ({ value: a, label: a }))} />
                                    {/* Marital Status moved to Life Situation card */}
                                    {/* #20 Nationality removed */}
                                    {/* #21 Pref country — default Pakistan, city first index */}
                                    <RangeSelect label="Preferred Country" value={prefs.pref_country || "Pakistan"} onChange={handlePrefCountryChange} placeholder="Any country" optional
                                        options={["No Preference", ...COUNTRY_LIST.map(c => c.label ?? c)]} />
                                    {(prefs.pref_country || "Pakistan") !== "No Preference" && PREF_CITIES.length > 0 ? (
                                        <RangeSelect label="Preferred City" value={prefs.pref_city || PREF_CITIES[0]} onChange={setp("pref_city")} placeholder="Any city" optional
                                            options={["No Preference", ...PREF_CITIES]} />
                                    ) : (
                                        <InputField label="Preferred City" value={prefs.pref_city} onChange={setp("pref_city")} placeholder="e.g. Karachi, London" optional max={100} />
                                    )}
                                </StepCard>

                                {/* #22 Religion — default Muslim, sect only for Muslim, default Sunni */}
                                <StepCard icon={Star} title="Religion" subtitle="Faith & practice preferences" variant="accent">
                                    <RangeSelect label="Religion" value={prefs.pref_religion || "Muslim"}
                                        onChange={(v) => { setp("pref_religion")(v); if (v !== "Muslim") setp("pref_sect")(""); else if (!prefs.pref_sect) setp("pref_sect")("Sunni") }}
                                        placeholder="No preference" optional
                                        options={["No Preference", ...(RELIGIONS.length ? RELIGIONS : ["Muslim", "Christian", "Hindu", "Other"])]} />
                                    {(prefs.pref_religion || "Muslim") === "Muslim" && (
                                        <MultiChips label="Sect" value={prefs.pref_sect || ["Sunni"]} onChange={setp("pref_sect")} optional
                                            options={["No Preference", ...(SECTS.length ? SECTS : ["Sunni", "Shia", "Deobandi", "Barelvi", "Other"])]} />
                                    )}
                                    <RangeSelect label="Practice Level" value={prefs.pref_religious_practice_level}
                                        onChange={setp("pref_religious_practice_level")} placeholder="No preference" optional
                                        options={["No Preference", ...(PRACTICE_LVLS.length ? PRACTICE_LVLS : ["Very Religious", "Moderately Religious", "Somewhat Religious"])]} />
                                </StepCard>

                                <StepCard icon={Heart} title="Physical" subtitle="Height & body type" variant="primary">
                                    {/* Height range — min first index (60"), max last index (90") */}
                                    <RangeRow label="Height Range" optional
                                        minVal={prefs.pref_height_min_inches || HEIGHT_OPTIONS[0]?.value}
                                        maxVal={prefs.pref_height_max_inches || HEIGHT_OPTIONS[HEIGHT_OPTIONS.length - 1]?.value}
                                        onMinChange={setp("pref_height_min_inches")} onMaxChange={setp("pref_height_max_inches")}
                                        minOpts={HEIGHT_OPTIONS} maxOpts={HEIGHT_OPTIONS} />
                                    {/* Body type — Average default */}
                                    <MultiChips label="Body Type" value={prefs.pref_body_type || ["Average"]} onChange={setp("pref_body_type")} optional
                                        options={["No Preference", ...(BODY_TYPES.length ? BODY_TYPES : ["Slim", "Athletic", "Average", "Curvy", "Heavy"])]} />
                                </StepCard>

                                {/* #22 No caste/mother tongue card in prefs */}

                                <StepCard icon={Briefcase} title="Education & Career" subtitle="Qualifications & income" variant="muted">
                                    {/* #23 Min education — Intermediate default */}
                                    <RangeSelect label="Min Education"
                                        value={prefs.pref_education || (EDUCATION.find(e => e === "Intermediate") ?? EDUCATION[4] ?? "")}
                                        onChange={setp("pref_education")} placeholder="No preference" optional
                                        options={["No Preference", ...(EDUCATION.length ? EDUCATION : ["High School", "Bachelor's", "Master's", "PhD"])]} />
                                    <MultiChips label="Employment Type" value={prefs.pref_employment_type} onChange={setp("pref_employment_type")} optional
                                        options={["No Preference", ...(EMPLOYMENT.length ? EMPLOYMENT : ["Government", "Private", "Self-Employed", "Business Owner"])]} />
                                    {PREF_SALARIES.length > 0 && (
                                        <RangeSelect label={`Monthly Income (min)${PREF_CURRENCY ? ` (${PREF_CURRENCY})` : ""}`}
                                            value={prefs.pref_monthly_salary} onChange={setp("pref_monthly_salary")} placeholder="No preference" optional
                                            options={["No Preference", ...PREF_SALARIES]} />
                                    )}
                                </StepCard>

                                <StepCard icon={Sparkles} title="Life Situation" subtitle="Marital status & relocation" variant="primary">
                                    {/* Partner marital status */}
                                    <MultiChips label="Partner Marital Status" value={prefs.pref_marital_status} onChange={setp("pref_marital_status")} optional
                                        options={["No Preference", ...(MARITAL.length ? MARITAL : ["Never Married", "Divorced", "Widowed", "Separated"])]} />
                                    {/* Has Children — show only if Divorced, Widowed or Separated selected */}
                                    {(Array.isArray(prefs.pref_marital_status)
                                        ? prefs.pref_marital_status.some(s => ["Divorced", "Widowed", "Separated"].includes(s))
                                        : ["Divorced", "Widowed", "Separated"].includes(prefs.pref_marital_status)) && (
                                            <RangeSelect label="Has Children" value={prefs.pref_has_children} onChange={setp("pref_has_children")} placeholder="No preference" optional
                                                options={["No Preference", ...(HAS_CHILDREN.length ? HAS_CHILDREN : ["No Children", "Has Children"])]} />
                                        )}
                                    {/* Willing to relocate — primary colour */}
                                    <ToggleGroup label="Willing to Relocate" value={prefs.pref_willing_to_relocate || "No"} onChange={setp("pref_willing_to_relocate")} optional
                                        options={[
                                            { value: "No Preference", label: "Any", activeClass: "border-border bg-muted text-muted-foreground" },
                                            { value: "Yes", label: "Yes", activeClass: "border-primary/5 bg-secondary text-primary" },
                                            { value: "No", label: "No", activeClass: "border-primary/5 bg-secondary text-primary" },
                                        ]} />
                                </StepCard>
                            </motion.div>
                        )}

                    </AnimatePresence>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
                <motion.button whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        // ── Validate current step before proceeding ──
                        const missing = []

                        if (step === 1) {
                            if (!form.date_of_birth) missing.push("Date of Birth")
                            if (!form.marital_status) missing.push("Marital Status")
                        }
                        if (step === 2) {
                            if (!form.country) missing.push("Country")
                            if (!form.city) missing.push("City")
                            if (!form.nationality) missing.push("Nationality")
                        }
                        if (step === 3) {
                            if (!form.religion) missing.push("Religion")
                            if (!form.religious_practice_level) missing.push("Practice Level")
                            if (!form.father_occupation) missing.push("Father's Occupation")
                            if (!form.brothers && form.brothers !== 0) missing.push("No. of Brothers")
                            if (!form.sisters && form.sisters !== 0) missing.push("No. of Sisters")
                        }
                        if (step === 4) {
                            if (!form.height_inches) missing.push("Height")
                            if (!form.body_type) missing.push("Body Type")
                        }
                        if (step === 5) {
                            if (!form.education) missing.push("Education Level")
                            if (!form.profession) missing.push("Profession")
                            if (!form.employment_type) missing.push("Employment Type")
                        }
                        if (step === 6) {
                            if (!form.bio) missing.push("About Me")
                            if (!form.relationship) missing.push("Relationship Intent")
                        }

                        if (missing.length > 0) {
                            toast.error(`Please fill in: ${missing.join(", ")}`)
                            return
                        }

                        // ── All good — proceed ──
                        if (step === TOTAL_STEPS) ctrl.submit(form, prefs)
                        else ctrl.next(step, TOTAL_STEPS, form, prefs)
                    }}
                    disabled={saving || (step === 7 && optsLoading)}
                    className="w-full py-4 rounded-2xl text-primary-foreground font-semibold text-base shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: "var(--gradient-primary)" }}>
                    {saving ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Saving your profile...</>
                    ) : step === TOTAL_STEPS ? (
                        <><Check className="w-5 h-5" />Save Preferences & Go Live</>
                    ) : (
                        <>Continue to {STEPS[step].label}<ChevronRight className="w-5 h-5" /></>
                    )}
                </motion.button>
            </div>
        </div>
    )
}