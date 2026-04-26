import { toast } from "react-toastify";
import * as jwtDecode from "jwt-decode";

class Api {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this._lastPing = 0;
    }

    // ---------------- Headers ----------------
    _getHeaders(isJson = true) {
        const headers = {};
        if (isJson) headers["Content-Type"] = "application/json";

        try {
            const token = localStorage.getItem("jwtToken");
            if (token) headers["Authorization"] = `Bearer ${token}`;
        } catch (err) {
            console.error("Error reading token from localStorage:", err);
        }

        return headers;
    }

    // ---------------- Last Seen ----------------
    _pingLastSeen() {
        const now = Date.now();
        if (now - this._lastPing < 60_000) return;
        this._lastPing = now;
        console.log(`${this.baseURL}/profile/last-seen`)
        fetch(`${this.baseURL}/profile/last-seen`, {
            method: "GET",
            // @ts-ignore
            headers: this._getHeaders(),
        }).catch(() => { console.log("erro ping lastseen") });
    }

    // ---------------- Central handle request ----------------
    // Fix for Api.js handleRequest — guard against null response

    async handleRequest(promise, callbacks = {}) {
        const { onSuccess, onFailed } = callbacks;
        try {
            const res = await promise;

            // ✅ Guard against null/undefined response
            if (!res) {
                const err = new Error('No response from server');
                if (onFailed) onFailed(err);
                return null;
            }

            if (res.success) {
                if (onSuccess) onSuccess(res);
            } else {
                if (onFailed) onFailed(res);
                toast.error(res.message || 'Request failed');
            }
            return res;
        } catch (err) {
            if (onFailed) onFailed(err);

            if (err.data?.errors) {
                Object.entries(err.data.errors).forEach(([field, msg]) => {
                    toast.error(`${field}: ${msg}`);
                });
            } else {
                toast.error(err.message || 'Network error');
            }

            console.error('API Error:', err.data || err.message);
            return null; // ✅ return null instead of Promise.reject to prevent uncaught
        }
    }

    // ---------------- Unified fetch ----------------
    async _fetch(endpoint, options) {
        const res = await fetch(`${this.baseURL}${endpoint}`, options);
        let data = null;

        try {
            data = await res.json();
        } catch {
            data = null;
        }


        if (!res.ok) {
            // ✅ Create error with full response data attached
            const msg = (data && (data.error || data.message)) || res.statusText;
            const err = new Error(msg);
            // @ts-ignore
            err.data = data;       // attach full JSON { errors, missingFields, etc }
            // @ts-ignore
            err.status = res.status;
            if (res.status === 401) this._handleTokenExpired();
            throw err;
        }

        console.log("result:", data.message);
        this._pingLastSeen();

        return data;
    }

    // ---------------- HTTP METHODS with built-in handleRequest ----------------
    get(endpoint, callbacks) {
        console.log("API GET ENDPOINT:", `${this.baseURL}${endpoint}`);

        return this.handleRequest(
            this._fetch(endpoint, {
                method: "GET",
                headers: this._getHeaders(),
            }),
            callbacks
        );
    }

    post(endpoint, body, callbacks) {
        console.log("API POST ENDPOINT:", `${this.baseURL}${endpoint}`);
        console.log("API POST body:", JSON.stringify(body));

        return this.handleRequest(
            this._fetch(endpoint, {
                method: "POST",
                headers: this._getHeaders(),
                body: JSON.stringify(body),
            }),
            callbacks
        );
    }

    put(endpoint, body, callbacks) {
        console.log("API PUT ENDPOINT:", `${this.baseURL}${endpoint}`);
        console.log("API PUT BODY:", body);
        return this.handleRequest(
            this._fetch(endpoint, {
                method: "PUT",
                headers: this._getHeaders(),
                body: JSON.stringify(body),
            }),
            callbacks
        );
    }
    // ---------------- File Upload (FormData) ----------------
    upload(endpoint, formData, callbacks) {
        const headers = {};
        try {
            const token = localStorage.getItem("jwtToken");
            if (token) headers["Authorization"] = `Bearer ${token}`;
            // ⚠️ NO Content-Type — browser sets multipart/form-data + boundary automatically
        } catch (err) {
            console.error("Error reading token:", err);
        }

        return this.handleRequest(
            this._fetch(endpoint, {
                method: "POST",
                headers,
                body: formData,
            }),
            callbacks
        );
    }

    patch(endpoint, body = {}, callbacks) {
        return this.handleRequest(
            this._fetch(endpoint, {
                method: "PATCH",
                headers: this._getHeaders(),
                body: JSON.stringify(body),
            }),
            callbacks
        );
    }

    delete(endpoint, callbacks) {
        return this.handleRequest(
            this._fetch(endpoint, {
                method: "DELETE",
                headers: this._getHeaders(),
            }),
            callbacks
        );
    }

    // ---------------- Token expired ----------------
    _handleTokenExpired() {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("authData");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
    }

    // ---------------- JWT validation ----------------
    checkToken() {
        const token = localStorage.getItem("jwtToken");
        if (!token) return false;

        try {
            // @ts-ignore
            const decoded = jwtDecode(token);
            if (decoded.exp < Date.now() / 1000) {
                this._handleTokenExpired();
                return false;
            }
            return true;
        } catch {
            this._handleTokenExpired();
            return false;
        }
    }
}

// @ts-ignore
export default new Api(import.meta.env.VITE_BASE_URL);