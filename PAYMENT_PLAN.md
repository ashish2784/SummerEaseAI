
# SummerEase Payment Integration Plan

This document outlines the step-by-step technical implementation to move SummerEase from a free-tier model to a Pro-subscription model using **Stripe** and **Supabase Edge Functions**.

---

## 1. Stripe Setup
1.  **Account Creation**: Create a Stripe account and set up a "SummerEase Pro" recurring product.
2.  **Price ID**: Note the `price_id` (e.g., `price_1234...`).
3.  **API Keys**: Retrieve your `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.

## 2. Supabase Database Schema
Add a `profiles` table (or extend `auth.users` metadata) to track subscription status:

```sql
alter table profiles add column stripe_customer_id text;
alter table profiles add column subscription_status text default 'free'; -- 'free', 'pro', 'canceled'
alter table profiles add column plan_type text default 'basic';
```

## 3. Checkout Edge Function
Create a Supabase Edge Function to generate a Stripe Checkout Session:

1.  **Input**: User ID and Email.
2.  **Process**:
    - Check if the user already has a `stripe_customer_id`.
    - Call `stripe.checkout.sessions.create()`.
    - Return the `url` to the frontend.

## 4. Webhook Handling
Create a second Edge Function to listen to Stripe events:

1.  **Event**: `checkout.session.completed` or `customer.subscription.updated`.
2.  **Logic**:
    - Verify signature using `STRIPE_WEBHOOK_SECRET`.
    - Update the user's `subscription_status` in the Supabase database.

## 5. Frontend Integration
1.  **Trigger**: Clicking "Upgrade to Pro" calls the Checkout Edge Function.
2.  **Redirect**: Browser redirects to the Stripe hosted checkout page.
3.  **App State**: On the Dashboard, check `user.subscription_status`. 
    - If `pro`, hide capacity limits and upgrade buttons.
    - If `free`, maintain the 100-record limit.

## 6. Security (RLS)
Update Supabase RLS policies to restrict "New Summary" creation for users with `free` status if `total_count >= 100`.

---
*Plan status: Ready for Integration.*
