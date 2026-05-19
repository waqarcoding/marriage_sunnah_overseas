// server/services/simpleMeeting.service.js
// Simple meeting service - Google Meet style links (no API)
// Works with your existing emailService.js

import crypto from 'crypto';
import EmailService from '../mail/service.js';

class SimpleMeetingService {

    /**
     * Generate Google Meet style link (without API)
     * Format: https://meet.google.com/xxx-yyyy-zzz
     */
    createGoogleMeetLink() {
        // Generate 3 random segments like Google Meet format
        const segment1 = this.generateSegment(3); // abc
        const segment2 = this.generateSegment(4); // defg
        const segment3 = this.generateSegment(3); // hij

        return `https://meet.jit.si/MarriageSunnah-${segment1}-${segment2}-${segment3}`;

    }

    /**
     * Generate random alphanumeric segment
     */
    generateSegment(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        const randomBytes = crypto.randomBytes(length);

        for (let i = 0; i < length; i++) {
            result += chars[randomBytes[i] % chars.length];
        }

        return result;
    }

    /**
     * Send meeting invitation via email (uses your EmailService)
     */
    async sendMeetingInvitation(emailServiceIgnored, meetingData) {
        // Use your imported EmailService instead of passed one
        return await EmailService.sendMeetingInvitationEmail(meetingData);
    }

    /**
     * Send meeting confirmation email (uses your EmailService)
     */
    async sendMeetingConfirmation(emailServiceIgnored, meetingData) {
        // Use your imported EmailService instead of passed one
        return await EmailService.sendMeetingConfirmationEmail(meetingData);
    }
}

export default new SimpleMeetingService();