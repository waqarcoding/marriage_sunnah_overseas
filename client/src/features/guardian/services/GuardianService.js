// @ts-nocheck
// features/guardian/api/GuardianService.js

import Api from "../../../api/Api";

class GuardianService {
    base = "/guardian";

    // ── Individual (Ward) methods ─────────────────────────────────────────────

    // Generate PIN for guardian linking
    generatePin(callbacks) {
        return Api.handleRequest(
            Api.post(`${this.base}/generate-pin`),
            callbacks
        );
    }

    // Get my current PIN
    getMyPin(callbacks) {
        return Api.handleRequest(
            Api.get(`${this.base}/my-pin`),
            callbacks
        );
    }

    // Search users to add as guardian
    searchGuardians(query, callbacks) {
        return Api.handleRequest(
            Api.get(`${this.base}/search?q=${encodeURIComponent(query)}`),
            callbacks
        );
    }

    // Get my current guardian(s)
    getMyGuardian(callbacks) {
        return Api.handleRequest(
            Api.get(`${this.base}/my-guardian`),
            callbacks
        );
    }

    // Remove my guardian
    async removeGuardian(callbacks) {
        try {
            const res = await Api.delete(`${this.base}/remove`);
            if (res.success && callbacks?.onSuccess) {
                callbacks.onSuccess(res);
            } else if (!res.success && callbacks?.onFailed) {
                callbacks.onFailed(res);
            }
        } catch (error) {
            if (callbacks?.onFailed) callbacks.onFailed(error);
        }
    }

    // ── Guardian methods ──────────────────────────────────────────────────────

    // Verify PIN and preview ward details (before linking)
    verifyPin(data, callbacks) {
        return Api.handleRequest(
            Api.post(`${this.base}/verify-pin`, data),
            callbacks
        );
    }

    // Link guardian to ward using PIN
    linkWithPin(data, callbacks) {
        return Api.handleRequest(
            Api.post(`${this.base}/link-with-pin`, data),
            callbacks
        );
    }

    // Search users to add as ward
    searchWards(query, callbacks) {
        return Api.handleRequest(
            Api.get(`${this.base}/guardian-search-wards?q=${encodeURIComponent(query)}`),
            callbacks
        );
    }

    // Get all my wards (individuals I am guardian for)
    getMyWards(callbacks) {
        return Api.handleRequest(
            Api.get(`${this.base}/guardian-my-wards`),
            callbacks
        );
    }

    // Add a ward (individual I will manage)
    addWard(data, callbacks) {
        return Api.handleRequest(
            Api.post(`${this.base}/guardian-add-ward`, data),
            callbacks
        );
    }

    // Remove a ward
    removeWard(data, callbacks) {
        return Api.handleRequest(
            Api.post(`${this.base}/guardian-remove-ward`, data),
            callbacks
        );
    }

    // ── Interest approval methods ─────────────────────────────────────────────

    // Get all pending interests for my wards
    getPendingInterests(callbacks) {
        return Api.handleRequest(
            Api.get(`${this.base}/guardian-pending-interests`),
            callbacks
        );
    }

    // Approve an interest on behalf of ward
    approveInterest(interestId, callbacks) {
        return Api.handleRequest(
            Api.post(`${this.base}/guardian-approve-interest`, { interestId }),
            callbacks
        );
    }

    // Reject an interest on behalf of ward
    rejectInterest(interestId, callbacks) {
        return Api.handleRequest(
            Api.post(`${this.base}/guardian-reject-interest`, { interestId }),
            callbacks
        );
    }

    // Get guardian pending count
    getGuardianPendingCount(callbacks) {
        return Api.handleRequest(
            Api.get(`${this.base}/guardian-pending-count`),
            callbacks
        );
    }
}

export default new GuardianService();