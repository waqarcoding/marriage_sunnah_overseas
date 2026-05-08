// components/PaymentMethodSelector.jsx
import { motion } from 'framer-motion';
import { CreditCard, Check, RefreshCw, AlertCircle } from 'lucide-react';

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

export default function PaymentMethodSelector({ methods, selected, onSelect }) {
    if (!methods || methods.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No payment methods available</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>

            {methods.map(method => {
                const isSelected = selected?.id === method.id;
                const isAutoRenewal = method.autoRenewal || method.id === 'stripe';

                return (
                    <motion.button
                        key={method.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(method)}
                        className="w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4"
                        style={{
                            borderColor: isSelected ? 'var(--primary, #1B4D3E)' : '#e5e7eb',
                            background: isSelected ? 'rgba(27, 77, 62, 0.05)' : '#fff',
                            boxShadow: isSelected ? '0 4px 12px rgba(27, 77, 62, 0.1)' : 'none'
                        }}
                    >
                        <div className="flex-shrink-0">
                            {PAYMENT_ICONS[method.id] || PAYMENT_ICONS.stripe}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Method Name with Auto-Renewal Badge */}
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-bold text-gray-900">{method.name}</p>
                                {isAutoRenewal ? (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                                        <RefreshCw className="w-3 h-3" />
                                        Auto-renews
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                                        <AlertCircle className="w-3 h-3" />
                                        Manual renewal
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-1.5">{method.description}</p>

                            {/* Fees and Currencies */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500">{method.fees}</span>
                                {method.currencies && method.currencies.length > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                        {method.currencies.join(', ')}
                                    </span>
                                )}
                            </div>

                            {/* Renewal Note */}
                            {method.renewalNote && (
                                <p className="text-xs text-gray-500 mt-2 italic">
                                    {method.renewalNote}
                                </p>
                            )}
                        </div>

                        {/* Selected Checkmark */}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: 'var(--primary, #1B4D3E)' }}>
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </motion.div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}