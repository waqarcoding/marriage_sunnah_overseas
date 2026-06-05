import { jwtDecode } from "jwt-decode";
import AuthService from "../features/auth/services/AuthService";

class Api {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this._lastPing = 0;
    }

    // ---------------- Headers ----------------
    _getHeaders(isJson = true) {
        const headers = {};
        if (isJson) {
            headers["Content-Type"] = "application/json";
            headers["Accept"] = "application/json";
        }
        try {
            const token = localStorage.getItem("jwtToken");
            if (token) headers["Authorization"] = `Bearer ${token}`;
        } catch (err) {
            console.error("[API] Error reading token:", err);
        }
        return headers;
    }

    // ---------------- Last Seen ----------------
    _pingLastSeen() {
        const now = Date.now();
        if (now - this._lastPing < 60_000) return;
        this._lastPing = now;
        fetch(`${this.baseURL}/profile/last-seen`, {
            method: "GET",

        }).catch(() => console.log("[API] Last seen ping failed"));
    }

    // ---------------- Handle Response ----------------
    _handleResponse(res, data, endpoint) {
        console.log(`[API] ⬅️ ${res.status} ${endpoint}`);

        if (res.ok && data?.success !== false) {
            this._pingLastSeen();
            return data;
        }

        let msg = "Request failed";
        try {
            const raw = data?.error || data?.message || data?.err || data?.msg;
            if (typeof raw === "string") msg = raw;
            else if (raw) msg = String(raw);
            else msg = res.statusText || msg;
        } catch { /* fallback */ }

        console.error(`[API] ❌ Error: ${msg}`);

        if (res.status === 401 &&
            data?.error !== "Wrong password" &&
            data?.error !== "Email not found"
        ) {
            this._handleTokenExpired();
        }

        return { success: false, error: msg, data };
    }

    // ---------------- Unified fetch ----------------
    async _fetch(endpoint, options) {
        console.log(`[API] 🌐 ${options.method} ${this.baseURL}${endpoint}`);

        try {
            const res = await fetch(`${this.baseURL}${endpoint}`, options);

            let data = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }

            return this._handleResponse(res, data, endpoint);

        } catch (err) {
            if (err.name === "TypeError") {
                console.error("[API] 🔌 Network Error:", err.message);
                return { success: false, error: "Please check your internet connection" };
            }
            console.error("[API] Unexpected Error:", err.message);
            return { success: false, error: "An unexpected error occurred" };
        }
    }

    // ---------------- Compatibility: handleRequest ----------------
    // Supports old callback pattern: Api.handleRequest(Api.get(...), { onSuccess, onFailed })
    // AND new direct await pattern: const res = await Api.get(...)
    async handleRequest(promise, callbacks = {}) {
        const { onSuccess, onFailed } = callbacks;
        try {
            const res = await promise;

            if (!res || res.success === false) {
                const msg = res?.error || res?.message || "Request failed";
                if (onFailed) onFailed({ message: msg, data: res });
                return null;
            }

            if (onSuccess) onSuccess(res);
            return res;

        } catch (err) {
            const msg = err?.message || "Network error";
            if (onFailed) onFailed({ message: msg, data: null });
            return null;
        }
    }

    // ---------------- HTTP Methods ----------------
    // Supports both:
    //   await Api.get("/endpoint")                          → new pattern
    //   await Api.get("/endpoint", { onSuccess, onFailed }) → old callback pattern
    //   await Api.get("/endpoint", { page: 1 })            → query params
    get(endpoint, secondArg) {
        const isCallbacks = secondArg && (secondArg.onSuccess || secondArg.onFailed);
        const queryParams = (!isCallbacks && secondArg) ? secondArg : null;
        const callbacks = isCallbacks ? secondArg : {};

        let url = endpoint;
        if (queryParams && Object.keys(queryParams).length > 0) {
            url += "?" + new URLSearchParams(queryParams).toString();
        }

        const promise = this._fetch(url, {
            method: "GET",
            headers: this._getHeaders(),
        });

        // If callbacks provided, wrap in handleRequest (old pattern)
        if (isCallbacks) return this.handleRequest(promise, callbacks);

        // Otherwise return promise directly (new pattern)
        return promise;
    }

    post(endpoint, body, callbacks) {
        const promise = this._fetch(endpoint, {
            method: "POST",
            headers: this._getHeaders(),
            body: JSON.stringify(body),
        });
        if (callbacks) return this.handleRequest(promise, callbacks);
        return promise;
    }

    put(endpoint, body, callbacks) {
        const promise = this._fetch(endpoint, {
            method: "PUT",
            headers: this._getHeaders(),
            body: JSON.stringify(body),
        });
        if (callbacks) return this.handleRequest(promise, callbacks);
        return promise;
    }

    patch(endpoint, body = {}, callbacks) {
        const promise = this._fetch(endpoint, {
            method: "PATCH",
            headers: this._getHeaders(),
            body: JSON.stringify(body),
        });
        if (callbacks) return this.handleRequest(promise, callbacks);
        return promise;
    }

    delete(endpoint, callbacks) {
        const promise = this._fetch(endpoint, {
            method: "DELETE",
            headers: this._getHeaders(),
        });
        if (callbacks) return this.handleRequest(promise, callbacks);
        return promise;
    }

    // ---------------- File Upload ----------------
    upload(endpoint, formData, callbacks) {
        const headers = {};
        try {
            const token = localStorage.getItem("jwtToken");
            if (token) headers["Authorization"] = `Bearer ${token}`;
        } catch (err) {
            console.error("[API] Error reading token:", err);
        }

        const promise = this._fetch(endpoint, {
            method: "POST",
            headers,
            body: formData,
        });
        if (callbacks) return this.handleRequest(promise, callbacks);
        return promise;
    }

    // ---------------- Token Expired ----------------
    _handleTokenExpired() {
        console.log("[API] Session expired");
        AuthService.logout();
        setTimeout(() => {
            window.history.pushState({}, "", "/login");
            window.dispatchEvent(new PopStateEvent("popstate"));
        }, 100);
    }

    // ---------------- Check Token ----------------
    checkToken() {
        const token = localStorage.getItem("jwtToken");
        if (!token) return false;

        try {
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