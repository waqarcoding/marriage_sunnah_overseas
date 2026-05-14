// src/features/auth/api/AuthApi.js
import Api from "../../../api/Api";
import settings from "../../../context/settings";
import GuardianService from "../../guardian/services/GuardianService";
import ProfileService from "../../profile/services/ProfileService";

class AuthApi {
    constructor() {
        this.base = "/auth";
    }


    // ---------------- Register ----------------
    register(data, callbacks) {
        return Api.upload(`${this.base}/register`, data, {
            ...callbacks,

            onSuccess: (res) => {
                console.log("✅ DEBUG: register success", res)

                localStorage.setItem("isLoggedIn", "true")
                localStorage.setItem("jwtToken", res.token)
                localStorage.setItem("authData", JSON.stringify(res))

                callbacks?.onSuccess?.(res)
            },

            onFailed: (err) => {
                console.log("❌ DEBUG: register failed", err)

                // normalize error (VERY IMPORTANT)
                const message =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Registration failed"

                callbacks?.onFailed?.({ message })
            },
        })
    }
    // ---------------- Login ----------------
    login(data, callbacks) {
        return Api.post(`${this.base}/login`, data, {
            ...callbacks,

            onSuccess: (res) => {
                console.log("🔍 DEBUG: login success", res)


                localStorage.setItem("isLoggedIn", "true")
                localStorage.setItem("authData", JSON.stringify(res))
                localStorage.setItem("user", JSON.stringify(res.user))

                localStorage.setItem("jwtToken", res.token)

                callbacks?.onSuccess?.(res)
            },

            onFailed: (err) => {
                console.log("❌ DEBUG: login failed", err)

                // Normalize error message
                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Login failed"

                callbacks?.onFailed?.({ message })
            },
        })
    }

    // ---------------- Check Profile ----------------
    async checkProfile(navigate) {
        const user = await ProfileService.getCurrentUser();


        if (user.role === 'individual') {
            try {
                const user = await ProfileService.getCurrentUser();
                const isProfileCompleted = user?.profile?.is_profile_completed === 1;
                const isVerified = user?.is_verified === true || user?.is_verified === 1;
                const guardianData = await GuardianService.getMyGuardian();

                // ✅ Check for guardianUser instead of guardian
                const isGuardianFound = guardianData.data != null ? true : false;

                console.log("User Role:" + user.role);
                console.log("isProfileCompleted:" + user?.profile?.is_profile_completed);


                if (!isProfileCompleted) {
                    console.log("navigating to setup:")
                    navigate("/profilesetup", { replace: true });
                }

                /*
                else if (!isVerified) {
                    navigate("/verification", { replace: true });
                } else if (!isGuardianFound) {
                    navigate("/individual/show-pin", { replace: true });
                }
                */


                return { isProfileCompleted, isVerified };
            } catch {
                navigate("/profilesetup", { replace: true });
                return { isProfileCompleted: false, isVerified: false };
            }
        } else if (user.role === 'guardian') {
            navigate("/guardian", { replace: true });
        }
        else if (user.role === 'admin' || user.role === 'staff') {
            navigate("/admin/dashboard", { replace: true });
        }

    }

    // ---------------- Verify OTP (registration flow — requires token) ----------------
    verifyOtp(data, callbacks) {
        return Api.post(`${this.base}/verify-otp`, data, {
            ...callbacks,
            onSuccess: (res) => {
                localStorage.setItem("isOtpVerified", "true");
                if (callbacks?.onSuccess) callbacks.onSuccess(res);
            },
            onFailed: callbacks?.onFailed,
        });
    }

    // ---------------- Send OTP (registration flow — requires token) ----------------
    sendOtp(data, callbacks) {
        return Api.post(`${this.base}/send-otp`, data, callbacks);
    }

    // ---------------- Send OTP by Email (forgot password flow — no token) ----------------
    sendOtpByEmail(data, callbacks) {
        return Api.post(`${this.base}/send-otp-byemail`, data, callbacks);
    }

    // ---------------- Change Password ----------------
    changePassword(data, callbacks) {
        return Api.post(`${this.base}/change-password`, data, callbacks);
    }

    // ---------------- Forgot Password ----------------
    forgotPassword(data, callbacks) {
        return Api.post(`${this.base}/forgot-password`, data, callbacks);
    }

