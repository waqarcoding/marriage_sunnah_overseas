import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Heart } from "lucide-react"
import AuthApi from "../api/AuthService"
import Api from "../../../api/Api"
import Input from "../../../components/ui/input"

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail")
        const savedPass = localStorage.getItem("rememberedPassword")
        if (savedEmail) setEmail(savedEmail)
        if (savedPass) setPassword(savedPass)
        Api.checkToken()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        localStorage.setItem("rememberedEmail", email)
        AuthApi.login(
            { email, password },
            {
                onSuccess: () => onLogin?.(),
                onFailed: () => setLoading(false),
            }
        )
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <section className="min-h-screen flex items-center justify-center bg-[#f0f5f3] px-4">
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">

                    {/* ── Left panel ── */}
                    <div className="hidden lg:flex flex-col justify-between p-10"
                        style={{ background: "var(--primary, #1B4D3E)" }}>

                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "rgba(245,240,232,0.15)" }}>
                                <Heart size={18} color="#f5f0e8" />
                            </div>
                            <span className="text-sm font-medium" style={{ color: "#f5f0e8" }}>
                                Marriage Sunnah Overseas
                            </span>
                        </div>

                        {/* Body */}
                        <div className="flex flex-col gap-5">
                            <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs"
                                style={{ background: "rgba(245,240,232,0.1)", border: "0.5px solid rgba(245,240,232,0.2)", color: "rgba(245,240,232,0.75)" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5]" />
                                Trusted by thousands of families
                            </div>
                            <h1 className="text-3xl font-semibold leading-snug"
                                style={{ color: "#f5f0e8" }}>
                                Find your perfect match the halal way
                            </h1>
                            <p className="text-sm leading-relaxed"
                                style={{ color: "rgba(245,240,232,0.6)" }}>
                                A safe, private platform built on Islamic values to help you find a righteous life partner.
                            </p>
                        </div>

                        <p className="text-xs" style={{ color: "rgba(245,240,232,0.3)" }}>
                            © 2025 Marriage Sunnah Overseas
                        </p>
                    </div>

                    {/* ── Right panel ── */}
                    <div className="flex flex-col justify-center gap-6 p-8 lg:p-10 bg-white">

                        <div>
                            <h2 className="text-xl font-semibold" style={{ color: "var(--primary, #1B4D3E)" }}>
                                Welcome back
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">Sign in to continue to your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="on">
                            <Input
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                            <div>
                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="text-xs mt-1.5 float-right"
                                    style={{ color: "var(--primary, #1B4D3E)", opacity: 0.7 }}
                                    onClick={() => window.location.href = '/forget-password'}
                                >
                                    Forgot password?
                                </button>

                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-50 mt-1"
                                style={{ background: "var(--primary, #1B4D3E)", color: "var(--primary-foreground, #f5f0e8)" }}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-xs text-slate-400">or continue with</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        {/* Social */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => toast.info("Google login coming soon!")}
                                className="w-full h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm text-slate-600 hover:bg-slate-50 transition"
                            >
                                <img src="https://developers.google.com/identity/images/g-logo.png" className="w-4 h-4" alt="Google" />
                                Continue with Google
                            </button>
                            <button
                                onClick={() => toast.info("Apple login coming soon!")}
                                className="w-full h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm text-slate-600 hover:bg-slate-50 transition"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16.365 1.43c0 1.104-.454 2.168-1.194 2.917-.787.796-1.962 1.223-3.102 1.223-.083-1.131.446-2.207 1.198-2.927.768-.74 1.936-1.25 3.098-1.213.07.006.14.007.201.007zM20.8 13.662c-.018-2.384 2.05-3.536 2.148-3.587-1.178-1.726-3.002-1.959-3.643-1.987-1.545-.156-3.003.907-3.774.907-.77 0-1.963-.887-3.231-.864-1.658.023-3.194.965-4.036 2.443-1.739 3.007-.444 7.465 1.242 9.906.823 1.089 1.793 2.314 3.074 2.273 1.243-.041 1.713-.804 3.213-.804 1.49 0 1.918.804 3.22.777 1.328-.03 2.17-1.105 2.99-2.194.93-1.23 1.316-2.426 1.333-2.488-.03-.01-2.538-1.015-2.556-4.048z" />
                                </svg>
                                Continue with Apple
                            </button>
                        </div>

                        <p className="text-xs text-center text-slate-400">
                            Don't have an account?{" "}
                            <a href="/register" className="font-medium" style={{ color: "var(--primary, #1B4D3E)" }}>
                                Register
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </>
    )
}