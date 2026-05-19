import { useState, useEffect } from "react";
import {
    Settings, Save, Lock, AlertCircle, Globe, CreditCard,
    Users, Gift, Shield, DollarSign, Zap, FileText, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";


export default function AdminSettingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = adminUser.role === 'admin';

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'plans', label: 'Plans & Pricing', icon: CreditCard },
        { id: 'credits', label: 'Credits & Costs', icon: DollarSign },
        { id: 'referrals', label: 'Referral System', icon: Gift },
        { id: 'limits', label: 'Verification', icon: Users },

    ];

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
                loadSettings();
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Platform Settings</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {isSuperAdmin ? "Configure platform settings" : "View platform settings (read-only)"}
                            </p>
                        </div>

                    </div>

                    {!isSuperAdmin && (
                        <div className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-xl p-3 flex items-center gap-3">
                            <Lock size={18} className="text-amber-600 flex-shrink-0" />
                            <p className="text-sm text-amber-800 font-medium">
                                Read-only access. Only super admins can modify settings.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs - Mobile Horizontal Scroll */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex overflow-x-auto hide-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-2 px-4 sm:px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all"
                                style={{
                                    borderColor: activeTab === tab.id ? '#1B4D3E' : 'transparent',
                                    color: activeTab === tab.id ? '#1B4D3E' : '#6b7280'
                                }}
                            >
                                <tab.icon size={18} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {activeTab === 'general' && <GeneralSettings settings={settings} updateField={updateField} isSuperAdmin={isSuperAdmin} />}
                {activeTab === 'plans' && <PlansSettings settings={settings} updateField={updateField} isSuperAdmin={isSuperAdmin} />}
                {activeTab === 'credits' && <CreditsSettings settings={settings} updateField={updateField} isSuperAdmin={isSuperAdmin} />}
                {activeTab === 'referrals' && <ReferralSettings settings={settings} updateField={updateField} isSuperAdmin={isSuperAdmin} />}
                {activeTab === 'limits' && <LimitsSettings settings={settings} updateField={updateField} isSuperAdmin={isSuperAdmin} />}
                {activeTab === 'features' && <FeaturesSettings settings={settings} updateField={updateField} isSuperAdmin={isSuperAdmin} />}

                {/* Bottom Save Button */}
                {isSuperAdmin && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-2xl p-4 shadow-lg">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 px-6 h-12 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}
                        >
                            <Save size={20} />
                            {saving ? "Saving Changes..." : "Save All Changes"}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

// Field Components
const Field = ({ label, field, value, onChange, type = "text", min, max, disabled, placeholder }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            disabled={disabled}
            min={min}
            max={max}
            placeholder={placeholder}
            className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
    </div>
);

const TextArea = ({ label, field, value, onChange, disabled, rows = 3 }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <textarea
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            disabled={disabled}
            rows={rows}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1B4D3E] outline-none transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
    </div>
);

const Toggle = ({ label, field, value, onChange, disabled }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <button
            onClick={() => !disabled && onChange(field, !value)}
            disabled={disabled}
            className="relative w-14 h-7 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: value ? '#1B4D3E' : '#d1d5db' }}
        >
            <div
                className="absolute top-1 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ transform: value ? 'translateX(28px)' : 'translateX(4px)' }}
            />
        </button>
    </div>
);

// Tab Content Components
function GeneralSettings({ settings, updateField, isSuperAdmin }) {
    return (
        <div className="space-y-6">
            <Section title="Site Information" icon={Globe}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Site Name" field="site_name" value={settings?.site_name} onChange={updateField} disabled={!isSuperAdmin} min={undefined} max={undefined} placeholder={undefined} />
                    <Field label="Site Tagline" field="site_tagline" value={settings?.site_tagline} onChange={updateField} disabled={!isSuperAdmin} min={undefined} max={undefined} placeholder={undefined} />
                    <Field label="Site Logo URL" field="site_logo_url" value={settings?.site_logo_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://..." min={undefined} max={undefined} />
                    <Field label="Favicon URL" field="site_favicon_url" value={settings?.site_favicon_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://..." min={undefined} max={undefined} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Toggle label="Maintenance Mode" field="maintenance_mode" value={settings?.maintenance_mode} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
                {settings?.maintenance_mode && (
                    <div className="mt-4">
                        <TextArea label="Maintenance Message" field="maintenance_message" value={settings?.maintenance_message} onChange={updateField} disabled={!isSuperAdmin} />
                    </div>
                )}
            </Section>

            <Section title="Contact & Support" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Support Email" field="support_email" value={settings?.support_email} onChange={updateField} disabled={!isSuperAdmin} type="email" min={undefined} max={undefined} placeholder={undefined} />
                    <Field label="Support Phone" field="support_phone" value={settings?.support_phone} onChange={updateField} disabled={!isSuperAdmin} min={undefined} max={undefined} placeholder={undefined} />
                    <Field label="WhatsApp Number" field="support_whatsapp" value={settings?.support_whatsapp} onChange={updateField} disabled={!isSuperAdmin} min={undefined} max={undefined} placeholder={undefined} />
                </div>
                <div className="mt-4">
                    <TextArea label="Office Address" field="office_address" value={settings?.office_address} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
            </Section>

            <Section title="Social Media Links" icon={Globe}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Facebook URL" field="facebook_url" value={settings?.facebook_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://facebook.com/..." min={undefined} max={undefined} />
                    <Field label="Instagram URL" field="instagram_url" value={settings?.instagram_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://instagram.com/..." min={undefined} max={undefined} />
                    <Field label="Twitter URL" field="twitter_url" value={settings?.twitter_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://twitter.com/..." min={undefined} max={undefined} />
                    <Field label="LinkedIn URL" field="linkedin_url" value={settings?.linkedin_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://linkedin.com/..." min={undefined} max={undefined} />
                    <Field label="YouTube URL" field="youtube_url" value={settings?.youtube_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://youtube.com/..." min={undefined} max={undefined} />
                </div>
            </Section>

            <Section title="Terms & Policies" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Terms of Service URL" field="terms_of_service_url" value={settings?.terms_of_service_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://..." min={undefined} max={undefined} />
                    <Field label="Privacy Policy URL" field="privacy_policy_url" value={settings?.privacy_policy_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://..." min={undefined} max={undefined} />
                    <Field label="Cookie Policy URL" field="cookie_policy_url" value={settings?.cookie_policy_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://..." min={undefined} max={undefined} />
                    <Field label="Refund Policy URL" field="refund_policy_url" value={settings?.refund_policy_url} onChange={updateField} disabled={!isSuperAdmin} placeholder="https://..." min={undefined} max={undefined} />
                </div>
            </Section>
        </div>
    );
}

function PlansSettings({ settings, updateField, isSuperAdmin }) {
    return (
        <div className="space-y-6">
            <Section title="Basic Plan (Weekly)" icon={CreditCard}>
                <div className="mb-4">
                    <Toggle label="Enable Basic Plan" field="basic_plan_enabled" value={settings?.basic_plan_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Plan Name" field="basic_plan_name" value={settings?.basic_plan_name} onChange={updateField} disabled={!isSuperAdmin} min={undefined} max={undefined} placeholder={undefined} />
                    <Field label="Credits Included" field="basic_plan_credits" value={settings?.basic_plan_credits} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Duration (days)" field="basic_plan_duration_days" value={settings?.basic_plan_duration_days} onChange={updateField} disabled={!isSuperAdmin} type="number" min={1} max={undefined} placeholder={undefined} />
                    <Field label="Price (USD)" field="basic_plan_price_usd" value={settings?.basic_plan_price_usd} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                </div>
                <div className="mt-4">
                    <Toggle label="Mark as Popular" field="basic_plan_popular" value={settings?.basic_plan_popular} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
            </Section>

            <Section title="Premium Plan (Monthly)" icon={CreditCard}>
                <div className="mb-4">
                    <Toggle label="Enable Premium Plan" field="premium_plan_enabled" value={settings?.premium_plan_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Plan Name" field="premium_plan_name" value={settings?.premium_plan_name} onChange={updateField} disabled={!isSuperAdmin} min={undefined} max={undefined} placeholder={undefined} />
                    <Field label="Credits Included" field="premium_plan_credits" value={settings?.premium_plan_credits} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Duration (days)" field="premium_plan_duration_days" value={settings?.premium_plan_duration_days} onChange={updateField} disabled={!isSuperAdmin} type="number" min={1} max={undefined} placeholder={undefined} />
                    <Field label="Price (USD)" field="premium_plan_price_usd" value={settings?.premium_plan_price_usd} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                </div>
                <div className="mt-4">
                    <Toggle label="Mark as Popular" field="premium_plan_popular" value={settings?.premium_plan_popular} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
            </Section>

            <Section title="Platinum Plan (Yearly)" icon={CreditCard}>
                <div className="mb-4">
                    <Toggle label="Enable Platinum Plan" field="platinum_plan_enabled" value={settings?.platinum_plan_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Plan Name" field="platinum_plan_name" value={settings?.platinum_plan_name} onChange={updateField} disabled={!isSuperAdmin} min={undefined} max={undefined} placeholder={undefined} />
                    <Field label="Credits Included" field="platinum_plan_credits" value={settings?.platinum_plan_credits} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Duration (days)" field="platinum_plan_duration_days" value={settings?.platinum_plan_duration_days} onChange={updateField} disabled={!isSuperAdmin} type="number" min={1} max={undefined} placeholder={undefined} />
                    <Field label="Price (USD)" field="platinum_plan_price_usd" value={settings?.platinum_plan_price_usd} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                </div>
                <div className="mt-4">
                    <Toggle label="Mark as Popular" field="platinum_plan_popular" value={settings?.platinum_plan_popular} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
            </Section>

            <Section title="Payment Processors" icon={DollarSign}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Toggle label="Stripe Enabled" field="stripe_enabled" value={settings?.stripe_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                    <Toggle label="JazzCash Enabled" field="jazzcash_enabled" value={settings?.jazzcash_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                    <Toggle label="EasyPaisa Enabled" field="easypaisa_enabled" value={settings?.easypaisa_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                    <Toggle label="PayPal Enabled" field="paypal_enabled" value={settings?.paypal_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
            </Section>

            <Section title="Payment Settings" icon={DollarSign}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Currency Code" field="currency_code" value={settings?.currency_code} onChange={updateField} disabled={!isSuperAdmin} placeholder="USD" min={undefined} max={undefined} />
                    <Field label="Refund Policy (days)" field="refund_policy_days" value={settings?.refund_policy_days} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                </div>
            </Section>
        </div>
    );
}

function CreditsSettings({ settings, updateField, isSuperAdmin }) {
    return (
        <div className="space-y-6">
            <Section title="Action Costs" icon={DollarSign}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Send Interest" field="cost_send_interest" value={settings?.cost_send_interest} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Send Message" field="cost_send_message" value={settings?.cost_send_message} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Unlock Phone" field="cost_unlock_phone" value={settings?.cost_unlock_phone} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Unlock Email" field="cost_unlock_email" value={settings?.cost_unlock_email} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Boost Profile" field="cost_boost_profile" value={settings?.cost_boost_profile} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Upload Image" field="cost_upload_image" value={settings?.cost_upload_image} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Upload Video" field="cost_upload_video" value={settings?.cost_upload_video} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Super Like" field="cost_super_like" value={settings?.cost_super_like} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Undo Action" field="cost_undo_action" value={settings?.cost_undo_action} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                </div>
            </Section>

            <Section title="Free Credits & Bonuses" icon={Gift}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Credits on Signup" field="free_credits_on_signup" value={settings?.free_credits_on_signup} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Credits on Verification" field="free_credits_on_verification" value={settings?.free_credits_on_verification} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Credits on Profile Complete" field="free_credits_on_profile_complete" value={settings?.free_credits_on_profile_complete} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                </div>
            </Section>
        </div>
    );
}

function ReferralSettings({ settings, updateField, isSuperAdmin }) {
    return (
        <div className="space-y-6">
            <Section title="Referral Rewards" icon={Gift}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Referrer Credits" field="referral_credits_referrer" value={settings?.referral_credits_referrer} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Referee Credits" field="referral_credits_referee" value={settings?.referral_credits_referee} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Commission %" field="referral_commission_percentage" value={settings?.referral_commission_percentage} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={100} placeholder={undefined} />
                    <Field label="General Commission %" field="commission_percentage" value={settings?.commission_percentage} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={100} placeholder={undefined} />
                </div>
            </Section>
        </div>
    );
}

function LimitsSettings({ settings, updateField, isSuperAdmin }) {
    return (
        <div className="space-y-6">
            {/*
              <Section title="Free User Limits" icon={Users}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Daily Interests" field="free_daily_interests" value={settings?.free_daily_interests} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Daily Messages" field="free_daily_messages" value={settings?.free_daily_messages} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                </div>
            </Section>

            <Section title="Premium User Limits" icon={Users}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Daily Interests" field="premium_daily_interests" value={settings?.premium_daily_interests} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                    <Field label="Daily Messages" field="premium_daily_messages" value={settings?.premium_daily_messages} onChange={updateField} disabled={!isSuperAdmin} type="number" min={0} max={undefined} placeholder={undefined} />
                </div>
            </Section>
            
            */}


            <Section title="Guardian Settings" icon={Shield}>
                <div className="grid grid-cols-1 gap-4">
                    <Toggle label="Guardian Verification Required" field="guardian_verification_required" value={settings?.guardian_verification_required} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
            </Section>
        </div>
    );
}

function FeaturesSettings({ settings, updateField, isSuperAdmin }) {
    return (
        <div className="space-y-6">
            <Section title="Communication Features" icon={Zap}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Toggle label="Video Calling" field="video_call_enabled" value={settings?.video_call_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                    <Toggle label="Voice Calling" field="voice_call_enabled" value={settings?.voice_call_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
            </Section>

            <Section title="Platform Features" icon={Zap}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Toggle label="Success Stories" field="success_stories_enabled" value={settings?.success_stories_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                    <Toggle label="Events & Meetups" field="events_enabled" value={settings?.events_enabled} onChange={updateField} disabled={!isSuperAdmin} />
                    <Toggle label="Manual Profile Approval" field="manual_profile_approval" value={settings?.manual_profile_approval} onChange={updateField} disabled={!isSuperAdmin} />
                </div>
            </Section>
        </div>
    );
}

// Section Component
function Section({ title, icon: Icon, children }) {
    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1B4D3E 0%, #2d7a63 100%)" }}>
                    <Icon size={18} className="text-white" />
                </div>
                {title}
            </h3>
            {children}
        </div>
    );
}