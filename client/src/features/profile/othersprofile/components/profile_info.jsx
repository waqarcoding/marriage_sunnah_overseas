// @ts-nocheck
import { motion } from "motion/react";
import {
    Heart, MessageCircle, Star, MapPin, Briefcase,
    GraduationCap, Moon, Globe, Ruler, Users, Baby, DollarSign, BookOpen,
    Phone, Mail, Lock, Unlock
} from "lucide-react";
import { Badge } from "../../../../ui/badge";
import { useState, useEffect } from "react";
import ProfileService from "../../services/ProfileService";
import { toast } from "react-hot-toast";
import RevealContactDialog from "../components/ reveal_contact_dialog";
import AuthService from "../../../auth/services/AuthService";

function Row({ icon: Icon, label, value, accent = "#1B4D3E", bg = "#f0f5f3" }) {
    if (!value && value !== 0) return null;
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 0",
            borderBottom: "0.5px solid rgba(27,77,62,0.06)"
        }}>
            <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: bg
            }}>
                <Icon style={{ width: "16px", height: "16px", color: accent }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: "0 0 2px",
                    fontSize: "10px",
                    fontWeight: "500",
                    color: "#9ca3af",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase"
                }}>
                    {label}
                </p>
                <p style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#1B4D3E",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function ContactRow({ icon: Icon, label, value, type, isRevealed, onUnlock, isUnlocking, creditCost, accent = "#1B4D3E", bg = "#f0f5f3", role }) {
    // console.log(`ContactRow - label: ${label}, value: ${value}, type: ${type}, isRevealed: ${isRevealed}`);

    if (!value) {
        //   console.log(`ContactRow - ${label} has no value, returning null`);
        return null;
    }

    // Mask the value based on type
    let maskedValue;
    if (isRevealed) {
        maskedValue = value;
    } else {
        if (type === 'email') {
            // Email: Hide first 4 characters - show ****rest@email.com
            maskedValue = value.length > 4
                ? `${"*".repeat(4)}${value.slice(4)}`
                : value;
        } else if (type === 'phone') {
            // Phone: Hide all except last 4 characters - show *******4345
            maskedValue = value.length > 4
                ? `${"*".repeat(value.length - 4)}${value.slice(-4)}`
                : value;
        } else {
            // Fallback
            maskedValue = `${"*".repeat(Math.max(0, value.length - 3))}${value.slice(-3)}`;
        }
    }

    // console.log(`ContactRow - ${label} maskedValue: ${maskedValue}`);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 0",
            borderBottom: "0.5px solid rgba(27,77,62,0.06)"
        }}>
            <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: bg
            }}>
                <Icon style={{ width: "16px", height: "16px", color: accent }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: "0 0 2px",
                    fontSize: "10px",
                    fontWeight: "500",
                    color: "#9ca3af",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase"
                }}>
                    {label}
                </p>
                <p style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: "500",
                    color: isRevealed ? "#1B4D3E" : "#9ca3af",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    letterSpacing: isRevealed ? "normal" : "0.05em"
                }}>
                    {maskedValue}
                </p>
            </div>
            {!isRevealed && role !== "guardian" && (

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onUnlock}
                    disabled={isUnlocking}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "#1B4D3E",
                        border: "none",
                        cursor: isUnlocking ? "not-allowed" : "pointer",
                        opacity: isUnlocking ? 0.6 : 1,
                        transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                        if (!isUnlocking) e.currentTarget.style.background = "#143d31";
                    }}
                    onMouseLeave={(e) => {
                        if (!isUnlocking) e.currentTarget.style.background = "#1B4D3E";
                    }}
                >
                    {isUnlocking ? (
                        <div style={{
                            width: "12px",
                            height: "12px",
                            border: "2px solid #ffffff",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            animation: "spin 0.6s linear infinite"
                        }} />
                    ) : (
                        <Unlock style={{ width: "12px", height: "12px", color: "#ffffff" }} />
                    )}
                    <span style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#ffffff",
                        whiteSpace: "nowrap"
                    }}>
                        {isUnlocking ? "Unlocking..." : `${creditCost} 💰`}
                    </span>
                </motion.button>
            )}
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{
            margin: "16px 16px 0",
            background: "#ffffff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(27,77,62,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            border: "0.5px solid rgba(27,77,62,0.06)"
        }}>
            <div style={{
                padding: "16px 18px 12px",
                borderBottom: "0.5px solid rgba(27,77,62,0.08)"
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1B4D3E",
                    letterSpacing: "0.01em"
                }}>
                    {title}
                </h3>
            </div>
            <div style={{ padding: "4px 18px 18px" }}>
                {children}
            </div>
        </div>
    );
}

