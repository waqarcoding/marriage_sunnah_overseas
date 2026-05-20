// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, UserCheck, Crown, DollarSign,
    Heart, Video, Activity, CheckCircle,
    ArrowUpRight, ArrowDownRight, TrendingUp,
    Sparkles, ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";

const PRIMARY = "#1B4D3E";

/* ─── Mini bar chart from data array ─── */
function MiniBars({ data, getter, color }) {
    if (!data?.length) return null;
    const max = Math.max(...data.map(d => +getter(d) || 0), 1);
    return (
        <div className="flex items-end gap-1 h-16 mt-4">
            {data.slice(-14).map((d, i) => {
                const h = Math.max(4, ((+getter(d) || 0) / max) * 100);
                return (
                    <div key={i} className="flex-1 rounded-t-sm transition-all"
                        style={{ height: `${h}%`, background: `linear-gradient(to top, ${color}, ${color}aa)` }} />
                );
            })}
        </div>
    );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, title, value, subtitle, trend, gradient, onClick, accent }) {
    return (
        <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group bg-white rounded-2xl p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.05)] hover:shadow-[0_8px_28px_rgba(27,77,62,0.10)] transition-shadow duration-300 border border-gray-100 relative overflow-hidden"
        >
            {/* Decorative blob */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.06] blur-2xl"
                style={{ background: accent || PRIMARY }} />

            <div className="relative flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: gradient, boxShadow: `0 6px 16px ${accent || PRIMARY}30` }}>
                    <Icon size={22} className="text-white" />
                </div>

                {trend != null && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                        style={{ background: trend > 0 ? "#dcfce7" : "#fee2e2" }}>
                        {trend > 0
                            ? <ArrowUpRight size={12} className="text-green-600" />
                            : <ArrowDownRight size={12} className="text-red-600" />}
                        <span className={`text-[11px] font-bold ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                            {Math.abs(trend)}%
                        </span>
                    </div>
                )}
            </div>

            <div className="relative">
                <div className="text-2xl font-extrabold mb-1 tracking-tight" style={{ color: "#0f172a", letterSpacing: "-0.03em" }}>
                    {typeof value === "string" ? value : (value?.toLocaleString() ?? 0)}
                </div>
                <div className="text-[13px] font-semibold text-gray-700 leading-tight">
                    {title}
                </div>
                {subtitle && (
                    <div className="text-[11px] text-gray-400 mt-1 font-medium flex items-center gap-1">
                        {subtitle}
                        {onClick && <ChevronRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                )}
            </div>
        </motion.button>
    );
}

/* ─── Section Header ─── */
function SectionHeading({ title, subtitle, eyebrow }) {
    return (
        <div className="mb-4">
            {eyebrow && (
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B4D3E]/10 text-[#1B4D3E] mb-2">
                    {eyebrow}
                </div>
            )}
            <h2 className="text-[17px] font-bold text-gray-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>{title}</h2>
            {subtitle && <p className="text-[12.5px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("30d");
    const navigate = useNavigate();

    useEffect(() => { loadDashboard(); }, []);
    useEffect(() => { if (period) loadCharts(); }, [period]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [statsRes, chartsRes, activityRes] = await Promise.all([
                AdminService.getDashboardStats(),
                AdminService.getDashboardCharts(period),
                AdminService.getRecentActivity(5),
            ]);
            if (statsRes.success) setStats(statsRes.data);
            if (chartsRes.success) setCharts(chartsRes.data);
            if (activityRes.success) setActivity(activityRes.data);
        } catch {
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const loadCharts = async () => {
        try {
            const chartsRes = await AdminService.getDashboardCharts(period);
            if (chartsRes.success) setCharts(chartsRes.data);
        } catch (e) { console.error(e); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f0f5f3] to-[#fafaf9]">
                <div className="text-center">
                    <div className="w-14 h-14 border-[3px] border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium text-sm">Loading dashboard…</p>
                </div>
            </div>
        );
    }

    const userGrowthTotal = charts?.userGrowth?.reduce((s, d) => s + (+d.count || 0), 0) ?? 0;
    const revenueGrowthTotal = charts?.revenueGrowth?.reduce((s, d) => s + parseFloat(d.total || 0), 0) ?? 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f5f3] to-[#fafaf9] p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#1B4D3E]/10 text-[#1B4D3E] mb-2">
                            <Sparkles size={11} /> Admin Panel
                        </div>
                        <h1 className="text-[28px] sm:text-[32px] font-extrabold text-gray-900 leading-tight tracking-tight"
                            style={{ letterSpacing: "-0.03em" }}>
                            Dashboard Overview
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Welcome back — here's what's happening across the platform
                        </p>
                    </div>

                    {/* Period switcher */}
                    <div className="inline-flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 self-start">
                        {[
                            { v: "7d", l: "7 days" },
                            { v: "30d", l: "30 days" },
                            { v: "90d", l: "90 days" },
                        ].map(p => (
                            <button
                                key={p.v}
                                onClick={() => setPeriod(p.v)}
                                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 ${period === p.v
                                        ? "bg-[#1B4D3E] text-white shadow-[0_4px_12px_rgba(27,77,62,0.25)]"
                                        : "text-gray-500 hover:text-[#1B4D3E]"
                                    }`}
                            >
                                {p.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Primary stats ── */}
                <div>
                    <SectionHeading eyebrow="Key metrics" title="Platform snapshot" subtitle="Top numbers at a glance" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <StatCard
                            icon={Users}
                            title="Total Users"
                            value={stats?.users?.total}
                            subtitle={`${stats?.users?.todaySignups || 0} new today`}
                            trend={12}
                            accent="#1B4D3E"
                            gradient="linear-gradient(135deg, #1B4D3E 0%, #276b4d 100%)"
                            onClick={() => navigate("/admin/users")}
                        />
                        <StatCard
                            icon={UserCheck}
                            title="Verified Users"
                            value={stats?.users?.verified}
                            subtitle={`${stats?.users?.active || 0} active now`}
                            trend={8}
                            accent="#0e7490"
                            gradient="linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)"
                            onClick={() => navigate("/admin/users?verified=true")}
                        />
                        <StatCard
                            icon={Crown}
                            title="Pro Members"
                            value={stats?.subscriptions?.proUsers}
                            subtitle={`${stats?.subscriptions?.active || 0} subscriptions`}
                            trend={15}
                            accent="#d97706"
                            gradient="linear-gradient(135deg, #d97706 0%, #fbbf24 100%)"
                            onClick={() => navigate("/admin/subscriptions")}
                        />
                        <StatCard
                            icon={DollarSign}
                            title="Today's Revenue"
                            value={`$${stats?.revenue?.today || 0}`}
                            subtitle="Total earnings"
                            trend={-3}
                            accent="#1e40af"
                            gradient="linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
                            onClick={() => navigate("/admin/transactions")}
                        />
                    </div>
                </div>

                {/* ── Secondary stats ── */}
                <div>
                    <SectionHeading eyebrow="Engagement" title="Activity & pending items" subtitle="Things that need attention" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <StatCard
                            icon={Heart}
                            title="Pending Interests"
                            value={stats?.engagement?.pendingInterests}
                            subtitle="Awaiting response"
                            accent="#ec4899"
                            gradient="linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
                            onClick={() => navigate("/admin/interests/pending")}
                        />
                        <StatCard
                            icon={Video}
                            title="Pending Meetings"
                            value={stats?.meetings?.upcoming || 0}
                            subtitle={`${stats?.meetings?.today || 0} today`}
                            accent="#7c3aed"
                            gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
                            onClick={() => navigate("/admin/meetings")}
                        />
                        <StatCard
                            icon={UserCheck}
                            title="Pending Verifications"
                            value={stats?.pending?.verifications}
                            subtitle="Needs review"
                            accent="#059669"
                            gradient="linear-gradient(135deg, #059669 0%, #34d399 100%)"
                            onClick={() => navigate("/admin/verifications")}
                        />
                        <StatCard
                            icon={Activity}
                            title="Total Credits"
                            value={stats?.credits?.total}
                            subtitle={`${stats?.credits?.rcredits || 0} referral`}
                            accent="#be185d"
                            gradient="linear-gradient(135deg, #be185d 0%, #f43f5e 100%)"
                        />
                    </div>
                </div>

                {/* ── Charts row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* User Growth */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.05)] border border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 inline-block px-2 py-0.5 rounded-full mb-2">
                                    Growth
                                </div>
                                <h3 className="text-base font-bold text-gray-900 leading-tight">User Growth</h3>
                                <p className="text-xs text-gray-500 mt-0.5">New user registrations</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                                style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}>
                                <TrendingUp size={18} className="text-white" />
                            </div>
                        </div>
                        {charts?.userGrowth?.length > 0 ? (
                            <>
                                <div className="flex items-baseline gap-2 mt-3">
                                    <div className="text-4xl font-extrabold text-[#1B4D3E]" style={{ letterSpacing: "-0.03em" }}>
                                        {userGrowthTotal.toLocaleString()}
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">
                                        signups · last {period}
                                    </span>
                                </div>
                                <MiniBars data={charts.userGrowth} getter={(d) => d.count} color="#1B4D3E" />
                                <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {charts.userGrowth.length} days of data
                                </div>
                            </>
                        ) : (
                            <EmptyChart message="No growth data yet" />
                        )}
                    </div>

                    {/* Revenue Growth */}
                    <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.05)] border border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded-full mb-2">
                                    Revenue
                                </div>
                                <h3 className="text-base font-bold text-gray-900 leading-tight">Revenue Growth</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Total earnings</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                                style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}>
                                <DollarSign size={18} className="text-white" />
                            </div>
                        </div>
                        {charts?.revenueGrowth?.length > 0 ? (
                            <>
                                <div className="flex items-baseline gap-2 mt-3">
                                    <div className="text-4xl font-extrabold text-[#1e40af]" style={{ letterSpacing: "-0.03em" }}>
                                        ${revenueGrowthTotal.toFixed(2)}
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">
                                        revenue · last {period}
                                    </span>
                                </div>
                                <MiniBars data={charts.revenueGrowth} getter={(d) => d.total} color="#3b82f6" />
                                <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    {charts.revenueGrowth.length} days of data
                                </div>
                            </>
                        ) : (
                            <EmptyChart message="No revenue data yet" />
                        )}
                    </div>
                </div>

                {/* ── Recent Activity ── */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(27,77,62,0.05)] border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#1B4D3E] bg-[#1B4D3E]/10 inline-block px-2 py-0.5 rounded-full mb-2">
                                Live
                            </div>
                            <h3 className="text-base font-bold text-gray-900 leading-tight">Recent Activity</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Latest user registrations</p>
                        </div>
                        <button onClick={() => navigate("/admin/users")}
                            className="text-[12px] font-bold text-[#1B4D3E] hover:underline flex items-center gap-1">
                            View all <ChevronRight size={13} />
                        </button>
                    </div>

                    {activity?.recentUsers?.length > 0 ? (
                        <div className="space-y-2">
                            {activity.recentUsers.slice(0, 5).map((user) => (
                                <motion.div
                                    key={user.id}
                                    whileHover={{ x: 4 }}
                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-[#f0f5f3] hover:to-transparent cursor-pointer border border-gray-100 transition-colors"
                                >
                                    {user.avatar
                                        ? <img src={user.avatar} alt={user.name}
                                            className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md" />
                                        : <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-extrabold text-[#fef3c7] shadow-md"
                                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}>
                                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                    }
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 text-sm truncate">{user.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                    </div>
                                    <div className="text-[11px] text-gray-400 font-medium shrink-0 hidden sm:block">
                                        {new Date(user.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 shrink-0" />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                <Users size={28} className="text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">No recent activity</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyChart({ message }) {
    return (
        <div className="h-32 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 font-medium">{message}</p>
        </div>
    );
}
