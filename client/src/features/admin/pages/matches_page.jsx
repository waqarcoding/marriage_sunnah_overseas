// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, Heart, Eye, ChevronLeft, ChevronRight,
    Calendar, Sparkles, X, ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";

const PRIMARY = "#1B4D3E";

/* ─── User cell ─── */
function UserCell({ user, gradient, navigate, align = "left" }) {
    if (!user) return <span className="text-xs text-gray-400">—</span>;
    return (
        <button
            onClick={() => navigate(`/admin/users/${user.id}`)}
            className={`flex items-center gap-3 hover:opacity-80 transition-opacity group min-w-0 ${align === "right" ? "flex-row-reverse text-right" : "text-left"}`}
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

export default function MatchesPage() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [selectedMatch, setSelectedMatch] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { loadMatches(); }, [pagination.page]);

    const loadMatches = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: pagination.limit, search };
            const response = await AdminService.getMatches(params);
            if (response.success) {
                setMatches(response.data.matches);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages,
                }));
            }
        } catch {
            toast.error("Failed to load matches");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadMatches();
    };

    const handleClearSearch = () => {
        setSearch("");
        setPagination(prev => ({ ...prev, page: 1 }));
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
                            <Sparkles size={11} /> Admin · Matches
                        </div>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight"
                            style={{ letterSpacing: "-0.03em" }}>
                            Successful Matches
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Love connections made on the platform
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                <Heart size={16} className="text-white fill-white" />
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

                {/* ── Search Bar ── */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search couples by name or email…"
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
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="h-11 px-4 rounded-xl font-bold text-sm bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-1.5"
                            >
                                <X size={14} /> Clear
                            </button>
                        )}
                    </form>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 text-sm font-medium">Finding love stories…</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                <Heart size={28} className="text-gray-300" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 mb-1">No matches yet</h3>
                            <p className="text-xs text-gray-400">Love connections will appear here</p>
                            {search && (
                                <button onClick={handleClearSearch}
                                    className="mt-3 text-xs font-bold text-[#1B4D3E] hover:underline">
                                    Clear search
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
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">User One</th>
                                            <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Match</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">User Two</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Matched On</th>
                                            <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matches.map((match, i) => (
                                            <motion.tr
                                                key={match.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-[#f0f5f3]/40 hover:to-transparent transition-colors group"
                                            >
                                                <td className="px-5 py-3">
                                                    <span className="text-xs font-mono font-bold text-gray-400">
                                                        #{match.id}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <UserCell
                                                        user={match.user_one}
                                                        gradient="linear-gradient(135deg,#1B4D3E,#2d7a63)"
                                                        navigate={navigate}
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center justify-center">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-[#1B4D3E] rounded-full animate-ping opacity-15" />
                                                            <div className="relative w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                                                                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                                                <Heart size={14} className="text-white fill-white" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <UserCell
                                                        user={match.user_two}
                                                        gradient="linear-gradient(135deg,#059669,#047857)"
                                                        navigate={navigate}
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-xs text-gray-700 font-medium">{formatDate(match.created_at)}</div>
                                                    <div className="text-[10px] text-gray-400">{formatTime(match.created_at)}</div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <button
                                                        onClick={() => setSelectedMatch(match)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#1B4D3E] bg-[#1B4D3E]/10 hover:bg-[#1B4D3E] hover:text-white transition-colors"
                                                    >
                                                        <Eye size={11} /> View
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile card list */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {matches.map((match) => (
                                    <div key={match.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-mono font-bold text-gray-400">#{match.id}</span>
                                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                <Calendar size={11} /> {formatDate(match.created_at)}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            <UserCell
                                                user={match.user_one}
                                                gradient="linear-gradient(135deg,#1B4D3E,#2d7a63)"
                                                navigate={navigate}
                                            />
                                            <div className="flex items-center gap-2 pl-2">
                                                <div className="w-px h-3 bg-gray-200" />
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                                                    style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                                    <Heart size={10} className="text-white fill-white" />
                                                </div>
                                                <div className="w-px h-3 bg-gray-200" />
                                            </div>
                                            <UserCell
                                                user={match.user_two}
                                                gradient="linear-gradient(135deg,#059669,#047857)"
                                                navigate={navigate}
                                            />
                                        </div>
                                        <div className="flex justify-end pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => setSelectedMatch(match)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#1B4D3E] bg-[#1B4D3E]/10"
                                            >
                                                <Eye size={11} /> Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                                <div className="text-xs text-gray-500 font-medium">
                                    Showing <span className="font-bold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span>
                                    {" – "}
                                    <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                                    {" of "}
                                    <span className="font-bold text-gray-900">{pagination.total.toLocaleString()}</span> matches
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#1B4D3E]/30 transition-all flex items-center justify-center"
                                    >
                                        <ChevronLeft size={16} className="text-gray-600" />
                                    </button>
                                    <span className="text-xs font-bold text-gray-700 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                                        {pagination.page} <span className="text-gray-400">/</span> {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#1B4D3E]/30 transition-all flex items-center justify-center"
                                    >
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
                {selectedMatch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMatch(null)}
                        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl"
                        >
                            {/* Modal header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                                        style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                        <Heart size={20} className="text-white fill-white" />
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-gray-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                                            Match #{selectedMatch.id}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                            <Calendar size={11} />
                                            {formatDate(selectedMatch.created_at)} · {formatTime(selectedMatch.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedMatch(null)}
                                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal body */}
                            <div className="p-5 space-y-4">
                                {/* Couple visualization */}
                                <div className="relative bg-gradient-to-br from-[#f0f5f3] to-white rounded-2xl p-6 border border-[#1B4D3E]/10">
                                    <div className="flex items-center justify-center gap-6">
                                        {/* User one */}
                                        <button
                                            onClick={() => navigate(`/admin/users/${selectedMatch.user_one?.id}`)}
                                            className="flex flex-col items-center gap-2 group/u"
                                        >
                                            <div
                                                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white overflow-hidden shadow-lg group-hover/u:scale-105 transition-transform"
                                                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}
                                            >
                                                {selectedMatch.user_one?.avatar_url
                                                    ? <img src={selectedMatch.user_one.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    : (selectedMatch.user_one?.name?.charAt(0)?.toUpperCase() || "U")}
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                                                    {selectedMatch.user_one?.name}
                                                </div>
                                                <div className="text-[10px] text-gray-500 truncate max-w-[120px]">
                                                    {selectedMatch.user_one?.email}
                                                </div>
                                            </div>
                                        </button>

                                        {/* Center heart */}
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-[#1B4D3E] rounded-full animate-ping opacity-20" />
                                            <div className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
                                                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                                <Heart size={18} className="text-white fill-white" />
                                            </div>
                                        </div>

                                        {/* User two */}
                                        <button
                                            onClick={() => navigate(`/admin/users/${selectedMatch.user_two?.id}`)}
                                            className="flex flex-col items-center gap-2 group/u"
                                        >
                                            <div
                                                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white overflow-hidden shadow-lg group-hover/u:scale-105 transition-transform"
                                                style={{ background: "linear-gradient(135deg,#059669,#047857)" }}
                                            >
                                                {selectedMatch.user_two?.avatar_url
                                                    ? <img src={selectedMatch.user_two.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    : (selectedMatch.user_two?.name?.charAt(0)?.toUpperCase() || "U")}
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                                                    {selectedMatch.user_two?.name}
                                                </div>
                                                <div className="text-[10px] text-gray-500 truncate max-w-[120px]">
                                                    {selectedMatch.user_two?.email}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Profile links */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => navigate(`/admin/users/${selectedMatch.user_one?.id}`)}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Eye size={14} className="text-[#1B4D3E] flex-shrink-0" />
                                            <span className="text-xs font-bold text-gray-700 truncate">View User One</span>
                                        </div>
                                        <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/users/${selectedMatch.user_two?.id}`)}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Eye size={14} className="text-[#059669] flex-shrink-0" />
                                            <span className="text-xs font-bold text-gray-700 truncate">View User Two</span>
                                        </div>
                                        <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
