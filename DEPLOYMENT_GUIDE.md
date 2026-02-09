
# SummerEase: Secure Deployment Guide

## 1. Hosting on Vercel (Recommended)
Vercel is the best choice for this app due to its native support for React, ESM, and Edge Functions.

### Step-by-Step:
1.  **Push to GitHub**: Initialize a Git repo and push your code.
2.  **Import to Vercel**: Connect your GitHub account and select the `SummerEase` project.
3.  **Environment Variables (CRITICAL)**:
    In the Vercel Dashboard, add the following under "Settings > Environment Variables":
    - `API_KEY`: Your Google Gemini API Key.
    - `SUPABASE_URL`: From your Supabase Project Settings.
    - `SUPABASE_ANON_KEY`: From your Supabase Project Settings.
4.  **Deploy**: Vercel will build the app and provide a secure `https://...` URL.

## 2. Encrypting the Gemini API (Proxying)
Currently, the app calls Gemini from the frontend. While `process.env.API_KEY` is used, the key can technically be exposed in a client-side bundle if not handled by a build tool like Vite.

**To fully "encrypt" the API usage:**
- Create a folder `api/summarize.ts` in your project.
- Move the `summarizeContent` logic from `geminiService.ts` to this file.
- Vercel will turn this into a **Serverless Function**.
- Your frontend will then call `/api/summarize` instead of calling Gemini directly.
- **Benefit**: Your `API_KEY` remains on the server and is *never* sent to the user's browser.

## 3. Securing Data Files
Your data files (summaries) are stored in Supabase. We have already implemented **Row Level Security (RLS)**.

### Verify RLS in Supabase:
Go to the Supabase SQL Editor and ensure this policy is active:
```sql
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own summaries" 
ON summaries FOR ALL 
USING (auth.uid() = user_id);
```
This ensures that even if someone gets your `SUPABASE_ANON_KEY`, they can **only** see their own data, and never anyone else's.

## 4. Final Security Checklist
- [ ] **HTTPS**: Vercel handles this. Never host on HTTP.
- [ ] **Auth Email Confirmation**: Enable in Supabase Auth settings to prevent fake accounts.
- [ ] **Rate Limiting**: Vercel has built-in DDoS protection.
- [ ] **Gemini API Restrictions**: Go to Google AI Studio and restrict your API Key to only allow calls from your Vercel domain.