    // ---------------- Reset Password ----------------
    resetPassword(data, callbacks) {
        return Api.post(`${this.base}/reset-password`, data, callbacks);
    }

    // ---------------- Forgot Password Reset (email + otp + newPassword — no token) ----------------
    forgotPasswordReset(data, callbacks) {
        return Api.post(`${this.base}/forgot-password-reset`, data, callbacks);
    }

    // ---------------- Logout ----------------
    logout() {
        console.log("LogOut");

        try {
            // ✅ 1. Close any open modals/portals before clearing storage
            const modals = document.querySelectorAll('[id$="-portal"]');
            modals.forEach(modal => {
                if (modal && modal.parentNode) {
                    try {
                        modal.parentNode.removeChild(modal);
                    } catch (e) {
                        console.warn("Modal cleanup warning:", e);
                    }
                }
            });

            // ✅ 2. Clear all localStorage items
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("authData");
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("isOtpVerified");

            // ✅ 3. Force close any Framer Motion AnimatePresence components
            const animatedElements = document.querySelectorAll('[data-framer-portal-id]');
            animatedElements.forEach(el => {
                if (el && el.parentNode) {
                    try {
                        el.parentNode.removeChild(el);
                    } catch (e) {
                        console.warn("Animation cleanup warning:", e);
                    }
                }
            });

            // ✅ 4. Small delay to ensure cleanup completes before navigation
            setTimeout(() => {
                // Force full page reload to clear all React state
                window.location.href = "/login";
            }, 50);

        } catch (error) {
            console.error("Logout cleanup error:", error);
            // Fallback: force navigation even if cleanup fails
            window.location.href = "/login";
        }
    }

    // ---------------- Get Current User ----------------
    getCurrentUser() {

        return ProfileService.getCurrentUser();
    }
    getUserById(id) {
        return ProfileService.getUserById(id);
    }
    async isPro() {
        try {
            const user = await ProfileService.getCurrentUser();
            return user?.is_pro || false;
        } catch (err) {
            console.error('Error getting pro status:', err);
            return false;
        }
    }


    // ---------------- Check Login ----------------
    isLoggedIn() {
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (!loggedIn) {
            this.logout();
        }
        return loggedIn;
    }

    // ---------------- Check OTP Verified ----------------
    isOtpVerified() {
        return localStorage.getItem("isOtpVerified") === "true";
    }

    // ---------------- Token Utilities ----------------
    getTokenData() {
        // console.log("🔍 getTokenData START");

        try {
            const token = localStorage.getItem("jwtToken");
            // console.log("🔍 Raw token from localStorage:", token);

            if (!token) {
                console.log("🔍 No token found");
                return null;
            }

            const parts = token.split(".");
            // console.log("🔍 Token parts:", parts.length);

            if (parts.length !== 3) {
                // console.error("🔍 Invalid JWT format");
                return null;
            }

            // ✅ Convert base64url to base64 before decoding
            let base64Payload = parts[1];

            // Replace URL-safe characters
            base64Payload = base64Payload.replace(/-/g, '+').replace(/_/g, '/');

            // Add padding if needed
            while (base64Payload.length % 4 !== 0) {
                base64Payload += '=';
            }

            // console.log("🔍 Original payload:", parts[1]);
            // console.log("🔍 Converted payload:", base64Payload);

            const decoded = JSON.parse(atob(base64Payload));
            //  console.log("🔍 Decoded token SUCCESS:", decoded);
            //  console.log("🔍 ID from token:", decoded.id);

            return decoded;
        } catch (err) {
            // console.error("🔍 ERROR in getTokenData:", err);
            return null;
        }
    }

    getUserRole() {
        const data = this.getTokenData();
        //console.log("🔍 getUserRole data:", data);
        return data?.role ?? null;
    }

    getUserId() {
        const data = this.getTokenData();
        //console.log("🔍 getUserId data:", data);
        //console.log("🔍 getUserId returning:", data?.id);
        return data?.id ?? null;
    }

    isGuardian() {
        return this.getUserRole() === "guardian";
    }

    isIndividual() {
        return this.getUserRole() === "individual";
    }
}

export default new AuthApi();