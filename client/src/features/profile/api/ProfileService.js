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


    // ---------------- Get My Profile ----------------
    async getMyProfile() {
        return Api.get(`${this.base}/get-profile`);
    }

    // ---------------- Create Profile (first time) ----------------
    async updatePrefs(data) {

        return Api.put(`${this.base}/update-prefs`, data);
    }

    // ---------------- Update Profile ----------------
    async updateProfile(data) {

        return Api.put(`${this.base}/update-profile`, data);
    }
    async updateGuardian(data) {
        return Api.put(`${this.base}/update-guardian`, data);
    }

    // ---------------- Upload Image ----------------
    async uploadImage(file, index) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("index", index);
        return Api.upload(`${this.base}/upload-image`, formData);
    }

    // ---------------- Update Last Seen ----------------
    async updateLastSeen() {
        return Api.get(`${this.base}/last-seen`);
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
}

export default new ProfileService();