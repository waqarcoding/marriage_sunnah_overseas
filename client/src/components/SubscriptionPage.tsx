import { motion } from "motion/react";
import { ChevronLeft, Check, Star, Zap, Crown } from "lucide-react";
import { useState } from "react";

interface SubscriptionPageProps {
  onBack: () => void;
}

export function SubscriptionPage({ onBack }: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<"1month" | "3month" | "6month">("3month");

  const plans = [
    {
      id: "6month",
      duration: "6 Months",
      price: "$19.99",
      perMonth: "$3.33/month",
      savings: "Save 67%",
      badge: "Best Value",
      badgeColor: "from-yellow-400 to-orange-500",
    },
    {
      id: "3month",
      duration: "3 Months",
      price: "$39.99",
      perMonth: "$13.33/month",
      savings: "Save 33%",
      badge: "Most Popular",
      badgeColor: "from-pink-500 to-red-500",
    },
    {
      id: "1month",
      duration: "1 Month",
      price: "$19.99",
      perMonth: "$19.99/month",
      savings: "",
      badge: "",
      badgeColor: "",
    },
  ];

  const features = [
    {
      icon: "💎",
      title: "See Who Likes You",
      description: "See everyone who already liked your profile",
    },
    {
      icon: "⭐",
      title: "Unlimited Super Likes",
      description: "Stand out with unlimited Super Likes every day",
    },
    {
      icon: "🔥",
      title: "Unlimited Likes",
      description: "Like as many profiles as you want",
    },
    {
      icon: "⚡",
      title: "5 Boosts Per Month",
      description: "Be the top profile in your area for 30 minutes",
    },
    {
      icon: "🎯",
      title: "Priority Likes",
      description: "Your likes are shown to others first",
    },
    {
      icon: "🌍",
      title: "Passport",
      description: "Match with anyone around the world",
    },
    {
      icon: "⏮️",
      title: "Rewind",
      description: "Undo your last swipe",
    },
    {
      icon: "🔒",
      title: "Control Your Profile",
      description: "Control who sees you and your profile",
    },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </motion.button>
          <h1 className="text-xl font-medium">Upgrade to Premium</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center py-8 px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl"
        >
          <Crown className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Get Premium
        </h2>
        <p className="text-gray-600">
          Unlock all features and find your perfect match faster
        </p>
      </div>

      {/* Plans */}
      <div className="px-6 pb-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPlan(plan.id as any)}
              className="relative"
            >
              {plan.badge && (
                <div className={`absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${plan.badgeColor} text-white text-xs font-medium shadow-lg z-10`}>
                  {plan.badge}
                </div>
              )}
              <div
                className={`relative rounded-2xl p-5 cursor-pointer transition-all ${selectedPlan === plan.id
                  ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-2xl scale-105"
                  : "bg-white text-gray-900 shadow-md hover:shadow-lg"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-bold">{plan.duration}</span>
                      {plan.savings && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${selectedPlan === plan.id
                            ? "bg-white/20"
                            : "bg-green-100 text-green-700"
                            }`}
                        >
                          {plan.savings}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-sm ${selectedPlan === plan.id
                        ? "text-white/80"
                        : "text-gray-500"
                        }`}
                    >
                      {plan.perMonth}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold mb-1">{plan.price}</div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id
                        ? "border-white bg-white"
                        : "border-gray-300"
                        }`}
                    >
                      {selectedPlan === plan.id && (
                        <Check className="w-4 h-4 text-pink-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-center text-gray-900">
            Premium Features
          </h3>
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0 text-xl">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">
                    {feature.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {feature.description}
                  </div>
                </div>
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscribe Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-auto">
        <div className="max-w-2xl mx-auto">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
          >
            Continue
          </motion.button>
          <p className="text-xs text-center text-gray-500 mt-3">
            Cancel anytime. Auto-renews until canceled.
          </p>
        </div>
      </div>
    </div>
  );
}
