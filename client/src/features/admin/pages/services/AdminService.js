import Api from "../../../../api/Api";


class AdminService {
    constructor() {
        this.base = "/admin";
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AUTHENTICATION
    // ═══════════════════════════════════════════════════════════════════════

    async login(email, password) {
        return Api.post(`${this.base}/login`, { email, password });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DASHBOARD
    // ═══════════════════════════════════════════════════════════════════════

    async getDashboardStats() {
        return Api.get(`${this.base}/dashboard/stats`);
    }

    async getDashboardCharts(period = '30d') {
        return Api.get(`${this.base}/dashboard/charts?period=${period}`);
    }

    async getRecentActivity(limit = 10) {
        return Api.get(`${this.base}/dashboard/recent-activity?limit=${limit}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // USER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/users${query ? `?${query}` : ''}`);
    }

    async getUserDetails(id) {
        return Api.get(`${this.base}/users/${id}`);
    }

    async updateUser(id, data) {
        return Api.put(`${this.base}/users/${id}`, data);
    }

    async deleteUser(id) {
        return Api.delete(`${this.base}/users/${id}`);
    }

    async banUser(id, reason) {
        return Api.post(`${this.base}/users/${id}/ban`, { reason });
    }

    async unbanUser(id) {
        return Api.post(`${this.base}/users/${id}/unban`);
    }

    async verifyUser(id) {
        return Api.post(`${this.base}/users/${id}/verify`);
    }

    async adjustCredits(id, amount, type = 'credits', reason = '') {
        return Api.post(`${this.base}/users/${id}/credits`, { amount, type, reason });
    }

    async adjustSubscription(id, isPro, expiresAt) {
        return Api.post(`${this.base}/users/${id}/subscription`, { isPro, expiresAt });
    }

    async getUserActivity(id) {
        return Api.get(`${this.base}/users/${id}/activity`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VERIFICATION QUEUE
    // ═══════════════════════════════════════════════════════════════════════

    async getPendingVerifications() {
        return Api.get(`${this.base}/verifications/pending`);
    }

    async approveVerification(userId) {
        return Api.post(`${this.base}/verifications/${userId}/approve`);
    }

    async rejectVerification(userId, reason) {
        return Api.post(`${this.base}/verifications/${userId}/reject`, { reason });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROFILE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getProfiles(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/profiles${query ? `?${query}` : ''}`);
    }

    async getProfileDetails(id) {
        return Api.get(`${this.base}/profiles/${id}`);
    }

    async updateProfile(id, data) {
        return Api.put(`${this.base}/profiles/${id}`, data);
    }

    async deleteProfilePhoto(id, index) {
        return Api.delete(`${this.base}/profiles/${id}/photo/${index}`);
    }

    async deleteProfileVideo(id, index) {
        return Api.delete(`${this.base}/profiles/${id}/video/${index}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GUARDIAN MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getGuardians(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/guardians${query ? `?${query}` : ''}`);
    }

    async getGuardianDetails(id) {
        return Api.get(`${this.base}/guardians/${id}`);
    }

    async removeGuardian(id) {
        return Api.delete(`${this.base}/guardians/${id}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SUBSCRIPTION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getSubscriptions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/subscriptions${query ? `?${query}` : ''}`);
    }

    async getSubscriptionDetails(id) {
        return Api.get(`${this.base}/subscriptions/${id}`);
    }

    async cancelSubscription(id) {
        return Api.post(`${this.base}/subscriptions/${id}/cancel`);
    }

    async extendSubscription(id, days) {
        return Api.post(`${this.base}/subscriptions/${id}/extend`, { days });
    }

    async refundSubscription(id) {
        return Api.post(`${this.base}/subscriptions/${id}/refund`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TRANSACTION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getTransactions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/transactions${query ? `?${query}` : ''}`);
    }

    async getTransactionDetails(id) {
        return Api.get(`${this.base}/transactions/${id}`);
    }

    async refundTransaction(id) {
        return Api.post(`${this.base}/transactions/${id}/refund`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // REFERRAL MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getReferrals(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/referrals${query ? `?${query}` : ''}`);
    }

    async getReferralStats() {
        return Api.get(`${this.base}/referrals/stats`);
    }

    async getReferralDetails(id) {
        return Api.get(`${this.base}/referrals/${id}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTEREST & MATCH MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getInterests(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/interests${query ? `?${query}` : ''}`);
    }

    async deleteInterest(id) {
        return Api.delete(`${this.base}/interests/${id}`);
    }
    async getPendingInterests(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/interests/pending${query ? `?${query}` : ''}`);
    }
    async getMatches(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/matches${query ? `?${query}` : ''}`);
    }

    async deleteMatch(id) {
        return Api.delete(`${this.base}/matches/${id}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MESSAGE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getMessages(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/messages${query ? `?${query}` : ''}`);
    }

    async deleteMessage(id) {
        return Api.delete(`${this.base}/messages/${id}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONTACT REVEAL MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getContactReveals(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/contact-reveals${query ? `?${query}` : ''}`);
    }

    async getContactRevealStats() {
        return Api.get(`${this.base}/contact-reveals/stats`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NOTIFICATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getNotifications(params = {}) {
        const query = new URLSearchParams(params).toString();
        return Api.get(`${this.base}/notifications${query ? `?${query}` : ''}`);
    }

    async sendNotification(data) {
        return Api.post(`${this.base}/notifications/send`, data);
    }

    async broadcastNotification(data) {
        return Api.post(`${this.base}/notifications/broadcast`, data);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SETTINGS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getSettings() {
        return Api.get(`${this.base}/settings`);
    }

    async updateSettings(data) {
        return Api.put(`${this.base}/settings`, data);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OPTIONS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    async getOptions() {
        return Api.get(`${this.base}/options`);
    }

    async updateGlobalOptions(data) {
        return Api.put(`${this.base}/options/global`, data);
    }

    async getCountryOptions() {
        return Api.get(`${this.base}/options/countries`);
    }

    async updateCountryOptions(country, data) {
        return Api.put(`${this.base}/options/countries/${country}`, data);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ANALYTICS & REPORTS
    // ═══════════════════════════════════════════════════════════════════════

    async getUserAnalytics(period = '30d') {
        return Api.get(`${this.base}/analytics/users?period=${period}`);
    }

    async getRevenueAnalytics(period = '30d') {
        return Api.get(`${this.base}/analytics/revenue?period=${period}`);
    }

    async getEngagementAnalytics(period = '30d') {
        return Api.get(`${this.base}/analytics/engagement?period=${period}`);
    }

    async getReferralAnalytics(period = '30d') {
        return Api.get(`${this.base}/analytics/referrals?period=${period}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT REPORTS
    // ═══════════════════════════════════════════════════════════════════════

    async exportUsers() {
        window.open(`${process.env.VITE_API_URL}/admin/export/users`, '_blank');
    }

    async exportTransactions() {
        window.open(`${process.env.VITE_API_URL}/admin/export/transactions`, '_blank');
    }

    async exportReferrals() {
        window.open(`${process.env.VITE_API_URL}/admin/export/referrals`, '_blank');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN USER MANAGEMENT (SUPERADMIN ONLY)
    // ═══════════════════════════════════════════════════════════════════════

    async getAdmins() {
        return Api.get(`${this.base}/admins`);
    }

    async createAdmin(data) {
        return Api.post(`${this.base}/admins`, data);
    }

    async updateAdmin(id, data) {
        return Api.put(`${this.base}/admins/${id}`, data);
    }

    async deleteAdmin(id) {
        return Api.delete(`${this.base}/admins/${id}`);
    }
    // Add these methods to your AdminService.js class
    // REPLACE the duplicate methods at the bottom of AdminService.js with these:
    // (Remove the old ones that use this.request and add these instead)

    // ═══════════════════════════════════════════════════════════════════════
    // USER DETAIL PAGE METHODS
    // ═══════════════════════════════════════════════════════════════════════

    // Update user profile (enhanced version)
    async updateUserProfileByAdmin(userId, profileData) {
        return Api.put(`${this.base}/users/${userId}/profile`, profileData);
    }

    // Delete user image
    async deleteUserImage(userId, imageUrl) {
        return Api.delete(`${this.base}/users/${userId}/image`, { imageUrl });
    }

    // Delete user video
    async deleteUserVideo(userId, videoUrl) {
        return Api.delete(`${this.base}/users/${userId}/video`, { videoUrl });
    }

    // Remove guardian link
    async removeGuardianByAdmin(userId, guardianId) {
        return Api.delete(`${this.base}/users/${userId}/guardian/${guardianId}`);
    }

    // Remove ward link
    async removeWard(userId, wardId) {
        return Api.delete(`${this.base}/users/${userId}/ward/${wardId}`);
    }
    /**
    * Get all meetings with filters
    */
    async getAllMeetings(filters = {}) {
        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.from_date) params.append('from_date', filters.from_date);
        if (filters.to_date) params.append('to_date', filters.to_date);
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        return Api.get(`/admin/meetings?${params.toString()}`);
    }

    /**
     * Get meeting statistics
     */
    async getStats() {
        return Api.get('/admin/meetings/stats');
    }

    /**
     * Get single meeting details
     */
    async getMeetingDetails(meetingId) {
        return Api.get(`/admin/meetings/${meetingId}`);
    }

    /**
     * Update meeting status
     */
    async updateStatus(meetingId, status, adminNotes = null) {
        return Api.patch(`/admin/meetings/${meetingId}/status`, {
            status,
            admin_notes: adminNotes
        });
    }

    /**
     * Delete meeting
     */
    async deleteMeeting(meetingId) {
        return Api.delete(`/admin/meetings/${meetingId}`);
    }
}

export default new AdminService();
