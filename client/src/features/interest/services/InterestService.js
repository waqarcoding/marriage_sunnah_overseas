import Api from "../../../api/Api";
import { fetchImageBlob } from "../../../components/ImageAvatar";

// @ts-ignore
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

class InterestService {
    constructor() {
        this.base = "/interest";
    }

    send(data) {
        return Api.post(`${this.base}/send-interest`, data);
    }

    cancel(interestId) {
        return Api.delete(`${this.base}/cancel-interest/${interestId}`);
    }

    accept(interestId) {
        return Api.post(`${this.base}/accept-interest`, { interestId: Number(interestId) });
    }

    decline(interestId) {
        return Api.post(`${this.base}/decline-interest`, { interestId: Number(interestId) });
    }

    getallInterests(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query
            ? `${this.base}/get-interests?${query}`
            : `${this.base}/get-interests`;
        return Api.get(endpoint);
    }

    pendingCount() {
        return Api.get(`${this.base}/pending-count`);
    }

    // ⚡ Call this from your component after getallInterests resolves
    // Pass the queryClient from useQueryClient() in your component
    prefetchAllImages(data, qc) {
        const { sent = [], received = [], matches = [] } = data ?? {};
        const allUrls = new Set();

        // Extract images from a profile object
        const collectFromProfile = (profile) => {
            if (!profile?.images) return;
            try {
                const imgs = JSON.parse(profile.images);
                imgs.forEach(url => {
                    if (!url) return;
                    const full = url.startsWith("http") ? url : `${BASE_URL}${url}`;
                    allUrls.add(full);
                });
            } catch (_) { }
        };

        [...sent, ...received].forEach(item => collectFromProfile(item.toProfile));
        matches.forEach(item => {
            collectFromProfile(item.toProfile);
            collectFromProfile(item.fromProfile);
        });

        // ⚡ Fire all prefetches in parallel — silent background downloads
        allUrls.forEach(url => {
            qc.prefetchQuery({
                queryKey: ["img", url],
                queryFn: () => fetchImageBlob(url),
                staleTime: Infinity,
            });
        });
    }
}

export default new InterestService();