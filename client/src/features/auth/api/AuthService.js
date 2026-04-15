// src/features/auth/api/AuthApi.js
import Api from "../../../api/Api";
import ProfileService from "../../profile/api/ProfileService";

class AuthApi {
    constructor() {
        this.base = "/auth";
    }

    // ---------------- Register ----------------
    register(data, callbacks) {
        return Api.post(`${this.base}/register`, data, callbacks);
    }

    // ---------------- Login ----------------
    // In your service
    login(data, callbacks) {
        return Api.post(`${this.base}/login`, data, {
            ...callbacks,
            onSuccess: (res) => {
                const authData = res;
                const profile = authData.profile;

                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("authData", JSON.stringify(authData));
                localStorage.setItem("jwtToken", authData.token);



                if (callbacks?.onSuccess) callbacks.onSuccess(res);
            },
            onFailed: callbacks?.onFailed,
        });
    }
    async checkProfileCompleted() {
        const user = await ProfileService.getMyProfile();




        return user.profile?.is_profile_completed === 1;
    }

    async checkIsVerfied() {
        const user = await ProfileService.getMyProfile();
        return user.is_verified === 1;
    }

    // ---------------- Verify OTP ----------------
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

    // ---------------- Send OTP ----------------
    sendOtp(data, callbacks) {
        return Api.post(`${this.base}/send-otp`, data, callbacks);
    }

    // ---------------- Resend OTP ----------------

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

        return authData.user || null;
    }

    // ---------------- Check Login ----------------
    isLoggedIn() {
        return localStorage.getItem("isLoggedIn") === "true";
    }

    // ---------------- Check OTP Verified ----------------
    isOtpVerified() {
        return localStorage.getItem("isOtpVerified") === "true";
    }
    // utils/auth.js
    getTokenData() {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) return null;
            return JSON.parse(atob(token.split(".")[1]));
        } catch { return null; }
    }

    getUserRole() {
        return getTokenData()?.role ?? null;
    }

    getUserId() {
        return getTokenData()?.id ?? null;
    }

    isGuardian() {
        return getUserRole() === "guardian";
    }

    isIndividual() {
        return getUserRole() === "individual";
    }
}

export default new AuthApi();