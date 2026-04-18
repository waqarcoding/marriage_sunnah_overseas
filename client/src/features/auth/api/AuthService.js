// src/features/auth/api/AuthApi.js
import Api from "../../../api/Api";
import ProfileService from "../../profile/api/ProfileService";

class AuthApi {
    constructor() {
        this.base = "/auth";
    }


    // ---------------- Register ----------------
    register(data, callbacks) {
        return Api.upload(`${this.base}/register`, data, {
            ...callbacks,
            onSuccess: (res) => {
                localStorage.setItem("isLoggedIn", "true")
                localStorage.setItem("jwtToken", res.token)
                localStorage.setItem("authData", JSON.stringify(res))
                if (callbacks?.onSuccess) callbacks.onSuccess(res)
            },
            onFailed: callbacks?.onFailed,
        })
    }
    // ---------------- Login ----------------
    login(data, callbacks) {
        return Api.post(`${this.base}/login`, data, {
            ...callbacks,
            onSuccess: (res) => {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("authData", JSON.stringify(res));
                localStorage.setItem("jwtToken", res.token);
                if (callbacks?.onSuccess) callbacks.onSuccess(res);
            },
            onFailed: callbacks?.onFailed,
        });
    }

    // ---------------- Check Profile ----------------
    async checkProfile(navigate) {
        const user = await ProfileService.getMyProfile();
        console.log("User Role:" + user.role);

        if (user.role === 'guardian') {
            navigate("/guardian", { replace: true });
        } else if (user.role === 'individual') {
            try {
                const user = await ProfileService.getMyProfile();
                const isProfileCompleted = user?.profile?.is_profile_completed === 1;
                const isVerified = user?.is_verified === true || user?.is_verified === 1;

                if (!isProfileCompleted) {
                    navigate("/profilesetup", { replace: true });
                } else if (!isVerified) {
                    navigate("/verification", { replace: true });
                } else {
                    navigate("/explore", { replace: true });
                }

                return { isProfileCompleted, isVerified };
            } catch {
                navigate("/profilesetup", { replace: true });
                return { isProfileCompleted: false, isVerified: false };
            }
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
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("authData");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("isOtpVerified");
    }

    // ---------------- Get Current User ----------------
    getCurrentUser() {
        const authData = JSON.parse(localStorage.getItem("authData"));
        return authData?.user || null;
    }

    // ---------------- Check Login ----------------
    isLoggedIn() {
        return localStorage.getItem("isLoggedIn") === "true";
    }

    // ---------------- Check OTP Verified ----------------
    isOtpVerified() {
        return localStorage.getItem("isOtpVerified") === "true";
    }

    // ---------------- Token Utilities ----------------
    getTokenData() {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) return null;
            return JSON.parse(atob(token.split(".")[1]));
        } catch { return null; }
    }

    getUserRole() { return this.getTokenData()?.role ?? null; }
    getUserId() { return this.getTokenData()?.id ?? null; }
    isGuardian() { return this.getUserRole() === "guardian"; }
    isIndividual() { return this.getUserRole() === "individual"; }
}

export default new AuthApi();