// server/controllers/meeting.controller.js
// Complete and Ready to Use

import db from '../models/index.js';
const { Meeting, Match, User, Guardian } = db;
import SimpleMeetingService from '../services/googleMeet.service.js';
import EmailService from '../mail/service.js';
import { Op } from 'sequelize';

export const proposeMeeting = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            match_id,
            meeting_datetime,
            duration_minutes = 60,
            timezone = 'Asia/Karachi',
            meeting_type = 'video_call',
            include_my_guardian = false,
            request_their_guardian = false,
            request_platform_team = false,
            platform_team_role = 'moderator',
            agenda,
            location_name,
            location_address
        } = req.body;

        // ✅ Validate datetime
        if (!meeting_datetime) {
            return res.status(400).json({
                success: false,
                error: 'Meeting datetime is required'
            });
        }

        const meetingDate = new Date(meeting_datetime);
        if (isNaN(meetingDate.getTime())) {
            console.error('Invalid datetime received:', meeting_datetime);
            return res.status(400).json({
                success: false,
                error: 'Invalid meeting datetime format'
            });
        }

        // Validate match exists and user is part of it
        const match = await Match.findByPk(match_id, {
            include: [
                { model: User, as: 'user_one', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'user_two', attributes: ['id', 'name', 'email'] }
            ]
        });

        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        // Determine user1 and user2
        const isUser1 = match.user1 === userId;
        const isUser2 = match.user2 === userId;

        if (!isUser1 && !isUser2) {
            return res.status(403).json({
                success: false,
                error: 'You are not part of this match'
            });
        }

        const user1_id = match.user1;
        const user2_id = match.user2;
        const proposer = isUser1 ? match.user_one : match.user_two;
        const otherUser = isUser1 ? match.user_two : match.user_one;

        // Get guardians if requested
        let user1_guardian_id = null;
        let user2_guardian_id = null;
        let user1Guardian = null;
        let user2Guardian = null;

        if (include_my_guardian) {
            const myGuardianLink = await Guardian.findOne({
                where: { individual_id: userId },
                include: [{
                    model: User,
                    as: 'guardianUser', // ✅ Fixed
                    attributes: ['id', 'name', 'email'],
                    required: false
                }]
            });

            if (myGuardianLink?.guardianUser) { // ✅ Fixed
                if (isUser1) {
                    user1_guardian_id = myGuardianLink.guardian_id;
                    user1Guardian = myGuardianLink.guardianUser; // ✅ Fixed
                } else {
                    user2_guardian_id = myGuardianLink.guardian_id;
                    user2Guardian = myGuardianLink.guardianUser; // ✅ Fixed
                }
            }
        }

        if (request_their_guardian) {
            const otherUserId = isUser1 ? user2_id : user1_id;
            const theirGuardianLink = await Guardian.findOne({
                where: { individual_id: otherUserId },
                include: [{
                    model: User,
                    as: 'guardianUser', // ✅ Fixed
                    attributes: ['id', 'name', 'email'],
                    required: false
                }]
            });

            if (theirGuardianLink?.guardianUser) { // ✅ Fixed
                if (isUser1) {
                    user2_guardian_id = theirGuardianLink.guardian_id;
                    user2Guardian = theirGuardianLink.guardianUser; // ✅ Fixed
                } else {
                    user1_guardian_id = theirGuardianLink.guardian_id;
                    user1Guardian = theirGuardianLink.guardianUser; // ✅ Fixed
                }
            }
        }

        // Generate meeting link immediately
        const meetingLink = SimpleMeetingService.createGoogleMeetLink();

        // Create meeting record
        const meeting = await Meeting.create({
            match_id,
            user1_id,
            user2_id,
            user1_guardian_id,
            user2_guardian_id,
            user1_guardian_attending: !!user1_guardian_id,
            user2_guardian_attending: !!user2_guardian_id,
            platform_team_attending: request_platform_team,
            platform_team_role: request_platform_team ? platform_team_role : null,
            proposed_by: userId,
            meeting_datetime: meetingDate.toISOString(), // ✅ Use validated date
            duration_minutes,
            timezone,
            meeting_type,
            meeting_link: meetingLink,
            agenda,
            location_name,
            location_address,
            status: 'proposed',
            user1_confirmed: isUser1,
            user2_confirmed: isUser2
        });

        // Prepare email data
        const attendees = [
            { name: proposer.name, email: proposer.email },
            { name: otherUser.name, email: otherUser.email }
        ];

        if (user1Guardian) {
            attendees.push({ name: user1Guardian.name, email: user1Guardian.email });
        }

        if (user2Guardian) {
            attendees.push({ name: user2Guardian.name, email: user2Guardian.email });
        }

        // ✅ GET ALL STAFF/ADMIN EMAILS FROM DATABASE
        if (request_platform_team) {
            const staffAndAdmins = await User.findAll({
                where: {
                    role: {
                        [Op.in]: ['staff', 'admin', 'super_admin']
                    },
                    email: {
                        [Op.ne]: null
                    }
                },
                attributes: ['name', 'email']
            });

            // Add all staff/admin to attendees
            staffAndAdmins.forEach(staff => {
                attendees.push({ name: staff.name, email: staff.email });
            });

            // Fallback to support email if no staff/admin found
            if (staffAndAdmins.length === 0) {
                attendees.push({
                    name: 'Platform Support',
                    email: process.env.PLATFORM_SUPPORT_EMAIL || 'support@marriagesunnah.com'
                });
            }
        }

        // Send invitation emails
        await EmailService.sendMeetingInvitationEmail({
            attendees,
            proposer_name: proposer.name,
            other_name: otherUser.name,
            meeting_datetime: meetingDate.toISOString(),
            startDateTime: meetingDate.toISOString(), // ✅ For ICS generation
            duration_minutes,
            duration: duration_minutes, // ✅ For ICS generation
            timezone,
            meeting_type,
            meeting_link: meetingLink,
            agenda
        });

        res.json({
            success: true,
            data: meeting,
            message: 'Meeting invitation sent successfully'
        });

    } catch (error) {
        console.error('Propose meeting error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to propose meeting',
            details: error
        });
    }
};

