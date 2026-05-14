import Api from "../../../api/Api";

class ExploreService {
    constructor() {
        this.base = "/explore";
    }

    // ── Single call: options + all country data + saved prefs ──────────────
    async getOptions() {
        await new Promise(resolve => setTimeout(resolve, 300));
        const response = await Api.get(`${this.base}/options`);
        return response; // ✅ Already returns the full response
    }

    // ── Get Explore feed ───────────────────────────────────────────────────
    // In ExploreService.js

    async getExplore(filters = {}) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📤 FETCHING EXPLORE PROFILES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Filters being sent to backend:', JSON.stringify(filters, null, 2));

        const params = new URLSearchParams();

        // Basic filters
        if (filters.gender) params.append("gender", filters.gender);
        if (filters.city) params.append("city", filters.city);

        // ✅ Handle single country OR multiple countries
        if (filters.country) {
            params.append("country", filters.country);
        } else if (filters.countries) {
            // Multiple countries as comma-separated string
            params.append("countries", filters.countries);
        }

        if (filters.minAge) params.append("minAge", filters.minAge);
        if (filters.maxAge) params.append("maxAge", filters.maxAge);

        // Additional filters from activeFilters
        if (filters.isVerified) params.append("isVerified", "1");
        if (filters.isPremium) params.append("isPremium", "1");
        if (filters.isOnline) params.append("isOnline", "1");

        const query = params.toString();
        console.log('Query string:', query || '(no filters)');
        console.log('Full URL:', `${this.base}/get-explore${query ? `?${query}` : ""}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return Api.get(`${this.base}/get-explore${query ? `?${query}` : ""}`);
    }
    // ── Send Interest (Like) ───────────────────────────────────────────────
    async sendInterest(toUserId, isSuperLike = false) {
        return Api.post(`/interest/send-interest`, {
            interestId: Number(toUserId),
            isSuperLike,
        });
    }

    // ── Send Dislike (Pass) ────────────────────────────────────────────────
    async sendDislike(targetUserId) {
        return Api.post(`/interest/dislike`, { interestId: Number(targetUserId) });
    }

    // ── Save preferences ───────────────────────────────────────────────────
    async savePreferences(payload) {
        try {
            const response = await Api.post(`${this.base}/save-preferences`, payload);



            // ✅ Return response.data if it exists, otherwise the whole response
            return response?.data || response;

        } catch (error) {
            console.error('❌ savePreferences error:', error);

            // ✅ Extract meaningful error message
            const errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'Failed to save preferences';

            // ✅ Throw with the message so the caller can catch it
            throw new Error(errorMessage);
        }
    }
}

export default new ExploreService();