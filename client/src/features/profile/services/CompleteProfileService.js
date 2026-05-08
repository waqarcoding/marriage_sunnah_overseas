// features/profile/controllers/CompleteProfileController.js

import ProfileService from "./ProfileService"
import { toast } from "react-toastify"

const calcAge = (dob) => {
    if (!dob) return null
    const b = new Date(dob), t = new Date()
    let age = t.getFullYear() - b.getFullYear()
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--
    return age > 0 ? age : null
}

export const defaultForm = {
    profile_for: "self",
    photos: [],
    is_blurred_images: false,  // ← add this
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

    guardian_phone: "",
    guardian_email: "",
    guardian_relationship: "",
    latitude: null,
    longitude: null,
}

export const defaultPrefs = {
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
}

export class CompleteProfileController {
    // @ts-ignore
    constructor({ setForm, setPrefs, setSaving, setDone, setStep, navigate } = {}) {
        this.setForm = setForm
        this.setPrefs = setPrefs
        this.setSaving = setSaving
        this.setDone = setDone
        this.setStep = setStep
        this.navigate = navigate
    }

    calcAge = calcAge

    // ── Load existing profile and prefill form ──────────────────────────────────
    async loadProfile() {
        try {
            const res = await ProfileService.getCurrentUser()
            const p = res?.data || res?.profile || res
            if (!p) return

            this.setForm(prev => ({
                ...prev,
                profile_for: p.profile_for || "self",
                name: p.name || "",
                gender: p.gender || "",
                date_of_birth: p.date_of_birth ? p.date_of_birth.split("T")[0] : "",
                marital_status: p.marital_status || "",
                phone: p.phone || p.mobile || "",
                country: p.country || "",
                city: p.city || "",
                nationality: p.nationality || "",
                religion: p.religion || "",
                sect: p.sect || "",
                religious_practice_level: p.religious_practice_level || "",
                caste: p.caste || "",
                mother_tongue: p.mother_tongue || "",
                height_inches: p.height_inches ? String(p.height_inches) : "",
                body_type: p.body_type || "",
                education: p.education || "",
                profession: p.profession || "",
                employment_type: p.employment_type || "",
                monthly_salary: p.monthly_salary || "",
                bio: p.bio || "",
                family_background: p.family_background || "",
                interests: p.interests || "",
                has_children: p.has_children === 1 ? "Has Children" : "No Children",
                willing_to_relocate: p.willing_to_relocate === 1 ? "Yes" : p.willing_to_relocate === 0 ? "No" : "",
                relationship: p.relationship || "",
                contact_hidden: String(p.contact_hidden ?? "0"),
                is_guardian_required: String(p.is_guardian_required ?? "1"),


                latitude: p.latitude || null,
                // inside loadProfile(), add to setForm:
                photos: ProfileService.parseImages(p),
                photos_blurred: p.photos_blurred === 1 || p.photos_blurred === true || false,
                longitude: p.longitude || null,
            }))

            const pref = p.preferences || p.prefs
            if (pref) {
                this.setPrefs(prev => ({
                    ...prev,
                    pref_gender: pref.pref_gender || "",
                    pref_age_min: pref.pref_age_min ? String(pref.pref_age_min) : "",
                    pref_age_max: pref.pref_age_max ? String(pref.pref_age_max) : "",
                    pref_marital_status: pref.pref_marital_status || [],
                    pref_nationality: pref.pref_nationality || [],
                    pref_country: pref.pref_country || [],
                    pref_city: pref.pref_city || "",
                    pref_religion: pref.pref_religion || "",
                    pref_sect: pref.pref_sect || [],
                    pref_religious_practice_level: pref.pref_religious_practice_level || "",
                    pref_height_min_inches: pref.pref_height_min_inches ? String(pref.pref_height_min_inches) : "",
                    pref_height_max_inches: pref.pref_height_max_inches ? String(pref.pref_height_max_inches) : "",
                    pref_body_type: pref.pref_body_type || [],
                    pref_caste: pref.pref_caste || [],
                    pref_mother_tongue: pref.pref_mother_tongue || [],
                    pref_education: pref.pref_education || "",
                    pref_employment_type: pref.pref_employment_type || [],
                    pref_monthly_salary: pref.pref_monthly_salary || "",
                    pref_has_children: pref.pref_has_children || "",
                    pref_willing_to_relocate: pref.pref_willing_to_relocate || "",
                }))
            }
        } catch {
            toast.error("Failed to load profile")
        }
    }

    // ── Validate current step ───────────────────────────────────────────────────
    stepValid(step, form) {
        if (step === 1) return form.name && form.gender && form.date_of_birth && form.marital_status
        if (step === 2) return form.country && form.city && form.nationality
        if (step === 3) return form.religion && form.religious_practice_level
        if (step === 7) return form.is_guardian_required === "0" || (form.guardian_name && form.guardian_phone)
        return true
    }

    // ── Next step or submit ─────────────────────────────────────────────────────
    async next(step, totalSteps, form, prefs) {
        if (!this.stepValid(step, form)) {
            toast.error("Please fill required fields")
            return
        }
        if (step < totalSteps) {
            this.setStep(s => s + 1)
        } else {
            await this.submit(form, prefs)
        }
    }

    // ── Submit profile ──────────────────────────────────────────────────────────
    async submit(form, prefs) {
        console.log("submiting...");
        this.setSaving(true)
        try {
            await ProfileService.updateProfile({
                name: form.name,
                gender: form.gender,
                date_of_birth: form.date_of_birth,
                age: calcAge(form.date_of_birth),
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


                latitude: form.latitude,
                longitude: form.longitude,
                is_profile_completed: 1,
                photos_blurred: form.photos_blurred ? 1 : 0,
            })

            const hasPrefs = prefs.pref_gender || prefs.pref_religion || prefs.pref_age_min || prefs.pref_age_max
            if (hasPrefs) await ProfileService.updatePrefs(prefs)

            this.setDone(true)
        } catch {
            toast.error("Failed to save profile. Please try again.")
        } finally {
            this.setSaving(false)
        }
    }

    // ── Geolocation ─────────────────────────────────────────────────────────────
    requestLocation(setForm, onError) {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.")
            return
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setForm(prev => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }))
                onError("")
            },
            (err) => {
                const msg = err.code === 1
                    ? "Location permission denied. Please allow access and try again."
                    : "Unable to get location: " + err.message
                onError(msg)
                toast.error(msg)
            }
        )
    }
}