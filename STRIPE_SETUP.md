# Stripe Setup Instructions

## 🔑 Required Environment Variables

Add these variables to your `.env.local` file (replace the placeholder values with your actual Stripe credentials):

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here
STRIPE_PRICE_MONTHLY=price_your_actual_monthly_price_id_here
STRIPE_PRICE_ANNUAL=price_your_actual_annual_price_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📋 Step-by-Step Setup

### 1. Get Your Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API Keys**
3. Copy the **Publishable key** (starts with `pk_test_`)
4. Copy the **Secret key** (starts with `sk_test_`)

### 2. Create Products and Prices
1. Go to **Products** in your Stripe Dashboard
2. Click **"Add product"**
3. Create two products:
   - **Bloomwell AI Monthly**: $24.99/month
   - **Bloomwell AI Annual**: $20.99/month (billed annually at $251.88)
4. Copy the **Price IDs** (start with `price_`) for each product

### 3. Update Environment Variables
Replace the placeholder values in `.env.local` with your actual values:

```bash
STRIPE_SECRET_KEY=sk_test_51ABC123...  # Your actual secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...  # Your actual publishable key
STRIPE_PRICE_MONTHLY=price_1ABC123...  # Your monthly price ID
STRIPE_PRICE_ANNUAL=price_1XYZ789...   # Your annual price ID
```

### 4. Restart Development Server
```bash
npm run dev
```

## 🧪 Testing

### Test Cards (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date (e.g., 12/25) and any 3-digit CVC.

### Debug Information
The checkout API now includes debug logging. Check your terminal for:
- `Stripe key exists: true` (should be true)
- `App URL exists: true` (should be true)
- `=== Stripe Checkout API Called ===` (when button is clicked)

## 🚨 Common Issues

### "Error processing upgrade. Please try again."
- **Cause**: Missing or incorrect environment variables
- **Fix**: Verify all Stripe variables are set correctly and restart the server

### "Neither apiKey nor config.authenticator provided"
- **Cause**: `STRIPE_SECRET_KEY` is missing or undefined
- **Fix**: Check that the secret key is properly set in `.env.local`

### Environment variables not loading
- **Cause**: Wrong file name or server not restarted
- **Fix**: Ensure file is named `.env.local` and restart `npm run dev`

## ✅ Success Indicators

When properly configured, you should see:
1. ✅ No errors in terminal when clicking upgrade button
2. ✅ Redirect to Stripe Checkout page
3. ✅ Ability to complete test payment
4. ✅ Return to dashboard after successful payment

## 🔒 Security Notes

- **Never commit** `.env.local` to version control
- **Use test keys** for development (keys starting with `sk_test_` and `pk_test_`)
- **Switch to live keys** only for production deployment
