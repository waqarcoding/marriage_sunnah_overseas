// server/routes/meeting.routes.js

import express from 'express';
import * as MeetingController from '../controllers/meeting.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Propose a new meeting
router.post('/propose', MeetingController.proposeMeeting);

// Confirm a meeting
router.post('/:meeting_id/confirm', MeetingController.confirmMeeting);

// Get user's meetings
router.get('/my-meetings', MeetingController.getUserMeetings);

// Get meeting details
router.get('/:meeting_id', MeetingController.getMeetingDetails);

// Cancel meeting
router.post('/:meeting_id/cancel', MeetingController.cancelMeeting);

// Reschedule meeting
router.post('/:meeting_id/reschedule', MeetingController.rescheduleMeeting);


export default router;