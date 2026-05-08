import Api from "../../../api/Api";

class SubscriptionService {
    constructor() {
        this.base = "/subscription";
        this.exchangeRates = null;
        this.ratesLastFetched = null;
    }
    /**
     * Get payment processor display name
     * @param {string} processor - Processor ID
     * @returns {string} - Display name
     */
    getProcessorName(processor) {
        const names = {
            stripe: 'Credit/Debit Card',
            easypaisa: 'EasyPaisa',
            jazzcash: 'JazzCash'
        };
        return names[processor] || processor;
    }

    /**
     * Get status badge configuration based on subscription status
     * @param {Object} status - Subscription status object
     * @returns {Object} - Badge configuration with color, bgColor, and text
     */
    getStatusBadge(status) {
        if (!status) {
            return {
                text: 'FREE',
                color: '#6b7280',
                bgColor: 'rgba(107, 116, 128, 0.1)'
            };
        }

        // Check if user has active subscription
        if (status.activeSubscription && !status.isExpired) {
            const planType = status.activeSubscription.plan_type?.toLowerCase();

            // Platinum plan
            if (planType === 'platinum' || planType === 'yearly') {
                return {
                    text: 'PLATINUM',
                    color: '#8b5cf6',
                    bgColor: 'rgba(139, 92, 246, 0.1)'
                };
            }

            // Premium plan
            if (planType === 'premium' || planType === 'monthly') {
                return {
                    text: 'PREMIUM',
                    color: '#3b82f6',
                    bgColor: 'rgba(59, 130, 246, 0.1)'
                };
            }

            // Basic plan
            if (planType === 'basic' || planType === 'weekly') {
                return {
                    text: 'BASIC',
                    color: '#10b981',
                    bgColor: 'rgba(16, 185, 129, 0.1)'
                };
            }

            // Generic PRO for any other active subscription
            return {
                text: 'PRO',
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.1)'
            };
        }

