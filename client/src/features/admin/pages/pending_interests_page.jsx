// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, Filter, Heart, Eye, ChevronLeft, ChevronRight,
    Calendar, Shield, Clock, CheckCircle, XCircle, X, Star, Sparkles, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";

const PRIMARY = "#1B4D3E";

/* ─── Status pill ─── */
function StatusPill({ status, size = "sm" }) {
    const map = {
        pending: { bg: "#fef3c7", color: "#92400e", icon: Clock, label: "Pending" },
        accepted: { bg: "#dcfce7", color: "#166534", icon: CheckCircle, label: "Accepted" },
        declined: { bg: "#fee2e2", color: "#991b1b", icon: XCircle, label: "Declined" },
    };
    const s = map[status] || map.pending;
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

/* ─── User cell ─── */
function UserCell({ user, gradient, navigate }) {
    if (!user) return <span className="text-xs text-gray-400">—</span>;
    return (
        <button
            onClick={() => navigate(`/admin/users/${user.id}`)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left group min-w-0"
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-white overflow-hidden flex-shrink-0 shadow-sm"
                style={{ background: gradient }}
            >
                {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    : (user.name?.charAt(0)?.toUpperCase() || "U")}
            </div>
            <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-[#1B4D3E] transition-colors">
                    {user.name || "—"}
                </div>
                <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
            </div>
        </button>
    );
}

/* ─── Guardian status mini ─── */
function GuardianMini({ status }) {
    if (!status) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                <Shield size={10} /> None
            </span>
        );
    }
    const colorMap = {
        pending: "text-amber-700 bg-amber-50",
        accepted: "text-green-700 bg-green-50",
        declined: "text-red-700 bg-red-50",
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${colorMap[status] || colorMap.pending}`}>
            <Shield size={9} /> {status}
        </span>
    );
}

export default function PendingInterestsPage() {
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ status: "", guardianStatus: "" });
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [selectedInterest, setSelectedInterest] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    // ✅ Hide destructive actions for staff
    const currentUserRole = (() => {
        try {
            const authData = JSON.parse(localStorage.getItem("authData") || "{}");
            return authData?.user?.role || authData?.role || "";
        } catch { return ""; }
    })();
    const canDelete = currentUserRole !== "staff";

    useEffect(() => { loadInterests(); }, [pagination.page, filters]);

    const loadInterests = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search,
                ...filters,
            };
            const response = await AdminService.getPendingInterests(params);
            if (response.success) {
                setInterests(response.data.interests);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages,
                }));
            }
        } catch {
            toast.error("Failed to load interests");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadInterests();
    };

    const handleClearFilters = () => {
        setFilters({ status: "", guardianStatus: "" });
        setSearch("");
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            const res = await AdminService.deleteInterest(deleteConfirm.id);
            if (res.success) {
                toast.success("Interest deleted");
                // Remove from local state immediately so the row slides out
                setInterests(prev => prev.filter(it => it.id !== deleteConfirm.id));
                setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                setDeleteConfirm(null);
                // Also close detail modal if open for the same interest
                if (selectedInterest?.id === deleteConfirm.id) setSelectedInterest(null);
            } else {
                toast.error(res.message || "Failed to delete interest");
            }
        } catch (err) {
            toast.error(err?.message || "Failed to delete interest");
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    const formatTime = (d) =>
        new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const hasActiveFilters = filters.status || filters.guardianStatus || search;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f5f3] to-[#fafaf9] p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B4D3E]/10 text-[#1B4D3E] mb-2">
                            <Sparkles size={11} /> Admin · Interests
                        </div>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight"
                            style={{ letterSpacing: "-0.03em" }}>
                            Pending Interests
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Monitor all interest requests and guardian approvals
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#ec4899,#f472b6)" }}>
                                <Heart size={16} className="text-white" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total</div>
                                <div className="text-lg font-extrabold text-gray-900 leading-none" style={{ letterSpacing: "-0.02em" }}>
                                    {pagination.total.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Search + Filter Bar ── */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by user name or email…"
                                className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/10 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-11 px-6 rounded-xl font-bold text-white text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-11 px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${showFilters
                                ? "bg-[#1B4D3E] text-white shadow-[0_4px_12px_rgba(27,77,62,0.25)]"
                                : "bg-gray-50 text-[#1B4D3E] border border-gray-200 hover:bg-gray-100"
                                }`}
                        >
                            <Filter size={16} />
                            <span className="hidden sm:inline">Filters</span>
                            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </button>
                    </form>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 mt-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Status</label>
                                        <select value={filters.status}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                            <option value="">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="declined">Declined</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Guardian Status</label>
                                        <select value={filters.guardianStatus}
                                            onChange={(e) => setFilters({ ...filters, guardianStatus: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                            <option value="">All Guardian Status</option>
                                            <option value="pending">Guardian Pending</option>
                                            <option value="accepted">Guardian Accepted</option>
                                            <option value="declined">Guardian Declined</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button onClick={handleClearFilters}
                                            className="w-full h-10 px-4 rounded-lg text-sm font-bold text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
                                            <X size={14} /> Clear All
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 text-sm font-medium">Loading interests…</p>
                        </div>
                    ) : interests.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                <Heart size={28} className="text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">No pending interests found</p>
                            {hasActiveFilters && (
                                <button onClick={handleClearFilters}
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
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">From</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">To</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Guardians</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Flags</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Created</th>
                                            <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence initial={false}>
                                            {interests.map((interest, i) => (
                                                <motion.tr
                                                    key={interest.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                                                    transition={{ delay: i * 0.02 }}
                                                    className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-[#f0f5f3]/40 hover:to-transparent transition-colors group"
                                                >
                                                    <td className="px-5 py-3">
                                                        <span className="text-xs font-mono font-bold text-gray-400">
                                                            #{interest.id}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <UserCell user={interest.fromUser}
                                                            gradient="linear-gradient(135deg,#1B4D3E,#2d7a63)"
                                                            navigate={navigate} />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <UserCell user={interest.toUser}
                                                            gradient="linear-gradient(135deg,#ec4899,#db2777)"
                                                            navigate={navigate} />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <StatusPill status={interest.status} />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] text-gray-400 font-bold w-7">FROM</span>
                                                                <GuardianMini status={interest.from_guardian_status} />
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] text-gray-400 font-bold w-7">TO</span>
                                                                <GuardianMini status={interest.to_guardian_status} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {interest.is_super_like && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">
                                                                    <Star size={9} /> Super
                                                                </span>
                                                            )}
                                                            {interest.is_mutual && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-700">
                                                                    ✓ Mutual
                                                                </span>
                                                            )}
                                                            {interest.both_guardians_approved && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                                                    <Shield size={9} /> Both G
                                                                </span>
                                                            )}
                                                            {interest.both_users_approved && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">
                                                                    <CheckCircle size={9} /> Both U
                                                                </span>
                                                            )}
                                                            {!interest.is_super_like && !interest.is_mutual && !interest.both_guardians_approved && !interest.both_users_approved && (
                                                                <span className="text-[10px] text-gray-300">—</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="text-xs text-gray-700 font-medium">{formatDate(interest.created_at)}</div>
                                                        <div className="text-[10px] text-gray-400">{formatTime(interest.created_at)}</div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => setSelectedInterest(interest)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white transition-colors"
                                                                title="View Details">
                                                                <Eye size={14} />
                                                            </button>
                                                            {canDelete && (
                                                                <button onClick={() => setDeleteConfirm(interest)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                                                    title="Delete Interest">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile card list */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                <AnimatePresence initial={false}>
                                    {interests.map((interest) => (
                                        <motion.div key={interest.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                                            className="p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-mono font-bold text-gray-400">#{interest.id}</span>
                                                <StatusPill status={interest.status} size="xs" />
                                            </div>
                                            <div className="space-y-2 mb-3">
                                                <div>
                                                    <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">From</div>
                                                    <UserCell user={interest.fromUser}
                                                        gradient="linear-gradient(135deg,#1B4D3E,#2d7a63)"
                                                        navigate={navigate} />
                                                </div>
                                                <div>
                                                    <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">To</div>
                                                    <UserCell user={interest.toUser}
                                                        gradient="linear-gradient(135deg,#ec4899,#db2777)"
                                                        navigate={navigate} />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <span className="text-[11px] text-gray-500">{formatDate(interest.created_at)}</span>
                                                <div className="flex gap-1">
                                                    <button onClick={() => setSelectedInterest(interest)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1B4D3E] bg-[#1B4D3E]/10">
                                                        <Eye size={11} /> Details
                                                    </button>
                                                    {canDelete && (
                                                        <button onClick={() => setDeleteConfirm(interest)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-red-100">
                                                            <Trash2 size={11} /> Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                                <div className="text-xs text-gray-500 font-medium">
                                    Showing <span className="font-bold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span>
                                    {" – "}
                                    <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                                    {" of "}
                                    <span className="font-bold text-gray-900">{pagination.total.toLocaleString()}</span> interests
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#1B4D3E]/30 transition-all flex items-center justify-center">
                                        <ChevronLeft size={16} className="text-gray-600" />
                                    </button>
                                    <span className="text-xs font-bold text-gray-700 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                                        {pagination.page} <span className="text-gray-400">/</span> {pagination.totalPages}
                                    </span>
                                    <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#1B4D3E]/30 transition-all flex items-center justify-center">
                                        <ChevronRight size={16} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ── */}
            <AnimatePresence>
                {selectedInterest && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedInterest(null)}
                        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center">
                                        <Heart size={20} className="text-pink-600" />
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-gray-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                                            Interest Request #{selectedInterest.id}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                            <Calendar size={11} />
                                            {formatDate(selectedInterest.created_at)} · {formatTime(selectedInterest.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedInterest(null)}
                                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <StatusPill status={selectedInterest.status} />
                                    {selectedInterest.is_super_like && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                                            <Star size={11} /> Super Like
                                        </span>
                                    )}
                                    {selectedInterest.is_mutual && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                                            🎉 Mutual Match
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">From</div>
                                        <UserCell user={selectedInterest.fromUser}
                                            gradient="linear-gradient(135deg,#1B4D3E,#2d7a63)"
                                            navigate={navigate} />
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                                                <Shield size={12} /> Guardian
                                            </span>
                                            <GuardianMini status={selectedInterest.from_guardian_status} />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">To</div>
                                        <UserCell user={selectedInterest.toUser}
                                            gradient="linear-gradient(135deg,#ec4899,#db2777)"
                                            navigate={navigate} />
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                                                <Shield size={12} /> Guardian
                                            </span>
                                            <GuardianMini status={selectedInterest.to_guardian_status} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#f0f5f3] to-white rounded-2xl p-4 border border-[#1B4D3E]/10">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D3E] mb-3">Approval Status</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={`p-3 rounded-xl flex items-center gap-2 ${selectedInterest.both_guardians_approved ? "bg-emerald-50 border border-emerald-200" : "bg-white border border-gray-200"}`}>
                                            <Shield size={16} className={selectedInterest.both_guardians_approved ? "text-emerald-600" : "text-gray-400"} />
                                            <div className="min-w-0">
                                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Both Guardians</div>
                                                <div className={`text-sm font-bold ${selectedInterest.both_guardians_approved ? "text-emerald-700" : "text-gray-400"}`}>
                                                    {selectedInterest.both_guardians_approved ? "Approved" : "Not yet"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-xl flex items-center gap-2 ${selectedInterest.both_users_approved ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-200"}`}>
                                            <CheckCircle size={16} className={selectedInterest.both_users_approved ? "text-blue-600" : "text-gray-400"} />
                                            <div className="min-w-0">
                                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Both Users</div>
                                                <div className={`text-sm font-bold ${selectedInterest.both_users_approved ? "text-blue-700" : "text-gray-400"}`}>
                                                    {selectedInterest.both_users_approved ? "Approved" : "Not yet"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal footer with delete button */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-2">
                                <button onClick={() => setSelectedInterest(null)}
                                    className={`${canDelete ? "flex-1" : "w-full"} h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors`}>
                                    Close
                                </button>
                                {canDelete && (
                                    <button onClick={() => setDeleteConfirm(selectedInterest)}
                                        className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-[0_4px_12px_rgba(220,38,38,0.30)] flex items-center justify-center gap-1.5">
                                        <Trash2 size={14} /> Delete Interest
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete confirm modal ── */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => !deleting && setDeleteConfirm(null)}
                        className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6"
                        >
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 bg-red-100 flex items-center justify-center">
                                <Trash2 size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 text-center mb-2"
                                style={{ letterSpacing: "-0.02em" }}>
                                Delete interest?
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                                Interest request{" "}
                                <span className="font-mono font-bold text-gray-700">#{deleteConfirm.id}</span> from{" "}
                                <strong className="text-gray-700">{deleteConfirm.fromUser?.name || "—"}</strong> to{" "}
                                <strong className="text-gray-700">{deleteConfirm.toUser?.name || "—"}</strong> will be permanently removed.
                                <br />
                                <span className="text-red-600 font-semibold">This action cannot be undone.</span>
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-[0_4px_12px_rgba(220,38,38,0.30)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {deleting ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Deleting…
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={14} /> Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
