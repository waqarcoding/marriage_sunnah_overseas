// @ts-nocheck
import { useState, useEffect } from "react";
import {
    CheckCircle, XCircle, Eye, Image as ImageIcon, Clock, Award,
    Sparkles, X, AlertTriangle, MapPin, User as UserIcon, Calendar,
    ChevronLeft, ChevronRight, Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";

const PRIMARY = "#1B4D3E";

/* ─── User cell ─── */
function UserCell({ user }) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-white overflow-hidden flex-shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    : (user.name?.charAt(0)?.toUpperCase() || "U")}
            </div>
            <div className="min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{user.name}</div>
                <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
            </div>
        </div>
    );
}

/* ─── Document preview ─── */
function DocPreview({ url, label, onExpand }) {
    if (!url) {
        return (
            <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                    <ImageIcon size={11} /> {label}
                </div>
                <div className="w-full h-56 rounded-2xl flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 gap-2">
                    <ImageIcon size={32} className="text-gray-300" />
                    <p className="text-xs text-gray-400 font-medium">No image uploaded</p>
                </div>
            </div>
        );
    }
    return (
        <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <ImageIcon size={11} /> {label}
            </div>
            <button onClick={() => onExpand(url)}
                className="relative w-full group block rounded-2xl overflow-hidden border border-gray-200 hover:border-[#1B4D3E]/40 transition-colors">
                <img src={url} alt={label} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-xs font-bold text-[#1B4D3E]">
                        <Maximize2 size={12} /> Expand
                    </div>
                </div>
            </button>
        </div>
    );
}

export default function VerificationQueue() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [approveConfirm, setApproveConfirm] = useState(null);
    const [rejectConfirm, setRejectConfirm] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => { loadVerifications(); }, []);

    const loadVerifications = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getPendingVerifications();
            if (response.success) setVerifications(response.data);
        } catch {
            toast.error("Failed to load verifications");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!approveConfirm) return;
        try {
            const res = await AdminService.approveVerification(approveConfirm.id);
            if (res.success) {
                toast.success("Verification approved");
                setApproveConfirm(null);
                setSelectedUser(null);
                loadVerifications();
            }
        } catch { toast.error("Failed to approve verification"); }
    };

    const handleReject = async () => {
        if (!rejectConfirm) return;
        try {
            const res = await AdminService.rejectVerification(rejectConfirm.id, rejectReason || null);
            if (res.success) {
                toast.success("Verification rejected");
                setRejectConfirm(null);
                setRejectReason("");
                setSelectedUser(null);
                loadVerifications();
            }
        } catch { toast.error("Failed to reject verification"); }
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
                            <Sparkles size={11} /> Admin · Verifications
                        </div>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight"
                            style={{ letterSpacing: "-0.03em" }}>
                            ID Verification Queue
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Review and approve user identity verifications
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                                <Clock size={16} className="text-white" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Pending</div>
                                <div className="text-lg font-extrabold text-gray-900 leading-none" style={{ letterSpacing: "-0.02em" }}>
                                    {verifications.length.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 text-sm font-medium">Loading verifications…</p>
                        </div>
                    ) : verifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle size={36} className="text-green-600" />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 mb-1" style={{ letterSpacing: "-0.02em" }}>
                                All Caught Up!
                            </h3>
                            <p className="text-sm text-gray-500">No pending verifications at the moment</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">ID</th>
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">User</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Profile</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Location</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Documents</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Submitted</th>
                                            <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {verifications.map((user, i) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-[#f0f5f3]/40 hover:to-transparent transition-colors group"
                                            >
                                                <td className="px-5 py-3">
                                                    <span className="text-xs font-mono font-bold text-gray-400">#{user.id}</span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <UserCell user={user} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    {user.profile ? (
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <UserIcon size={11} className="text-gray-400 flex-shrink-0" />
                                                            <span className="text-gray-700 font-medium capitalize">{user.profile.gender || "—"}</span>
                                                            {user.profile.age && (
                                                                <span className="text-gray-400">· {user.profile.age}y</span>
                                                            )}
                                                        </div>
                                                    ) : <span className="text-xs text-gray-400">—</span>}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {user.profile?.city || user.profile?.country ? (
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                                                            <span className="text-gray-700 truncate max-w-[140px]">
                                                                {[user.profile.city, user.profile.country].filter(Boolean).join(", ")}
                                                            </span>
                                                        </div>
                                                    ) : <span className="text-xs text-gray-400">—</span>}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${user.frontid_url ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                                                            }`}>
                                                            {user.frontid_url ? <CheckCircle size={9} /> : <XCircle size={9} />} Front
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${user.backid_url ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                                                            }`}>
                                                            {user.backid_url ? <CheckCircle size={9} /> : <XCircle size={9} />} Back
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-xs text-gray-700 font-medium">{formatDate(user.created_at)}</div>
                                                    <div className="text-[10px] text-gray-400">{formatTime(user.created_at)}</div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <button onClick={() => setSelectedUser(user)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all hover:shadow-md hover:-translate-y-0.5"
                                                        style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                                        <Eye size={11} /> Review
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile card list */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {verifications.map((user) => (
                                    <div key={user.id} className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-mono font-bold text-gray-400">#{user.id}</span>
                                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                <Calendar size={11} /> {formatDate(user.created_at)}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <UserCell user={user} />
                                        </div>
                                        {user.profile && (
                                            <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] text-gray-600">
                                                {user.profile.gender && (
                                                    <span className="inline-flex items-center gap-1 capitalize">
                                                        <UserIcon size={11} /> {user.profile.gender}
                                                        {user.profile.age && ` · ${user.profile.age}y`}
                                                    </span>
                                                )}
                                                {(user.profile.city || user.profile.country) && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin size={11} />
                                                        {[user.profile.city, user.profile.country].filter(Boolean).join(", ")}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 mb-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${user.frontid_url ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                                                }`}>
                                                {user.frontid_url ? <CheckCircle size={9} /> : <XCircle size={9} />} Front ID
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${user.backid_url ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                                                }`}>
                                                {user.backid_url ? <CheckCircle size={9} /> : <XCircle size={9} />} Back ID
                                            </span>
                                        </div>
                                        <button onClick={() => setSelectedUser(user)}
                                            className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                                            style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                            <Eye size={14} /> Review Documents
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Review modal ── */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedUser(null)}
                        className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-extrabold text-white shadow-md"
                                        style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                        {selectedUser.avatar_url
                                            ? <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                            : (selectedUser.name?.charAt(0)?.toUpperCase() || "U")}
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-gray-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                                            {selectedUser.name}
                                        </div>
                                        <div className="text-xs text-gray-500">{selectedUser.email}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)}
                                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Profile summary */}
                                {selectedUser.profile && (
                                    <div className="bg-gradient-to-br from-[#f0f5f3] to-white rounded-2xl p-4 border border-[#1B4D3E]/10 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Gender</div>
                                            <div className="text-sm font-bold text-gray-900 capitalize">{selectedUser.profile.gender || "—"}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Age</div>
                                            <div className="text-sm font-bold text-gray-900">{selectedUser.profile.age ? `${selectedUser.profile.age} years` : "—"}</div>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Location</div>
                                            <div className="text-sm font-bold text-gray-900 truncate">
                                                {[selectedUser.profile.city, selectedUser.profile.country].filter(Boolean).join(", ") || "—"}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Documents grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DocPreview url={selectedUser.frontid_url} label="Front ID Document" onExpand={setLightbox} />
                                    <DocPreview url={selectedUser.backid_url} label="Back ID Document" onExpand={setLightbox} />
                                </div>

                                {/* Submitted info */}
                                <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                                    <Calendar size={12} />
                                    Submitted on {formatDate(selectedUser.created_at)} at {formatTime(selectedUser.created_at)}
                                </div>
                            </div>

                            {/* Actions footer */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
                                <button onClick={() => setRejectConfirm(selectedUser)}
                                    className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200">
                                    <XCircle size={16} /> Reject
                                </button>
                                <button onClick={() => setApproveConfirm(selectedUser)}
                                    className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white shadow-[0_4px_12px_rgba(16,185,129,0.30)] hover:-translate-y-0.5 transition-all"
                                    style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                                    <CheckCircle size={16} /> Approve
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Approve confirm ── */}
            <AnimatePresence>
                {approveConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setApproveConfirm(null)}
                        className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6"
                        >
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 bg-emerald-100 flex items-center justify-center">
                                <Award size={26} className="text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 text-center mb-2"
                                style={{ letterSpacing: "-0.02em" }}>
                                Approve verification?
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                                <strong className="text-gray-700">{approveConfirm.name}</strong> will be verified and receive bonus credits.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setApproveConfirm(null)}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleApprove}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white transition-colors shadow-[0_4px_12px_rgba(16,185,129,0.30)]"
                                    style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                                    Approve
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Reject confirm (with reason) ── */}
            <AnimatePresence>
                {rejectConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setRejectConfirm(null)}
                        className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6"
                        >
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 bg-red-100 flex items-center justify-center">
                                <AlertTriangle size={26} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 text-center mb-2"
                                style={{ letterSpacing: "-0.02em" }}>
                                Reject verification?
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-4">
                                <strong className="text-gray-700">{rejectConfirm.name}</strong>'s ID submission will be rejected.
                            </p>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                                Rejection reason (optional)
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                                placeholder="e.g. ID image is blurry, please re-upload…"
                                className="w-full px-3 py-2 mb-5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm bg-gray-50 focus:bg-white resize-none"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => { setRejectConfirm(null); setRejectReason(""); }}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleReject}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.30)]">
                                    Reject
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Image lightbox ── */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setLightbox(null)}
                        className="fixed inset-0 z-[10001] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <motion.img
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            src={lightbox} alt="Document"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                        <button onClick={() => setLightbox(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white">
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