export default function ProfileInfoSection({ p, interests, onStartChat, onLike, userId }) {



    const [contactRevealed, setContactRevealed] = useState({
        phone: false,
        email: false
    });
    const [revealedContactInfo, setRevealedContactInfo] = useState({
        phone: null,
        email: null
    });
    // Check approval status when component mounts
    // Add this state at the top with other states
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [creditsRemaining, setCreditsRemaining] = useState(null);
    const [unlimitedReveals, setUnlimitedReveals] = useState(false);

    // Dialog state
    const [showRevealDialog, setShowRevealDialog] = useState(false);
    const [pendingRevealType, setPendingRevealType] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState({
        interestExists: false,
        interestAccepted: false,
        guardiansInvolved: false,
        guardiansApproved: false
    });


    // Cost for each reveal type
    const CREDIT_COST = {
        phone: 500,
        email: 500,
        both: 1000
    };




    // Update the useEffect to fetch user premium status
    useEffect(() => {
        checkApprovalStatus();
        fetchUserPremiumStatus();
    }, [userId, p.individual_id]);

    // Add this function to fetch premium status
    const fetchUserPremiumStatus = async () => {
        try {
            const stats = await ProfileService.getContactRevealStats();
            if (stats && stats.data) {
                setCreditsRemaining(stats.data.creditsRemaining);
                setUnlimitedReveals(stats.data.unlimitedReveals);
                setIsPremiumUser(stats.data.unlimitedReveals || stats.data.isSubscriptionActive);
            }
        } catch (error) {
            console.error('Failed to fetch premium status:', error);
        }
    };

    // Add this handler for premium feature unlock
    const handlePremiumFeatureClick = () => {
        // Navigate to subscription page
        window.location.href = '/subscription'; // Or use your router navigation
        toast.info('Upgrade to Premium to unlock this feature');
    };

    const checkApprovalStatus = async () => {
        try {
            const targetUserId = p.individual_id || userId;
            const status = await ProfileService.checkContactRevealStatus(targetUserId);
            console.log("profile data:" + status.data);

            if (status && status.data) {
                setApprovalStatus({
                    interestExists: status.data.interestExists || false,
                    interestAccepted: status.data.interestAccepted || false,
                    guardiansInvolved: status.data.guardiansInvolved || false,
                    guardiansApproved: status.data.guardiansApproved || false
                });

                // If already revealed, update the state
                if (status.data.isRevealed) {
                    const revealType = status.data.revealType;
                    if (revealType === 'phone' || revealType === 'both') {
                        setContactRevealed(prev => ({ ...prev, phone: true }));
                    }
                    if (revealType === 'email' || revealType === 'both') {
                        setContactRevealed(prev => ({ ...prev, email: true }));
                    }
                }
            }
        } catch (error) {
            console.error('Failed to check approval status:', error);
        }
    };

    // Open dialog instead of directly unlocking
    const handleUnlockClick = (type) => {
        setPendingRevealType(type);
        setShowRevealDialog(true);
    };

    // Confirm and actually unlock
    const handleConfirmReveal = async () => {
        setShowRevealDialog(false);
        await handleUnlockContact(pendingRevealType);
    };

    const handleUnlockContact = async (type) => {
        if (isUnlocking) {
            console.debug("Unlock already in progress, skipping.");
            return;
        }

        setIsUnlocking(true);

        try {
            const targetUserId = p.individual_id || userId;
            console.log("Attempting to reveal contact for individual_id:", targetUserId, "type:", type);

            const response = await ProfileService.revealContact(targetUserId, type);
            console.log("Reveal contact response:", response);

            if (response && response.success) {
                // Update revealed state
                setContactRevealed(prev => ({
                    ...prev,
                    [type]: true
                }));

                // Store the actual contact info
                setRevealedContactInfo(prev => ({
                    ...prev,
                    phone: response.data.contactInfo.phone || prev.phone,
                    email: response.data.contactInfo.email || prev.email
                }));

                // Update credits
                if (response.data.creditsRemaining !== undefined) {
                    setCreditsRemaining(response.data.creditsRemaining);
                }
                if (response.data.unlimitedReveals !== undefined) {
                    setUnlimitedReveals(response.data.unlimitedReveals);
                }

                const creditsUsed = response.data.creditsUsed || 0;

                if (unlimitedReveals || response.data.unlimitedReveals) {
                    toast.success('Contact unlocked! (Premium)');
                } else {
                    toast.success(`Contact unlocked! ${creditsUsed} credits used. ${response.data.creditsRemaining} credits remaining.`);
                }
            } else {
                console.error('Unlock failed - response:', response);
                toast.error('Failed to unlock contact. Please try again.');
            }
        } catch (error) {
            console.error('Failed to unlock contact:', error);

            // Handle specific error types
            if (error.response?.data?.error === 'insufficient_credits') {
                const data = error.response.data.data;
                toast.error(
                    `Not enough credits! Need ${data.creditsRequired} credits. You have ${data.currentCredits}.`
                );
            } else if (error.response?.data?.error === 'no_interest') {
                toast.error('You need to send an interest first before revealing contact details.');
            } else if (error.response?.data?.error === 'interest_not_accepted') {
                toast.error(error.response.data.message);
            } else if (error.response?.data?.error === 'guardian_approval_required') {
                toast.error(error.response.data.message);
            } else if (error.response?.data?.error === 'users_approval_required') {
                toast.error('Both users must approve the interest first.');
            } else if (error.response?.data?.error === 'already_revealed') {
                setContactRevealed(prev => ({
                    ...prev,
                    [type]: true
                }));
                setRevealedContactInfo(prev => ({
                    ...prev,
                    phone: error.response.data.contactInfo?.phone || prev.phone,
                    email: error.response.data.contactInfo?.email || prev.email
                }));
                toast.info('Contact already revealed');
            } else {
                toast.error('Failed to unlock contact. Please try again.');
            }
        } finally {
            setIsUnlocking(false);
        }
    };

    // Determine phone and email values - matches your data structure
    const phoneValue = revealedContactInfo.phone || p.phone || p.user?.mobile;
    const emailValue = revealedContactInfo.email || p.user?.email;

    //  console.log("Final values - phoneValue:", phoneValue, "emailValue:", emailValue);
    const role = AuthService.getUserRole();
    console.log("crole" + role);

    return (
        <>
            {/* Reveal Contact Dialog */}
            <RevealContactDialog
                isOpen={showRevealDialog}
                onClose={() => setShowRevealDialog(false)}
                onConfirm={handleConfirmReveal}
                revealType={pendingRevealType}
                creditCost={CREDIT_COST[pendingRevealType]}
                creditsRemaining={creditsRemaining}
                unlimitedReveals={unlimitedReveals}
                targetUserName={p.name}
                approvalStatus={approvalStatus}
            />

            {/* Quick badges */}
            <div style={{
                padding: "0 16px",
                marginTop: "16px",
                display: "flex",
                flexWrap: "wrap",
                gap: "6px"
            }}>
                {p.marital_status && (
                    <span style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "0.5px solid rgba(220,38,38,0.15)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <span style={{ fontSize: "13px" }}>💍</span>
                        {p.marital_status}
                    </span>
                )}
                {p.religion && (
                    <span style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#f0fdf4",
                        color: "#16a34a",
                        border: "0.5px solid rgba(22,163,74,0.15)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <span style={{ fontSize: "13px" }}>🕌</span>
                        {p.religion}
                    </span>
                )}
                {p.nationality && (
                    <span style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "0.5px solid rgba(37,99,235,0.15)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <span style={{ fontSize: "13px" }}>🌍</span>
                        {p.nationality}
                    </span>
                )}
                {p.is_guardian_required && (
                    <span style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#faf5ff",
                        color: "#9333ea",
                        border: "0.5px solid rgba(147,51,234,0.15)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <span style={{ fontSize: "13px" }}>🛡️</span>
                        Guardian Required
                    </span>
                )}
                {p.willing_to_relocate === "Yes" && (
                    <span style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#f0fdfa",
                        color: "#0d9488",
                        border: "0.5px solid rgba(13,148,136,0.15)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <span style={{ fontSize: "13px" }}>✈️</span>
                        Open to Relocate
                    </span>
                )}

                {/* Premium Badge */}
                {unlimitedReveals && (
                    <span style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#fef3c7",
                        color: "#d97706",
                        border: "0.5px solid rgba(217,119,6,0.15)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <span style={{ fontSize: "13px" }}>⭐</span>
                        Unlimited Reveals
                    </span>
                )}
            </div>

            {/* Action buttons */}
            <div style={{ padding: "0 16px", marginTop: "16px" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    {/* 
                       
                              <motion.button
                        whileTap={{ scale: 0.96 }}
                        whileHover={{ y: -1 }}
                        onClick={onStartChat}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "11px 16px",
                            borderRadius: "12px",
                            background: "#fafaf9",
                            border: "0.5px solid rgba(27,77,62,0.12)",
                            cursor: "pointer",
                            transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f0f5f3";
                            e.currentTarget.style.borderColor = "rgba(27,77,62,0.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fafaf9";
                            e.currentTarget.style.borderColor = "rgba(27,77,62,0.12)";
                        }}
                    >
                        <MessageCircle style={{ width: "16px", height: "16px", color: "#1B4D3E", flexShrink: 0 }} />
                        <span style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#1B4D3E",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}>
                            Message
                        </span>
                    </motion.button>
                    
                    */}


                    {(
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ y: -1 }}
                            onClick={onLike}
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                padding: "11px 16px",
                                borderRadius: "12px",
                                background: "#1B4D3E",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#143d31";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#1B4D3E";
                            }}
                        >
                            <Heart style={{ width: "16px", height: "16px", color: "#ffffff", fill: "#ffffff", flexShrink: 0 }} />
                            <span style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#ffffff",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }}>
                                Send Interest
                            </span>
                        </motion.button>
                    )}


                </div>
            </div>

            {/* Contact Information Section */}
            {(phoneValue || emailValue) && (
                <Section title="Contact Information">
                    <div style={{ marginTop: "4px" }}>
                        {phoneValue && (
                            <ContactRow
                                icon={Phone}
                                label="Phone Number"
                                value={phoneValue}
                                type="phone"
                                isRevealed={contactRevealed.phone}
                                onUnlock={() => handleUnlockClick('phone')}
                                isUnlocking={isUnlocking}
                                creditCost={CREDIT_COST.phone}
                                accent="#059669"
                                role={role}
                                bg="#d1fae5"
                            />
                        )}
                        {emailValue && (
                            <ContactRow
                                icon={Mail}
                                label="Email Address"
                                value={emailValue}
                                type="email"
                                isRevealed={contactRevealed.email}
                                onUnlock={() => handleUnlockClick('email')}
                                isUnlocking={isUnlocking}
                                creditCost={CREDIT_COST.email}
                                accent="#2563eb"
                                role={role}
                                bg="#dbeafe"
                            />
                        )}
                    </div>

                    {role !== "guardian" && (!contactRevealed.phone || !contactRevealed.email) && (

                        <div style={{
                            marginTop: "12px",
                            padding: "10px 12px",
                            background: "#fffbeb",
                            border: "0.5px solid rgba(251,191,36,0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <Lock style={{ width: "14px", height: "14px", color: "#f59e0b", flexShrink: 0 }} />
                            <p style={{
                                margin: 0,
                                fontSize: "11px",
                                fontWeight: "500",
                                color: "#92400e",
                                lineHeight: "1.4"
                            }}>
                                Use credits to unlock contact details and connect directly
                            </p>
                        </div>
                    )}
                </Section>
            )}

            {/* About */}
            {p.bio && (
                <Section title="About">
                    <p style={{
                        margin: "8px 0 0",
                        fontSize: "13px",
                        fontWeight: "400",
                        color: "#374151",
                        lineHeight: "1.6"
                    }}>
                        {p.bio}
                    </p>
                </Section>
            )}

            {/* Personal */}
            <Section title="Personal">
                <div style={{ marginTop: "4px" }}>
                    <Row icon={BookOpen} label="Religion" value={p.religion} accent="#059669" bg="#d1fae5" />
                    <Row icon={Moon} label="Sect" value={p.sect} accent="#7c3aed" bg="#ede9fe" />
                    <Row icon={Globe} label="Nationality" value={p.nationality} accent="#2563eb" bg="#dbeafe" />
                    <Row icon={MapPin} label="Marital Status" value={p.marital_status} accent="#db2777" bg="#fce7f3" />
                    <Row icon={Moon} label="Practice Level" value={p.religious_practice_level} accent="#059669" bg="#d1fae5" />
                    <Row icon={Ruler} label="Height" value={p.height} accent="#0891b2" bg="#e0f2fe" />
                    <Row icon={Users} label="Body Type" value={p.body_type} accent="#64748b" bg="#f1f5f9" />
                    <Row icon={Globe} label="Mother Tongue" value={p.mother_tongue} accent="#0d9488" bg="#ccfbf1" />
                    <Row icon={Users} label="Caste" value={p.caste} accent="#92400e" bg="#fef3c7" />
                    <Row icon={Baby} label="Has Children" value={p.has_children} accent="#6d28d9" bg="#ede9fe" />
                </div>
                {interests.length > 0 && (
                    <div style={{
                        paddingTop: "16px",
                        borderTop: "0.5px solid rgba(27,77,62,0.08)",
                        marginTop: "12px"
                    }}>
                        <p style={{
                            margin: "0 0 10px",
                            fontSize: "10px",
                            fontWeight: "500",
                            color: "#9ca3af",
                            letterSpacing: "0.02em",
                            textTransform: "uppercase"
                        }}>
                            Interests
                        </p>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px"
                        }}>
                            {interests.map((item, i) => (
                                <span
                                    key={i}
                                    style={{
                                        padding: "5px 11px",
                                        borderRadius: "8px",
                                        fontSize: "11px",
                                        fontWeight: "500",
                                        background: "#f0f5f3",
                                        color: "#1B4D3E",
                                        border: "0.5px solid rgba(27,77,62,0.12)"
                                    }}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </Section>

            {/* Career */}
            <Section title="Career & Education">
                <div style={{ marginTop: "4px" }}>
                    <Row icon={Briefcase} label="Profession" value={p.profession} accent="#1d4ed8" bg="#dbeafe" />
                    <Row icon={GraduationCap} label="Education" value={p.education} accent="#7c3aed" bg="#ede9fe" />
                    <Row icon={Briefcase} label="Employment Type" value={p.employment_type} accent="#0891b2" bg="#e0f2fe" />
                    <Row icon={DollarSign} label="Monthly Salary" value={p.monthly_salary} accent="#059669" bg="#d1fae5" />
                </div>
            </Section>

            {/* Family */}
            <Section title="Family">
                <div style={{ marginTop: "4px" }}>
                    <Row icon={Users} label="Family Background" value={p.family_background} accent="#d97706" bg="#fef3c7" />
                    <Row icon={Users} label="Father's Occupation" value={p.father_occupation} accent="#374151" bg="#f3f4f6" />
                    <Row icon={Users} label="Mother's Occupation" value={p.mother_occupation} accent="#374151" bg="#f3f4f6" />
                    <Row icon={Users} label="Brothers" value={p.brothers} accent="#1d4ed8" bg="#dbeafe" />
                    <Row icon={Users} label="Sisters" value={p.sisters} accent="#db2777" bg="#fce7f3" />
                </div>
            </Section>

            {/* Add spinning animation to head/style */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}