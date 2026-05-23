import { useState, useEffect } from "react";
import {
    Settings, Save, Lock, AlertCircle, Globe, CreditCard,
    Users, Gift, Shield, DollarSign, Zap, FileText, ChevronRight, UserCheck, FileCheck, CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminService from "./services/AdminService";
import { motion } from "framer-motion";


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
        setSettings(prev => {
            const newSettings = { ...prev, [field]: value };

            // Auto-disable skip option when manual approval is ON
            if (field === 'manual_profile_approval' && value === true) {
                newSettings.allow_skip_after_submit = false;
            }

            return newSettings;
        });
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
    // ✅ Define function INSIDE component
    const getSignUpFlowSteps = () => {
        const steps = [];
        let stepNumber = 1;

        // Step 1: Always - User Registration
        steps.push({
            title: "User Registration",
            description: "User creates account with basic information",
            icon: Users,
            iconBg: "bg-blue-50 border-blue-200",
            iconColor: "text-blue-600",
            badge: "bg-blue-100 text-blue-700",
            stepNumber: stepNumber++
        });

        // Step 2: User CNIC Verification (if enabled)
        if (settings?.user_verification_required) {
            steps.push({
                title: "User CNIC Verification",
                description: "User uploads CNIC for admin verification",
                icon: FileCheck,
                iconBg: "bg-purple-50 border-purple-200",
                iconColor: "text-purple-600",
                badge: "bg-purple-100 text-purple-700",
                stepNumber: stepNumber++
            });
        }

        // Step 3: Guardian Linking (if enabled)
        if (settings?.guardian_linking_required) {
            steps.push({
                title: "Guardian Linking",
                description: "User links their guardian account",
                icon: Users,
                iconBg: "bg-orange-50 border-orange-200",
                iconColor: "text-orange-600",
                badge: "bg-orange-100 text-orange-700",
                stepNumber: stepNumber++
            });
        }


        // Step 5: Admin Profile Approval (if enabled)
        if (settings?.manual_profile_approval) {
            steps.push({
                title: "Admin Profile Approval",
                description: "Staff/Admin reviews and approves the profile",
                icon: UserCheck,
                iconBg: "bg-red-50 border-red-200",
                iconColor: "text-red-600",
                badge: "bg-red-100 text-red-700",
                stepNumber: stepNumber++
            });
        }

        // Step 6: Profile Live
        steps.push({
            title: "Profile Goes Live",
            description: settings?.allow_skip_after_submit && !settings?.manual_profile_approval
                ? "User can skip optional steps and start using platform"
                : "User can now access the platform",
            icon: CheckCircle,
            iconBg: "bg-green-50 border-green-200",
            iconColor: "text-green-600",
            badge: "bg-green-100 text-green-700",
            stepNumber: stepNumber++
        });

        return steps;
    };

    return (
        <div className="space-y-6">
            <Section
                title={
                    <div className="flex items-center justify-between w-full">
                        <span>SignUp Settings</span>
                        <span className="text-sm font-normal text-gray-500">
                            {getSignUpFlowSteps().length} step flow
                        </span>
                    </div>
                }
                icon={Shield}
            >
                <div className="grid grid-cols-1 gap-4">
                    {/* User CNIC Verification */}
                    <Toggle
                        label="User CNIC Verification Required on Sign Up"
                        field="user_verification_required"
                        value={settings?.user_verification_required}
                        onChange={updateField}
                        disabled={!isSuperAdmin}
                    />
                    <p className="text-sm text-gray-500 -mt-2 ml-1">
                        When enabled, new users must submit CNIC for admin verification before accessing the platform
                    </p>

                    {/* Guardian Linking */}
                    <Toggle
                        label="Guardian Linking Required on Sign Up"
                        field="guardian_linking_required"
                        value={settings?.guardian_linking_required}
                        onChange={updateField}
                        disabled={!isSuperAdmin}
                    />
                    <p className="text-sm text-gray-500 -mt-2 ml-1">
                        When enabled, users must link a guardian (another user account) during registration
                    </p>

                    {/* Guardian CNIC Verification */}
                    <Toggle
                        label="Guardian CNIC Verification Required on Sign Up"
                        field="guardian_verification_required"
                        value={settings?.guardian_verification_required}
                        onChange={updateField}
                        disabled={!isSuperAdmin}
                    />
                    <p className="text-sm text-gray-500 -mt-2 ml-1">
                        When enabled, guardian accounts must submit CNIC for admin verification during sign up
                    </p>

                    {/* Manual Profile Approval */}
                    <Toggle
                        label="Admin/Staff Approval Required Before Profile Goes Live"
                        field="manual_profile_approval"
                        value={settings?.manual_profile_approval}
                        onChange={updateField}
                        disabled={!isSuperAdmin}
                    />
                    <p className="text-sm text-gray-500 -mt-2 ml-1">
                        When enabled, staff/admin must approve profiles before they become visible to others
                    </p>

                    {/* Skip Option */}
                    <Toggle
                        label="Show Skip Option After Submit"
                        field="allow_skip_after_submit"
                        value={settings?.manual_profile_approval ? false : settings?.allow_skip_after_submit}
                        onChange={updateField}
                        disabled={!isSuperAdmin || settings?.manual_profile_approval}
                    />
                    {settings?.manual_profile_approval ? (
                        <p className="text-sm text-amber-600 -mt-2 ml-1">
                            ⚠️ Disabled because "Admin/Staff Approval" is enabled. Users must wait for approval before their profile goes live.
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 -mt-2 ml-1">
                            When enabled, users can skip optional steps after submitting their profile
                        </p>
                    )}
                </div>

                {/* Flow Preview */}
                <div className="mt-6 border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-900">Sign Up Flow Preview</h4>
                        <span className="text-xs text-gray-500">Based on current settings</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {getSignUpFlowSteps().map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex gap-[18px]"
                                >
                                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border-2 ${step.iconBg}`}>
                                        <Icon className={`w-[22px] h-[22px] ${step.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                                            <h4 className="m-0 text-[15px] font-semibold text-[#1B4D3E] tracking-tight">
                                                {step.title}
                                            </h4>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide whitespace-nowrap ${step.badge}`}>
                                                Step {step.stepNumber}
                                            </span>
                                        </div>
                                        <p className="m-0 text-sm text-gray-500 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
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