        // Check if user is Pro (based on isPro flag)
        if (status.isPro) {
            return {
                text: 'PRO',
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.1)'
            };
        }

        // Has credits but no active subscription
        if (status.credits && status.credits > 0) {
            return {
                text: 'CREDITS',
                color: '#14b8a6',
                bgColor: 'rgba(20, 184, 166, 0.1)'
            };
        }

        // Default - Free tier
        return {
            text: 'FREE',
            color: '#6b7280',
            bgColor: 'rgba(107, 116, 128, 0.1)'
        };
    }
    /**
     * Get available subscription plans (from backend)
     * @returns {Promise} - Returns plans from backend
     */
    async getPlans() {
        try {
            const response = await Api.get(`${this.base}/plans`);
            console.log('Plans from backend:', response);
            return response;
        } catch (error) {
            console.error('Get plans error:', error);
            // Fallback to static plans if API fails
            return {
                success: true,
                data: this.getStaticPlans()
            };
        }
    }

    /**
     * Get static plans (fallback or for offline use)
     * @returns {Array} - Returns array of subscription plans
     */
    getStaticPlans() {
        return [
            {
                id: "basic",
                name: "Basic",
                label: "BASIC",
                credits: 50,
                price: { USD: 4.99, PKR: 1400, AED: 18 },
                priceValue: 4.99,
                durationDays: 7,
                description: "50 credits per week",
                popular: false,
                // @ts-ignore
                stripePriceId: import.meta.env.VITE_STRIPE_WEEKLY_PRICE_ID,
            },
            {
                id: "premium",
                name: "Premium",
                label: "PREMIUM",
                credits: 250,
                price: { USD: 12.99, PKR: 3600, AED: 48 },
                priceValue: 12.99,
                durationDays: 30,
                description: "250 credits per month",
                popular: true,
                // @ts-ignore
                stripePriceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID,
            },
            {
                id: "platinum",
                name: "Platinum",
                label: "PLATINUM",
                credits: 3500,
                price: { USD: 71.88, PKR: 20000, AED: 264 },
                priceValue: 71.88,
                durationDays: 365,
                description: "3500 credits per year",
                popular: false,
                // @ts-ignore
                stripePriceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID,
            },
        ];
    }

    /**
     * Get exchange rates from API
     * @returns {Promise<Object>} - Exchange rates
     */
    async getExchangeRates() {
        // Cache rates for 1 hour
        const ONE_HOUR = 60 * 60 * 1000;
        if (this.exchangeRates && this.ratesLastFetched && (Date.now() - this.ratesLastFetched < ONE_HOUR)) {
            return this.exchangeRates;
        }

        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            this.exchangeRates = data.rates;
            this.ratesLastFetched = Date.now();
            return data.rates;
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            // Fallback rates
            return {
                USD: 1,
                PKR: 278,
                AED: 3.67,
                GBP: 0.79,
                EUR: 0.92
            };
        }
    }

    /**
     * Convert USD price to target currency
     * @param {number} usdAmount - Amount in USD
     * @param {string} targetCurrency - Target currency code
     * @returns {Promise<number>} - Converted amount
     */
    async convertPrice(usdAmount, targetCurrency) {
        if (targetCurrency === 'USD') return usdAmount;

        try {
            const rates = await this.getExchangeRates();
            const rate = rates[targetCurrency];

            if (rate) {
                return parseFloat((usdAmount * rate).toFixed(2));
            }
            return usdAmount;
        } catch (error) {
            console.error('Currency conversion error:', error);
            return usdAmount;
        }
    }

    /**
     * Get available payment methods
     * @returns {Promise} - Returns available payment processors
     */
    async getPaymentMethods() {
        try {
            const response = await Api.get(`${this.base}/payment-methods`);
            return response;
        } catch (error) {
            console.error('Get payment methods error:', error);
            // Fallback to Stripe only if API fails
            return {
                success: true,
                data: [{
                    id: 'stripe',
                    name: 'Credit/Debit Card',
                    description: 'Pay with Visa, Mastercard, or American Express',
                    fees: 'No additional fees',
                    supported: true
                }]
            };
        }
    }

    /**
     * Create payment session (works for all processors)
     * @param {Object} data - { planType, userId, paymentMethod, currency, priceId }
     * @returns {Promise} - Returns payment URL and session data
     */
    async createPaymentSession(data) {
        try {
            const response = await Api.post(`${this.base}/create-session`, data);
            return response;
        } catch (error) {
            console.error('Create payment session error:', error);
            throw error;
        }
    }

    /**
     * Legacy method for Stripe checkout (backward compatibility)
     */
    async createCheckoutSession(data) {
        try {
            const response = await Api.post(`${this.base}/create-checkout-session`, data);
            return response;
        } catch (error) {
            console.error('Create checkout session error:', error);
            throw error;
        }
    }

    /**
     * Get user subscription status
     * @param {number|string} userId - User ID
     * @returns {Promise} - Returns subscription status data
     */
    async getSubscriptionStatus(userId) {
        try {
            const response = await Api.get(`${this.base}/status/${userId}`);
            return response;
        } catch (error) {
            console.error('Get subscription status error:', error);
            return {
                success: false,
                data: {
                    credits: 0,
                    isPro: false,
                    activeSubscription: null,
                    isExpired: true
                }
            };
        }
    }

    /**
     * Get user's subscription data
     * @returns {Promise} - Returns subscription and transaction history
     */
    async getMySubscriptions() {
        try {
            const response = await Api.get(`${this.base}/my`);
            return response;
        } catch (error) {
            console.error('Get my subscriptions error:', error);
            throw error;
        }
    }

    /**
     * Restore previous purchases (Stripe only)
     * @param {number|string} userId - User ID
     * @returns {Promise} - Returns restore status
     */
    async restorePurchases(userId) {
        try {
            const response = await Api.post(`${this.base}/restore-purchases`, { userId });
            return response;
        } catch (error) {
            console.error('Restore purchases error:', error);
            throw error;
        }
    }

    /**
     * Verify payment session
     * @param {string} sessionId - Session ID
     * @returns {Promise} - Returns session verification data
     */
    async verifySession(sessionId) {
        try {
            const response = await Api.get(`${this.base}/verify-session?session_id=${sessionId}`);
            return response;
        } catch (error) {
            console.error('Verify session error:', error);
            throw error;
        }
    }

    /**
     * Format price based on currency
     * @param {number} amount - Amount
     * @param {string} currency - Currency code (USD, PKR, AED, etc.)
     * @returns {string} - Formatted price
     */
    formatPrice(amount, currency = 'USD') {
        if (!amount || isNaN(amount)) {
            return currency === 'USD' ? '$0.00' : `${currency} 0`;
        }

        const currencyFormats = {
            USD: { symbol: '$', decimals: 2, position: 'before' },
            PKR: { symbol: 'Rs', decimals: 0, position: 'before' },
            AED: { symbol: 'AED', decimals: 2, position: 'before' },
            GBP: { symbol: '£', decimals: 2, position: 'before' },
            EUR: { symbol: '€', decimals: 2, position: 'before' },
        };

        const format = currencyFormats[currency] || { symbol: currency, decimals: 2, position: 'before' };
        const formattedAmount = format.decimals === 0
            ? Math.round(amount).toLocaleString()
            : amount.toFixed(format.decimals);

        return format.position === 'before'
            ? `${format.symbol}${formattedAmount}`
            : `${formattedAmount} ${format.symbol}`;
    }


    /**
     * Detect user's currency based on country
     * @param {string} country - Country name or code
     * @returns {string} - Currency code
     */
    getCurrencyByCountry(country) {
        if (!country) return 'USD';

        const countryLower = country.toLowerCase();

        const currencyMap = {
            pakistan: 'PKR',
            pk: 'PKR',
            'united arab emirates': 'AED',
            uae: 'AED',
            ae: 'AED',
            'united states': 'USD',
            usa: 'USD',
            us: 'USD',
            'united kingdom': 'GBP',
            uk: 'GBP',
            gb: 'GBP',
        };

        return currencyMap[countryLower] || 'USD';
    }
}

export default new SubscriptionService();