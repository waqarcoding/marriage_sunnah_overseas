// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, Filter, UserCheck, UserX, Shield, ChevronLeft, ChevronRight,
    Eye, X, Crown, Sparkles, AlertTriangle, Coins, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";

const PRIMARY = "#1B4D3E";

/* ─── Role chip ─── */
function RoleChip({ role }) {
    const map = {
        guardian: { bg: "#fef3c7", color: "#92400e", icon: Shield, label: "Guardian" },
        individual: { bg: "#dbeafe", color: "#1e40af", icon: UserCheck, label: "Individual" },
    };
    const r = map[role] || { bg: "#f1f5f9", color: "#475569", icon: UserCheck, label: role || "—" };
    const Icon = r.icon;
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
            style={{ background: r.bg, color: r.color }}>
            <Icon size={11} /> {r.label}
        </span>
    );
}

/* ─── Status pill ─── */
function StatusPill({ suspended }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
            style={{
                background: suspended ? "#fee2e2" : "#dcfce7",
                color: suspended ? "#991b1b" : "#166534",
            }}>
            <span className="w-1.5 h-1.5 rounded-full"
                style={{ background: suspended ? "#dc2626" : "#16a34a" }} />
            {suspended ? "Suspended" : "Active"}
        </span>
    );
}

/* ─── User cell ─── */
function UserCell({ user, navigate }) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <button
                onClick={() => navigate(`/admin/users/${user.id}`)}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-white cursor-pointer hover:scale-105 transition-transform overflow-hidden flex-shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}
            >
                {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    : (user.name?.charAt(0)?.toUpperCase() || "U")}
            </button>
            <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-gray-900 truncate">{user.name}</span>
                    {user.is_verified && (
                        <span title="Verified" className="flex-shrink-0">
                            <UserCheck size={13} className="text-green-500" />
                        </span>
                    )}
                    {user.is_pro && (
                        <span title="Pro" className="flex-shrink-0">
                            <Crown size={13} className="text-amber-500" />
                        </span>
                    )}
                </div>
                <div className="text-[11px] text-gray-400 font-mono">#{user.id}</div>
            </div>
        </div>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ role: "", status: "", verified: "", isPro: "", country: "" });
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [banConfirm, setBanConfirm] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    // ✅ Get current user's role to gate destructive actions
    const currentUserRole = (() => {
        try {
            const authData = JSON.parse(localStorage.getItem("authData") || "{}");
            return authData?.user?.role || authData?.role || "";
        } catch { return ""; }
    })();
    const canDelete = currentUserRole !== "staff";

    useEffect(() => { loadUsers(); }, [pagination.page, filters]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: pagination.limit, search, ...filters };
            const response = await AdminService.getUsers(params);
            if (response.success) {
                setUsers(response.data.users);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages,
                }));
            }
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadUsers();
    };

    const handleBan = async () => {
        if (!banConfirm) return;
        try {
            const res = await AdminService.banUser(banConfirm.id);
            if (res.success) {
                toast.success("User banned");
                setBanConfirm(null);
                loadUsers();
            }
        } catch { toast.error("Failed to ban user"); }
    };

    const handleUnban = async (id) => {
        try {
            const res = await AdminService.unbanUser(id);
            if (res.success) { toast.success("User unbanned"); loadUsers(); }
        } catch { toast.error("Failed to unban user"); }
    };

    const handleVerify = async (id) => {
        try {
            const res = await AdminService.verifyUser(id);
            if (res.success) { toast.success(res.message || "User verified"); loadUsers(); }
        } catch { toast.error("Failed to verify user"); }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            const res = await AdminService.deleteUser(deleteConfirm.id);
            if (res.success) {
                toast.success("User deleted");
                // Remove from local state immediately so the row disappears
                setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
                setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                setDeleteConfirm(null);
            } else {
                toast.error(res.message || "Failed to delete user");
            }
        } catch (err) {
            toast.error(err?.message || "Failed to delete user");
        } finally {
            setDeleting(false);
        }
    };

    const handleClearFilters = () => {
        setFilters({ role: "", status: "", verified: "", isPro: "", country: "" });
        setSearch("");
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const hasActiveFilters = Object.values(filters).some(Boolean) || search;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f5f3] to-[#fafaf9] p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B4D3E]/10 text-[#1B4D3E] mb-2">
                            <Sparkles size={11} /> Admin · Users
                        </div>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight"
                            style={{ letterSpacing: "-0.03em" }}>
                            Users Management
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage and monitor all platform users
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                <UserCheck size={16} className="text-white" />
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
                                placeholder="Search by name, email, or mobile…"
                                className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]/10 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                            />
                        </div>
                        <button type="submit"
                            className="h-11 px-6 rounded-xl font-bold text-white text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}>
                            Search
                        </button>
                        <button type="button" onClick={() => setShowFilters(!showFilters)}
                            className={`h-11 px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${showFilters
                                ? "bg-[#1B4D3E] text-white shadow-[0_4px_12px_rgba(27,77,62,0.25)]"
                                : "bg-gray-50 text-[#1B4D3E] border border-gray-200 hover:bg-gray-100"
                                }`}>
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
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 pt-4 mt-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Role</label>
                                        <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                            <option value="">All Roles</option>
                                            <option value="individual">Individual</option>
                                            <option value="guardian">Guardian</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Status</label>
                                        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                            <option value="">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Verification</label>
                                        <select value={filters.verified} onChange={e => setFilters({ ...filters, verified: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                            <option value="">All</option>
                                            <option value="true">Verified</option>
                                            <option value="false">Not Verified</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Membership</label>
                                        <select value={filters.isPro} onChange={e => setFilters({ ...filters, isPro: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                            <option value="">All Members</option>
                                            <option value="true">Pro Members</option>
                                            <option value="false">Free Members</option>
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
                            <p className="text-gray-500 text-sm font-medium">Loading users…</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                <Search size={28} className="text-gray-300" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 mb-1">No users found</h3>
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
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">User</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Contact</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Role</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Credits</th>
                                            <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence initial={false}>
                                            {users.map((user, i) => (
                                                <motion.tr
                                                    key={user.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                                                    transition={{ delay: i * 0.02 }}
                                                    className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-[#f0f5f3]/40 hover:to-transparent transition-colors group"
                                                >
                                                    <td className="px-5 py-3">
                                                        <UserCell user={user} navigate={navigate} />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="text-xs text-gray-700 font-medium truncate max-w-[200px]">{user.email}</div>
                                                        <div className="text-[10px] text-gray-400 truncate">{user.mobile || "—"}</div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <RoleChip role={user.role} />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <StatusPill suspended={user.is_suspended} />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <Coins size={12} className="text-amber-500" />
                                                            <span className="text-sm font-bold text-gray-900">{user.credits || 0}</span>
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">{user.rcredits || 0} referral</div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => navigate(`/admin/users/${user.id}`)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white transition-colors"
                                                                title="View Details">
                                                                <Eye size={14} />
                                                            </button>
                                                            {!user.is_verified && (
                                                                <button onClick={() => handleVerify(user.id)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition-colors"
                                                                    title="Verify User">
                                                                    <UserCheck size={14} />
                                                                </button>
                                                            )}
                                                            {user.is_suspended ? (
                                                                <button onClick={() => handleUnban(user.id)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition-colors"
                                                                    title="Unban User">
                                                                    <UserCheck size={14} />
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => setBanConfirm(user)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                                    title="Ban User">
                                                                    <UserX size={14} />
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button onClick={() => setDeleteConfirm(user)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                                                    title="Delete User">
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
                                    {users.map((user) => (
                                        <motion.div key={user.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                                            className="p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <UserCell user={user} navigate={navigate} />
                                                <StatusPill suspended={user.is_suspended} />
                                            </div>
                                            <div className="text-xs text-gray-600 mb-2 truncate">{user.email}</div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <RoleChip role={user.role} />
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600">
                                                    <Coins size={11} className="text-amber-500" /> {user.credits || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-end gap-1 pt-3 border-t border-gray-100 flex-wrap">
                                                <button onClick={() => navigate(`/admin/users/${user.id}`)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#1B4D3E] bg-[#1B4D3E]/10">
                                                    <Eye size={11} /> View
                                                </button>
                                                {!user.is_verified && (
                                                    <button onClick={() => handleVerify(user.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-green-700 bg-green-50">
                                                        <UserCheck size={11} /> Verify
                                                    </button>
                                                )}
                                                {user.is_suspended ? (
                                                    <button onClick={() => handleUnban(user.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-green-700 bg-green-50">
                                                        <UserCheck size={11} /> Unban
                                                    </button>
                                                ) : (
                                                    <button onClick={() => setBanConfirm(user)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-600 bg-red-50">
                                                        <UserX size={11} /> Ban
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button onClick={() => setDeleteConfirm(user)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-700 bg-red-100">
                                                        <Trash2 size={11} /> Delete
                                                    </button>
                                                )}
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
                                    <span className="font-bold text-gray-900">{pagination.total.toLocaleString()}</span> users
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

            {/* ── Ban confirm modal ── */}
            <AnimatePresence>
                {banConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setBanConfirm(null)}
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
                                Ban this user?
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                                <strong className="text-gray-700">{banConfirm.name}</strong> will be suspended and lose access to the platform. You can unban them later.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setBanConfirm(null)}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleBan}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.30)]">
                                    Ban User
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete confirm modal ── */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => !deleting && setDeleteConfirm(null)}
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
                                <Trash2 size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 text-center mb-2"
                                style={{ letterSpacing: "-0.02em" }}>
                                Delete user permanently?
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                                <strong className="text-gray-700">{deleteConfirm.name}</strong>{" "}
                                <span className="text-gray-400 font-mono">(#{deleteConfirm.id})</span> will be permanently removed along with all their data.
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
