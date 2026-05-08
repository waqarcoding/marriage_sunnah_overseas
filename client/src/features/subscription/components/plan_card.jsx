// components/PlanCard.jsx
import { motion } from 'framer-motion';
import { Crown, Check, Zap } from 'lucide-react';

export default function PlanCard({ plan, selected, onSelect, currency }) {
    const isPopular = plan.popular;
    const isSelected = selected?.id === plan.id;

    const getCreditsPerDay = () => {
        return (plan.credits / plan.durationDays).toFixed(1);
    };

    const getSavingsPercent = (plans) => {
        if (plan.id === 'yearly' && plans.length > 0) {
            const monthly = plans.find(p => p.id === 'monthly');
            if (monthly) {
                const yearlyMonthly = plan.price[currency] / 12;
                const savings = ((monthly.price[currency] - yearlyMonthly) / monthly.price[currency]) * 100;
                return Math.round(savings);
            }
        }
        return null;
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(plan)}
            className="relative w-full p-5 rounded-2xl border-2 transition-all text-left"
            style={{
                borderColor: isSelected ? 'var(--primary, #1B4D3E)' : isPopular ? '#f59e0b' : '#e5e7eb',
                background: isSelected
                    ? 'linear-gradient(135deg, rgba(27, 77, 62, 0.08), rgba(27, 77, 62, 0.05))'
                    : '#fff',
                boxShadow: isSelected ? '0 8px 24px rgba(27, 77, 62, 0.15)' : isPopular ? '0 4px 12px rgba(245, 158, 11, 0.15)' : 'none'
            }}
        >
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <Crown className="w-3 h-3" />
                    BEST VALUE
                </div>
            )}

            {/* Savings Badge */}
            {plan.id === 'yearly' && (
                <div className="absolute -top-3 right-4 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                    Save 41%
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                        {plan.name}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--primary, #1B4D3E)' }}>
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </motion.div>
                        )}
                    </h3>

                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-extrabold"
                            style={{ color: isSelected ? 'var(--primary, #1B4D3E)' : '#1f2937' }}>
                            {currency === 'PKR' ? 'Rs' : '$'}
                            {plan.price[currency].toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                            /{plan.id === 'weekly' ? 'week' : plan.id === 'monthly' ? 'month' : 'year'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(27, 77, 62, 0.1)' }}>
                        <Zap className="w-3 h-3" style={{ color: 'var(--primary, #1B4D3E)' }} />
                    </div>
                    <span className="font-semibold text-gray-900">{plan.credits} Credits</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(27, 77, 62, 0.1)' }}>
                        <Check className="w-3 h-3" style={{ color: 'var(--primary, #1B4D3E)' }} strokeWidth={2.5} />
                    </div>
                    <span className="text-gray-600">{plan.durationDays} days access</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(27, 77, 62, 0.1)' }}>
                        <Check className="w-3 h-3" style={{ color: 'var(--primary, #1B4D3E)' }} strokeWidth={2.5} />
                    </div>
                    <span className="text-gray-600">~{getCreditsPerDay()} credits/day</span>
                </div>

                {plan.id === 'yearly' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-green-500"></span>
                            Only {currency === 'PKR' ? 'Rs' : '$'}{(plan.price[currency] / 12).toFixed(0)}/month
                        </p>
                    </div>
                )}
            </div>
        </motion.button>
    );
}