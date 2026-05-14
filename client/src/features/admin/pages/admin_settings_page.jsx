import { useState, useEffect } from "react";
import { Settings, Save, Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function AdminSettingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = adminUser.role === 'admin';

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getSettings();
            if (response.success) {
                setSettings(response.data);
            }
        } catch (error) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!isSuperAdmin) {
            toast.error("Only super admin can update settings");
            return;
        }
        try {
            setSaving(true);
            const response = await AdminService.updateSettings(settings);
            if (response.success) {
                toast.success("Settings updated successfully");
                setSettings(response.data);
            }
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1B4D3E] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading settings...</p>
                </div>
            </div>
        );
    }

    const Field = ({ label, field, type = "text", min, max }) => (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                value={settings?.[field] || ''}
                onChange={(e) => updateField(field, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                disabled={!isSuperAdmin}
                min={min}
                max={max}
                className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
                        <p className="text-gray-600">
                            {isSuperAdmin ? "Configure platform settings" : "View platform settings (read-only)"}
                        </p>
                    </div>
                    {isSuperAdmin && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 h-12 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                        >
                            <Save size={20} />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    )}
                </div>

                {!isSuperAdmin && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                        <Lock size={20} className="text-amber-600" />
                        <p className="text-sm text-amber-800 font-medium">
                            You have read-only access. Only super admins can modify settings.
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Site Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                                <Settings size={20} className="text-white" />
                            </div>
                            Site Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Site Name" field="site_name" min={undefined} max={undefined} />
                            <Field label="Site URL" field="site_url" min={undefined} max={undefined} />
                            <Field label="Support Email" field="support_email" min={undefined} max={undefined} />
                            <Field label="Contact Phone" field="contact_phone" min={undefined} max={undefined} />
                        </div>
                    </div>

                    {/* Credit Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
                                <Settings size={20} className="text-white" />
                            </div>
                            Credit System
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Free Credits on Signup" field="free_credits_on_signup" type="number" min={0} max={undefined} />
                            <Field label="Free Credits on Verification" field="free_credits_on_verification" type="number" min={0} max={undefined} />
                            <Field label="Cost to Send Interest" field="cost_send_interest" type="number" min={0} max={undefined} />
                            <Field label="Cost to Send Super Like" field="cost_send_super_like" type="number" min={0} max={undefined} />
                            <Field label="Cost to Reveal Email" field="cost_reveal_email" type="number" min={0} max={undefined} />
                            <Field label="Cost to Reveal Phone" field="cost_reveal_phone" type="number" min={0} max={undefined} />
                        </div>
                    </div>

                    {/* Referral Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
                                <Settings size={20} className="text-white" />
                            </div>
                            Referral Program
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Referral Commission (%)" field="referral_commission_percentage" type="number" min={0} max={100} />
                            <Field label="Referral Bonus Credits" field="referral_bonus_credits" type="number" min={0} max={undefined} />
                        </div>
                    </div>

                    {/* Subscription Plans */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
                                <Settings size={20} className="text-white" />
                            </div>
                            Subscription Plans (USD)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Monthly Plan Price" field="monthly_plan_price" type="number" min={0} max={undefined} />
                            <Field label="Quarterly Plan Price" field="quarterly_plan_price" type="number" min={0} max={undefined} />
                            <Field label="Yearly Plan Price" field="yearly_plan_price" type="number" min={0} max={undefined} />
                        </div>
                    </div>

                    {/* User Limits */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" }}>
                                <Settings size={20} className="text-white" />
                            </div>
                            User Limits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Free Daily Interests" field="free_daily_interests" type="number" min={0} max={undefined} />
                            <Field label="Pro Daily Interests" field="pro_daily_interests" type="number" min={0} max={undefined} />
                            <Field label="Max Images Per Profile" field="max_images_per_profile" type="number" min={1} max={undefined} />
                            <Field label="Max Videos Per Profile" field="max_videos_per_profile" type="number" min={0} max={undefined} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
