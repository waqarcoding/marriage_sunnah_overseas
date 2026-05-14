import Api from "../../../api/Api";

class ProfileService {

    constructor() {
        this.base = "/profile";
    }

    async uploadIdCard(id_front, id_back) {
        const formData = new FormData();
        formData.append("front_id", id_front);
        formData.append("back_id", id_back);
        return Api.upload(`${this.base}/upload-idcard`, formData);
    }

    // ---------------- Upload Image ----------------
    async uploadImage(file, index) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("index", index);
        return Api.upload(`${this.base}/upload-image`, formData);
    }

    async uploadVideo(file, index) {
        const formData = new FormData();
        formData.append("video", file);
        formData.append("index", index);
        return Api.upload(`${this.base}/upload-video`, formData);
    }

    async deleteImage(index) {
        return Api.delete(`${this.base}/delete-image/${index}`);
    }

    async deleteVideo(index) {
        return Api.delete(`${this.base}/delete-video/${index}`);
    }

    // ---------------- Get My Profile ----------------
    async getCurrentUser() {
        return await Api.get(`${this.base}/get-current-user`);
    }

    async getUserById(id) {
        return await Api.get(`${this.base}/get-user/${id}`);
    }

    // ---------------- Create Profile (first time) ----------------
    async updatePrefs(data) {
        return Api.put(`${this.base}/update-prefs`, data);
    }

    // ---------------- Update Profile ----------------
    async updateProfile(data) {
        return Api.put(`${this.base}/update-profile`, data);
    }
    async updateAboutInterest(data) {
        return Api.put(`${this.base}/update-about`, data);
    }

    async updateGuardian(data) {
        return Api.put(`${this.base}/update-guardian`, data);
    }

    // ---------------- Update Last Seen ----------------
    async updateLastSeen() {
        return Api.get(`${this.base}/last-seen`);
    }

    // ---------------- NEW: Contact Reveal ----------------
    /**
     * Reveal contact information for a user
     * @param {number} userId - The ID of the user whose contact to reveal
     * @param {string} revealType - Type of reveal: 'phone', 'email', or 'both'
     * @returns {Promise} Response with contact info and reveals remaining
     */
    async revealContact(userId, revealType = 'both') {
        return Api.post(`${this.base}/reveal-contact/${userId}`, { revealType });
    }

    /**
     * Check if contact is already revealed for a user
     * @param {number} userId - The ID of the user to check
     * @returns {Promise} Response with reveal status
     */
    async checkContactRevealStatus(userId) {
        return Api.get(`${this.base}/contact-reveal-status/${userId}`);
    }
    /**
     * Delete the current user's account
     * @returns {Promise} Response from backend after deleting account
     */
    async deleteAccount() {
        return Api.delete(`${this.base}/delete-account`);
    }

    /**
     * Get current user's contact reveal stats
     * @returns {Promise} Response with reveals remaining and unlimited status
     */
    async getContactRevealStats() {
        return Api.get(`${this.base}/contact-reveal-stats`);
    }

    // ---------------- Parse Images ----------------
    parseImages = (profile) => {
        const MalePlaceholder = "https://cdn-icons-png.flaticon.com/512/1077/1077114.png";
        const FemalePlaceholder = "https://cdn-icons-png.flaticon.com/512/1077/1077063.png";
        let imgs = [];

        if (profile.images) {
            if (Array.isArray(profile.images)) imgs = profile.images;
            else try { imgs = JSON.parse(profile.images); } catch { imgs = []; }
        } else if (profile.image) {
            imgs = [profile.image];
        }

        imgs = imgs
            .filter(Boolean)
            // @ts-ignore
            .map((url) => url.startsWith("http") ? url : `${import.meta.env.VITE_BASE_URL}${url}`);

        if (imgs.length === 0) {
            return [profile.gender === "female" ? FemalePlaceholder : MalePlaceholder];
        }

        return imgs;
    };

    async getCredits() {
        try {
            const user = await this.getCurrentUser();
            // Return 0 if user or user.credits is undefined/null
            return user?.credits ?? 0;
        } catch (error) {
            // If there is an error (e.g., not logged in), return 0 as fallback
            return 0;
        }
    }
}

export default new ProfileService();