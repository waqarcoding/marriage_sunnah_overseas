import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Clock, Users, MapPin, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import MeetingService from "../services/meetingservice";

export default function ScheduleMeetingModal({
    isOpen,
    onClose,
    matchId,
    receiverInfo
}) {
    const [formData, setFormData] = useState({
        meeting_datetime: '',
        duration_minutes: 60,
        timezone: 'Asia/Karachi',
        meeting_type: 'video_call',
        include_my_guardian: false,
        request_their_guardian: false,
        request_platform_team: false,
        platform_team_role: 'moderator',
        agenda: '',
        location_name: '',
        location_address: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(18, 0, 0, 0);
            setFormData(prev => ({
                ...prev,
                meeting_datetime: tomorrow.toISOString().slice(0, 16)
            }));
        }
    }, [isOpen]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!matchId) {
            toast.error("Match ID is missing");
            return;
        }
        try {
            setLoading(true);
            const response = await MeetingService.proposeMeeting({
                match_id: matchId,
                ...formData
            });
            if (response.success) {
                toast.success("Meeting invitation sent!");
                onClose();
                setFormData({
                    meeting_datetime: '',
                    duration_minutes: 60,
                    timezone: 'Asia/Karachi',
                    meeting_type: 'video_call',
                    include_my_guardian: false,
                    request_their_guardian: false,
                    request_platform_team: false,
                    platform_team_role: 'moderator',
                    agenda: '',
                    location_name: '',
                    location_address: ''
                });
            }
        } catch (error) {
            toast.error(error.message || "Failed to schedule meeting");
        } finally {
            setLoading(false);
        }
    };

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop — fixed, covers everything including appbar/sidebar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 999998,
                            backgroundColor: "rgba(0,0,0,0.55)",
                            backdropFilter: "blur(4px)",
                            WebkitBackdropFilter: "blur(4px)",
                        }}
                    />

                    {/* Centering container — fixed, full viewport, above backdrop */}
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 999999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "16px",
                            pointerEvents: "none", // let backdrop receive clicks
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                pointerEvents: "auto",
                                backgroundColor: "#fff",
                                borderRadius: "24px",
                                width: "100%",
                                maxWidth: "640px",
                                maxHeight: "90dvh",
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                                boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
                            }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)",
                                    padding: "16px 24px",
                                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                                    flexShrink: 0,
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                            <Calendar size={24} color="white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold" style={{ color: "#fff" }}>
                                                Schedule Meeting
                                            </h2>
                                            <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                                                with {receiverInfo?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                                        style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable form body */}
                            <div style={{ overflowY: "auto", flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

                                {/* Date & Time */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Calendar size={16} color="#1B4D3E" />
                                        Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.meeting_datetime}
                                        onChange={(e) => setFormData({ ...formData, meeting_datetime: e.target.value })}
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 outline-none transition-all"
                                        style={{ borderColor: "#e5e7eb" }}
                                        onFocus={e => e.target.style.borderColor = "#1B4D3E"}
                                        onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Clock size={16} color="#1B4D3E" />
                                        Duration
                                    </label>
                                    <select
                                        value={formData.duration_minutes}
                                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 outline-none transition-all"
                                        style={{ borderColor: "#e5e7eb" }}
                                        onFocus={e => e.target.style.borderColor = "#1B4D3E"}
                                        onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                                    >
                                        <option value={30}>30 minutes</option>
                                        <option value={60}>1 hour</option>
                                        <option value={90}>1.5 hours</option>
                                        <option value={120}>2 hours</option>
                                    </select>
                                </div>

                                {/* Meeting Type */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Users size={16} color="#1B4D3E" />
                                        Meeting Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { value: 'video_call', label: '🎥 Video Call', desc: 'jitsi Meet' },
                                            { value: 'phone', label: '📞 Voice Call', desc: 'Voice only' },
                                            { value: 'in_person', label: '🤝 In Person', desc: 'Physical meeting' }
                                        ].map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, meeting_type: type.value })}
                                                className="p-3 rounded-xl border-2 transition-all text-left"
                                                style={{
                                                    borderColor: formData.meeting_type === type.value ? "#1B4D3E" : "#e5e7eb",
                                                    background: formData.meeting_type === type.value ? "#f0fdf4" : "#fff",
                                                }}
                                            >
                                                <div className="font-semibold text-gray-900 text-sm">{type.label}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{type.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location (in-person only) */}
                                {formData.meeting_type === 'in_person' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <MapPin size={16} color="#1B4D3E" />
                                                Location Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.location_name}
                                                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                                placeholder="e.g., Starbucks Downtown"
                                                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 outline-none transition-all"
                                                onFocus={e => e.target.style.borderColor = "#1B4D3E"}
                                                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Address</label>
                                            <input
                                                type="text"
                                                value={formData.location_address}
                                                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                                                placeholder="Full address"
                                                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 outline-none transition-all"
                                                onFocus={e => e.target.style.borderColor = "#1B4D3E"}
                                                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Optional Attendees */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Users size={16} color="#1B4D3E" />
                                        Optional Attendees
                                    </label>
                                    <div className="space-y-3">
                                        {[
                                            { key: "include_my_guardian", title: "Include my guardian", desc: "Your guardian will attend the meeting" },
                                            { key: "request_their_guardian", title: "Request their guardian", desc: "Ask for their guardian to attend" },
                                            { key: "request_platform_team", title: "Request platform moderator", desc: "Platform team member will join as observer" },
                                        ].map(({ key, title, desc }) => (
                                            <label
                                                key={key}
                                                className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer transition-all"
                                                style={{ borderColor: formData[key] ? "#1B4D3E" : "#e5e7eb", background: formData[key] ? "#f0fdf4" : "#fff" }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData[key]}
                                                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                                                    className="w-5 h-5 rounded"
                                                    style={{ accentColor: "#1B4D3E" }}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 text-sm">{title}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Agenda */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <FileText size={16} color="#1B4D3E" />
                                        Agenda (Optional)
                                    </label>
                                    <textarea
                                        value={formData.agenda}
                                        onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                                        placeholder="What would you like to discuss?"
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none transition-all resize-none"
                                        onFocus={e => e.target.style.borderColor = "#1B4D3E"}
                                        onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                                    />
                                </div>

                                {/* Info Banner */}
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle size={20} color="#2563eb" className="flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-blue-900 mb-1">Meeting invitation will be sent</p>
                                        <p className="text-blue-700">The other person will receive an email invitation and can confirm or propose a different time.</p>
                                    </div>
                                </div>

                            </div>

                            {/* Footer */}
                            <div
                                className="flex gap-3 px-6 py-4"
                                style={{ borderTop: "1px solid #f3f4f6", flexShrink: 0 }}
                            >
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl font-semibold text-gray-700 border-2 border-gray-200 transition-all"
                                    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                                    onMouseLeave={e => e.currentTarget.style.background = ""}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.meeting_datetime}
                                    className="flex-1 h-12 rounded-xl font-semibold text-white transition-all"
                                    style={{
                                        background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)",
                                        opacity: (loading || !formData.meeting_datetime) ? 0.5 : 1,
                                        cursor: (loading || !formData.meeting_datetime) ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {loading ? "Sending…" : "Send Invitation"}
                                </button>
                            </div>

                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );

    return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