export const confirmMeeting = async (req, res) => {
    try {
        const userId = req.user.id;
        const { meeting_id } = req.params;

        const meeting = await Meeting.findByPk(meeting_id, {
            include: [
                { model: User, as: 'user1', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'user2', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'user1Guardian', attributes: ['id', 'name', 'email'], required: false },
                { model: User, as: 'user2Guardian', attributes: ['id', 'name', 'email'], required: false }
            ]
        });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        // Update confirmation status
        if (meeting.user1_id === userId) {
            meeting.user1_confirmed = true;
        } else if (meeting.user2_id === userId) {
            meeting.user2_confirmed = true;
        } else {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        await meeting.save();

        // If both confirmed, send confirmation emails
        if (meeting.user1_confirmed && meeting.user2_confirmed && meeting.status === 'proposed') {
            meeting.status = 'confirmed';
            await meeting.save();

            const attendees = [
                { name: meeting.user1.name, email: meeting.user1.email },
                { name: meeting.user2.name, email: meeting.user2.email }
            ];

            if (meeting.user1Guardian) {
                attendees.push({ name: meeting.user1Guardian.name, email: meeting.user1Guardian.email });
            }

            if (meeting.user2Guardian) {
                attendees.push({ name: meeting.user2Guardian.name, email: meeting.user2Guardian.email });
            }

            // ✅ GET ALL STAFF/ADMIN EMAILS FROM DATABASE
            if (meeting.platform_team_attending) {
                const staffAndAdmins = await User.findAll({
                    where: {
                        role: {
                            [Op.in]: ['staff', 'admin', 'super_admin']
                        },
                        email: {
                            [Op.ne]: null
                        }
                    },
                    attributes: ['name', 'email']
                });

                staffAndAdmins.forEach(staff => {
                    attendees.push({ name: staff.name, email: staff.email });
                });

                if (staffAndAdmins.length === 0) {
                    attendees.push({
                        name: 'Platform Support',
                        email: process.env.PLATFORM_SUPPORT_EMAIL || 'support@marriagesunnah.com'
                    });
                }
            }

            // Send confirmation emails
            await EmailService.sendMeetingConfirmationEmail({
                attendees,
                user1_name: meeting.user1.name,
                user2_name: meeting.user2.name,
                meeting_datetime: meeting.meeting_datetime,
                duration_minutes: meeting.duration_minutes,
                meeting_link: meeting.meeting_link,
                agenda: meeting.agenda
            });
        }

        res.json({
            success: true,
            data: meeting,
            message: meeting.status === 'confirmed'
                ? 'Meeting confirmed! All attendees notified.'
                : 'Your confirmation recorded. Waiting for the other person.'
        });

    } catch (error) {
        console.error('Confirm meeting error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to confirm meeting'
        });
    }
};

