import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import AuthApi from "../api/AuthService";

// Uses same hero background section as landing_page.jsx lines 25-78
export default function OtpPage({ onSuccess }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(600); // 10 minutes
    const [resendLoading, setResendLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(""); // <-- For API errors
    const [successMessage, setSuccessMessage] = useState(""); //  
    const [resendCooldown, setResendCooldown] = useState(0); // <-- Fix: Set cooldown for resend button
    const inputRefs = useRef([]);

    const navigate = useNavigate();
    const email = localStorage.getItem("rememberedEmail");

    // Countdown timer
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Countdown for resend cooldown
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < 5) inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length < 6) {
            setErrorMessage("Please enter a 6-digit OTP");
            return;
        }

        setLoading(true);
        setSuccessMessage(""); // clear success on resend
        setErrorMessage(""); // clear previous error
        AuthApi.verifyOtp({ otp: otpValue }, {
            onSuccess: (data) => {
                toast.success("OTP verified successfully!");
                const profile = data?.profile;

                if (!AuthApi.checkProfileCompleted()) {
                    navigate("/profilesetup");

                    return;
                }
                else if (!AuthApi.checkIsVerfied()) {
                    navigate("/verification");
                    return;
                }
                else {
                    navigate("/", { replace: true });
                }

                onSuccess?.();
            },
            onFailed: (err) => {
                setLoading(false);
                setErrorMessage(err.response?.data?.error || err.message || "Verification failed");
            }
        });
    };

    const handleResend = async () => {
        setResendLoading(true);
        setSuccessMessage(""); // clear success on resend
        setErrorMessage(""); // clear errors on resend
        setOtp(["", "", "", "", "", ""]);
        AuthApi.sendOtp({}, {
            onSuccess: (data) => {
                toast.success("OTP resent successfully!");
                setTimer(600);
                setSuccessMessage("OTP resent successfully!");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
                setResendLoading(false);
                setResendCooldown(30); // Start cooldown (e.g., 30 seconds)
            },
            onFailed: (err) => {
                setResendLoading(false);
                setErrorMessage(err.response?.data?.error || err.message || "Failed to resend OTP");
            }
        });
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* BG Hero image */}
            <div className="absolute inset-0">
                <img
                    src="/hero-banner.png"
                    alt="Marriage Sunna Overseas"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-800/50" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
                {/* Back arrow */}
                <div
                    className="absolute top-4 left-4 cursor-pointer"
                    onClick={() => navigate("/login")}
                >
                    <FaArrowLeft className="text-white text-2xl hover:text-white/70 transition" />
                </div>

                <form
                    onSubmit={handleSubmit}
                    // Expanded card width and padding for room for OTPs!
                    className="bg-white/90 shadow-2xl rounded-2xl flex flex-col items-center space-y-8 w-full max-w-2xl px-6 py-14 sm:px-12 md:px-20"
                    style={{
                        fontFamily: "var(--font-family, 'Inter', Arial, sans-serif)",
                        color: "var(--text-main, #222)",
                        backdropFilter: "blur(8px)"
                    }}
                >
                    <h1 className="text-xl    font-bold text-center"
                        style={{
                            color: "black", // teal-700 for good contrast
                            fontFamily: "var(--font-heading, 'Quicksand', 'Rounded Mplus 1c', sans-serif)",
                            textShadow: "0 1px 10px rgba(0,85,130,0.11)"
                        }}

                    >
                        OTP Sent To
                        <div
                            className="text-3xl md:text-4xl font-bold text-center"
                            style={{
                                fontFamily: "var(--font-heading, 'Quicksand', 'Rounded Mplus 1c', sans-serif)",
                                color: "var(--primary, #4f46e5)"
                            }}
                        >
                            {email}
                        </div>
                    </h1>
                    {/* Error message */}
                    {successMessage && (
                        <div
                            className="text-lg md:text-xl text-center"
                            style={{
                                color: "var(--primary, #4f46e5)",
                                fontFamily: "var(--font-family, 'Inter', Arial, sans-serif)"
                            }}
                        >
                            {successMessage}
                        </div>
                    )}
                    {/* Error message */}
                    {errorMessage && (
                        <div
                            className="text-lg md:text-xl text-center"
                            style={{
                                color: "var(--danger, #f87171)",
                                fontFamily: "var(--font-family, 'Inter', Arial, sans-serif)"
                            }}
                        >
                            {errorMessage}
                        </div>
                    )}

                    {/* OTP Inputs - INSIDE CARD, more responsive layout */}
                    <div className="flex flex-row justify-center items-center gap-3 sm:gap-5 md:gap-6 w-full my-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-center text-3xl md:text-4xl font-bold rounded-xl backdrop-blur transition-all duration-200"
                                style={{
                                    background: "var(--card-bg, rgba(255,255,255,0.20))",
                                    color: "var(--primary, #4f46e5)",
                                    border: "2px solid var(--input-border, rgba(160,160,180,0.16))",
                                    fontFamily: "var(--font-family, 'Inter', Arial, sans-serif)",
                                }}
                                autoComplete="off"
                            />
                        ))}
                    </div>

                    {/* Timer */}
                    <div
                        className="text-base md:text-lg"
                        style={{
                            color: "var(--text-muted, #64748b)",
                            fontFamily: "var(--font-family, 'Inter', Arial, sans-serif)"
                        }}
                    >
                        {timer > 0
                            ? (
                                <>
                                    Expires in{" "}
                                    <span style={{
                                        color: "var(--primary, #4f46e5)",
                                        fontWeight: "bold"
                                    }}>
                                        {formatTime(timer)}
                                    </span>
                                </>
                            )
                            : <span style={{ color: "var(--danger, #f87171)" }}>OTP expired. Please resend.</span>
                        }
                    </div>

                    {/* Buttons in same row */}
                    <div className="flex flex-col sm:flex-row justify-between w-full mt-2 space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                            type="submit"
                            disabled={loading || timer <= 0}
                            className="flex-1 px-8 py-3 rounded-full text-lg font-bold hover:opacity-90 transition disabled:opacity-50 mb-0"
                            style={{
                                background: "var(--primary, #4f46e5)",
                                color: "var(--btn-foreground, #fff)",
                                fontFamily: "var(--font-family, 'Inter', Arial, sans-serif)"
                            }}
                        >
                            {loading ? "Verifying..." : "Verify"}
                        </button>
                        <div className="h-3"></div>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading || resendCooldown > 0}
                            className="flex-1 px-8 py-3 rounded-full border text-lg font-bold hover:bg-gray-100 transition disabled:opacity-50"
                            style={{
                                color: "var(--primary, #4f46e5)",
                                background: "var(--btn-alt-bg, #fff)",
                                fontFamily: "var(--font-family, 'Inter', Arial, sans-serif)"
                            }}
                        >
                            {resendLoading
                                ? "Resending..."
                                : resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : "Resend OTP"
                            }
                        </button>
                    </div>
                </form>
            </div>

            {/* Decorative Gradient Footer */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
    );
}