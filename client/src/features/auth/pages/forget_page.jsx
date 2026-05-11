import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import AppToaster from "../../../ui/toaster"

import { Heart, Mail, KeyRound, Lock } from "lucide-react"
import AuthApi from "../services/AuthService"
import Input from "../../../ui/input"


const STEPS = {
    EMAIL: 1,
    OTP: 2,
    PASSWORD: 3,
}

export default function ForgotPassword() {
    const [step, setStep] = useState(STEPS.EMAIL)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [timer, setTimer] = useState(600)
    const [error, setError] = useState("")
    const inputRefs = useRef([])
    const navigate = useNavigate()

    useEffect(() => {
        if (step !== STEPS.OTP || timer <= 0) return
        const interval = setInterval(() => setTimer(t => t - 1), 1000)
        return () => clearInterval(interval)
    }, [step, timer])

    useEffect(() => {
        if (resendCooldown <= 0) return
        const interval = setInterval(() => setResendCooldown(t => t - 1), 1000)
        return () => clearInterval(interval)
    }, [resendCooldown])

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

    const handleOtpChange = (e, index) => {
        const value = e.target.value
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp]
            newOtp[index] = value
            setOtp(newOtp)
            if (value && index < 5) inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0)
            inputRefs.current[index - 1]?.focus()
    }

    // Step 1 — send OTP by email (no token)
    const handleSendOtp = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        AuthApi.sendOtpByEmail({ email }, {
            onSuccess: () => {
                setLoading(false)
                setTimer(600)
                setStep(STEPS.OTP)
                toast.success("OTP sent to your email!")
            },
            onFailed: (err) => {
                setLoading(false)
                setError(err.message || "Failed to send OTP")
            }
        })
    }

    // Resend OTP
    const handleResend = () => {
        setLoading(true)
        setError("")
        setOtp(["", "", "", "", "", ""])
        AuthApi.sendOtpByEmail({ email }, {
            onSuccess: () => {
                setLoading(false)
                setTimer(600)
                setResendCooldown(30)
                toast.success("OTP resent!")
                inputRefs.current[0]?.focus()
            },
            onFailed: (err) => {
                setLoading(false)
                setError(err.message || "Failed to resend OTP")
            }
        })
    }

    // Step 2 — just validate length, no API call
    const handleVerifyOtp = (e) => {
        e.preventDefault()
        const otpValue = otp.join("")
        if (otpValue.length < 6) { setError("Please enter the full 6-digit OTP"); return }
        setError("")
        setStep(STEPS.PASSWORD)
    }

    // Step 3 — reset with email + otp + newPassword
    const handleResetPassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) { setError("Passwords don't match"); return }
        setError("")
        setLoading(true)
        AuthApi.forgotPasswordReset({ email, otp: otp.join(""), newPassword }, {
            onSuccess: () => {
                setLoading(false)
                toast.success("Password reset successfully!")
                navigate("/login")
            },
            onFailed: (err) => {
                setLoading(false)
                setError(err.message || "Failed to reset password")
            }
        })
    }

    const leftContent = {
        [STEPS.EMAIL]: {
            pill: "Step 1 of 3",
            heading: "Reset your password",
            sub: "Enter your registered email and we'll send a one-time code to verify it's you.",
        },
        [STEPS.OTP]: {
            pill: "Step 2 of 3",
            heading: "Verify your email",
            sub: "Enter the 6-digit OTP sent to your inbox. Check your spam folder if you don't see it.",
        },
        [STEPS.PASSWORD]: {
            pill: "Step 3 of 3",
            heading: "Set new password",
            sub: "OTP verified! Now choose a strong new password for your account.",
        },
    }

    return (
        <>
            <AppToaster></AppToaster>
            <section className="min-h-screen flex items-center justify-center bg-[#f0f5f3] px-4">
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">

                    {/* ── Left panel ── */}
                    <div className="hidden lg:flex flex-col justify-between p-8"
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
                            {/* Step indicators */}
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                                        style={{
                                            width: step === i ? 20 : 6,
                                            background: step === i ? "#5DCAA5" : "rgba(245,240,232,0.25)"
                                        }} />
                                ))}
                            </div>
                            <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs"
                                style={{ background: "rgba(245,240,232,0.1)", border: "0.5px solid rgba(245,240,232,0.2)", color: "rgba(245,240,232,0.75)" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5]" />
                                {leftContent[step].pill}
                            </div>
                            <h1 className="text-2xl font-semibold leading-snug" style={{ color: "#f5f0e8" }}>
                                {leftContent[step].heading}
                            </h1>
                            <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.6)" }}>
                                {leftContent[step].sub}
                            </p>
                        </div>
                        <p className="text-xs" style={{ color: "rgba(245,240,232,0.3)" }}>
                            © 2025 Marriage Sunna Overseas
                        </p>
                    </div>

                    {/* ── Right panel ── */}
                    <div className="flex flex-col justify-center bg-white p-8 gap-5">
                        <div className="flex items-center justify-center mb-2">
                            <img
                                src="/logo.png"
                                alt="Marriage Sunna Overseas Logo"
                                className="h-40 w-auto"
                                style={{ maxHeight: 155 }}
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* STEP 1 — Email */}
                        {step === STEPS.EMAIL && (
                            <>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: "#f0f5f3" }}>
                                    <Mail size={22} color="#1B4D3E" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold" style={{ color: "var(--primary, #1B4D3E)" }}>
                                        Forgot password?
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">Enter your email to receive a reset code</p>
                                </div>
                                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                                    <Input
                                        label="Email address"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                    <button type="submit" disabled={loading}
                                        className="w-full h-11 rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
                                        style={{ background: "var(--primary, #1B4D3E)", color: "var(--primary-foreground, #f5f0e8)" }}>
                                        {loading ? "Sending..." : "Send OTP"}
                                    </button>
                                </form>
                                <button onClick={() => navigate("/login")}
                                    className="text-xs text-center"
                                    style={{ color: "var(--primary, #1B4D3E)", opacity: 0.6 }}>
                                    ← Back to login
                                </button>
                            </>
                        )}

                        {/* STEP 2 — OTP */}
                        {step === STEPS.OTP && (
                            <>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: "#f0f5f3" }}>
                                    <KeyRound size={22} color="#1B4D3E" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold" style={{ color: "var(--primary, #1B4D3E)" }}>
                                        Enter OTP
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">We sent a 6-digit code to</p>
                                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-xs font-medium"
                                        style={{ background: "#f0f5f3", color: "var(--primary, #1B4D3E)" }}>
                                        <Mail size={12} />
                                        {email}
                                    </div>
                                </div>
                                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                                    <div className="flex gap-2 justify-center">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={el => (inputRefs.current[Number(index)] = el)}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpChange(e, index)}
                                                onKeyDown={e => handleOtpKeyDown(e, index)}
                                                className="w-11 h-13 text-center text-xl font-semibold rounded-xl border border-slate-200 outline-none transition-all"

                                                style={{ height: 52, color: "var(--primary, #1B4D3E)" }}
                                                onFocus={e => e.target.style.boxShadow = "0 0 0 2px rgba(27,77,62,0.15)"}
                                                onBlur={e => e.target.style.boxShadow = ""}
                                                autoComplete="off"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-center text-slate-400">
                                        {timer > 0
                                            ? <>Expires in <span className="font-medium" style={{ color: "var(--primary, #1B4D3E)" }}>{formatTime(timer)}</span></>
                                            : <span className="text-red-500">OTP expired. Please resend.</span>
                                        }
                                    </p>
                                    <button type="submit" disabled={loading || timer <= 0}
                                        className="w-full h-11 rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
                                        style={{ background: "var(--primary, #1B4D3E)", color: "var(--primary-foreground, #f5f0e8)" }}>
                                        {loading ? "Verifying..." : "Verify OTP"}
                                    </button>
                                    <button type="button" onClick={handleResend}
                                        disabled={resendCooldown > 0}
                                        className="w-full h-11 rounded-xl text-sm font-medium border border-slate-200 bg-white transition hover:bg-[#f0f5f3] disabled:opacity-50"
                                        style={{ color: "var(--primary, #1B4D3E)" }}>
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                                    </button>
                                </form>
                                <button onClick={() => setStep(STEPS.EMAIL)}
                                    className="text-xs text-center"
                                    style={{ color: "var(--primary, #1B4D3E)", opacity: 0.6 }}>
                                    ← Back
                                </button>
                            </>
                        )}

                        {/* STEP 3 — New Password */}
                        {step === STEPS.PASSWORD && (
                            <>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: "#f0f5f3" }}>
                                    <Lock size={22} color="#1B4D3E" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold" style={{ color: "var(--primary, #1B4D3E)" }}>
                                        Set new password
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">Choose a strong password for your account</p>
                                </div>
                                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                                    <Input
                                        label="New password"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <Input
                                        label="Confirm password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        error={confirmPassword && newPassword !== confirmPassword ? "Passwords don't match" : ""}
                                    />
                                    <button type="submit" disabled={loading}
                                        className="w-full h-11 rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
                                        style={{ background: "var(--primary, #1B4D3E)", color: "var(--primary-foreground, #f5f0e8)" }}>
                                        {loading ? "Resetting..." : "Reset Password"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}