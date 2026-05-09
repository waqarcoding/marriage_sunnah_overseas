// @ts-nocheck
// pages/Individual/ShowPinPage.jsx — matching guardian/add-ward design

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Copy, RefreshCw, Info, Mail, Phone, MapPin, Trash2,
    AlertTriangle, MessageCircle, Shield, KeyRound, Sparkles, Check, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import GuardianService from '../../../guardian/services/GuardianService';
import AuthService from '../../../auth/services/AuthService';
import ChatService from '../../../chat/services/ChatService';
import PageHeader from '../../../../ui/page_header';

export default function ShowPinPage() {
    const navigate = useNavigate();
    const [pin, setPin] = useState(null);
    const [guardian, setGuardian] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ Starts as true
    const [copied, setCopied] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        const tokenData = AuthService.getTokenData();
        if (tokenData?.role === "guardian") {
            navigate("/guardian");
            return;
        }
        loadGuardianStatus();
    }, []);

    const loadGuardianStatus = () => {
        setLoading(true);
        GuardianService.getMyGuardian({
            onSuccess: (res) => {
                if (res.data && res.data.guardianUser) {
                    const data = res.data;
                    const guardianProfile = data.guardianUser?.profile || {};

                    setGuardian({
                        id: data.guardian_id,
                        name: data.guardian_name || 'Unknown',
                        email: data.guardian_email || '',
                        phone: data.guardian_phone || '',
                        avatar: data.guardian_image || '',
                        relationship: data.guardian_relationship || '',
                        city: guardianProfile.city || '',
                        country: guardianProfile.country || '',
                        profession: guardianProfile.profession || '',
                    });
                    setPin(null);
                } else {
                    loadPin();
                }
                setLoading(false);
            },
            onFailed: () => {
                loadPin();
                setLoading(false);
            },
        });
    };

    const loadPin = () => {
        GuardianService.getMyPin({
            onSuccess: (res) => setPin(res.data?.pin || null),
            onFailed: () => { },
        });
    };

    const generatePin = () => {
        setLoading(true);
        GuardianService.generatePin({
            onSuccess: (res) => {
                setPin(res.data.pin);
                toast.success('New PIN generated!');
                setLoading(false);
            },
            onFailed: () => {
                toast.error('Failed to generate PIN');
                setLoading(false);
            },
        });
    };

    const copyPin = () => {
        if (!pin) return;
        navigator.clipboard.writeText(pin);
        setCopied(true);
        toast.success('PIN copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRemoveGuardian = () => {
        setRemoving(true);
        GuardianService.removeGuardian({
            onSuccess: () => {
                toast.success('Guardian removed!');
                setGuardian(null);
                setShowRemoveModal(false);
                setRemoving(false);
                loadPin();
            },
            onFailed: () => {
                toast.error('Failed to remove guardian');
                setRemoving(false);
            },
        });
    };

    const handleStartChat = async () => {
        if (!guardian?.id) {
            toast.error("Invalid guardian");
            return;
        }
        navigate(`/individual/chats?receiver_id=${guardian.id}`, {
            state: { receiver: { id: guardian.id, name: guardian.name, avatar: guardian.avatar } },
        });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* ── Header ── */}
            <PageHeader
                title="Guardian"
                subtitle="Fulfilling your sacred duty with honor"
            />

            {/* ── Content Area ── */}
            <div style={{ flex: 1, overflow: "auto" }}>
                <div className="px-4 mx-auto pb-6" style={{ maxWidth: 600 }}>
                    {/* ✅ Loading State */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20">
                            {/* Circular Spinner */}
                            <div className="relative w-16 h-16 mb-6">
                                <div className="absolute inset-0 rounded-full border-4 opacity-20"
                                    style={{ borderColor: 'var(--primary)' }} />
                                <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
                                    style={{
                                        borderTopColor: 'var(--primary)',
                                        borderRightColor: 'var(--primary)',
                                    }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                                Loading guardian...
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Please wait</p>
                        </motion.div>
                    )}

                    {/* ✅ Guardian Linked */}
                    {!loading && guardian && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pt-3 space-y-4">
                            <GuardianCard
                                guardian={guardian}
                                onChat={handleStartChat}
                                onRemove={() => setShowRemoveModal(true)}
                            />

                            {/* Permissions info */}
                            <InfoBanner
                                icon={Shield}
                                tone="blue"
                                title="Guardian Permissions"
                                body="Your guardian can view your profile and approve interest requests on your behalf."
                            />
                        </motion.div>
                    )}

                    {/* ✅ No Guardian - PIN Flow */}
                    {!loading && !guardian && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pt-4">
                            {/* Hero icon */}
                            <div className="text-center mb-7">
                                <div className="relative inline-block">
                                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary), black 15%))',
                                        }}>
                                        <KeyRound className="w-10 h-10" style={{ color: 'var(--primary-foreground, #fef3c7)' }} />
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                                        <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                                    </span>
                                </div>
                            </div>

                            {/* PIN card */}
                            <div className="bg-white rounded-3xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.06)] mb-4">
                                {pin ? (
                                    <>
                                        <p className="text-center text-[13px] font-bold mb-1 uppercase tracking-wider"
                                            style={{ color: 'var(--primary)' }}>
                                            Your PIN Code
                                        </p>
                                        <p className="text-center text-xs text-gray-400 mb-5">
                                            Share this with your guardian
                                        </p>

                                        {/* Big PIN display */}
                                        <div className="rounded-2xl p-6 mb-5 text-center relative overflow-hidden"
                                            style={{ background: 'var(--secondary)' }}>
                                            <div className="absolute inset-0 opacity-30 pointer-events-none"
                                                style={{
                                                    backgroundImage: 'radial-gradient(circle at 20% 50%, var(--primary) 1px, transparent 1px)',
                                                    backgroundSize: '20px 20px',
                                                }} />
                                            <div className="relative font-bold font-mono"
                                                style={{
                                                    fontSize: 'clamp(36px, 9vw, 46px)',
                                                    letterSpacing: 'clamp(6px, 2vw, 10px)',
                                                    color: 'var(--primary)',
                                                }}>
                                                {pin}
                                            </div>
                                        </div>

                                        <div className="flex gap-2.5">
                                            <button onClick={copyPin}
                                                className="flex-1 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95"
                                                style={{
                                                    border: `2px solid ${copied ? '#10b981' : 'var(--primary)'}`,
                                                    background: copied ? '#d1fae5' : 'white',
                                                    color: copied ? '#059669' : 'var(--primary)',
                                                }}>
                                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                                {copied ? 'Copied!' : 'Copy PIN'}
                                            </button>
                                            <button onClick={generatePin} disabled={loading}
                                                className="flex-1 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95"
                                                style={{
                                                    background: 'var(--primary)',
                                                    color: 'var(--primary-foreground, #fef3c7)',
                                                    opacity: loading ? 0.7 : 1,
                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                    boxShadow: '0 4px 12px rgba(27, 77, 62, 0.2)',
                                                }}>
                                                <RefreshCw size={16} />
                                                New PIN
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                                            Generate a 6-digit PIN to share<br />with your guardian
                                        </p>
                                        <button onClick={generatePin} disabled={loading}
                                            className="px-8 py-3.5 rounded-xl text-sm font-semibold transition active:scale-95"
                                            style={{
                                                background: 'var(--primary)',
                                                color: 'var(--primary-foreground, #fef3c7)',
                                                opacity: loading ? 0.7 : 1,
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                boxShadow: '0 6px 16px rgba(27, 77, 62, 0.25)',
                                            }}>
                                            {loading ? 'Generating...' : 'Generate PIN'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <InstructionsBanner />
                        </motion.div>
                    )}
                </div>
            </div>

            <RemoveModal
                show={showRemoveModal}
                title="Remove Guardian?"
                message={guardian ? (
                    <><strong>{guardian.name}</strong> will no longer be able to view your profile or approve interests.</>
                ) : ''}
                onCancel={() => !removing && setShowRemoveModal(false)}
                onConfirm={handleRemoveGuardian}
                loading={removing}
            />

            {/* ✅ Add spin animation */}
            <style>{`
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
            `}</style>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Guardian Card - Redesigned (matching WardCard)
   ───────────────────────────────────────────────────────── */
function GuardianCard({ guardian, onChat, onRemove }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            style={{ border: '1px solid rgba(27, 77, 62, 0.08)' }}
        >
            {/* Header with Avatar */}
            <div className="relative px-5 pt-6 pb-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar name={guardian.name} src={guardian.avatar} size={72} />

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-lg font-bold leading-tight truncate mb-1"
                            style={{ color: 'var(--primary)' }}>
                            {guardian.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {[guardian.relationship && `Your ${guardian.relationship}`, guardian.profession].filter(Boolean).join(' • ')}
                        </p>
                        {(guardian.city || guardian.country) && (
                            <div className="flex items-center gap-1.5 mt-2">
                                <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-400">
                                    {[guardian.city, guardian.country].filter(Boolean).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Guardian Badge */}
                    <div className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                        style={{
                            background: 'var(--primary-foreground)',
                            color: 'var(--primary, #fef3c7)',
                        }}>
                        <Shield size={10} />
                        Guardian
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px mx-5" style={{ background: 'rgba(27, 77, 62, 0.08)' }} />

            {/* Actions */}
            <div className="flex gap-3 px-5 py-4">
                <button
                    onClick={onChat}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground, #fef3c7)',
                    }}
                >
                    <MessageCircle size={16} />
                    Message
                </button>
                <button
                    onClick={onRemove}
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:bg-red-50 active:scale-95"
                    style={{
                        border: '1.5px solid #fecaca',
                        background: 'white',
                        color: '#ef4444',
                    }}
                    aria-label="Remove guardian"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────
   Banners
   ───────────────────────────────────────────────────────── */
function InfoBanner({ icon: Icon, tone = 'primary', title, body, showPattern = false }) {
    const tones = {
        primary: 'bg-[#1B4D3E]/5 border-[#1B4D3E]/15',
        gold: 'bg-[#D4AF37]/8 border-[#D4AF37]/25',
        success: 'bg-[#2d8c6e]/8 border-[#2d8c6e]/20',
        warning: 'bg-amber-500/8 border-amber-500/20',
        danger: 'bg-red-600/8 border-red-600/20',
        info: 'bg-[#f0f5f3] border-[#1B4D3E]/10',
    };

    const iconColors = {
        primary: 'text-[#1B4D3E]',
        gold: 'text-[#D4AF37]',
        success: 'text-[#2d8c6e]',
        warning: 'text-amber-600',
        danger: 'text-red-600',
        info: 'text-[#6a7282]',
    };

    const titleColors = {
        primary: 'text-[#1B4D3E]',
        gold: 'text-[#B8941F]',
        success: 'text-[#1B4D3E]',
        warning: 'text-amber-900',
        danger: 'text-red-900',
        info: 'text-[#1B4D3E]',
    };

    const bodyColors = {
        primary: 'text-[#2d8c6e]',
        gold: 'text-[#9c7d1a]',
        success: 'text-[#2d8c6e]',
        warning: 'text-amber-800',
        danger: 'text-red-800',
        info: 'text-[#5a7a70]',
    };

    const patternColors = {
        primary: '#1B4D3E',
        gold: '#D4AF37',
        success: '#2d8c6e',
        warning: '#f59e0b',
        danger: '#dc2626',
        info: '#1B4D3E',
    };

    return (
        <div className={`rounded-2xl p-4 border-[1.5px] relative overflow-hidden ${tones[tone]}`}>
            {/* Islamic Pattern */}
            {showPattern && (
                <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <defs>
                            <pattern id={`banner-pattern-${tone}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="10" cy="10" r="8" fill="none" stroke={patternColors[tone]} strokeWidth="0.5" />
                                <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="none" stroke={patternColors[tone]} strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill={`url(#banner-pattern-${tone})`} />
                    </svg>
                </div>
            )}

            <div className="flex items-start gap-3 relative z-10">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/90 shadow-sm ${iconColors[tone]}`}>
                    <Icon size={16} />
                </div>
                <div className="flex-1">
                    <h3 className={`text-[13px] font-bold mb-1 ${titleColors[tone]}`}>{title}</h3>
                    <p className={`text-[13px] leading-relaxed ${bodyColors[tone]}`}>{body}</p>
                </div>
            </div>
        </div>
    );
}
function InstructionsBanner() {
    const steps = [
        'Your guardian creates an account or logs in',
        'They go to "Add Ward" in their dashboard',
        'They enter this 6-digit PIN',
        'They select their relationship to you',
        'They confirm the linking request',
    ];
    return (
        <div className="rounded-2xl p-4"
            style={{ background: '#fef3c7', border: '1.5px solid #fde68a' }}>
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white">
                    <Info size={16} style={{ color: '#d97706' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold mb-2" style={{ color: '#92400e' }}>
                        How to Link Your Guardian
                    </h3>
                    <ol className="space-y-1.5 m-0 list-none p-0">
                        {steps.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug"
                                style={{ color: '#78350f' }}>
                                <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                                    style={{ background: '#d97706', color: 'white' }}>
                                    {i + 1}
                                </span>
                                {s}
                            </li>
                        ))}
                    </ol>
                    <p className="text-[11.5px] mt-3 font-semibold flex items-center gap-1.5"
                        style={{ color: '#92400e' }}>
                        <AlertTriangle size={12} />
                        The PIN expires after successful linking
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Shared Components
   ───────────────────────────────────────────────────────── */
function Avatar({ name, src, size = 80, ring = false }) {
    const initial = name?.[0]?.toUpperCase() || '?';
    return (
        <div
            className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{
                width: size,
                height: size,
                background: '#e5e7eb',
                border: ring ? '4px solid white' : '3px solid var(--primary)',
                boxShadow: ring ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            }}>
            {src ? (
                <img src={src} alt={name} className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML =
                            `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.38}px;font-weight:bold;color:var(--primary);background:#e5e7eb">${initial}</div>`;
                    }}
                />
            ) : (
                <span style={{ fontSize: size * 0.38, fontWeight: 'bold', color: 'var(--primary)' }}>
                    {initial}
                </span>
            )}
        </div>
    );
}

function RemoveModal({ show, title, message, onCancel, onConfirm, loading }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onCancel}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-7 w-full"
                style={{ maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                onClick={(e) => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#fee2e2' }}>
                    <AlertTriangle className="w-7 h-7" style={{ color: '#ef4444' }} />
                </div>
                <h3 className="text-lg font-bold text-center mb-2.5" style={{ color: 'var(--primary)' }}>
                    {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed text-center mb-6">
                    {message}
                </p>
                <div className="flex gap-2.5">
                    <button onClick={onCancel} disabled={loading}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition active:scale-95"
                        style={{
                            border: '2px solid #e5e7eb',
                            background: 'white',
                            color: '#6b7280',
                            opacity: loading ? 0.5 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition active:scale-95"
                        style={{
                            background: '#ef4444',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}>
                        {loading ? 'Removing...' : 'Remove'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}