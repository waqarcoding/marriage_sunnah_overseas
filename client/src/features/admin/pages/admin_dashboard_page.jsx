import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, UserCheck, Crown, DollarSign,
    Heart, MessageCircle, Clock, TrendingUp,
    Activity, CheckCircle, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";



export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30d');
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        if (period) {
            loadCharts();
        }
    }, [period]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [statsRes, chartsRes, activityRes] = await Promise.all([
                AdminService.getDashboardStats(),
                AdminService.getDashboardCharts(period),
                AdminService.getRecentActivity(5)
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (chartsRes.success) setCharts(chartsRes.data);
            if (activityRes.success) setActivity(activityRes.data);
        } catch (error) {
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const loadCharts = async () => {
        try {
            const chartsRes = await AdminService.getDashboardCharts(period);
            if (chartsRes.success) setCharts(chartsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <div
                        className="w-16 h-16 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4"
                    />
                    <p className="text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, gradient, onClick }) => (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group"
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: gradient || color }}
                >
                    <Icon size={28} className="text-white" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ background: trend > 0 ? "#dcfce7" : "#fee2e2" }}>
                        {trend > 0 ? <ArrowUpRight size={14} color="#16a34a" /> : <ArrowDownRight size={14} color="#dc2626" />}
                        <span className="text-xs font-semibold" style={{ color: trend > 0 ? "#16a34a" : "#dc2626" }}>
                            {Math.abs(trend)}%
                        </span>
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: "#1e293b" }}>
                {value?.toLocaleString() || 0}
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">
                {title}
            </div>
            {subtitle && (
                <div className="text-xs text-gray-500">
                    {subtitle}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-600">
                            Welcome back! Here's what's happening with your platform.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {['7d', '30d', '90d'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                style={{
                                    background: period === p ? "#1B4D3E" : "white",
                                    color: period === p ? "white" : "#1B4D3E",
                                    border: period === p ? "none" : "1px solid #e5e7eb",
                                    boxShadow: period === p ? "0 4px 12px rgba(27, 77, 62, 0.15)" : "none"
                                }}
                            >
                                Last {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Users}
                        title="Total Users"
                        value={stats?.users?.total}
                        subtitle={`${stats?.users?.todaySignups || 0} new today`}
                        trend={12}
                        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        onClick={() => navigate('/admin/users')} color={undefined} />
                    <StatCard
                        icon={UserCheck}
                        title="Verified Users"
                        value={stats?.users?.verified}
                        subtitle={`${stats?.users?.active || 0} active now`}
                        trend={8}
                        gradient="linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)"
                        onClick={() => navigate('/admin/users?verified=true')} color={undefined} />
                    <StatCard
                        icon={Crown}
                        title="Pro Members"
                        value={stats?.subscriptions?.proUsers}
                        subtitle={`${stats?.subscriptions?.active || 0} subscriptions`}
                        trend={15}
                        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        onClick={() => navigate('/admin/subscriptions')} color={undefined} />
                    <StatCard
                        icon={DollarSign}
                        title="Today's Revenue"
                        value={`$${stats?.revenue?.today || 0}`}
                        subtitle="Total earnings"
                        trend={-3}
                        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        onClick={() => navigate('/admin/transactions')} color={undefined} />
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Heart}
                        title="Pending Interests"
                        value={stats?.engagement?.pendingInterests}
                        subtitle="Awaiting response"
                        gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                        onClick={() => navigate('/admin/interests')} trend={undefined} color={undefined} />
                    <StatCard
                        icon={MessageCircle}
                        title="Today's Messages"
                        value={stats?.engagement?.todayMessages}
                        subtitle={`${stats?.engagement?.todayMatches || 0} matches`}
                        gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
                        onClick={() => navigate('/admin/messages')} trend={undefined} color={undefined} />
                    <StatCard
                        icon={Clock}
                        title="Pending Verifications"
                        value={stats?.pending?.verifications}
                        subtitle="Needs review"
                        gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                        onClick={() => navigate('/admin/verifications')} trend={undefined} color={undefined} />
                    <StatCard
                        icon={Activity}
                        title="Total Credits"
                        value={stats?.credits?.total}
                        subtitle={`${stats?.credits?.rcredits || 0} referral`}
                        gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" trend={undefined} color={undefined} onClick={undefined} />
                </div>

                {/* Charts and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Growth */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
                                <p className="text-sm text-gray-500">New user registrations</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                                <TrendingUp size={20} className="text-white" />
                            </div>
                        </div>
                        <div className="h-48 flex items-center justify-center">
                            {charts?.userGrowth?.length > 0 ? (
                                <div className="w-full text-center">
                                    <div className="text-4xl font-bold mb-2" style={{ color: "#1B4D3E" }}>
                                        {charts.userGrowth.reduce((sum, d) => sum + parseInt(d.count), 0)}
                                    </div>
                                    <p className="text-gray-500">Total signups in {period}</p>
                                    <div className="mt-4 flex items-center justify-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-xs text-gray-600">
                                            {charts.userGrowth.length} days of data
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400">No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Revenue Growth */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Revenue Growth</h3>
                                <p className="text-sm text-gray-500">Total earnings</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
                                <DollarSign size={20} className="text-white" />
                            </div>
                        </div>
                        <div className="h-48 flex items-center justify-center">
                            {charts?.revenueGrowth?.length > 0 ? (
                                <div className="w-full text-center">
                                    <div className="text-4xl font-bold mb-2" style={{ color: "#1B4D3E" }}>
                                        ${charts.revenueGrowth.reduce((sum, d) => sum + parseFloat(d.total || 0), 0).toFixed(2)}
                                    </div>
                                    <p className="text-gray-500">Total revenue in {period}</p>
                                    <div className="mt-4 flex items-center justify-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-xs text-gray-600">
                                            {charts.revenueGrowth.length} days of data
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400">No data available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                            <p className="text-sm text-gray-500">Latest user registrations</p>
                        </div>
                        <CheckCircle size={20} style={{ color: "#1B4D3E" }} />
                    </div>

                    {activity?.recentUsers?.length > 0 ? (
                        <div className="space-y-3">
                            {activity.recentUsers.slice(0, 5).map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-gray-100"
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                                        style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                                    >
                                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400">No recent activity</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
