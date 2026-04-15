import Api from "../../../api/Api";

class GuardianService {
    constructor() {
        this.base = "/guardian";
    }

    // ── Individual ────────────────────────────────────────────
    searchGuardians(query, callbacks) {
        return Api.get(`${this.base}/search?q=${encodeURIComponent(query)}`, callbacks);
    }

    assignGuardian(data, callbacks) {
        return Api.post(`${this.base}/assign`, data, callbacks);
    }

    getMyGuardian(callbacks) {
        return Api.get(`${this.base}/my-guardian`, callbacks);
    }


    removeGuardian(callbacks) {
        return Api.post(`${this.base}/remove`, {}, callbacks);
    }
    // ── Guardian ──────────────────────────────────────────────
    assignChildren(data, callbacks) {
        return Api.post(`${this.base}/assign-children`, data, callbacks);
    }

    guardianApprove(interestId, callbacks) {
        return Api.put(`${this.base}/guardian-approve/${interestId}`, {}, callbacks);
    }

    getPendingInterests(callbacks) {
        return Api.get(`${this.base}/pending-interests`, callbacks);
    }

    approveInterest(interestId, callbacks) {
        return Api.put(`${this.base}/interests/${interestId}/approve`, {}, callbacks);
    }

    rejectInterest(interestId, callbacks) {
        return Api.put(`${this.base}/interests/${interestId}/reject`, {}, callbacks);
    }
}

export default new GuardianService();