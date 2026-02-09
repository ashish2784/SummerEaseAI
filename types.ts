
export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionStatus?: 'free' | 'pro';
}

export interface SummaryItem {
  id: string;
  userId: string;
  title: string;
  originalText: string;
  summary: string;
  createdAt: number;
  category: 'Text' | 'Document';
}

export interface Transaction {
  id: string;
  userId: string;
  email: string;
  plan: string;
  paymentAmount: number;
  paymentStatus: string;
  createdAt: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export type View = 'Home' | 'Login' | 'Signup' | 'Dashboard' | 'NewSummary' | 'SummaryDetail' | 'History';
