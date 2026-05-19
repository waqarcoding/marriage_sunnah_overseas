// CREATE: client/src/features/admin/pages/AdminMeetingsPage.jsx

import { useState, useEffect } from "react";
import { Calendar, Users, Video, Phone, MapPin, Eye, Trash2, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import AdminMeetingService from "../../meeting/services/meetingservice";


export default function AdminMeetingsPage() {
    const [meetings, setMeetings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        page: 1,
        limit: 20
    });
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [meetingsRes, statsRes] = await Promise.all([
                AdminMeetingService.getAllMeetings(filters),
                AdminMeetingService.getStats()
            ]);

            if (meetingsRes.success) {
                setMeetings(meetingsRes.data);
                setPagination(meetingsRes.pagination);
            }

            if (statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (error) {
            toast.error('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (meetingId, newStatus) => {
        try {
            const response = await AdminMeetingService.updateStatus(meetingId, newStatus);
            if (response.success) {
                toast.success('Meeting status updated');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (meetingId) => {
        if (!confirm('Are you sure you want to delete this meeting?')) return;

        try {
            const response = await AdminMeetingService.deleteMeeting(meetingId);
            if (response.success) {
                toast.success('Meeting deleted');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to delete meeting');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b bg-white">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900">Meeting Management</h1>
                    <p className="text-gray-600 mt-1">Monitor and manage all platform meetings</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="flex-shrink-0 p-6 bg-white border-b">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Meetings"
                            value={stats.total}
                            icon={Calendar}
                            color="blue"
                        />
                        <StatCard
                            title="Upcoming"
                            value={stats.upcoming}
                            icon={TrendingUp}
                            color="green"
                        />
                        <StatCard
                            title="Completed"
                            value={stats.by_status.completed}
                            icon={CheckCircle}
                            color="gray"
                        />
                        <StatCard
                            title="With Platform Team"
                            value={stats.with_platform_team}
                            icon={Users}
                            color="purple"
                        />
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex-shrink-0 p-6 bg-white border-b">
                <div className="max-w-7xl mx-auto flex gap-4">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="proposed">Proposed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Meetings Table */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading meetings...</p>
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No meetings found</h3>
                            <p className="text-gray-500">No meetings match your current filters</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Participants</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {meetings.map((meeting) => (
                                            <MeetingRow
                                                key={meeting.id}
                                                meeting={meeting}
                                                onStatusUpdate={handleStatusUpdate}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total_pages > 1 && (
                                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} meetings
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                            disabled={pagination.page === 1}
                                            className="px-4 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                            disabled={pagination.page === pagination.total_pages}
                                            className="px-4 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        gray: 'bg-gray-100 text-gray-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}

function MeetingRow({ meeting, onStatusUpdate, onDelete }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMeetingTypeIcon = () => {
        switch (meeting.meeting_type) {
            case 'video_call': return <Video size={16} className="text-blue-600" />;
            case 'phone': return <Phone size={16} className="text-green-600" />;
            case 'in_person': return <MapPin size={16} className="text-purple-600" />;
            default: return <Calendar size={16} />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            proposed: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
            completed: 'bg-gray-100 text-gray-700'
        };

        return (
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
                <span className="text-sm font-mono text-gray-600">#{meeting.id}</span>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm">
                    <p className="font-semibold text-gray-900">{meeting.user1.name}</p>
                    <p className="text-gray-500">& {meeting.user2.name}</p>
                </div>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-900">{formatDate(meeting.meeting_datetime)}</p>
                <p className="text-xs text-gray-500">{meeting.duration_minutes} min</p>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {getMeetingTypeIcon()}
                    <span className="text-sm capitalize">{meeting.meeting_type.replace('_', ' ')}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                {getStatusBadge(meeting.status)}
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => window.open(meeting.meeting_link, '_blank')}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        title="View meeting link"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(meeting.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Delete meeting"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}