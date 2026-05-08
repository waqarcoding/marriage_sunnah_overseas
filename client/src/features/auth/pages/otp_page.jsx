import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import AppToaster from "../../../ui/toaster"
import { Heart, Mail } from "lucide-react"
import AuthApi from "../services/AuthService"


export default function OtpPage({ onSuccess }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [timer, setTimer] = useState(600)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const inputRefs = useRef([])
    const navigate = useNavigate()

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail")
        setEmail(savedEmail)
    }, [])

    useEffect(() => {
        if (timer <= 0) return
        const interval = setInterval(() => setTimer(prev => prev - 1), 1000)
        return () => clearInterval(interval)
    }, [timer])

    useEffect(() => {
        if (resendCooldown <= 0) return
        const interval = setInterval(() => setResendCooldown(prev => prev - 1), 1000)
        return () => clearInterval(interval)
    }, [resendCooldown])

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0")
        const s = (seconds % 60).toString().padStart(2, "0")
        return `${m}:${s}`
    }

    const handleChange = (e, index) => {
        const value = e.target.value
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp]
            newOtp[index] = value
            setOtp(newOtp)
            if (value && index < 5) inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const otpValue = otp.join("")
        if (otpValue.length < 6) { setErrorMessage("Please enter a 6-digit OTP"); return }
        setLoading(true)
        setErrorMessage("")
        setSuccessMessage("")
        AuthApi.verifyOtp({ otp: otpValue }, {
            onSuccess: async () => {
                toast.success("OTP verified successfully!")
                setLoading(false)
                onSuccess?.()
                await AuthApi.checkProfile(navigate)
            },
            onFailed: (err) => {
                setLoading(false)
                setErrorMessage(err.response?.data?.error || err.message || "Verification failed")
            }
        })
    }

    const handleResend = () => {
        setResendLoading(true)
        setErrorMessage("")
        setSuccessMessage("")
        setOtp(["", "", "", "", "", ""])
        AuthApi.sendOtp({}, {
            onSuccess: () => {
                toast.success("OTP resent!")
                setTimer(600)
                setSuccessMessage("OTP resent successfully!")
                setResendLoading(false)
                setResendCooldown(30)
                inputRefs.current[0]?.focus()
            },
            onFailed: (err) => {
                setResendLoading(false)
                setErrorMessage(err.response?.data?.error || err.message || "Failed to resend OTP")
            }
        })
    }

    return (
        <>
            <AppToaster></AppToaster>
            <section className="min-h-screen flex items-center justify-center bg-[#f0f5f3] px-4 py-5">
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
                                Marriage Sunnah Overseas
                            </span>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs"
                                style={{ background: "rgba(245,240,232,0.1)", border: "0.5px solid rgba(245,240,232,0.2)", color: "rgba(245,240,232,0.75)" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5]" />
                                Secure verification
                            </div>
                            <h1 className="text-3xl font-semibold leading-snug" style={{ color: "#f5f0e8" }}>
                                One step away from your journey
                            </h1>
                            <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.6)" }}>
                                We sent a 6-digit code to your email to keep your account secure. It expires in 10 minutes.
                            </p>
                        </div>
                        <p className="text-xs" style={{ color: "rgba(245,240,232,0.3)" }}>
                            © 2025 Marriage Sunnah Overseas
                        </p>
                    </div>

                    {/* ── Right panel ── */}
                    <div className="flex flex-col justify-center bg-white p-8 lg:p-10 gap-6">
                        <div className="flex items-center justify-center mb-2">
                            <img
                                src="/logo.png"
                                alt="Marriage Sunnah Overseas Logo"
                                className="h-40 w-auto"
                                style={{ maxHeight: 155 }}
                            />
                        </div>


                        <div>
                            <h2 className="text-xl font-semibold" style={{ color: "var(--primary, #1B4D3E)" }}>
                                Verify your email
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">Enter the 6-digit code sent to</p>
                            <div className="inline-flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                                style={{ background: "#f0f5f3", color: "var(--primary, #1B4D3E)" }}>
                                <Mail size={14} />
                                {email}
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs border border-red-100">
                                {errorMessage}
                            </div>
                        )}
                        {successMessage && (
                            <div className="px-3 py-2 rounded-lg text-xs border"
                                style={{ background: "#f0f5f3", color: "var(--primary, #1B4D3E)", borderColor: "#d1e9e0" }}>
                                {successMessage}
                            </div>
                        )}

                        {/* OTP inputs */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex gap-2 justify-center">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => (inputRefs.current[index] = el)}
                                        type="text"
                                        maxLength={1}

                                        value={digit}
                                        onChange={e => handleChange(e, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        className="w-11 h-14 text-center text-xl font-semibold rounded-xl border border-slate-200 outline-none transition-all"
                                        style={{ color: "var(--primary, #1B4D3E)" }}
                                        onFocus={e => e.target.style.boxShadow = "0 0 0 2px rgba(27,77,62,0.15)"}
                                        onBlur={e => e.target.style.boxShadow = ""}
                                        autoComplete="off"
                                    />
                                ))}
                            </div>

                            {/* Timer */}
                            <p className="text-xs text-center text-slate-400">
                                {timer > 0 ? (
                                    <>Expires in <span className="font-medium" style={{ color: "var(--primary, #1B4D3E)" }}>{formatTime(timer)}</span></>
                                ) : (
                                    <span className="text-red-500">OTP expired. Please resend.</span>
                                )}
                            </p>

                            <div className="flex flex-col gap-2">
                                <button
                                    type="submit"
                                    disabled={loading || timer <= 0}
                                    className="w-full h-11 rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
                                    style={{ background: "var(--primary, #1B4D3E)", color: "var(--primary-foreground, #f5f0e8)" }}
                                >
                                    {loading ? "Verifying..." : "Verify"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendLoading || resendCooldown > 0}
                                    className="w-full h-11 rounded-xl text-sm font-medium border border-slate-200 bg-white transition hover:bg-[#f0f5f3] disabled:opacity-50"
                                    style={{ color: "var(--primary, #1B4D3E)" }}
                                >
                                    {resendLoading ? "Resending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                                </button>
                            </div>
                        </form>

                        <button
                            onClick={() => navigate("/login")}
                            className="text-xs text-center"
                            style={{ color: "var(--primary, #1B4D3E)", opacity: 0.6 }}
                        >
                            ← Back to login
                        </button>
                    </div>
                </div>
            </section>
        </>
    )
}