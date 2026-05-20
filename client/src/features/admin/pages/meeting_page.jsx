// @ts-nocheck
import { useState, useEffect } from "react";
import {
    Calendar, Users, Video, Phone, MapPin, Eye, Trash2,
    CheckCircle, XCircle, Clock, TrendingUp, Sparkles,
    ChevronLeft, ChevronRight, X, ExternalLink, AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import AdminMeetingService from "../../meeting/services/MeetingService.js";

const PRIMARY = "#1B4D3E";

/* ─── Status pill ─── */
function StatusPill({ status, size = "sm" }) {
    const map = {
        proposed: { bg: "#fef3c7", color: "#92400e", icon: Clock, label: "Proposed" },
        confirmed: { bg: "#dcfce7", color: "#166534", icon: CheckCircle, label: "Confirmed" },
        completed: { bg: "#f3f4f6", color: "#475569", icon: CheckCircle, label: "Completed" },
        cancelled: { bg: "#fee2e2", color: "#991b1b", icon: XCircle, label: "Cancelled" },
    };
    const s = map[status] || map.proposed;
    const Icon = s.icon;
    const pad = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide ${pad}`}
            style={{ background: s.bg, color: s.color }}>
            <Icon size={size === "xs" ? 10 : 11} />
            {s.label}
        </span>
    );
}

/* ─── Meeting type chip ─── */
function MeetingTypeChip({ type }) {
    const map = {
        video_call: { icon: Video, label: "Video Call", color: "#1d4ed8", bg: "#dbeafe" },
        phone: { icon: Phone, label: "Phone", color: "#059669", bg: "#dcfce7" },
        in_person: { icon: MapPin, label: "In Person", color: "#7c3aed", bg: "#ede9fe" },
    };
    const t = map[type] || { icon: Calendar, label: type, color: "#475569", bg: "#f1f5f9" };
    const Icon = t.icon;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
            style={{ background: t.bg, color: t.color }}>
            <Icon size={12} /> {t.label}
        </span>
    );
}

/* ─── Stat card ─── */
function StatCard({ title, value, icon: Icon, gradient, accent }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.05)] border border-gray-100 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.06] blur-2xl"
                style={{ background: accent }} />
            <div className="relative flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: gradient, boxShadow: `0 6px 16px ${accent}30` }}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
            <div className="relative">
                <div className="text-2xl font-extrabold text-gray-900 mb-1" style={{ letterSpacing: "-0.03em" }}>
                    {value?.toLocaleString?.() ?? value ?? 0}
                </div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</div>
            </div>
        </div>
    );
}

/* ─── Participants cell ─── */
function ParticipantsCell({ user1, user2 }) {
    const initial = (u) => u?.name?.charAt(0)?.toUpperCase() || "U";
    return (
        <div className="flex items-center gap-2 min-w-0">
            <div className="flex -space-x-2 flex-shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white border-2 border-white shadow-sm"
                    style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                    {initial(user1)}
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white border-2 border-white shadow-sm"
                    style={{ background: "linear-gradient(135deg,#059669,#047857)" }}>
                    {initial(user2)}
                </div>
            </div>
            <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{user1?.name || "—"}</div>
                <div className="text-[11px] text-gray-500 truncate">& {user2?.name || "—"}</div>
            </div>
        </div>
    );
}

export default function AdminMeetingsPage() {
    const [meetings, setMeetings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "all", page: 1, limit: 20 });
    const [pagination, setPagination] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => { loadData(); }, [filters]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [meetingsRes, statsRes] = await Promise.all([
                AdminMeetingService.getAllMeetings(filters),
                AdminMeetingService.getStats(),
            ]);
            if (meetingsRes.success) {
                setMeetings(meetingsRes.data);
                setPagination(meetingsRes.pagination);
            }
            if (statsRes.success) setStats(statsRes.data);
        } catch {
            toast.error("Failed to load meetings");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            const response = await AdminMeetingService.deleteMeeting(confirmDelete.id);
            if (response.success) {
                toast.success("Meeting deleted");
                setConfirmDelete(null);
                loadData();
            }
        } catch {
            toast.error("Failed to delete meeting");
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const formatTime = (d) =>
        new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f5f3] to-[#fafaf9] p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B4D3E]/10 text-[#1B4D3E] mb-2">
                            <Sparkles size={11} /> Admin · Meetings
                        </div>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight"
                            style={{ letterSpacing: "-0.03em" }}>
                            Meeting Management
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Monitor and manage all platform meetings
                        </p>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 text-sm font-medium">Loading meetings…</p>
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                <Calendar size={28} className="text-gray-300" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 mb-1">No meetings found</h3>
                            <p className="text-xs text-gray-400">No meetings match your current filters</p>
                            {filters.status !== "all" && (
                                <button onClick={() => setFilters({ ...filters, status: "all", page: 1 })}
                                    className="mt-3 text-xs font-bold text-[#1B4D3E] hover:underline">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">ID</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Participants</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Date & Time</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Duration</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Type</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                                            <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {meetings.map((meeting, i) => (
                                            <motion.tr
                                                key={meeting.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-[#f0f5f3]/40 hover:to-transparent transition-colors group"
                                            >
                                                <td className="px-5 py-3">
                                                    <span className="text-xs font-mono font-bold text-gray-400">
                                                        #{meeting.id}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <ParticipantsCell user1={meeting.user1} user2={meeting.user2} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-xs text-gray-700 font-semibold">{formatDate(meeting.meeting_datetime)}</div>
                                                    <div className="text-[10px] text-gray-400">{formatTime(meeting.meeting_datetime)}</div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-600">
                                                        <Clock size={10} /> {meeting.duration_minutes} min
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <MeetingTypeChip type={meeting.meeting_type} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <StatusPill status={meeting.status} />
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {meeting.meeting_link && (
                                                            <button
                                                                onClick={() => window.open(meeting.meeting_link, "_blank")}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white transition-colors"
                                                                title="Open meeting link"
                                                            >
                                                                <ExternalLink size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setConfirmDelete(meeting)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                            title="Delete meeting"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile card list */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {meetings.map((meeting) => (
                                    <div key={meeting.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-mono font-bold text-gray-400">#{meeting.id}</span>
                                            <StatusPill status={meeting.status} size="xs" />
                                        </div>
                                        <div className="mb-3">
                                            <ParticipantsCell user1={meeting.user1} user2={meeting.user2} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] text-gray-500">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar size={11} /> {formatDate(meeting.meeting_datetime)}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock size={11} /> {formatTime(meeting.meeting_datetime)} · {meeting.duration_minutes}m
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <MeetingTypeChip type={meeting.meeting_type} />
                                            <div className="flex items-center gap-1">
                                                {meeting.meeting_link && (
                                                    <button
                                                        onClick={() => window.open(meeting.meeting_link, "_blank")}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#1B4D3E] bg-[#1B4D3E]/10"
                                                    >
                                                        <ExternalLink size={11} /> Link
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setConfirmDelete(meeting)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-600 bg-red-50"
                                                >
                                                    <Trash2 size={11} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total_pages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                                    <div className="text-xs text-gray-500 font-medium">
                                        Showing <span className="font-bold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span>
                                        {" – "}
                                        <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                                        {" of "}
                                        <span className="font-bold text-gray-900">{pagination.total.toLocaleString()}</span> meetings
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                            disabled={pagination.page === 1}
                                            className="w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#1B4D3E]/30 transition-all flex items-center justify-center"
                                        >
                                            <ChevronLeft size={16} className="text-gray-600" />
                                        </button>
                                        <span className="text-xs font-bold text-gray-700 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                                            {pagination.page} <span className="text-gray-400">/</span> {pagination.total_pages}
                                        </span>
                                        <button
                                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                            disabled={pagination.page === pagination.total_pages}
                                            className="w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#1B4D3E]/30 transition-all flex items-center justify-center"
                                        >
                                            <ChevronRight size={16} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Delete confirm modal ── */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setConfirmDelete(null)}
                        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6"
                        >
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 bg-red-100 flex items-center justify-center">
                                <AlertTriangle size={26} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 text-center mb-2"
                                style={{ letterSpacing: "-0.02em" }}>
                                Delete meeting?
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                                Meeting <span className="font-mono font-bold">#{confirmDelete.id}</span> between{" "}
                                <strong className="text-gray-700">{confirmDelete.user1?.name}</strong> and{" "}
                                <strong className="text-gray-700">{confirmDelete.user2?.name}</strong> will be permanently removed.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmDelete(null)}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleDelete}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.30)]">
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
