import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import AppToaster from "../../../ui/toaster"
import { Heart } from "lucide-react"
import AuthApi from "../services/AuthService"
import Api from "../../../api/Api"
import Input from "../../../ui/input"

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail")
        const savedPass = localStorage.getItem("rememberedPassword")

        if (savedEmail) setEmail(savedEmail)
        if (savedPass) setPassword(savedPass)



    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()   // ✅ add this (important)

        if (loading) return   // ✅ prevent double submit

        setError("")
        setLoading(true)

        await AuthApi.logout()

        localStorage.setItem("rememberedEmail", email)

        AuthApi.login(
            { email, password },
            {
                onSuccess: () => {
                    setLoading(false)


                    onLogin?.()
                },
                onFailed: (err) => {
                    setLoading(false)
                    const message = err?.message || "Invalid email or password"
                    setError(message)
                    toast.error(message)
                },
            }
        )
    }

    return (
        <>



            <section
                className="min-h-screen px-4 py-5"
                style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >

                <AppToaster></AppToaster>
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">

                    {/* ── Left panel ── */}
                    <div
                        className="hidden lg:flex flex-col justify-between p-10"
                        style={{ background: "var(--primary, #1B4D3E)" }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "rgba(245,240,232,0.15)" }}
                            >
                                <Heart size={18} color="#f5f0e8" />
                            </div>
                            <span className="text-sm font-medium text-[#f5f0e8]">
                                Marriage Sunnah Overseas
                            </span>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div
                                className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs"
                                style={{
                                    background: "rgba(245,240,232,0.1)",
                                    border: "0.5px solid rgba(245,240,232,0.2)",
                                    color: "rgba(245,240,232,0.75)",
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5]" />
                                Trusted by thousands of families
                            </div>

                            <h1 className="text-3xl font-semibold text-[#f5f0e8]">
                                Find your perfect match the halal way
                            </h1>

                            <p className="text-sm text-[rgba(245,240,232,0.6)]">
                                A safe, private platform built on Islamic values to help you
                                find a righteous life partner.
                            </p>
                        </div>

                        <p className="text-xs text-[rgba(245,240,232,0.3)]">
                            © 2025 Marriage Sunnah Overseas
                        </p>
                    </div>

                    {/* ── Right panel ── */}
                    <div className="flex flex-col justify-center gap-6 p-8 lg:p-10 bg-white">

                        {/* Logo */}
                        <div className="flex items-center justify-center mb-2">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="h-40 w-auto"
                                style={{ maxHeight: 155 }}
                            />
                        </div>

                        {/* Heading */}
                        <div>
                            <h2
                                className="text-xl font-semibold"
                                style={{ color: "var(--primary, #1B4D3E)" }}
                            >
                                Welcome back
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Sign in to continue to your account
                            </p>
                        </div>

                        {/* ❌ Error UI */}
                        {error && (
                            <div
                                className="px-3 py-2 rounded-lg text-xs border"
                                style={{
                                    background: "#ffe4e6",
                                    color: "#7f1d1d",
                                    borderColor: "#fecdd3",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                            autoComplete="on"
                        >
                            <Input
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setError("")
                                }}
                                placeholder="you@example.com"
                                required
                            />

                            <div>
                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        setError("")
                                    }}
                                    placeholder="Enter your password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="text-xs mt-1.5 float-right"
                                    style={{
                                        color: "var(--primary, #1B4D3E)",
                                        opacity: 0.7,
                                    }}
                                    onClick={() => navigate("/forget-password")}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
                                style={{
                                    background: "var(--primary, #1B4D3E)",
                                    color: "#fef3c7",
                                }}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-xs text-slate-400">
                                or continue with
                            </span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        {/* Social */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() =>
                                    toast.success("Google login coming soon!")
                                }
                                className="w-full h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm text-slate-600 hover:bg-slate-50"
                            >
                                <img
                                    src="https://developers.google.com/identity/images/g-logo.png"
                                    className="w-4 h-4"
                                />
                                Continue with Google
                            </button>

                            <button
                                onClick={() =>
                                    toast.success("Apple login coming soon!")
                                }
                                className="w-full h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm text-slate-600 hover:bg-slate-50"
                            >
                                Continue with Apple
                            </button>
                        </div>

                        <p className="text-xs text-center text-slate-400">
                            Don't have an account?{" "}
                            <a
                                href="/register"
                                onClick={e => {
                                    e.preventDefault();
                                    window.history.pushState({}, '', '/register');
                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                }}
                                className="font-medium"
                                style={{ color: "#1B4D3E" }}
                            >

                                Register
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </>
    )
}