// components/RevealContactDialog.jsx
import { motion, AnimatePresence } from "motion/react";
import { X, Shield, CheckCircle2, AlertCircle, CreditCard, Unlock } from "lucide-react";
import AuthService from "../../../auth/services/AuthService";
import React from "react";

export default function RevealContactDialog({
    isOpen,
    onClose,
    onConfirm,
    revealType,
    creditCost,

    unlimitedReveals,
    targetUserName,
    approvalStatus
}) {
    if (!isOpen) return null;

    const getRevealTypeText = () => {
        switch (revealType) {
            case 'phone': return 'phone number';
            case 'email': return 'email address';
            case 'both': return 'phone number and email address';
            default: return 'contact details';
        }
    };


    // Add this helper function inside the component, before the return statement
    function isFullyApproved() {
        console.log('Approval Status:', approvalStatus);
        console.log('Interest Exists:', approvalStatus?.interestExists);
        console.log('Interest Accepted:', approvalStatus?.interestAccepted);
        console.log('Guardians Involved:', approvalStatus?.guardiansInvolved);
        console.log('Guardians Approved:', approvalStatus?.guardiansApproved);

        if (!approvalStatus?.interestExists) return false;
        if (!approvalStatus?.interestAccepted) return false;
        if (approvalStatus?.guardiansInvolved && !approvalStatus?.guardiansApproved) return false;
        return true;
    }

    const [creditsRemaining, setCreditsRemaining] = React.useState(0);

    React.useEffect(() => {
        let isMounted = true;
        AuthService.getCurrentUser().then(user => {
            const credits = parseInt(user?.credits, 10) || 0;
            if (isMounted) setCreditsRemaining(credits);
        }).catch(() => {
            if (isMounted) setCreditsRemaining(0);
        });
        return () => { isMounted = false; };
    }, []);
    const canAfford = unlimitedReveals || creditsRemaining >= creditCost;
    const canReveal = canAfford && isFullyApproved();
    console.log("isFullyApproved:", isFullyApproved());
    console.log("can reveal:", canReveal);


    // Then update the button to use canReveal instead of canAfford
    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
            }}>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)'
                    }}
                />

                {/* Dialog */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '440px',
                        background: '#ffffff',
                        borderRadius: '24px',
                        boxShadow: '0 20px 60px rgba(27,77,62,0.2)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '24px 24px 20px',
                        borderBottom: '1px solid rgba(27,77,62,0.08)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f5f5f4',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e7e5e4'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f4'}
                        >
                            <X style={{ width: '18px', height: '18px', color: '#78716c' }} />
                        </button>

                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #1B4D3E, #2d7a5f)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <Unlock style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                        </div>

                        <h2 style={{
                            margin: '0 0 8px',
                            fontSize: '22px',
                            fontWeight: '600',
                            color: '#1B4D3E',
                            letterSpacing: '-0.01em'
                        }}>
                            Reveal Contact Details
                        </h2>
                        <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#6b7280',
                            lineHeight: '1.5'
                        }}>
                            You're about to reveal {getRevealTypeText()} for <strong>{targetUserName}</strong>
                        </p>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '24px' }}>
                        {/* Approval Status Checklist */}
                        <div style={{
                            background: '#f9fafb',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{
                                margin: '0 0 12px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#1B4D3E',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Verification Status
                            </h3>

                            {/* Interest Sent */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '10px'
                            }}>
                                {approvalStatus.interestExists ? (
                                    <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', flexShrink: 0 }} />
                                ) : (
                                    <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0 }} />
                                )}
                                <span style={{
                                    fontSize: '13px',
                                    color: approvalStatus.interestExists ? '#059669' : '#dc2626',
                                    fontWeight: '500'
                                }}>
                                    Interest sent/received
                                </span>
                            </div>

                            {/* Interest Accepted */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '10px'
                            }}>
                                {approvalStatus.interestAccepted ? (
                                    <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', flexShrink: 0 }} />
                                ) : (
                                    <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0 }} />
                                )}
                                <span style={{
                                    fontSize: '13px',
                                    color: approvalStatus.interestAccepted ? '#059669' : '#dc2626',
                                    fontWeight: '500'
                                }}>
                                    Both users accepted
                                </span>
                            </div>

                            {/* Guardians Approved */}
                            {approvalStatus.guardiansInvolved && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '10px'
                                }}>
                                    {approvalStatus.guardiansApproved ? (
                                        <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', flexShrink: 0 }} />
                                    ) : (
                                        <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0 }} />
                                    )}
                                    <span style={{
                                        fontSize: '13px',
                                        color: approvalStatus.guardiansApproved ? '#059669' : '#dc2626',
                                        fontWeight: '500'
                                    }}>
                                        Both families approved
                                    </span>
                                </div>
                            )}

                            {/* Credits Available */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {canAfford ? (
                                    <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', flexShrink: 0 }} />
                                ) : (
                                    <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0 }} />
                                )}
                                <span style={{
                                    fontSize: '13px',
                                    color: canAfford ? '#059669' : '#dc2626',
                                    fontWeight: '500'
                                }}>
                                    {unlimitedReveals
                                        ? 'Unlimited reveals (Premium)'
                                        : `Sufficient credits (${creditsRemaining} available)`
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Cost Information */}
                        {!unlimitedReveals && (
                            <div style={{
                                background: '#fffbeb',
                                border: '1px solid rgba(251,191,36,0.2)',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <CreditCard style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        margin: '0 0 2px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#92400e'
                                    }}>
                                        Cost: {creditCost} Credits
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '12px',
                                        color: '#b45309'
                                    }}>
                                        Remaining after: {creditsRemaining >= creditCost ? creditsRemaining - creditCost : creditsRemaining} credits

                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Privacy Notice */}
                        <div style={{
                            background: '#f0f9ff',
                            border: '1px solid rgba(37,99,235,0.15)',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <Shield style={{ width: '18px', height: '18px', color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <p style={{
                                        margin: '0 0 4px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#1e40af'
                                    }}>
                                        Privacy Notice
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '11px',
                                        color: '#1e40af',
                                        lineHeight: '1.5'
                                    }}>
                                        The user will be notified that you've unlocked their contact details.
                                        Please use this information respectfully.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{
                        padding: '20px 24px',
                        borderTop: '1px solid rgba(27,77,62,0.08)',
                        display: 'flex',
                        gap: '12px'
                    }}>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px 20px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                background: '#f5f5f4',
                                color: '#57534e',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e7e5e4'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f4'}
                        >
                            Cancel
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={onConfirm}
                            disabled={!canReveal} // Changed from !canAfford
                            style={{
                                flex: 1,
                                padding: '12px 20px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                background: canReveal ? 'linear-gradient(135deg, #1B4D3E, #2d7a5f)' : '#d1d5db', // Changed
                                color: '#ffffff',
                                border: 'none',
                                cursor: canReveal ? 'pointer' : 'not-allowed', // Changed
                                transition: 'all 0.2s',
                                opacity: canReveal ? 1 : 0.6 // Changed
                            }}
                            onMouseEnter={(e) => {
                                if (canReveal) e.currentTarget.style.transform = 'translateY(-1px)'; // Changed
                            }}
                            onMouseLeave={(e) => {
                                if (canReveal) e.currentTarget.style.transform = 'translateY(0)'; // Changed
                            }}
                        >
                            {unlimitedReveals ? 'Reveal Now (Free)' : `Reveal for ${creditCost} Credits`}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}