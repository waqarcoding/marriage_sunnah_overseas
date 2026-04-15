import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthApi from "../api/AuthService";
import Api from "../../../api/Api";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        const savedPass = localStorage.getItem("rememberedPassword");
        if (savedEmail) setEmail(savedEmail);
        if (savedPass) setPassword(savedPass);
        Api.checkToken();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        AuthApi.login(
            { email, password },
            {
                onSuccess: (res) => {
                    onLogin?.();
                },
                onFailed: () => {
                    setLoading(false);
                },
            }
        );
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/hero-banner.png"
                        alt="Marriage Sunna Overseas"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-800/50" />
                </div>

                {/* Decor Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

                <div className="relative z-20 w-full flex flex-col lg:flex-row items-center justify-center px-2 sm:px-4 md:px-12">
                    {/* Title section - ensure it stacks above login card on mobile */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center py-8 px-2 order-1 lg:order-none min-h-[120px] md:min-h-[180px] bg-transparent">
                        <h1
                            className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-6xl leading-snug text-center font-rounded drop-shadow font-bold"
                            style={{
                                fontFamily:
                                    "var(--font-heading, 'Quicksand', 'Rounded Mplus 1c', 'sans-serif')",
                                color: "var(--primary-foreground, #fff)",
                                textShadow:
                                    "0 4px 40px rgba(0,0,0,0.53), 0 2px 20px rgba(78,72,219,0.10)",
                            }}
                        >
                            Marriage Sunnah Overseas
                        </h1>
                    </div>
                    {/* Login Card */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center py-6 px-0 sm:px-4 order-2">
                        <div
                            className="shadow-lg rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-md"
                            style={{
                                background: "rgba(255,255,255,0.93)",
                                backdropFilter: "blur(2px)",
                                boxShadow: "0 4px 36px rgba(93,89,255,0.09)",
                                fontFamily: "var(--font-family, 'Inter', 'Helvetica', sans-serif)",
                                color: "var(--text-main, #222)",
                            }}
                        >
                            <h2
                                className="text-xl sm:text-2xl font-bold mb-6 text-center"
                                style={{
                                    fontFamily:
                                        "var(--font-heading, 'Quicksand', 'Rounded Mplus 1c', sans-serif)",
                                    color: "var(--primary, #4f46e5)",
                                }}
                            >
                                Login
                            </h2>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                                autoComplete="on"
                            >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block mb-1 font-medium"
                                        style={{
                                            color: "var(--label-color, #1e293b)",
                                            fontFamily:
                                                "var(--font-family, 'Inter', Arial, sans-serif)",
                                        }}
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/80"
                                        style={{
                                            borderColor: "var(--input-border, #cbd5e1)",
                                            background: "var(--input-bg, #fff)",
                                            color: "var(--input-text, #222)",
                                            fontFamily:
                                                "var(--font-family, 'Inter', Arial, sans-serif)",
                                            fontSize: "1rem",
                                        }}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block mb-1 font-medium"
                                        style={{
                                            color: "var(--label-color, #1e293b)",
                                            fontFamily:
                                                "var(--font-family, 'Inter', Arial, sans-serif)",
                                        }}
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/80"
                                        style={{
                                            borderColor: "var(--input-border, #cbd5e1)",
                                            background: "var(--input-bg, #fff)",
                                            color: "var(--input-text, #222)",
                                            fontFamily:
                                                "var(--font-family, 'Inter', Arial, sans-serif)",
                                            fontSize: "1rem",
                                        }}
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 px-4 rounded hover:opacity-90 transition disabled:opacity-50 shadow text-base sm:text-lg"
                                    style={{
                                        background:
                                            "var(--gradient-primary, linear-gradient(90deg, #4f46e5, #06b6d4))",
                                        color: "var(--btn-text, #fff)",
                                        fontFamily:
                                            "var(--font-family, 'Inter', Arial, sans-serif)",
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        boxShadow: "0 4px 14px 0 rgba(79,70,229,0.14)",
                                    }}
                                >
                                    {loading ? "Logging in..." : "Sign In"}
                                </button>
                            </form>

                            <div className="flex items-center my-4">
                                <hr
                                    className="flex-1 border-gray-300"
                                    style={{ borderColor: "var(--divider, #e5e7eb)" }}
                                />
                                <span
                                    className="mx-2 text-gray-500 text-sm"
                                    style={{
                                        color: "var(--text-muted, #64748b)",
                                        fontFamily:
                                            "var(--font-family, 'Inter', Arial, sans-serif)",
                                    }}
                                >
                                    OR
                                </span>
                                <hr
                                    className="flex-1 border-gray-300"
                                    style={{ borderColor: "var(--divider, #e5e7eb)" }}
                                />
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => toast.info("Google login coming soon!")}
                                    className="w-full flex items-center justify-center gap-2 border rounded py-2 hover:bg-gray-100 transition text-sm sm:text-base"
                                    style={{
                                        borderColor: "var(--input-border, #cbd5e1)",
                                        background: "var(--btn-alt-bg, #fff)",
                                        color: "var(--btn-alt-text, #374151)",
                                        fontFamily:
                                            "var(--font-family, 'Inter', Arial, sans-serif)",
                                        fontSize: "1rem",
                                    }}
                                >
                                    <img
                                        src="https://developers.google.com/identity/images/g-logo.png"
                                        alt="Google"
                                        className="w-5 h-5"
                                    />
                                    <span>Continue with Google</span>
                                </button>

                                <button
                                    onClick={() => toast.info("Apple login coming soon!")}
                                    className="w-full flex items-center justify-center gap-2 border rounded py-2 hover:bg-gray-100 transition text-sm sm:text-base"
                                    style={{
                                        borderColor: "var(--input-border, #cbd5e1)",
                                        background: "var(--btn-alt-bg, #fff)",
                                        color: "var(--btn-alt-text, #374151)",
                                        fontFamily:
                                            "var(--font-family, 'Inter', Arial, sans-serif)",
                                        fontSize: "1rem",
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M16.365 1.43c0 1.104-.454 2.168-1.194 2.917-.787.796-1.962 1.223-3.102 1.223-.083-1.131.446-2.207 1.198-2.927.768-.74 1.936-1.25 3.098-1.213.07.006.14.007.201.007zM20.8 13.662c-.018-2.384 2.05-3.536 2.148-3.587-1.178-1.726-3.002-1.959-3.643-1.987-1.545-.156-3.003.907-3.774.907-.77 0-1.963-.887-3.231-.864-1.658.023-3.194.965-4.036 2.443-1.739 3.007-.444 7.465 1.242 9.906.823 1.089 1.793 2.314 3.074 2.273 1.243-.041 1.713-.804 3.213-.804 1.49 0 1.918.804 3.22.777 1.328-.03 2.17-1.105 2.99-2.194.93-1.23 1.316-2.426 1.333-2.488-.03-.01-2.538-1.015-2.556-4.048z" />
                                    </svg>
                                    <span>Continue with Apple</span>
                                </button>
                            </div>

                            <div className="mt-4 text-center">
                                <p
                                    className="text-xs sm:text-sm"
                                    style={{
                                        color: "var(--text-muted, #64748b)",
                                        fontFamily:
                                            "var(--font-family, 'Inter', Arial, sans-serif)",
                                    }}
                                >
                                    Don't have an account?{" "}
                                    <a
                                        href="/register"
                                        className="hover:underline"
                                        style={{
                                            color: "var(--primary, #4f46e5)",
                                            fontWeight: 500,
                                            fontFamily:
                                                "var(--font-family, 'Inter', Arial, sans-serif)",
                                        }}
                                    >
                                        Register
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}