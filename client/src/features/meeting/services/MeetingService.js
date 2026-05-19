// client/src/features/chat/services/MeetingService.js

import Api from "../../../api/Api";



class MeetingService {
    constructor() {
        this.base = '/meetings';
    }

    /**
     * Propose a new meeting
     */
    async proposeMeeting(data) {
        return Api.post(`${this.base}/propose`, data);
    }

    /**
     * Confirm a meeting invitation
     */
    async confirmMeeting(meetingId) {
        return Api.post(`${this.base}/${meetingId}/confirm`);
    }

    /**
     * Get user's meetings
     */
    async getMyMeetings(status = 'all') {
        return Api.get(`${this.base}/my-meetings`, { status });
    }

    /**
     * Get meeting details
     */
    async getMeetingDetails(meetingId) {
        return Api.get(`${this.base}/${meetingId}`);
    }

    /**
     * Cancel a meeting
     */
    async cancelMeeting(meetingId, reason) {
        return Api.post(`${this.base}/${meetingId}/cancel`, { reason });
    }

    /**
     * Reschedule a meeting
     */
    async rescheduleMeeting(meetingId, new_datetime, new_duration) {
        return Api.post(`${this.base}/${meetingId}/reschedule`, {
            new_datetime,
            new_duration
        });
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

export default new MeetingService();