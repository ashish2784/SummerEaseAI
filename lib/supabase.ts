
import { createClient } from '@supabase/supabase-js';

/**
 * SECURE VAULT CONFIGURATION
 * Using your provided Supabase project credentials.
 * In a production hosting environment (Vercel), these should be moved to 
 * Environment Variables for maximum security.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://vgglvtbctxxmmtzmcfbd.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZ2x2dGJjdHh4bW10em1jZmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODAwNzcsImV4cCI6MjA4NTk1NjA3N30.TGLYgunbq1jrVS-El0sWqg8gOaNClisxCiXRCfV2Xmw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'summerease_auth_token'
  }
});
