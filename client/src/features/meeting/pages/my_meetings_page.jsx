import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, Video, Phone, X, Check, AlertCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import MeetingService from "../services/meetingservice";

export default function MyMeetingsPage() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        try {
            setLoading(true);
            const response = await MeetingService.getMyMeetings('all');
            if (response.success) {
                // ✅ Filter out expired meetings completely
                const now = new Date();
                const activeMeetings = response.data.filter(meeting => {
                    const meetingDate = new Date(meeting.meeting_datetime);
                    const meetingEndTime = new Date(meetingDate.getTime() + meeting.duration_minutes * 60000);
                    // Only show meetings that haven't ended yet
                    return meetingEndTime > now;
                });
                setMeetings(activeMeetings);
            }
        } catch (error) {
            toast.error('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (meetingId) => {
        try {
            const response = await MeetingService.confirmMeeting(meetingId);
            if (response.success) {
                toast.success(response.message);
                loadMeetings();
            }
        } catch (error) {
            toast.error('Failed to confirm meeting');
        }
    };

    const handleCancel = async (meetingId) => {
        const reason = prompt('Reason for cancellation (optional):');
        if (reason === null) return;

        try {
            const response = await MeetingService.cancelMeeting(meetingId, reason);
            if (response.success) {
                toast.success('Meeting cancelled');
                loadMeetings();
            }
        } catch (error) {
            toast.error('Failed to cancel meeting');
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const getStatusBadge = (status) => {
        const styles = {
            proposed: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            confirmed: { bg: 'bg-green-100', text: 'text-green-700', icon: Check },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: X },
            completed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Check }
        };

        const style = styles[status] || styles.proposed;
        const Icon = style.icon;

        return (
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${style.bg} ${style.text} inline-flex items-center gap-1`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} className="text-gray-700" />
                        </button>

                        {/* Title */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Meetings</h1>
                            <p className="text-gray-600 mt-1">View your scheduled meetings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="bg-white rounded-3xl p-12 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading meetings...</p>
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center">
                            <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming meetings</h3>
                            <p className="text-gray-500">Your scheduled meetings will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {meetings.map((meeting) => (
                                <MeetingCard
                                    key={meeting.id}
                                    meeting={meeting}
                                    onConfirm={handleConfirm}
                                    onCancel={handleCancel}
                                    formatDateTime={formatDateTime}
                                    getStatusBadge={getStatusBadge}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MeetingCard({ meeting, onConfirm, onCancel, formatDateTime, getStatusBadge }) {
    const { date, time } = formatDateTime(meeting.meeting_datetime);
    const currentUserId = parseInt(localStorage.getItem('userId'));
    const isUser1 = meeting.user1_id === currentUserId;
    const otherUser = isUser1 ? meeting.user2 : meeting.user1;

    const getMeetingTypeIcon = () => {
        switch (meeting.meeting_type) {
            case 'video_call': return <Video size={16} />;
            case 'phone': return <Phone size={16} />;
            case 'in_person': return <MapPin size={16} />;
            default: return <Calendar size={16} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden hover:shadow-lg transition-all"
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                        >
                            {otherUser.avatar_url ? (
                                <img
                                    src={otherUser.avatar_url}
                                    alt={otherUser.name}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                otherUser.name?.charAt(0)?.toUpperCase()
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Meeting with {otherUser.name}</h3>
                            <p className="text-sm text-gray-500">ID: #{meeting.id}</p>
                        </div>
                    </div>
                    {getStatusBadge(meeting.status)}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-[#1B4D3E]" />
                        <span className="font-medium text-gray-900">{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-[#1B4D3E]" />
                        <span className="font-medium text-gray-900">{time} ({meeting.duration_minutes} min)</span>
                    </div>
                </div>

                {/* Meeting Type */}
                <div className="flex items-center gap-2 text-sm mb-4 px-3 py-2 bg-gray-50 rounded-xl w-fit">
                    {getMeetingTypeIcon()}
                    <span className="font-medium text-gray-900 capitalize">{meeting.meeting_type.replace('_', ' ')}</span>
                </div>

                {/* Attendees */}
                {(meeting.user1_guardian_attending || meeting.user2_guardian_attending || meeting.platform_team_attending) && (
                    <div className="mb-4">
                        <div className="text-xs font-semibold text-gray-600 mb-2">Optional Attendees:</div>
                        <div className="flex flex-wrap gap-2">
                            {meeting.user1_guardian_attending && (
                                <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs">Guardian (User 1)</span>
                            )}
                            {meeting.user2_guardian_attending && (
                                <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs">Guardian (User 2)</span>
                            )}
                            {meeting.platform_team_attending && (
                                <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs">Platform Moderator</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Agenda */}
                {meeting.agenda && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                        <div className="text-xs font-semibold text-gray-600 mb-1">Agenda:</div>
                        <p className="text-sm text-gray-700">{meeting.agenda}</p>
                    </div>
                )}

                {/* Meeting Link */}
                {meeting.meeting_link && (
                    <a
                        href={meeting.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
                        style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                    >
                        <Video size={18} />
                        Join Meeting
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>
        </motion.div>
    );
}