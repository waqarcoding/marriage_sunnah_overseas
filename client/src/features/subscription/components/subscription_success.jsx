// pages/subscription_success.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader2, XCircle } from 'lucide-react';
import SubscriptionService from '../services/SubscriptionService';
import AuthService from '../../auth/services/AuthService';


export default function SubscriptionSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);
    const userRole = AuthService.getUserRole();

    const processor = searchParams.get('processor');
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        try {
            if (processor === 'stripe' && sessionId) {
                const response = await SubscriptionService.verifySession(sessionId);
                if (response.success) {
                    setPaymentData(response.session);
                } else {
                    setError('Payment verification failed');
                }
            } else if ((processor === 'easypaisa' || processor === 'jazzcash') && orderId) {
                // Payment already verified via callback
                setPaymentData({ orderId, processor });
            } else {
                setError('Invalid payment session');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError(error.message || 'Failed to verify payment');
        } finally {
            setVerifying(false);
        }
    };

    const getRoleBasedPath = (path) => {
        const prefix = userRole === 'guardian' ? '/guardian' : '/individual';
        return `${prefix}${path}`;
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
                    <p className="text-lg font-semibold text-gray-900 mb-2">Verifying your payment...</p>
                    <p className="text-sm text-gray-600">Please wait a moment</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-5" style={{ background: 'var(--background)' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-100">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Failed</h1>
                    <p className="text-gray-600 mb-8">{error}</p>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/subscription')}
                        className="w-full py-4 rounded-2xl text-white font-bold"
                        style={{ background: 'linear-gradient(135deg, var(--primary), #2d7a5f)' }}
                    >
                        Try Again
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-5" style={{ background: 'var(--background)' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full text-center"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                    <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-gray-900 mb-3"
                >
                    Payment Successful!
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 mb-8"
                >
                    Your subscription has been activated. Welcome to premium!
                </motion.p>

                {/* Payment Details */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl p-6 mb-6 shadow-sm"
                >
                    <p className="text-sm text-gray-500 mb-2">Payment Method</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize mb-4">
                        {SubscriptionService.getProcessorName(processor)}
                    </p>

                    {orderId && (
                        <>
                            <p className="text-sm text-gray-500 mb-2">Transaction ID</p>
                            <p className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                {orderId}
                            </p>
                        </>
                    )}
                </motion.div>

                {/* Action Button */}
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(getRoleBasedPath('/explore'))}
                    className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, var(--primary), #2d7a5f)' }}
                >
                    Start Exploring
                    <ArrowRight className="w-5 h-5" />
                </motion.button>

                {/* View Subscription Link */}
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    onClick={() => navigate(getRoleBasedPath('/subscription-detail'))}
                    className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                    View subscription details
                </motion.button>
            </motion.div>
        </div>
    );
}