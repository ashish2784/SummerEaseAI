
# Deploying SummerEase

This application is built as a modern ESM React application. It is designed to be deployed to any static site hosting provider (Vercel, Netlify, Cloudflare Pages).

## Environment Variables

For the app to function in production, ensure you set the following environment variables in your hosting provider's dashboard:

1.  `API_KEY`: Your Google Gemini API Key.
2.  `SUPABASE_URL`: Your Supabase Project URL.
3.  `SUPABASE_ANON_KEY`: Your Supabase Project Anonymous Key.

## Deployment Steps

### Option 1: Vercel / Netlify (Recommended)
1.  Connect your GitHub repository.
2.  Set the **Build Command** to: `npm run build` (if using a bundler) or simply serve `index.html`.
3.  Set the **Output Directory** to: `.` or `./dist`.
4.  Add the environment variables listed above.
5.  Deploy.

### Option 2: Static Hosting
Since the app uses native ESM and an `importmap`, you can technically host this by simply serving the root directory as static files. Ensure your server routes all requests to `index.html` to support client-side routing.

## Security Note
The Supabase Anon Key is safe to expose on the client side, as security should be handled via **Row Level Security (RLS)** in your Supabase dashboard. Ensure the `summaries` table has RLS enabled so users can only access their own `user_id`.
