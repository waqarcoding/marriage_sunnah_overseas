// @ts-nocheck
import { useState, useEffect } from "react";
import {
    DollarSign, RotateCcw, ChevronLeft, ChevronRight, CreditCard,
    Sparkles, X, AlertTriangle, CheckCircle, XCircle, Clock,
    TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";

const PRIMARY = "#1B4D3E";

/* ─── Status pill ─── */
function StatusPill({ status, size = "sm" }) {
    const map = {
        succeeded: { bg: "#dcfce7", color: "#166534", icon: CheckCircle, label: "Succeeded" },
        failed: { bg: "#fee2e2", color: "#991b1b", icon: XCircle, label: "Failed" },
        pending: { bg: "#fef3c7", color: "#92400e", icon: Clock, label: "Pending" },
        refunded: { bg: "#ede9fe", color: "#5b21b6", icon: RotateCcw, label: "Refunded" },
    };
    const s = map[status] || { bg: "#f3f4f6", color: "#475569", icon: Clock, label: status || "—" };
    const Icon = s.icon;
    const pad = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide ${pad}`}
            style={{ background: s.bg, color: s.color }}>
            <Icon size={size === "xs" ? 10 : 11} /> {s.label}
        </span>
    );
}

/* ─── Type chip ─── */
function TypeChip({ type }) {
    const map = {
        subscription: { bg: "#dbeafe", color: "#1e40af", icon: CreditCard },
        credits: { bg: "#fef3c7", color: "#92400e", icon: DollarSign },
    };
    const t = map[type] || { bg: "#f1f5f9", color: "#475569", icon: DollarSign };
    const Icon = t.icon;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold capitalize"
            style={{ background: t.bg, color: t.color }}>
            <Icon size={10} /> {type || "—"}
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

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "", type: "", processor: "" });
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [refundConfirm, setRefundConfirm] = useState(null);

    useEffect(() => { loadTransactions(); }, [pagination.page, filters]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getTransactions({
                page: pagination.page, limit: pagination.limit, ...filters,
            });
            if (response.success) {
                setTransactions(response.data.transactions);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages,
                }));
            }
        } catch {
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async () => {
        if (!refundConfirm) return;
        try {
            const res = await AdminService.refundTransaction(refundConfirm.id);
            if (res.success) {
                toast.success("Transaction refunded");
                setRefundConfirm(null);
                loadTransactions();
            }
        } catch { toast.error("Failed to refund"); }
    };

    const handleClearFilters = () => {
        setFilters({ status: "", type: "", processor: "" });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);
    const totalRevenue = transactions
        .filter(t => t.status === "succeeded")
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

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
                            <Sparkles size={11} /> Admin · Transactions
                        </div>
                        <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight"
                            style={{ letterSpacing: "-0.03em" }}>
                            Transactions
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Monitor all payment transactions
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#1e40af,#3b82f6)" }}>
                                <TrendingUp size={16} className="text-white" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Revenue (page)</div>
                                <div className="text-lg font-extrabold text-gray-900 leading-none" style={{ letterSpacing: "-0.02em" }}>
                                    ${totalRevenue.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg,#1B4D3E,#2d7a63)" }}>
                                <CreditCard size={16} className="text-white" />
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
                                <option value="succeeded">Succeeded</option>
                                <option value="failed">Failed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Type</label>
                            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#1B4D3E] outline-none text-sm bg-white">
                                <option value="">All Types</option>
                                <option value="subscription">Subscription</option>
                                <option value="credits">Credits</option>
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
                            <p className="text-gray-500 text-sm font-medium">Loading transactions…</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                <DollarSign size={28} className="text-gray-300" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 mb-1">No transactions found</h3>
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
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Amount</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Type</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                                            <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Date</th>
                                            <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx, i) => (
                                            <motion.tr
                                                key={tx.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-[#f0f5f3]/40 hover:to-transparent transition-colors group"
                                            >
                                                <td className="px-5 py-3">
                                                    <span className="text-xs font-mono font-bold text-gray-400">#{tx.id}</span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <UserCell user={tx.user} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-base font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                                                        ${tx.amount}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 uppercase">{tx.currency || "USD"}</div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <TypeChip type={tx.type} />
                                                    <div className="mt-1">
                                                        <ProcessorChip processor={tx.payment_processor} />
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <StatusPill status={tx.status} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-xs text-gray-700 font-semibold">{formatDate(tx.created_at)}</div>
                                                    <div className="text-[10px] text-gray-400">{formatTime(tx.created_at)}</div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    {tx.status === "succeeded" ? (
                                                        <button onClick={() => setRefundConfirm(tx)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-500 hover:text-white transition-colors"
                                                            title="Refund">
                                                            <RotateCcw size={11} /> Refund
                                                        </button>
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
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-mono font-bold text-gray-400">#{tx.id}</span>
                                            <StatusPill status={tx.status} size="xs" />
                                        </div>
                                        <div className="mb-3">
                                            <UserCell user={tx.user} />
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="text-lg font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                                                    ${tx.amount}
                                                </div>
                                                <div className="text-[10px] text-gray-400 uppercase">{tx.currency || "USD"}</div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <TypeChip type={tx.type} />
                                                <ProcessorChip processor={tx.payment_processor} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <span className="text-[11px] text-gray-500">{formatDate(tx.created_at)} · {formatTime(tx.created_at)}</span>
                                            {tx.status === "succeeded" && (
                                                <button onClick={() => setRefundConfirm(tx)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-600 bg-red-50">
                                                    <RotateCcw size={11} /> Refund
                                                </button>
                                            )}
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
                                    <span className="font-bold text-gray-900">{pagination.total.toLocaleString()}</span> transactions
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

            {/* ── Refund confirm modal ── */}
            <AnimatePresence>
                {refundConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setRefundConfirm(null)}
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
                                Refund transaction?
                            </h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                                <strong className="text-gray-700">${refundConfirm.amount}</strong> will be refunded to{" "}
                                <strong className="text-gray-700">{refundConfirm.user?.name || "this user"}</strong>. This action cannot be undone.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setRefundConfirm(null)}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleRefund}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.30)]">
                                    Refund
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
