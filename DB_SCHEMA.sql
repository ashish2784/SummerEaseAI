
-- SummerEase Professional Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Summaries Directory Table
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  subscription_status TEXT CHECK (subscription_status IN ('free', 'pro')) DEFAULT 'free',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Razorpay Transactions Ledger
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL,
  payment_amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT NOT NULL, -- SUCCESS, FAILED, PENDING
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6. Security Policies
-- Summaries: Users only see/edit their own data
CREATE POLICY "Summaries: Access Own" ON public.summaries FOR ALL USING (auth.uid() = user_id);

-- Profiles: Users see their own profile
CREATE POLICY "Profiles: Access Own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: Update Own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Transactions: Users see their own payment history
CREATE POLICY "Transactions: Access Own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- 7. Automatic Profile Generation on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, subscription_status)
  VALUES (new.id, 'free');
  RETURN NEW;
END;
$$;

-- Clean up existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
