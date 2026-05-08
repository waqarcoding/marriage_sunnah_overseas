import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Eye, MessageCircle, Star, Zap, Crown, Heart, Users, CreditCard, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SubscriptionService from "../services/SubscriptionService";
import AuthApi from "../../auth/services/AuthService";

// ── Payment Icons ─────────────────────────────────────────────────────────────
const PAYMENT_ICONS = {
    stripe: (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #635bff, #4f46e5)' }}>
            <CreditCard className="w-5 h-5 text-white" />
        </div>
    ),
    easypaisa: (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #00a651, #008542)' }}>
            EP
        </div>
    ),
    jazzcash: (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #ff6b00, #ff5100)' }}>
            JC
        </div>
    )
};

// ── Payment Method Dialog ─────────────────────────────────────────────────────
function PaymentMethodDialog({ isOpen, onClose, onSelect, paymentMethods, selectedPlan, currency, convertedPrices = {} }) {
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (paymentMethods && paymentMethods.length > 0) {
            setSelected(paymentMethods[0]);
        }
    }, [paymentMethods]);

    const handleConfirm = () => {
        if (selected) {
            onSelect(selected);
        }
    };

    if (!isOpen) return null;

    const getPlanPrice = () => {
        if (!selectedPlan) return 0;

        // ✅ Get USD price first
        const priceUSD = selectedPlan.priceUSD || selectedPlan.price?.USD || selectedPlan.priceValue || 0;

        // ✅ If currency is USD, return USD price
        if (currency === 'USD') {
            return priceUSD;
        }

        // ✅ Otherwise return converted price
        return convertedPrices[selectedPlan.id] || priceUSD;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(8px)"
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-md rounded-3xl overflow-hidden"
                style={{ background: "#fff" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Select Payment Method</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Choose how you'd like to pay for your subscription
                    </p>
                </div>

                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Selected Plan</p>
                            <p className="text-lg font-bold text-gray-900">
                                {selectedPlan?.name || 'Plan'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-extrabold" style={{ color: 'var(--primary)' }}>
                                {SubscriptionService.formatPrice(getPlanPrice(), currency)}
                            </p>
                            <p className="text-xs text-gray-500">{selectedPlan?.credits || 0} credits</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                    {paymentMethods && paymentMethods.length > 0 ? (
                        paymentMethods.map(method => (
                            <motion.button
                                key={method.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelected(method)}
                                className="w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4"
                                style={{
                                    borderColor: selected?.id === method.id ? 'var(--primary)' : '#e5e7eb',
                                    background: selected?.id === method.id ? 'rgba(27, 77, 62, 0.05)' : '#fff',
                                    boxShadow: selected?.id === method.id ? '0 4px 12px rgba(27, 77, 62, 0.1)' : 'none'
                                }}
                            >
                                <div className="flex-shrink-0">
                                    {PAYMENT_ICONS[method.id] || PAYMENT_ICONS.stripe}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 mb-1">{method.name}</p>
                                    <p className="text-sm text-gray-600 mb-1.5">{method.description}</p>
                                    <p className="text-xs text-gray-500">{method.fees}</p>
                                </div>

                                {selected?.id === method.id && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'var(--primary)' }}>
                                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">Loading payment methods...</p>
                    )}
                </div>

                <div className="p-6 pt-4 border-t border-gray-100">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirm}
                        disabled={!selected}
                        className="w-full py-4 rounded-2xl font-bold text-center text-white"
                        style={{
                            background: selected ? 'linear-gradient(135deg, var(--primary), #2d7a5f)' : '#d1d5db',
                            cursor: selected ? 'pointer' : 'not-allowed',
                            opacity: selected ? 1 : 0.6
                        }}
                    >
                        Continue to Payment
                    </motion.button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                        🔒 Secure payment • Your information is encrypted
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
// ── Background Video Player ──────────────────────────────────────────────────
function BackgroundVideo() {
    const [currentIndex] = useState(0);
    const playlist = ['/image1.jpg'];

    return (
        <div className="absolute inset-0 overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${playlist[currentIndex]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(2px)",
                    transform: "scale(1)",
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(180deg, rgba(27,77,62,0.6) 0%, rgba(27,77,62,0.92) 60%, var(--primary) 100%)",
                }}
            />
        </div>
    );
}

// ── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between px-2 py-2">
            <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center"
            >
                <X size={24} style={{ color: "var(--background)", opacity: 0.7 }} />
            </button>
            <div
                className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{
                    background: "var(--background)",
                }}
            >
                <Sparkles size={12} color="#111111" fill="#111111" />
                <span style={{ color: "#111111", fontSize: "11px", fontWeight: 700 }}>
                    PRO
                </span>
            </div>
        </div>
    );
}

// ── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
    return (
        <div className="text-center px-5">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "var(--background)",
                    lineHeight: 1.3,
                    marginTop: "16px",
                    marginBottom: "8px",
                }}
            >
                Unlock Unlimited
                <br />
                Connections
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                    fontSize: "14px",
                    color: "var(--primary-foreground)",
                    opacity: 0.8,
                }}
            >
                Go Pro and find your perfect match without limits
            </motion.p>
        </div>
    );
}

// ── Features List ────────────────────────────────────────────────────────────
function FeaturesList() {
    const features = [
        { icon: Eye, text: "See who liked you" },
        { icon: Zap, text: "Unlimited likes" },
        { icon: MessageCircle, text: "Chat unlock" },
        { icon: Star, text: "More appearance" },
        { icon: Crown, text: "Premium badge" },
        { icon: Heart, text: "See full match compatibility" },
        { icon: Users, text: "Family visibility boost" },
    ];

    return (
        <div className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <Icon size={20} style={{ color: "var(--accent)" }} />
                        <span style={{ fontSize: "17px", color: "var(--background)" }}>
                            {text}
                        </span>
                    </div>
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "#10b981",
                        }}
                    >
                        <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                            <path
                                d="M1 5.5L5 9.5L13 1.5"
                                stroke="#ffffff"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// ── Pricing Cards ────────────────────────────────────────────────────────────
