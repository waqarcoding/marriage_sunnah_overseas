// @ts-nocheck
import { useState, useEffect } from "react";
import {
    Crown, Plus, XCircle, Calendar, ChevronLeft, ChevronRight,
    TrendingUp, Sparkles, X, AlertTriangle, CreditCard, CheckCircle, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";

const PRIMARY = "#1B4D3E";

/* ─── Status pill ─── */
function StatusPill({ status, size = "sm" }) {
    const map = {
        active: { bg: "#dcfce7", color: "#166534", icon: CheckCircle, label: "Active" },
        canceled: { bg: "#fee2e2", color: "#991b1b", icon: XCircle, label: "Canceled" },
        expired: { bg: "#f3f4f6", color: "#475569", icon: Clock, label: "Expired" },
    };
    const s = map[status] || map.expired;
    const Icon = s.icon;
    const pad = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide ${pad}`}
            style={{ background: s.bg, color: s.color }}>
            <Icon size={size === "xs" ? 10 : 11} /> {s.label}
        </span>
    );
}

/* ─── Plan chip ─── */
function PlanChip({ plan }) {
    const map = {
        monthly: { bg: "#dbeafe", color: "#1e40af" },
        quarterly: { bg: "#ede9fe", color: "#6d28d9" },
        yearly: { bg: "#fef3c7", color: "#92400e" },
    };
    const p = map[plan] || { bg: "#f1f5f9", color: "#475569" };
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold capitalize"
            style={{ background: p.bg, color: p.color }}>
            <Crown size={10} /> {plan || "—"}
        </span>
    );
}

/* ─── Processor chip ─── */
function ProcessorChip({ processor }) {
    if (!processor) return <span className="text-[10px] text-gray-400">—</span>;
    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 capitalize">
            <CreditCard size={9} /> {processor}
        </span>
    );
}

/* ─── User cell ─── */
function UserCell({ user }) {
    if (!user) return <span className="text-xs text-gray-400">Unknown</span>;
    return (
        <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-white overflow-hidden flex-shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    : (user.name?.charAt(0)?.toUpperCase() || "U")}
            </div>
            <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{user.name || "Unknown"}</div>
                <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
            </div>
        </div>
    );
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "", planType: "", processor: "" });
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [cancelConfirm, setCancelConfirm] = useState(null);
    const [extendDialog, setExtendDialog] = useState(null);
    const [extendDays, setExtendDays] = useState("");
    const [extending, setExtending] = useState(false);
    // ✅ NEW: credits state
    const [extendCredits, setExtendCredits] = useState("");

    useEffect(() => { loadSubscriptions(); }, [pagination.page, filters]);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getSubscriptions({
                page: pagination.page, limit: pagination.limit, ...filters,
            });
            if (response.success) {
                setSubscriptions(response.data.subscriptions);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages,
                }));
            }
        } catch {
            toast.error("Failed to load subscriptions");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelConfirm) return;
        try {
            const res = await AdminService.cancelSubscription(cancelConfirm.id);
            if (res.success) {
                toast.success("Subscription canceled");
                setCancelConfirm(null);
                loadSubscriptions();
            }
        } catch { toast.error("Failed to cancel"); }
    };

    // ✅ UPDATED: sends both days + credits
    // ── 2. Replace handleExtend with this ──
    const handleExtend = async () => {
        if (!extendDialog || !extendDays || isNaN(extendDays)) return;
        setExtending(true);
        try {
            const days = parseInt(extendDays);
            const credits = extendCredits && !isNaN(extendCredits) && parseInt(extendCredits) > 0
                ? parseInt(extendCredits)
                : 0;

            const res = await AdminService.extendSubscription(extendDialog.id, days, credits);
            if (res.success) {
                const parts = [`Extended by ${days} days`];
                if (credits > 0) parts.push(`+${credits} credits added`);
                toast.success(parts.join(" · "));
                setExtendDialog(null);
                setExtendDays("");
                setExtendCredits("");
                loadSubscriptions();
            }
        } catch {
            toast.error("Failed to extend");
        } finally {
            setExtending(false);
        }
    };


    const handleClearFilters = () => {
        setFilters({ status: "", planType: "", processor: "" });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);
    const activeCount = subscriptions.filter(s => s.status === "active").length;

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f5f3] to-[#fafaf9] p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B4D3E]/10 text-[#1B4D3E] mb-2">
                            <Sparkles size={11} /> Admin · Subscriptions
                        </div>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight"
                            style={{ letterSpacing: "-0.03em" }}>
                            Subscriptions
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage user pro memberships</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                                <TrendingUp size={16} className="text-white" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Active</div>
                                <div className="text-lg font-extrabold text-gray-900 leading-none" style={{ letterSpacing: "-0.02em" }}>
                                    {activeCount.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                <Crown size={16} className="text-white" />
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

                {/* ── Filter Bar ── */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Status</label>
                            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="canceled">Canceled</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Plan</label>
                            <select value={filters.planType} onChange={(e) => setFilters({ ...filters, planType: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                <option value="">All Plans</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Processor</label>
                            <select value={filters.processor} onChange={(e) => setFilters({ ...filters, processor: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                <option value="">All Processors</option>
                                <option value="stripe">Stripe</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleClearFilters} disabled={!hasActiveFilters}
                                className="w-full h-10 px-4 rounded-lg text-sm font-bold text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-600">
                                <X size={14} /> Clear All
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.04)] border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 text-sm font-medium">Loading subscriptions…</p>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                <Crown size={28} className="text-gray-300" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 mb-1">No subscriptions found</h3>
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
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">User</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Plan</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Period</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Amount</th>
                                            <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptions.map((sub, i) => (
                                            <motion.tr
                                                key={sub.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-[#f0f5f3]/40 hover:to-transparent transition-colors group"
                                            >
                                                <td className="px-5 py-3">
                                                    <span className="text-xs font-mono font-bold text-gray-400">#{sub.id}</span>
                                                </td>
                                                <td className="px-5 py-3"><UserCell user={sub.user} /></td>
                                                <td className="px-3 py-3">
                                                    <PlanChip plan={sub.plan_type} />
                                                    <div className="mt-1"><ProcessorChip processor={sub.payment_processor} /></div>
                                                </td>
                                                <td className="px-3 py-3"><StatusPill status={sub.status} /></td>
                                                <td className="px-3 py-3">
                                                    <div className="text-xs text-gray-700 font-semibold flex items-center gap-1">
                                                        <Calendar size={11} className="text-gray-400" />
                                                        {formatDate(sub.current_period_end)}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                                        Started {formatDate(sub.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-base font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                                                        ${sub.amount}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    {sub.status === "active" ? (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => setExtendDialog(sub)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                                                title="Extend">
                                                                <Plus size={14} />
                                                            </button>
                                                            <button onClick={() => setCancelConfirm(sub)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                                title="Cancel">
                                                                <XCircle size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300">—</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile card list */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {subscriptions.map((sub) => (
                                    <div key={sub.id} className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-mono font-bold text-gray-400">#{sub.id}</span>
                                            <StatusPill status={sub.status} size="xs" />
                                        </div>
                                        <div className="mb-3"><UserCell user={sub.user} /></div>
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <PlanChip plan={sub.plan_type} />
                                            <ProcessorChip processor={sub.payment_processor} />
                                            <span className="text-sm font-extrabold text-gray-900 ml-auto"
                                                style={{ letterSpacing: "-0.02em" }}>${sub.amount}</span>
                                        </div>
                                        <div className="text-[11px] text-gray-500 mb-3 flex items-center gap-1">
                                            <Calendar size={11} /> Ends {formatDate(sub.current_period_end)}
                                        </div>
                                        {sub.status === "active" && (
                                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                                                <button onClick={() => setExtendDialog(sub)}
                                                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50">
                                                    <Plus size={12} /> Extend
                                                </button>
                                                <button onClick={() => setCancelConfirm(sub)}
                                                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50">
                                                    <XCircle size={12} /> Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                                <div className="text-xs text-gray-500 font-medium">
                                    Showing{" "}
                                    <span className="font-bold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span>
                                    {" – "}
                                    <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                                    {" of "}
                                    <span className="font-bold text-gray-900">{pagination.total.toLocaleString()}</span> subscriptions
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

            {/* ── Cancel confirm ── */}
            <AnimatePresence>
                {cancelConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setCancelConfirm(null)}
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
                                Cancel subscription?
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                                Subscription <span className="font-mono font-bold">#{cancelConfirm.id}</span> for{" "}
                                <strong className="text-gray-700">{cancelConfirm.user?.name || "this user"}</strong> will be canceled.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setCancelConfirm(null)}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Keep It
                                </button>
                                <button onClick={handleCancel}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.30)]">
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Extend dialog ── */}
            <AnimatePresence>
                {extendDialog && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => { setExtendDialog(null); setExtendDays(""); setExtendCredits(""); }}
                        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6"
                        >
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 bg-emerald-100 flex items-center justify-center">
                                <Plus size={26} className="text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 text-center mb-2"
                                style={{ letterSpacing: "-0.02em" }}>
                                Extend subscription
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                                Update <strong className="text-gray-700">{extendDialog.user?.name || `#${extendDialog.id}`}</strong>'s subscription
                            </p>

                            {/* Days */}
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                                Days to extend
                            </label>
                            <input
                                type="number" min="1" value={extendDays}
                                onChange={(e) => setExtendDays(e.target.value)}
                                placeholder="e.g. 30"
                                autoFocus
                                className="w-full h-11 px-3 mb-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm bg-gray-50 focus:bg-white"
                            />

                            {/* Credits — NEW */}
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                                Credits to add{" "}
                                <span className="text-gray-400 normal-case font-normal">(optional)</span>
                            </label>
                            <input
                                type="number" min="0" value={extendCredits}
                                onChange={(e) => setExtendCredits(e.target.value)}
                                placeholder="e.g. 100"
                                className="w-full h-11 px-3 mb-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm bg-gray-50 focus:bg-white"
                            />

                            {/* Preview */}
                            {(extendDays || extendCredits) && (
                                <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 font-medium flex flex-col gap-1.5">
                                    {extendDays && !isNaN(extendDays) && (
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} />
                                            <span>+{extendDays} days added to subscription</span>
                                        </div>
                                    )}
                                    {extendCredits && !isNaN(extendCredits) && parseInt(extendCredits) > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={12} />
                                            <span>+{extendCredits} credits added to account</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button onClick={() => { setExtendDialog(null); setExtendDays(""); setExtendCredits(""); }}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExtend}
                                    disabled={!extendDays || isNaN(extendDays) || extending}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white transition-all shadow-[0_4px_12px_rgba(16,185,129,0.30)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                                    {extending ? (
                                        <>
                                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                            Saving…
                                        </>
                                    ) : "Confirm"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}