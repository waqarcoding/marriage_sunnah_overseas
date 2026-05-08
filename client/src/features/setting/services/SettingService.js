import Api from "../../../api/Api";

class SettingService {
    constructor() {
        this.base = "/profile";
        this.referralBase = "/referrals";
    }

    passwordChange(data, callbacks) {
        return Api.put(`${this.base}/change-password`, data, callbacks);
    }

    updateSettings(data, callbacks) {
        return Api.patch(`${this.base}/settings`, data, callbacks);
    }

    /* ─── Referral Methods ─────────────────────────────────────── */

    /**
     * Get all users referred by current user with avatars (for UI)
     */
    getMyReferrals(userId, callbacks) {
        console.log('📞 Calling API: /api/referrals/referrer/' + userId + '/details');

        // Convert success/error to onSuccess/onFailed
        const apiCallbacks = {};
        if (callbacks?.success) {
            apiCallbacks.onSuccess = callbacks.success;
        }
        if (callbacks?.error) {
            apiCallbacks.onFailed = callbacks.error;
        }

        return Api.get(`${this.referralBase}/referrer/${userId}/details`, apiCallbacks);
    }

    /**
     * Get who referred the current user with avatar (for UI)
     */
    getMyReferrer(userId, callbacks) {
        console.log('📞 Calling API: /api/referrals/user/' + userId + '/referrer/details');

        // Convert success/error to onSuccess/onFailed
        const apiCallbacks = {};
        if (callbacks?.success) {
            apiCallbacks.onSuccess = callbacks.success;
        }
        if (callbacks?.error) {
            apiCallbacks.onFailed = callbacks.error;
        }

        return Api.get(`${this.referralBase}/user/${userId}/referrer/details`, apiCallbacks);
    }

    /**
     * Get referral statistics (basic - no avatars)
     */
    getReferralStats(userId, callbacks) {
        const apiCallbacks = {};
        if (callbacks?.success) {
            apiCallbacks.onSuccess = callbacks.success;
        }
        if (callbacks?.error) {
            apiCallbacks.onFailed = callbacks.error;
        }
        return Api.get(`${this.referralBase}/referrer/${userId}`, apiCallbacks);
    }

    /**
     * Check if referral exists between two users
     */
    checkReferralExists(data, callbacks) {
        const apiCallbacks = {};
        if (callbacks?.success) {
            apiCallbacks.onSuccess = callbacks.success;
        }
        if (callbacks?.error) {
            apiCallbacks.onFailed = callbacks.error;
        }
        return Api.post(`${this.referralBase}/check`, data, apiCallbacks);
    }
}

export default new SettingService();