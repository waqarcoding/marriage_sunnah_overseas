// @ts-nocheck
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft, Crown, Zap, Calendar, CheckCircle2,
    XCircle, Clock, CreditCard, ArrowUpRight, RefreshCw,
    Sparkles, Shield, Star, AlertCircle, Receipt,
} from "lucide-react";
import SubscriptionService from "../services/SubscriptionDetailService";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

const fmtAmount = (amount, currency = "usd") => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
    }).format(amount);
};

const planColors = {
    weekly: { bg: "#eff6ff", text: "#1d4ed8", badge: "#3b82f6" },
    monthly: { bg: "#f0fdf4", text: "#15803d", badge: "#22c55e" },
    yearly: { bg: "#fefce8", text: "#a16207", badge: "#eab308" },
};

const planIcons = { weekly: Zap, monthly: Star, yearly: Crown };

const statusConfig = {
    active: { icon: CheckCircle2, color: "#22c55e", bg: "#f0fdf4", label: "Active" },
    canceled: { icon: XCircle, color: "#ef4444", bg: "#fff1f2", label: "Canceled" },
    past_due: { icon: AlertCircle, color: "#f59e0b", bg: "#fffbeb", label: "Past Due" },
    upgraded: { icon: ArrowUpRight, color: "#8b5cf6", bg: "#faf5ff", label: "Upgraded" },
    incomplete: { icon: Clock, color: "#9ca3af", bg: "#f9fafb", label: "Incomplete" },
    succeeded: { icon: CheckCircle2, color: "#22c55e", bg: "#f0fdf4", label: "Paid" },
    failed: { icon: XCircle, color: "#ef4444", bg: "#fff1f2", label: "Failed" },
    pending: { icon: Clock, color: "#f59e0b", bg: "#fffbeb", label: "Pending" },
};

// ── Sub components ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = statusConfig[status] || statusConfig.pending;
    const Icon = cfg.icon;
    return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: cfg.bg, color: cfg.color }}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

function ActiveSubscriptionCard({ sub, user }) {
    const PlanIcon = planIcons[sub.plan_type] || Star;
    const colors = planColors[sub.plan_type] || planColors.monthly;
    const daysLeft = Math.max(0, Math.ceil((new Date(sub.current_period_end) - new Date()) / (1000 * 60 * 60 * 24)));
    const isExpiringSoon = daysLeft <= 7;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-4 mb-4 rounded-3xl overflow-hidden"
            style={{
                background: "linear-gradient(135deg, var(--primary,#1B4D3E) 0%, #2d7a62 100%)",
                boxShadow: "0 8px 32px rgba(27,77,62,0.35)",
            }}>

            {/* Top pattern */}
            <div style={{ position: "relative", padding: "20px 20px 0" }}>
                <div style={{
                    position: "absolute", top: -20, right: -20, width: 120, height: 120,
                    borderRadius: "50%", background: "rgba(255,255,255,0.05)"
                }} />
                <div style={{
                    position: "absolute", top: 10, right: 30, width: 60, height: 60,
                    borderRadius: "50%", background: "rgba(255,255,255,0.05)"
                }} />

                <div className="flex items-start justify-between relative">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.15)" }}>
                                <PlanIcon className="w-4 h-4 text-yellow-300" />
                            </div>
                            <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
                                {sub.plan_type} plan
                            </span>
                        </div>
                        <p className="text-2xl font-black text-white capitalize">{sub.plan_type}</p>
                        <p className="text-sm text-white/60 mt-0.5">{sub.credits_amount} credits included</p>
                    </div>
                    <StatusBadge status={sub.status} />
                </div>
            </div>

            {/* Credits bar */}
            <div style={{ padding: "16px 20px" }}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60 font-medium">Credits remaining</span>
                    <span className="text-sm font-black text-white">{user.credits?.toLocaleString() || 0}</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((user.credits || 0) / sub.credits_amount) * 100)}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #86efac, #4ade80)" }}
                    />
                </div>
            </div>

            {/* Dates footer */}
            <div className="flex items-center justify-between px-5 pb-5">
                <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Started</p>
                    <p className="text-xs font-bold text-white/80 mt-0.5">{fmt(sub.current_period_start)}</p>
                </div>
                <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
                <div className="text-center">
                    <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Days left</p>
                    <p className={`text-lg font-black mt-0.5 ${isExpiringSoon ? "text-yellow-300" : "text-white"}`}>
                        {daysLeft}
                    </p>
                </div>
                <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
                <div className="text-right">
                    <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Renews</p>
                    <p className="text-xs font-bold text-white/80 mt-0.5">{fmt(sub.current_period_end)}</p>
                </div>
            </div>

            {isExpiringSoon && (
                <div className="mx-4 mb-4 px-3 py-2 rounded-2xl flex items-center gap-2"
                    style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
                    <p className="text-xs text-yellow-200 font-medium">Expiring soon — renew to keep your Pro access</p>
                </div>
            )}
        </motion.div>
    );
}

