import toast from "react-hot-toast";
import * as jwtDecode from "jwt-decode";
import AuthService from "../features/auth/services/AuthService";

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

            if (!res) {
                const err = new Error('No response from server');
                if (onFailed) onFailed({ message: err.message, data: null });
                return null;
            }

            if (res.success === false) {
                // Show the most relevant error message, preferring inner data.message if present
                let errorMsg = res.message || res.error || 'Request failed';
                if (res.error === 'server_error' && res.data && res.data.message) {
                    errorMsg = res.data.message;
                }
                if (onFailed) onFailed({ message: errorMsg, data: res });
                return null;
            }

            if (onSuccess) onSuccess(res);
            return res;

        } catch (err) {
            // Prefer inner data.message for server_error as well
            let errorMsg = err.message || 'Network error';
            if (err.data && err.data.error === 'server_error' && err.data.message) {
                errorMsg = err.data.message;
            }
            if (onFailed) onFailed({ message: errorMsg, data: err.data || null });
            return null;
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

        // Remove incorrect API SUCCESS/FAILED logs with success === "true"
        // No logging should happen here; _fetch should only handle errors below



        if (!res.ok || data?.success === false) {

            // ✅ Extract error message from response
            const msg = (data && (data.error || data.message || data.err || data.msg)) || res.statusText;
            console.error("API Error:", msg);
            toast(msg)


            const err = new Error(msg);
            // @ts-ignore
            err.data = data;       // attach full JSON
            // @ts-ignore
            err.status = res.status;
            console.log("Backend Authentication Error:" + res.status)


            if (res.status === 401) this._handleTokenExpired();

            throw err;
        }

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
        toast.error("Session expired. Please log in again.")
        console.log("Session expired. Please log in again.")
        AuthService.logout()



        // ❌ remove hard reload
        // window.location.href = "/login"

        // ✅ soft navigation
        setTimeout(() => {
            window.history.pushState({}, "", "/login")
            window.dispatchEvent(new PopStateEvent("popstate"))
        }, 100)
    }

    // ---------------- JWT validation ----------------
    checkToken() {
        const token = localStorage.getItem("jwtToken")
        console.log("JWT TOKEN NOT FOUND")
        if (!token) return false

        try {
            // @ts-ignore
            const decoded = jwtDecode(token)

            if (decoded.exp < Date.now() / 1000) {
                this._handleTokenExpired()

                return false
            }

            return true
        } catch {
            this._handleTokenExpired()
            return false
        }
    }
}

// @ts-ignore
export default new Api(import.meta.env.VITE_BASE_URL);