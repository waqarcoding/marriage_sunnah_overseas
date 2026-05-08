// test-stripe-connection.js
require('dotenv').config();
const Stripe = require('stripe');

console.log('\n=== Testing Stripe Connection ===\n');

// Check if API key exists
const apiKey = process.env.STRIPE_SECRET_KEY;
console.log('1. Checking API Key...');
console.log('   Key exists:', !!apiKey);
console.log('   Key starts with sk_test_:', apiKey?.startsWith('sk_test_'));
console.log('   Key length:', apiKey?.length || 0);
console.log('   First 20 chars:', apiKey?.substring(0, 20) || 'NOT FOUND');

if (!apiKey) {
    console.error('\n❌ ERROR: STRIPE_SECRET_KEY not found in .env file!\n');
    process.exit(1);
}

if (!apiKey.startsWith('sk_test_')) {
    console.error('\n❌ ERROR: API key should start with sk_test_ for test mode!\n');
    process.exit(1);
}

// Initialize Stripe
console.log('\n2. Initializing Stripe...');
const stripe = new Stripe(apiKey);
console.log('   Stripe initialized ✓');

// Test API connection
console.log('\n3. Testing API Connection...');
async function testConnection() {
    try {
        // Try to fetch account info
        // @ts-ignore
        const account = await stripe.accounts.retrieve();
        console.log('   ✅ Connection successful!');
        console.log('   Account ID:', account.id);
        console.log('   Email:', account.email);
        console.log('   Country:', account.country);

        // Test listing customers (should work even if empty)
        console.log('\n4. Testing API Permissions...');
        const customers = await stripe.customers.list({ limit: 1 });
        console.log('   ✅ Can access customers');

        // Check price IDs
        console.log('\n5. Checking Price IDs...');
        const weeklyPriceId = process.env.STRIPE_WEEKLY_PRICE_ID;
        const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID;
        const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID;

        console.log('   Weekly:', weeklyPriceId || '❌ NOT SET');
        console.log('   Monthly:', monthlyPriceId || '❌ NOT SET');
        console.log('   Yearly:', yearlyPriceId || '❌ NOT SET');

        // Verify each price exists
        if (weeklyPriceId) {
            try {
                const price = await stripe.prices.retrieve(weeklyPriceId);
                // @ts-ignore
                console.log('   ✅ Weekly price verified: $' + (price.unit_amount / 100));
            } catch (err) {
                console.log('   ❌ Weekly price ID invalid:', err);
            }
        }

        if (monthlyPriceId) {
            try {
                const price = await stripe.prices.retrieve(monthlyPriceId);
                // @ts-ignore
                console.log('   ✅ Monthly price verified: $' + (price.unit_amount / 100));
            } catch (err) {
                console.log('   ❌ Monthly price ID invalid:', err);
            }
        }

        if (yearlyPriceId) {
            try {
                const price = await stripe.prices.retrieve(yearlyPriceId);
                // @ts-ignore
                console.log('   ✅ Yearly price verified: $' + (price.unit_amount / 100));
            } catch (err) {
                console.log('   ❌ Yearly price ID invalid:', err);
            }
        }

        console.log('\n✅ All tests passed!\n');

    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error type:', error);
        console.error('Error message:', error);
        console.error('\nFull error:', error);

        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Go to: https://dashboard.stripe.com/test/apikeys');
        console.log('2. Copy the "Secret key" (starts with sk_test_)');
        console.log('3. Update your .env file: STRIPE_SECRET_KEY=sk_test_...');
        console.log('4. Make sure there are no extra spaces or quotes');
        console.log('5. Restart your server after updating .env\n');

        process.exit(1);
    }
}

testConnection();