function PricingCards({ onSelect, selected, currency, plans = [], convertedPrices = {} }) {
    if (!Array.isArray(plans) || plans.length === 0) {
        return (
            <div className="text-center py-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                        width: "30px",
                        height: "30px",
                        margin: "0 auto",
                        border: "3px solid rgba(245,240,232,0.2)",
                        borderTopColor: "var(--primary-foreground)",
                        borderRadius: "50%",
                    }}
                />
                <p style={{ color: 'var(--background)', opacity: 0.6, marginTop: '12px', fontSize: '14px' }}>
                    Loading plans...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {plans.map((pkg, i) => {
                const isSelected = selected?.id === pkg.id;

                // ✅ Always use USD price
                const priceUSD = pkg.priceUSD || pkg.price?.USD || 0;
                const price = SubscriptionService.formatPrice(priceUSD, 'USD');

                // ✅ Format duration
                const getDurationText = () => {
                    if (pkg.durationDays === 7) return 'per week';
                    if (pkg.durationDays === 30) return 'per month';
                    if (pkg.durationDays === 365) return 'per year';
                    return `per ${pkg.durationDays} days`;
                };

                return (
                    <motion.button
                        key={pkg.id || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                        onClick={() => onSelect(pkg)}
                        className="w-full p-4 rounded-3xl text-left"
                        style={{
                            background: isSelected ? "#ffffff" : "#1B4D3E",
                            color: "#ffffff",
                            border: `2px solid ${isSelected ? "#1B4D3E" : "transparent"}`,
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? "0 4px 16px rgba(27,77,62,0.3)" : "none",
                        }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span style={{
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        color: isSelected ? "#1B4D3E" : "#ffffff",
                                        letterSpacing: "0.5px",
                                    }}>
                                        {pkg.name}
                                    </span>
                                    {pkg.popular && (
                                        <span style={{
                                            fontSize: "9px",
                                            fontWeight: 700,
                                            color: "#ffffff",
                                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                            padding: "3px 8px",
                                            borderRadius: "8px",
                                        }}>
                                            POPULAR
                                        </span>
                                    )}
                                </div>

                                <p style={{
                                    fontSize: "13px",
                                    color: isSelected ? "#1B4D3E" : "#ffffff",
                                    opacity: 0.7,
                                    marginBottom: "8px",
                                    fontWeight: 500,
                                }}>
                                    {pkg.description}
                                </p>

                                <div className="flex items-center gap-2">
                                    <Zap size={14} style={{
                                        color: isSelected ? "#1B4D3E" : "#fbbf24",
                                        fill: isSelected ? "#1B4D3E" : "#fbbf24",
                                    }} />
                                    <span style={{
                                        fontSize: "14px",
                                        color: isSelected ? "#1B4D3E" : "#ffffff",
                                        fontWeight: 600,
                                    }}>
                                        {pkg.credits} credits
                                    </span>
                                </div>
                            </div>

                            <div className="text-right ml-4">
                                <div style={{
                                    fontSize: "26px",
                                    fontWeight: 700,
                                    color: isSelected ? "#1B4D3E" : "#ffffff",
                                    lineHeight: 1.1,
                                }}>
                                    {price}
                                </div>
                                <div style={{
                                    fontSize: "11px",
                                    color: isSelected ? "#1B4D3E" : "#ffffff",
                                    opacity: 0.6,
                                    marginTop: "2px",
                                    fontWeight: 500,
                                }}>
                                    {getDurationText()}
                                </div>
                            </div>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

// ── Current Subscription Info ────────────────────────────────────────────────
function CurrentSubscriptionInfo({ userStatus }) {
    if (!userStatus?.activeSubscription || userStatus.isExpired) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: "16px",
                background: "rgba(245, 240, 232, 0.15)",
                borderRadius: "16px",
                border: "1px solid rgba(245, 240, 232, 0.2)",
            }}
        >
            <div style={{ marginBottom: "8px" }}>
                <span style={{
                    fontSize: "12px",
                    color: "var(--background)",
                    opacity: 0.6,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600
                }}>
                    Current Plan
                </span>
            </div>
            <div style={{
                fontSize: "18px",
                color: "var(--background)",
                fontWeight: 700,
                marginBottom: "8px"
            }}>
                {userStatus.activeSubscription.plan_type.toUpperCase()}
            </div>
            <div style={{
                fontSize: "14px",
                color: "var(--background)",
                opacity: 0.7,
                marginBottom: "12px"
            }}>
                <strong>{userStatus.credits}</strong> credits remaining
                <br />
                Renews {new Date(userStatus.subscriptionExpiresAt).toLocaleDateString()}
            </div>
            <div style={{
                fontSize: "13px",
                color: "var(--accent)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px"
            }}>
                <Sparkles size={14} />
                Upgrade to keep your {userStatus.credits} credits and get more!
            </div>
        </motion.div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [plans, setPlans] = useState([]);
    const [currency, setCurrency] = useState('USD');
    const [userId, setUserId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);

    const [convertedPrices, setConvertedPrices] = useState({}); // ✅ Add this





    // ... rest of component
    useEffect(() => {
        async function loadPlans() {
            setPlansLoading(true);
            try {
                const response = await SubscriptionService.getPlans();
                console.log('Plans API response:', response);

                if (response.success && response.data) {
                    // ✅ Check if data is an object (not array)
                    const isObject = typeof response.data === 'object' && !Array.isArray(response.data);

                    let plansArray;

                    if (isObject) {
                        // ✅ Convert object to array format
                        plansArray = Object.entries(response.data).map(([key, plan]) => ({
                            id: key,
                            name: plan.name,
                            description: plan.description,
                            credits: plan.credits,
                            durationDays: plan.durationDays,
                            priceUSD: plan.priceUSD, // ✅ Add this!
                            price: plan.price || { USD: plan.priceUSD }, // ✅ Create price object
                            stripePriceId: plan.stripePriceId,
                            productId: plan.productId,
                            popular: plan.popular
                        }));
                    } else {
                        // Already an array
                        plansArray = response.data;
                    }

                    console.log('Plans array:', plansArray);
                    setPlans(plansArray);

                    // Auto-select popular or premium plan
                    const popularPlan = plansArray.find(p => p.popular);
                    if (popularPlan) {
                        setSelectedPlan(popularPlan);
                    } else if (plansArray.length > 0) {
                        setSelectedPlan(plansArray[plansArray.length - 1]);
                    }
                } else {
                    // Fallback to static plans
                    const staticPlans = SubscriptionService.getStaticPlans();
                    setPlans(staticPlans);
                    setSelectedPlan(staticPlans.find(p => p.popular) || staticPlans[0]);
                }
            } catch (error) {
                console.error('Error loading plans:', error);
                // Fallback to static plans
                const staticPlans = SubscriptionService.getStaticPlans();
                setPlans(staticPlans);
                setSelectedPlan(staticPlans.find(p => p.popular) || staticPlans[0]);
            } finally {
                setPlansLoading(false);
            }
        }

        loadPlans();
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function fetchUserInfo() {
            const fetchedUserId = AuthApi.getUserId();
            const fetchedIsLoggedIn = AuthApi.isLoggedIn();

            if (isMounted) {
                setUserId(fetchedUserId);
                setIsLoggedIn(fetchedIsLoggedIn);
            }
        }

        async function fetchPaymentMethods() {
            try {
                const response = await SubscriptionService.getPaymentMethods();
                if (response.success && Array.isArray(response.data)) {
                    setPaymentMethods(response.data);
                }
            } catch (error) {
                console.error('Error loading payment methods:', error);
            }
        }

        fetchUserInfo();
        fetchPaymentMethods();

        document.body.style.background = "var(--primary)";
        return () => {
            isMounted = false;
            document.body.style.background = "";
        };
    }, []);

    // ✅ Fetch user profile for currency
    const { data: userProfile } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: async () => {
            const response = await AuthApi.getCurrentUser();
            return response.profile || response.data?.profile || response.data || response;
        },
        enabled: !!userId && isLoggedIn,
        staleTime: 10 * 60 * 1000,
    });


    const { data: userStatus, isLoading: statusLoading } = useQuery({
        queryKey: ['subscription-status', userId],
        queryFn: () => SubscriptionService.getSubscriptionStatus(userId),
        enabled: !!userId && isLoggedIn,
        select: (response) => response.data || response,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setError(null);
    };

    const handleSubscribeClick = () => {
        if (!userId || !isLoggedIn) {
            setError("Please login to continue");
            navigate('/login', { state: { from: '/subscription' } });
            return;
        }

        if (!selectedPlan) {
            setError("Please select a plan");
            return;
        }

        setShowPaymentDialog(true);
    };

    const handlePaymentMethodSelect = async (paymentMethod) => {
        setShowPaymentDialog(false);
        setIsProcessing(true);
        setError(null);

        try {
            // ✅ Get the correct price ID for the user's currency
            const priceId = selectedPlan.stripePriceId; // Use single USD price ID

            const data = {
                planType: selectedPlan.id,
                userId: userId,
                paymentMethod: paymentMethod.id,
                currency: currency,
                priceId: priceId
            };

            console.log('Creating payment session with:', data);

            const response = await SubscriptionService.createPaymentSession(data);

            console.log('Payment session response:', response);

            // ✅ Better null/error checking
            if (!response) {
                throw new Error('No response from server');
            }

            if (response.success && response.url) {
                if (paymentMethod.id === 'stripe') {
                    window.location.href = response.url;
                } else if (paymentMethod.id === 'easypaisa' || paymentMethod.id === 'jazzcash') {
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = response.url;

                    Object.entries(response.transactionData || {}).forEach(([key, value]) => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = value;
                        form.appendChild(input);
                    });

                    document.body.appendChild(form);
                    form.submit();
                }
            } else {
                // ✅ Better error message extraction
                const errorMsg = response?.message || response?.error || 'Failed to create payment session';
                throw new Error(errorMsg);
            }
        } catch (err) {
            console.error('Subscription error:', err);

            // ✅ Safe error message extraction
            let errorMessage = 'Failed to start subscription';

            if (err.message) {
                errorMessage = err.message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.error) {
                errorMessage = err.response.error;
            }

            setError(errorMessage);
            setIsProcessing(false);
        }
    };

    const handleRestore = async () => {
        if (!userId || !isLoggedIn) {
            setError("Please login to continue");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await SubscriptionService.restorePurchases(userId);

            if (response?.success) {
                // @ts-ignore
                queryClient.invalidateQueries(['subscription-status', userId]);
                setIsSuccess(true);
                setTimeout(() => navigate(-1), 2000);
            } else {
                setError(response?.message || 'No purchases found to restore');
            }
        } catch (err) {
            console.error('Restore error:', err);
            setError(err.response?.error || 'Failed to restore purchases');
        } finally {
            setIsProcessing(false);
        }
    };

    if (statusLoading || plansLoading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--primary)",
                }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                        width: "40px",
                        height: "40px",
                        border: "4px solid rgba(245,240,232,0.2)",
                        borderTopColor: "var(--primary-foreground)",
                        borderRadius: "50%",
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className="relative min-h-screen overflow-hidden"
            style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                background: "var(--primary)",
            }}
        >
            <BackgroundVideo />

            <div className="relative z-10 min-h-screen flex flex-col">
                <TopBar />

                <div className="flex-1 overflow-y-auto px-5 pb-5">
                    <div className="space-y-7">
                        <div className="mt-5">
                            <HeroSection />
                        </div>

                        <FeaturesList />

                        <CurrentSubscriptionInfo userStatus={userStatus} />

                        <PricingCards
                            onSelect={handlePlanSelect}
                            selected={selectedPlan}
                            currency={currency}
                            plans={plans}
                            convertedPrices={convertedPrices}
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: "12px 16px",
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    borderRadius: "12px",
                                    color: "#ef4444",
                                    fontSize: "14px",
                                    textAlign: "center"
                                }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="w-full py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2"
                                    style={{
                                        background: "#10b981",
                                        color: "#ffffff",
                                        fontSize: "16px",
                                        boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)",
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M20 6L9 17L4 12"
                                            stroke="#ffffff"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    Success! Welcome to Premium
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="subscribe"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.1, duration: 0.4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubscribeClick}
                                    disabled={isProcessing || !selectedPlan}
                                    className="w-full py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2"
                                    style={{
                                        background: "#ffffff",
                                        color: "#111111",
                                        fontSize: "16px",
                                        boxShadow: "0 4px 20px #ffffff",
                                        opacity: (isProcessing || !selectedPlan) ? 0.7 : 1,
                                        cursor: (isProcessing || !selectedPlan) ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    border: "3px solid rgba(17,17,17,0.3)",
                                                    borderTopColor: "#111111",
                                                    borderRadius: "50%",
                                                }}
                                            />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {userStatus?.activeSubscription && !userStatus.isExpired
                                                ? `Upgrade Now - ${SubscriptionService.formatPrice(
                                                    selectedPlan?.priceUSD || 0,
                                                    'USD'
                                                )}`
                                                : `Subscribe Now - ${SubscriptionService.formatPrice(
                                                    selectedPlan?.priceUSD || 0,
                                                    'USD'
                                                )}`
                                            }
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.4 }}
                            onClick={handleRestore}
                            disabled={isProcessing}
                            className="w-full py-3"
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "var(--background)",
                                opacity: isProcessing ? 0.4 : 0.6,
                                textAlign: "center",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                            }}
                        >
                            Restore Purchases
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.25, duration: 0.4 }}
                            className="flex items-center justify-center gap-2 py-2"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <span style={{
                                fontSize: "12px",
                                color: "var(--background)",
                                opacity: 0.5,
                            }}>
                                Secure Payment • Prices in {currency}
                            </span>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.3, duration: 0.4 }}
                            style={{
                                fontSize: "10px",
                                color: "var(--background)",
                                opacity: 0.4,
                                textAlign: "center",
                                lineHeight: 1.5,
                            }}
                        >
                            Subscriptions auto-renew unless cancelled.
                            <br />
                            {currency !== 'USD' && '* Approximate conversion. Final amount determined at checkout.'}
                        </motion.p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showPaymentDialog && (
                    <PaymentMethodDialog
                        isOpen={showPaymentDialog}
                        onClose={() => setShowPaymentDialog(false)}
                        onSelect={handlePaymentMethodSelect}
                        paymentMethods={paymentMethods}
                        selectedPlan={selectedPlan}
                        currency={currency}
                        convertedPrices={convertedPrices}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}