export const getUserMeetings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const whereClause = {
            [Op.or]: [
                { user1_id: userId },
                { user2_id: userId },
                { user1_guardian_id: userId },
                { user2_guardian_id: userId }
            ]
        };

        if (status && status !== 'all') {
            whereClause.status = status;
        }

        const meetings = await Meeting.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'user1', attributes: ['id', 'name', 'email', 'avatar_url'] },
                { model: User, as: 'user2', attributes: ['id', 'name', 'email', 'avatar_url'] },
                { model: User, as: 'user1Guardian', attributes: ['id', 'name', 'avatar_url'], required: false },
                { model: User, as: 'user2Guardian', attributes: ['id', 'name', 'avatar_url'], required: false }
            ],
            order: [['meeting_datetime', 'DESC']]
        });

        res.json({
            success: true,
            data: meetings
        });

    } catch (error) {
        console.error('Get meetings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meetings'
        });
    }
};

export const getMeetingDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { meeting_id } = req.params;

        const meeting = await Meeting.findByPk(meeting_id, {
            include: [
                { model: User, as: 'user1', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'user2', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'user1Guardian', attributes: ['id', 'name', 'email'], required: false },
                { model: User, as: 'user2Guardian', attributes: ['id', 'name', 'email'], required: false }
            ]
        });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        // Check authorization
        const isAuthorized =
            meeting.user1_id === userId ||
            meeting.user2_id === userId ||
            meeting.user1_guardian_id === userId ||
            meeting.user2_guardian_id === userId;

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        res.json({
            success: true,
            data: meeting
        });

    } catch (error) {
        console.error('Get meeting details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meeting details'
        });
    }
};

export const cancelMeeting = async (req, res) => {
    try {
        const userId = req.user.id;
        const { meeting_id } = req.params;
        const { reason } = req.body;

        const meeting = await Meeting.findByPk(meeting_id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        // Check authorization
        const isAuthorized =
            meeting.user1_id === userId ||
            meeting.user2_id === userId;

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        meeting.status = 'cancelled';
        meeting.cancelled_by = userId;
        meeting.cancellation_reason = reason;
        await meeting.save();

        res.json({
            success: true,
            data: meeting,
            message: 'Meeting cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel meeting error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel meeting'
        });
    }
};

export const rescheduleMeeting = async (req, res) => {
    try {
        const userId = req.user.id;
        const { meeting_id } = req.params;
        const { new_datetime, new_duration } = req.body;

        const meeting = await Meeting.findByPk(meeting_id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        // Check authorization
        const isAuthorized =
            meeting.user1_id === userId ||
            meeting.user2_id === userId;

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        meeting.meeting_datetime = new_datetime;
        meeting.duration_minutes = new_duration || meeting.duration_minutes;
        meeting.user1_confirmed = meeting.user1_id === userId;
        meeting.user2_confirmed = meeting.user2_id === userId;
        meeting.status = 'proposed';
        await meeting.save();

        res.json({
            success: true,
            data: meeting,
            message: 'Meeting rescheduled. Waiting for confirmation.'
        });

    } catch (error) {
        console.error('Reschedule meeting error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reschedule meeting'
        });
    }
};
