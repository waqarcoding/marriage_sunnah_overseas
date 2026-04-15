import Api from "../../../api/Api";

class ExploreService {
    constructor() {
        this.base = "/explore";
    }

    // ---------------- Get Explore ----------------
    async getExplore(filters = {}) {
        const params = new URLSearchParams();
        if (filters.gender) params.append("gender", filters.gender);
        if (filters.city) params.append("city", filters.city);
        if (filters.country) params.append("country", filters.country);
        if (filters.minAge) params.append("minAge", filters.minAge);
        if (filters.maxAge) params.append("maxAge", filters.maxAge);

        const query = params.toString();
        return Api.get(`${this.base}/get-explore${query ? `?${query}` : ""}`);
    }

    // ---------------- Send Interest (Like) ----------------
    async sendInterest(toUserId, isSuperLike = false) {
        console.log("sending like")
        return Api.post(`/interest/send-interest`, {
            interestId: Number(toUserId),
            isSuperLike: isSuperLike,
        });
    }

    // ---------------- Send Dislike (Pass) ----------------
    async sendDislike(targetUserId) {
        return Api.post(`/interest/dislike`, { interestId: Number(targetUserId) });
    }
}

export default new ExploreService();