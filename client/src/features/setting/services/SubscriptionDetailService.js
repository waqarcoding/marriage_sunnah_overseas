import Api from "../../../api/Api";

class SubscriptionDetailService {
    constructor() {
        this.base = "/subscription";
    }

    // Get logged-in user's subscriptions + transaction history
    getMySubscriptions(callbacks) {
        return Api.get(`${this.base}/my`, callbacks);
    }

    // Get subscription status by userId
    getStatus(userId, callbacks) {
        return Api.get(`${this.base}/status/${userId}`, callbacks);
    }

    // Create Stripe checkout session
    createCheckoutSession(data, callbacks) {
        return Api.post(`${this.base}/create-checkout-session`, data, callbacks);
    }

    // Restore purchases
    restorePurchases(data, callbacks) {
        return Api.post(`${this.base}/restore-purchases`, data, callbacks);
    }

    // Verify session after redirect
    verifySession(sessionId, callbacks) {
        return Api.get(`${this.base}/verify-session?session_id=${sessionId}`, callbacks);
    }
}

export default new SubscriptionDetailService();