function EmptySubscriptionCard({ onUpgrade }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-4 rounded-3xl p-6 text-center"
            style={{
                background: "#fff",
                border: "2px dashed rgba(27,77,62,0.15)",
                boxShadow: "0 2px 12px rgba(27,77,62,0.06)"
            }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "var(--secondary,#f0f5f3)" }}>
                <Crown className="w-6 h-6" style={{ color: "var(--primary,#1B4D3E)" }} />
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: "#1a1a1a" }}>No Active Subscription</p>
            <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>Upgrade to Pro to unlock premium features</p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onUpgrade}
                className="px-6 py-2.5 rounded-2xl text-sm font-bold text-white"
                style={{ background: "var(--primary,#1B4D3E)", border: "none", cursor: "pointer" }}>
                Upgrade to Pro
            </motion.button>
        </motion.div>
    );
}

function SubscriptionHistoryItem({ sub, index }) {
    const PlanIcon = planIcons[sub.plan_type] || Star;
    const colors = planColors[sub.plan_type] || planColors.monthly;

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 py-3.5 border-b last:border-0"
            style={{ borderColor: "rgba(27,77,62,0.06)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: colors.bg }}>
                <PlanIcon className="w-4 h-4" style={{ color: colors.badge }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold capitalize" style={{ color: "#1a1a1a" }}>
                    {sub.plan_type} Plan
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                    {fmt(sub.current_period_start)} → {fmt(sub.current_period_end)}
                </p>
            </div>
            <div className="text-right flex-shrink-0">
                <StatusBadge status={sub.status} />
                <p className="text-[10px] mt-1" style={{ color: "#9ca3af" }}>
                    {sub.credits_amount} credits
                </p>
            </div>
        </motion.div>
    );
}

function TransactionItem({ tx, index }) {
    const isSuccess = tx.status === "succeeded";
    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex items-center gap-3 py-3.5 border-b last:border-0"
            style={{ borderColor: "rgba(27,77,62,0.06)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: isSuccess ? "#f0fdf4" : "#fff1f2" }}>
                <Receipt className="w-4 h-4" style={{ color: isSuccess ? "#22c55e" : "#ef4444" }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#1a1a1a" }}>
                    {tx.description || "Subscription payment"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                    {fmt(tx.created_at)} · +{tx.credits_added} credits
                </p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: isSuccess ? "#15803d" : "#ef4444" }}>
                    {fmtAmount(tx.amount, tx.currency)}
                </p>
                <StatusBadge status={tx.status} />
            </div>
        </motion.div>
    );
}

function SectionCard({ title, icon: Icon, iconColor, children, action }) {
    return (
        <div className="mx-4 mb-4 bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 8px rgba(27,77,62,0.06)", border: "0.5px solid rgba(27,77,62,0.07)" }}>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--secondary,#f0f5f3)" }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: iconColor || "var(--primary,#1B4D3E)" }} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>{title}</span>
                </div>
                {action}
            </div>
            <div className="px-4 pb-2">{children}</div>
        </div>
    );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = ["Overview", "History", "Transactions"];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SubscriptionDetailPage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("Overview");

    useEffect(() => {
        SubscriptionService.getMySubscriptions({
            onSuccess: (res) => {
                console.log(res);
                setData(res.data);
                setLoading(false);
            },
            onFailed: (err) => {
                setError(err?.message || "Failed to load subscription data");
                setLoading(false);
            }
        });
    }, []);

    const activeSub = data?.subscriptions?.find(s => s.status === "active");
    const pastSubs = data?.subscriptions?.filter(s => s.status !== "active") || [];
    const transactions = data?.transactions || [];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: "var(--secondary,#f0f5f3)" }}>
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 animate-spin"
                    style={{ borderColor: "var(--secondary,#f0f5f3)", borderTopColor: "var(--primary,#1B4D3E)" }} />
                <p className="text-xs font-medium" style={{ color: "#9ca3af" }}>Loading subscription...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-28" style={{ background: "var(--secondary,#f0f5f3)" }}>

            {/* Header */}
            <div className="sticky top-0 z-10 border-b px-4 py-3 flex items-center gap-3"
                style={{ background: "#fff", borderColor: "rgba(27,77,62,0.08)" }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "var(--secondary,#f0f5f3)", border: "none", cursor: "pointer" }}>
                    <ChevronLeft className="w-5 h-5" style={{ color: "var(--primary,#1B4D3E)" }} />
                </motion.button>
                <h1 className="font-bold text-base" style={{ color: "var(--primary,#1B4D3E)" }}>Subscription</h1>
                <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => { setLoading(true); SubscriptionService.getMySubscriptions({ onSuccess: r => { setData(r.data); setLoading(false); }, onFailed: () => setLoading(false) }); }}
                    className="ml-auto w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "var(--secondary,#f0f5f3)", border: "none", cursor: "pointer" }}>
                    <RefreshCw className="w-4 h-4" style={{ color: "var(--primary,#1B4D3E)" }} />
                </motion.button>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mt-4 p-3 rounded-2xl text-sm flex items-center gap-2"
                    style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <div className="pt-5">

                {/* Active subscription card */}
                {activeSub
                    ? <ActiveSubscriptionCard sub={activeSub} user={data.user} />
                    : <EmptySubscriptionCard onUpgrade={() => navigate("/subscription")} />
                }

                {/* Credits summary */}
                {data && (
                    <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
                        {[
                            { label: "Credits", value: data.user.credits?.toLocaleString() || "0", icon: Zap, color: "#3b82f6" },
                            { label: "Plan", value: activeSub ? activeSub.plan_type : "Free", icon: Crown, color: "#f59e0b" },
                            { label: "Transactions", value: transactions.length, icon: Receipt, color: "#8b5cf6" },
                        ].map(({ label, value, icon: Icon, color }, i) => (
                            <motion.div key={label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="bg-white rounded-2xl p-3 text-center"
                                style={{ boxShadow: "0 1px 6px rgba(27,77,62,0.06)" }}>
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1.5"
                                    style={{ background: `${color}18` }}>
                                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                                </div>
                                <p className="text-sm font-black capitalize" style={{ color: "#1a1a1a" }}>{value}</p>
                                <p className="text-[10px] font-medium mt-0.5" style={{ color: "#9ca3af" }}>{label}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="mx-4 mb-4 bg-white rounded-2xl p-1 flex gap-1"
                    style={{ boxShadow: "0 1px 6px rgba(27,77,62,0.06)" }}>
                    {TABS.map(t => (
                        <motion.button key={t} whileTap={{ scale: 0.96 }}
                            onClick={() => setTab(t)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                                background: tab === t ? "var(--primary,#1B4D3E)" : "transparent",
                                color: tab === t ? "#fff" : "#9ca3af",
                                border: "none", cursor: "pointer"
                            }}>
                            {t}
                        </motion.button>
                    ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    {tab === "Overview" && (
                        <motion.div key="overview"
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>

                            {/* Features list */}
                            <SectionCard title="Pro Features" icon={Sparkles} iconColor="#f59e0b">
                                {[
                                    { label: "See Who Likes You", desc: "See everyone who has liked your profile", active: !!activeSub },

                                    { label: "Priority Matching", desc: "Get shown to more compatible profiles", active: !!activeSub },
                                    { label: "Contact Reveals", desc: "Reveal contact details with credit cost", active: !!activeSub },

                                    { label: "Show Last Seen", desc: "Control your visibility to others", active: !!activeSub },
                                    { label: "Credits Included", desc: `${activeSub?.credits_amount || 0} credits per cycle`, active: !!activeSub },

                                ].map(({ label, desc, active }) => (
                                    <div key={label} className="flex items-center gap-3 py-3 border-b last:border-0"
                                        style={{ borderColor: "rgba(27,77,62,0.06)" }}>
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: active ? "#f0fdf4" : "#f9fafb" }}>
                                            {active
                                                ? <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                                                : <XCircle className="w-4 h-4" style={{ color: "#d1d5db" }} />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: active ? "#1a1a1a" : "#9ca3af" }}>{label}</p>
                                            <p className="text-xs" style={{ color: "#9ca3af" }}>{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </SectionCard>

                            {/* Upgrade CTA if no active sub */}
                            {!activeSub && (
                                <div className="mx-4 mb-4">
                                    <motion.button whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate("/subscription/plans")}
                                        className="w-full h-12 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
                                        style={{ background: "var(--primary,#1B4D3E)", border: "none", cursor: "pointer" }}>
                                        <Crown className="w-4 h-4 text-yellow-300" />
                                        View Plans & Upgrade
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {tab === "History" && (
                        <motion.div key="history"
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                            <SectionCard title="Subscription History" icon={Calendar} iconColor="#3b82f6">
                                {activeSub && <SubscriptionHistoryItem sub={activeSub} index={0} />}
                                {pastSubs.length === 0 && !activeSub ? (
                                    <div className="py-8 text-center">
                                        <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: "#d1d5db" }} />
                                        <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>No subscription history</p>
                                    </div>
                                ) : (
                                    pastSubs.map((sub, i) => (
                                        <SubscriptionHistoryItem key={sub.id} sub={sub} index={activeSub ? i + 1 : i} />
                                    ))
                                )}
                            </SectionCard>
                        </motion.div>
                    )}

                    {tab === "Transactions" && (
                        <motion.div key="transactions"
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                            <SectionCard title="Transaction History" icon={CreditCard} iconColor="#8b5cf6">
                                {transactions.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <Receipt className="w-8 h-8 mx-auto mb-2" style={{ color: "#d1d5db" }} />
                                        <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>No transactions yet</p>
                                    </div>
                                ) : (
                                    transactions.map((tx, i) => (
                                        <TransactionItem key={tx.id} tx={tx} index={i} />
                                    ))
                                )}
                            </SectionCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}