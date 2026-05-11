// @ts-nocheck
// pages/Guardian/LinkWithPinPage.jsx
// Guardian's page to manage ward linking — redesigned with chat + matching layout

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Shield, Check, Mail, Phone, MapPin, Trash2,
    AlertTriangle, MessageCircle, UserPlus, Sparkles, KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import GuardianService from '../services/GuardianService';

const RELATIONSHIPS = [
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Brother", label: "Brother" },
    { value: "Sister", label: "Sister" },
    { value: "Uncle", label: "Uncle" },
    { value: "Aunt", label: "Aunt" },
    { value: "Grandfather", label: "Grandfather" },
    { value: "Grandmother", label: "Grandmother" },
    { value: "Guardian", label: "Guardian" },
    { value: "Other", label: "Other" },
];

export default function LinkWithPinPage() {
    const navigate = useNavigate();
    const [view, setView] = useState('loading');
    const [wards, setWards] = useState([]);
    const [step, setStep] = useState(1);
    const [pin, setPin] = useState('');
    const [wardDetails, setWardDetails] = useState(null);
    const [relationship, setRelationship] = useState('Guardian');
    const [loading, setLoading] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [wardToRemove, setWardToRemove] = useState(null);
    const [removing, setRemoving] = useState(false);
    const [showAddNew, setShowAddNew] = useState(false);

    useEffect(() => { loadWards(); }, []);

    const loadWards = () => {
        setView('loading');
        GuardianService.getMyWards({
            onSuccess: (res) => {
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    const wardsData = res.data.map(guardian => {
                        const profile = guardian.individualProfile || {};
                        return {
                            id: guardian.individual_id,
                            name: profile.name || 'Unknown Ward',
                            email: profile.email || '',
                            phone: profile.phone || guardian.guardian_phone || '',
                            avatar: profile.avatar || profile.image || guardian.guardian_image || '',
                            age: profile.age || '',
                            gender: profile.gender || '',
                            city: profile.city || '',
                            country: profile.country || '',
                            relationship: guardian.guardian_relationship || 'Guardian'
                        };
                    });
                    setWards(wardsData);
                    setView('linked');
                    setShowAddNew(false);
                } else {
                    setWards([]);
                    setView('not-linked');
                }
            },
            onFailed: () => setView('not-linked'),
        });
    };

    const handlePinChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setPin(value);
    };

    const verifyPin = () => {
        if (pin.length !== 6) {
            toast.error('Please enter a 6-digit PIN');
            return;
        }
        setLoading(true);
        GuardianService.verifyPin({ pin }, {
            onSuccess: (res) => { setWardDetails(res.data); setStep(2); setLoading(false); },
            onFailed: () => setLoading(false),
        });
    };

    const confirmLink = () => {
        setLoading(true);
        GuardianService.linkWithPin({ pin, relationship }, {
            onSuccess: () => {
                setStep(3);
                setLoading(false);
                setTimeout(() => {
                    setStep(1); setPin(''); setWardDetails(null); loadWards();
                }, 2000);
            },
            onFailed: () => setLoading(false),
        });
    };

    const handleRemoveWard = () => {
        if (!wardToRemove) return;
        setRemoving(true);
        GuardianService.removeWard({ wardId: wardToRemove.id }, {
            onSuccess: () => {
                toast.success('Ward removed successfully!');
                setShowRemoveModal(false); setWardToRemove(null); setRemoving(false);
                loadWards();
            },
            onFailed: () => setRemoving(false),
        });
    };

    const handleStartChat = (ward) => {
        if (!ward?.id) return;
        navigate(`/chats?receiver_id=${ward.id}`, {
            state: { receiver: { id: ward.id, name: ward.name, avatar: ward.avatar } },
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && pin.length === 6 && !loading) verifyPin();
    };

    const showPinFlow = view === 'not-linked' || showAddNew;

    return (
        <div className="min-h-screen pb-24" style={{ background: 'var(--secondary)' }}>
            {/* ── Header ── */}
            <div className="px-5 pt-5 pb-2">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-[26px] font-extrabold tracking-tight text-gray-900 leading-tight mb-1"
                            style={{ letterSpacing: '-0.03em' }}>
                            My Wards
                        </h1>
                        <p className="text-sm text-gray-400 font-medium">
                            {view === 'linked' && !showAddNew
                                ? `Managing ${wards.length} ward${wards.length !== 1 ? 's' : ''}`
                                : 'Connect with your ward using their PIN'}
                        </p>
                    </div>
                    {view === 'linked' && !showAddNew && (
                        <button
                            onClick={() => setShowAddNew(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold transition active:scale-95"
                            style={{
                                background: 'var(--primary)',
                                color: 'var(--primary-foreground, #fef3c7)',
                            }}
                        >
                            <UserPlus size={15} />
                            Add
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4 mx-auto" style={{ maxWidth: 600 }}>
                <AnimatePresence mode="wait">
                    {/* ── Loading ── */}
                    {view === 'loading' && (
                        <motion.div key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center py-16">
                            <div className="w-10 h-10 mx-auto rounded-full"
                                style={{
                                    border: '4px solid var(--secondary)',
                                    borderTop: '4px solid var(--primary)',
                                    animation: 'spin 1s linear infinite',
                                }} />
                            <p className="mt-5 text-sm text-gray-500">Loading...</p>
                        </motion.div>
                    )}

                    {/* ── Wards List ── */}
                    {view === 'linked' && !showAddNew && (
                        <motion.div key="wards-list"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="pt-3 space-y-4">
                            {wards.map((ward, idx) => (
                                <WardCard
                                    key={ward.id}
                                    ward={ward}
                                    index={idx}
                                    onChat={() => handleStartChat(ward)}
                                    onRemove={() => { setWardToRemove(ward); setShowRemoveModal(true); }}
                                />
                            ))}
                        </motion.div>
                    )}

                    {/* ── PIN Flow ── */}
                    {showPinFlow && (
                        <motion.div key="pin-flow"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="pt-4">
                            {/* Hero icon */}
                            {step !== 3 && (
                                <div className="text-center mb-7">
                                    <div className="relative inline-block">
                                        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg"
                                            style={{
                                                background: 'linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary), black 15%))',
                                            }}>
                                            <Shield className="w-10 h-10" style={{ color: 'var(--primary-foreground, #fef3c7)' }} />
                                        </div>
                                        <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                                            <KeyRound size={14} style={{ color: 'var(--primary)' }} />
                                        </span>
                                    </div>
                                    {showAddNew && view === 'linked' && (
                                        <button
                                            onClick={() => setShowAddNew(false)}
                                            className="mt-4 text-xs font-semibold text-gray-500 hover:text-gray-700"
                                        >
                                            ← Back to my wards
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Step 1 */}
                            {step === 1 && (
                                <motion.div key="step1"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-3xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                                    <label className="block text-center text-[13px] font-bold mb-1 uppercase tracking-wider"
                                        style={{ color: 'var(--primary)' }}>
                                        Ward's PIN Code
                                    </label>
                                    <p className="text-center text-xs text-gray-400 mb-5">
                                        Enter the 6-digit PIN your ward shared
                                    </p>
                                    <input
                                        type="text"
                                        value={pin}
                                        onChange={handlePinChange}
                                        onKeyPress={handleKeyPress}
                                        placeholder="000000"
                                        maxLength={6}
                                        autoFocus
                                        inputMode="numeric"
                                        className="w-full text-center font-bold font-mono outline-none box-border transition-all"
                                        style={{
                                            padding: '20px',
                                            fontSize: 'clamp(28px, 8vw, 38px)',
                                            letterSpacing: 'clamp(8px, 2.5vw, 14px)',
                                            borderRadius: 16,
                                            border: '2px solid #e5e7eb',
                                            color: 'var(--primary)',
                                            background: '#fafafa',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'var(--primary)';
                                            e.target.style.background = 'white';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(27, 77, 62, 0.08)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.background = '#fafafa';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    <button
                                        onClick={verifyPin}
                                        disabled={pin.length !== 6 || loading}
                                        className="w-full mt-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98]"
                                        style={{
                                            background: 'var(--primary)',
                                            color: 'var(--primary-foreground, #fef3c7)',
                                            opacity: pin.length !== 6 || loading ? 0.5 : 1,
                                            cursor: pin.length !== 6 || loading ? 'not-allowed' : 'pointer',
                                            boxShadow: pin.length === 6 && !loading ? '0 8px 20px rgba(27, 77, 62, 0.25)' : 'none',
                                        }}
                                    >
                                        {loading ? 'Verifying...' : 'Continue'}
                                        {!loading && <ArrowRight size={18} />}
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 2 */}
                            {step === 2 && wardDetails && (
                                <motion.div key="step2"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                                    <div className="text-center mb-5">
                                        <Sparkles size={18} className="mx-auto mb-2" style={{ color: 'var(--primary)' }} />
                                        <p className="text-sm font-semibold text-gray-500">Confirm Ward Details</p>
                                    </div>

                                    <div className="rounded-2xl p-5 mb-5 flex flex-col items-center text-center"
                                        style={{ background: 'var(--secondary)' }}>
                                        <Avatar name={wardDetails.name} src={wardDetails.avatar} size={88} />
                                        <h3 className="mt-3 text-xl font-bold" style={{ color: 'var(--primary)' }}>
                                            {wardDetails.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {wardDetails.age} years • {wardDetails.gender}
                                        </p>
                                        {(wardDetails.city || wardDetails.country) && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {[wardDetails.city, wardDetails.country].filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-5">
                                        <label className="block text-xs font-bold mb-2 uppercase tracking-wider"
                                            style={{ color: 'var(--primary)' }}>
                                            Your Relationship
                                        </label>
                                        <select
                                            value={relationship}
                                            onChange={(e) => setRelationship(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none cursor-pointer transition"
                                            style={{
                                                border: '2px solid #e5e7eb',
                                                color: 'var(--primary)',
                                                background: 'white',
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        >
                                            {RELATIONSHIPS.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setStep(1); setWardDetails(null); setPin(''); }}
                                            className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition active:scale-95"
                                            style={{
                                                border: '2px solid #e5e7eb',
                                                background: 'white',
                                                color: '#6b7280',
                                            }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={confirmLink}
                                            disabled={loading}
                                            className="flex-[2] py-3.5 rounded-xl text-sm font-semibold transition active:scale-95"
                                            style={{
                                                background: 'var(--primary)',
                                                color: 'var(--primary-foreground, #fef3c7)',
                                                opacity: loading ? 0.7 : 1,
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                boxShadow: '0 6px 16px rgba(27, 77, 62, 0.2)',
                                            }}
                                        >
                                            {loading ? 'Linking...' : 'Confirm & Link'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3 */}
                            {step === 3 && (
                                <motion.div key="step3"
                                    initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-3xl py-12 px-7 shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-center">
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                                        style={{ background: '#d1fae5' }}>
                                        <Check className="w-10 h-10" style={{ color: '#059669' }} />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                                        Successfully Linked!
                                    </h2>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        You can now manage <strong>{wardDetails?.name}</strong>'s profile<br />
                                        and approve their interests.
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Remove Modal ── */}
            <RemoveModal
                show={showRemoveModal}
                title="Remove Ward?"
                message={wardToRemove ? (
                    <>You will no longer be able to manage <strong>{wardToRemove.name}</strong>'s profile or approve their interests. This action cannot be undone.</>
                ) : ''}
                onCancel={() => !removing && setShowRemoveModal(false)}
                onConfirm={handleRemoveWard}
                loading={removing}
            />

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Ward Card
   ───────────────────────────────────────────────────────── */
function WardCard({ ward, index, onChat, onRemove }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
        >
            {/* Gradient header strip */}
            <div className="relative h-28"
                style={{
                    background: 'linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary), black 20%))',
                }}>
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)',
                        backgroundSize: '24px 24px, 32px 32px',
                    }} />
                {ward.relationship && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            color: 'var(--primary-foreground, #fef3c7)',
                        }}>
                        {ward.relationship}
                    </div>
                )}
            </div>

            <div className="px-5 pb-5">
                {/* Avatar overlapping the strip */}
                <div className="flex items-end gap-4 -mt-14 mb-4">
                    <Avatar name={ward.name} src={ward.avatar} size={88} ring />
                    <div className="flex-1 min-w-0 pb-1">
                        <h3 className="text-lg font-bold leading-tight truncate"
                            style={{ color: 'var(--primary)' }}>
                            {ward.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {[ward.age && `${ward.age} yrs`, ward.gender].filter(Boolean).join(' • ')}
                        </p>
                    </div>
                </div>

                {/* Contact rows */}
                {(ward.email || ward.phone || ward.city || ward.country) && (
                    <div className="rounded-2xl p-3.5 mb-4 space-y-2.5"
                        style={{ background: 'var(--secondary)' }}>
                        {ward.email && (
                            <ContactRow icon={Mail} text={ward.email} breakAll />
                        )}
                        {ward.phone && (
                            <ContactRow icon={Phone} text={ward.phone} />
                        )}
                        {(ward.city || ward.country) && (
                            <ContactRow icon={MapPin} text={[ward.city, ward.country].filter(Boolean).join(', ')} />
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2.5">
                    <button
                        onClick={onChat}
                        className="flex-[2] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-[0.97]"
                        style={{
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground, #fef3c7)',
                            boxShadow: '0 4px 12px rgba(27, 77, 62, 0.18)',
                        }}
                    >
                        <MessageCircle size={16} />
                        Chat
                    </button>
                    <button
                        onClick={onRemove}
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition active:scale-95"
                        style={{
                            border: '1.5px solid #fecaca',
                            background: 'white',
                            color: '#ef4444',
                        }}
                        aria-label="Remove ward"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────
   Shared mini-components (also used by ShowPinPage)
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
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover"
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

function ContactRow({ icon: Icon, text, breakAll }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'white' }}>
                <Icon size={13} style={{ color: 'var(--primary)' }} />
            </div>
            <span className={`text-[13px] text-gray-700 ${breakAll ? 'break-all' : ''}`}>
                {text}
            </span>
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
