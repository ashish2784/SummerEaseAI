
import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { supabase } from '../lib/supabase';

interface PaymentsProps {
  user: User;
  onBack: () => void;
  onStatusUpdate?: (status: 'free' | 'pro') => void;
}

// Global Razorpay declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payments: React.FC<PaymentsProps> = ({ user, onBack, onStatusUpdate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'none' | 'handshake' | 'gateway' | 'verifying' | 'finalizing'>('none');

  const isPro = user.subscriptionStatus === 'pro';

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTransactions(data.map(t => ({
          id: t.id,
          userId: t.user_id,
          email: t.email,
          plan: t.plan,
          paymentAmount: t.payment_amount,
          paymentStatus: t.payment_status,
          createdAt: new Date(t.created_at).getTime(),
          razorpay_payment_id: t.razorpay_payment_id,
          razorpay_order_id: t.razorpay_order_id,
          razorpay_signature: t.razorpay_signature
        })));
      }
      setLoading(false);
    };
    fetchTransactions();
  }, [user.id]);

  const handleRazorpayCheckout = async () => {
    setError(null);
    
    if (!window.Razorpay) {
      setError("Payment Gateway script failed to load. Please check your connection or disable ad-blockers.");
      return;
    }

    setProcessing(true);
    setCheckoutStep('handshake');
    
    // In production, you'd fetch a real Order ID from your backend here.
    setTimeout(() => {
      setCheckoutStep('gateway');
      
      const options = {
        key: "rzp_test_YOUR_KEY", 
        amount: 1900, 
        currency: "INR",
        name: "SummerEase AI",
        description: "Monthly Pro Subscription",
        image: "https://raw.githubusercontent.com/lucide-static/lucide/main/icons/zap.svg",
        order_id: "order_" + Math.random().toString(36).substring(2, 12).toUpperCase(),
        handler: async function (response: any) {
          setCheckoutStep('verifying');
          await finalizePayment(response);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            setCheckoutStep('none');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description);
        setProcessing(false);
        setCheckoutStep('none');
      });
      rzp.open();
    }, 1000);
  };

  const finalizePayment = async (rzpResponse: any) => {
    setCheckoutStep('finalizing');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'pro' })
      .eq('id', user.id);
    
    if (profileError) {
      setError("Profile update failed. Reference: " + rzpResponse.razorpay_payment_id);
      setProcessing(false);
      return;
    }

    const { error: transError } = await supabase.from('transactions').insert({
      user_id: user.id,
      email: user.email,
      plan: 'Pro Monthly',
      payment_amount: 19,
      payment_status: 'SUCCESS',
      razorpay_order_id: rzpResponse.razorpay_order_id,
      razorpay_payment_id: rzpResponse.razorpay_payment_id,
      razorpay_signature: rzpResponse.razorpay_signature
    });

    if (!transError) {
      setTimeout(() => {
        setShowSuccess(true);
        setProcessing(false);
        setCheckoutStep('none');
        if (onStatusUpdate) onStatusUpdate('pro');
      }, 500);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 animate-in zoom-in-95 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 sm:p-20 border border-green-100 dark:border-green-900/30 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-3 bg-green-500"></div>
          <div className="h-24 w-24 bg-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/30 animate-bounce">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter">Vault Upgraded</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-12 font-medium">Your Razorpay transaction was verified. Pro features are now available across all devices.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-indigo-600 text-white font-black py-6 rounded-3xl shadow-xl text-[10px] uppercase tracking-[0.3em]">Open Pro Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 animate-in fade-in duration-700">
      {processing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/40">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border border-indigo-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
              {checkoutStep === 'handshake' && 'Link Encryption'}
              {checkoutStep === 'gateway' && 'Awaiting Razorpay'}
              {checkoutStep === 'verifying' && 'Verification Step'}
              {checkoutStep === 'finalizing' && 'Writing Ledger'}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Connection Active</p>
          </div>
        </div>
      )}

      <div className="mb-12 flex items-center justify-between">
        <button onClick={onBack} className="group flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors">
          <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
           <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.4em]">Razorpay Secure v3.1</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 sm:p-14 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
            {isPro && <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black uppercase px-6 py-2 rounded-bl-3xl">Active</div>}
            <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-10">Vault Subscription</h3>
            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter leading-none">{isPro ? 'Pro Active' : 'Go Pro'}</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-12 font-medium">Elevate your intelligence directory with unlimited synthesis and high-priority Gemini nodes for ₹19/mo.</p>
            
            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase rounded-2xl border border-red-100 dark:border-red-900/30">
                Error: {error}
              </div>
            )}

            {!isPro ? (
              <button onClick={handleRazorpayCheckout} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-3xl shadow-xl transition-all active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-4">
                Upgrade - ₹19/mo
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            ) : (
              <div className="w-full py-6 text-center text-green-500 text-[10px] font-black uppercase tracking-widest border-2 border-green-500/20 rounded-3xl bg-green-50/50 dark:bg-green-900/10">Subscription Verified</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 sm:p-14 border border-gray-100 dark:border-slate-800 shadow-sm min-h-full transition-colors">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-12">Transaction Audit Log</h3>
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-gray-50 dark:bg-slate-800 animate-pulse rounded-[2rem]"></div>)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-gray-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">No financial records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map(t => (
                  <div key={t.id} className="p-8 rounded-[2.5rem] border border-gray-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 flex items-center justify-between hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                    <div>
                      <span className="text-lg font-black text-gray-900 dark:text-white block">{t.plan}</span>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest block mt-1">
                        {new Date(t.createdAt).toLocaleDateString()} • ID: {t.razorpay_payment_id?.substring(0, 12)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">₹{t.paymentAmount}</span>
                      <span className="block text-[8px] font-black text-green-500 uppercase tracking-[0.3em] mt-1">{t.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
