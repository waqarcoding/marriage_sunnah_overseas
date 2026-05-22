import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import AppToaster from "../../../ui/toaster"
import { Heart, User, Pencil, Shield, ChevronLeft } from "lucide-react"
import AuthApi from "../services/AuthService"
import Input from "../../../ui/input"
import Select from "../../../ui/select_option"
import { useSearchParams } from "react-router-dom";
export default function Register({ onRegister }) {
    const [step, setStep] = useState("role")
    const [role, setRole] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    const [gender, setGender] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [profilePhoto, setProfilePhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();

    const referrerId = searchParams.get("id");
    console.log("Incoming ID:", referrerId);
    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole)
        setStep("form")
    }
    const compressImage = (file, maxSizeMB = 2, maxWidthOrHeight = 1920) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = typeof event.target.result === 'string' ? event.target.result : '';

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if needed
                    if (width > height) {
                        if (width > maxWidthOrHeight) {
                            height *= maxWidthOrHeight / width;
                            width = maxWidthOrHeight;
                        }
                    } else {
                        if (height > maxWidthOrHeight) {
                            width *= maxWidthOrHeight / height;
                            height = maxWidthOrHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Start with quality 0.9 and reduce if needed
                    let quality = 0.9;
                    const tryCompress = () => {
                        canvas.toBlob(
                            (blob) => {
                                if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.5) {
                                    quality -= 0.1;
                                    tryCompress();
                                } else {
                                    const compressedFile = new File(
                                        [blob],
                                        file.name,
                                        { type: 'image/jpeg', lastModified: Date.now() }
                                    );
                                    console.log(`✅ Compressed ${file.name}:`);
                                    console.log(`   Original: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                                    console.log(`   Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                                    console.log(`   Quality: ${(quality * 100).toFixed(0)}%`);
                                    resolve(compressedFile);
                                }
                            },
                            'image/jpeg',
                            quality
                        );
                    };
                    tryCompress();
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };
    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Only JPG, PNG, or WEBP images are allowed.")
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be under 2MB.")
            return
        }
        setProfilePhoto(file)
        setPhotoPreview(URL.createObjectURL(file))
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!profilePhoto) {
            toast.error("Profile photo is required.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        const formData = new FormData()
        formData.append("name", name)
        formData.append("email", email)
        formData.append("mobile", mobile)
        formData.append("password_hash", password)
        formData.append("role", role)
        formData.append("gender", gender)
        formData.append("referrerId", referrerId)
        formData.append("image", profilePhoto)  // ← actual file object

        AuthApi.register(formData, {
            onSuccess: () => {
                localStorage.setItem("rememberedEmail", email)
                onRegister?.()

                navigate("/otp", { replace: true })
            },
            onFailed: (err) => {
                setError(err.message || "Registration failed")
                setLoading(false)
                toast.error(err.message || "Registration failed")
            },
        })
    }

    return (
        <>
            <AppToaster></AppToaster>
            <section
                className="h-screen px-4 py-10 flex flex-col items-center justify-center"
                style={{ background: "#f0f5f3" }}
            >


                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">

                    {/* ── Left panel ── */}
                    <div className="hidden lg:flex flex-col justify-between p-10"
                        style={{ background: "var(--primary, #1B4D3E)" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "rgba(245,240,232,0.15)" }}>
                                <Heart size={18} color="#f5f0e8" />
                            </div>
                            <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                                Marriage Sunna Overseas
                            </span>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs"
                                style={{ background: "rgba(245,240,232,0.1)", border: "0.5px solid rgba(245,240,232,0.2)", color: "rgba(245,240,232,0.75)" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5]" />
                                Begin your journey today
                            </div>
                            <h1 className="text-3xl font-semibold leading-snug" style={{ color: "#f5f0e8" }}>
                                Create your profile and find your match
                            </h1>
                            <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.6)" }}>
                                Join thousands of families who trust our platform to find righteous, compatible life partners.
                            </p>
                        </div>
                        <p className="text-xs" style={{ color: "rgba(245,240,232,0.3)" }}>
                            © 2025 Marriage Sunna Overseas
                        </p>
                    </div>
                    <div className="w-full max-w-5xl overflow-y-auto max-h-full">
                        <div className="flex flex-col justify-center bg-white p-8 lg:p-10 overflow-y-auto max-h-screen">
                            {step === "role" && (
                                <div className="flex items-center justify-center mb-2">
                                    <img
                                        src="/logo.png"
                                        alt="Marriage Sunna Overseas"
                                        className="h-40 w-auto"
                                        style={{ maxHeight: 155 }}
                                    />
                                </div>
                            )}


                            {/* STEP 1 — Role */}
                            {step === "role" && (
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold" style={{ color: "var(--primary, #1B4D3E)" }}>Join as</h2>
                                        <p className="text-sm text-slate-400 mt-1">Choose how you want to register</p>
                                    </div>
                                    <div className="flex flex-col gap-3 mt-2">
                                        <button
                                            onClick={() => handleRoleSelect("individual")}
                                            className="rounded-xl border border-slate-200 p-4 flex items-center gap-4 text-left hover:border-[#1B4D3E] hover:bg-[#f0f5f3] transition-all"
                                        >
                                            <div className="w-11 h-11 rounded-xl bg-[#f0f5f3] flex items-center justify-center flex-shrink-0">
                                                <User size={20} color="#1B4D3E" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium" style={{ color: "var(--primary, #1B4D3E)" }}>Individual</div>
                                                <div className="text-xs text-slate-400 mt-0.5">Looking for a life partner</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleRoleSelect("guardian")}
                                            className="rounded-xl border border-slate-200 p-4 flex items-center gap-4 text-left hover:border-[#1B4D3E] hover:bg-[#f0f5f3] transition-all"
                                        >
                                            <div className="w-11 h-11 rounded-xl bg-[#f0f5f3] flex items-center justify-center flex-shrink-0">
                                                <Shield size={20} color="#1B4D3E" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium" style={{ color: "var(--primary, #1B4D3E)" }}>Guardian (Wali)</div>
                                                <div className="text-xs text-slate-400 mt-0.5">Managing on behalf of a family member</div>
                                            </div>
                                        </button>
                                    </div>
                                    <p className="text-xs text-center text-slate-400 mt-2">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            className="font-medium"
                                            style={{ color: "var(--primary, #1B4D3E)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                                            onClick={() => {
                                                window.history.pushState({}, '', '/login');
                                                window.dispatchEvent(new PopStateEvent('popstate'));
                                            }}
                                        >
                                            Sign in
                                        </button>
                                    </p>

                                </div>
                            )}

                            {/* STEP 2 — Form */}
                            {step === "form" && (
                                <div className="flex flex-col gap-4">
                                    <button onClick={() => setStep("role")}
                                        className="flex items-center gap-1 text-xs w-fit mb-1"
                                        style={{ color: "var(--primary, #1B4D3E)", opacity: 0.7 }}>
                                        <ChevronLeft size={14} /> Change role
                                    </button>

                                    <div>
                                        <div className="flex flex-row items-center justify-between gap-4 mb-1">
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <h2 className="text-xl font-semibold" style={{ color: "var(--primary, #1B4D3E)" }}>
                                                    Register as {role === "individual" ? "Individual" : "Guardian (Wali)"}
                                                </h2>
                                                <p className="text-sm text-slate-400 mt-1">Fill in your details to create your account</p>
                                            </div>
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0" style={{ width: 56, height: 56, cursor: "pointer" }}
                                                onClick={() => document.getElementById("photoInput").click()}>
                                                <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                                                <div className="absolute rounded-full overflow-hidden flex items-center justify-center bg-[#f0f5f3]"
                                                    style={{ inset: 3 }}>
                                                    {photoPreview
                                                        ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                                        : <User size={24} color="#94a3b8" />
                                                    }
                                                </div>
                                                <button type="button"
                                                    onClick={e => { e.stopPropagation(); document.getElementById("photoInput").click() }}
                                                    className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center z-10 hover:scale-110 transition-transform"
                                                    style={{ background: "var(--primary, #1B4D3E)", border: "2px solid #fff" }}>
                                                    <Pencil size={10} color="#fff" />
                                                </button>
                                            </div>
                                            <input id="photoInput" type="file" accept="image/jpeg,image/png,image/webp"
                                                className="hidden" onChange={handlePhotoChange} />
                                        </div>

                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs border border-red-100">
                                            {error}
                                        </div>
                                    )}



                                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                        <Input label="Full Name" type="text" value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Your full name" required autoComplete="name" />

                                        <Input label="Email" type="email" value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="you@example.com" required autoComplete="email" />

                                        <Input label="Mobile" type="tel" value={mobile}
                                            onChange={e => setMobile(e.target.value)}
                                            placeholder="+447700100001" required autoComplete="tel" />

                                        <Select searchable={false} label="Gender" value={gender} onChange={setGender}
                                            placeholder="Select gender"
                                            options={[
                                                { value: "male", label: "Male" },
                                                { value: "female", label: "Female" },
                                            ]} />

                                        <Input label="Password" type="password" value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Enter your password" required autoComplete="new-password" />

                                        <Input label="Confirm Password" type="password" value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your password" required autoComplete="new-password"
                                            error={confirmPassword && password !== confirmPassword ? "Passwords don't match" : ""} />

                                        <button type="submit" disabled={loading}
                                            className="w-full h-10 rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-50 mt-1"
                                            style={{ background: "var(--primary, #1B4D3E)", color: "var(--primary-foreground, #f5f0e8)" }}>
                                            {loading ? "Registering..." : "Sign Up"}
                                        </button>
                                    </form>

                                    <p className="text-xs text-center text-slate-400">
                                        Already have an account?{" "}
                                        <a href="/login" className="font-medium" style={{ color: "var(--primary, #1B4D3E)" }}>Sign in</a>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* ── Right panel ── */}

                </div>
            </section>
        </>
    )
}