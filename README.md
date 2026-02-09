<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SummerEase - AI Summary Directory

A sophisticated AI-powered summary directory built with React, Vite, Google Gemini AI, and Supabase.

View your app in AI Studio: https://ai.studio/apps/drive/1EvPOKGgCNjmI81vL0oylxfNSyP_gWkJE

## 🚀 Quick Start

### Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Set your `GEMINI_API_KEY` in `.env.local`
   - Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` if using Supabase

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

## 🌐 Deploy to Production

Your app is **100% hosting-ready**! Deploy to any of these platforms:

### Quick Deploy (Recommended)

**Vercel** - One command deployment:
```bash
./deploy.sh
```

Or manually:
```bash
npm install -g vercel
vercel --prod
```

### Other Platforms

- **Netlify**: `netlify deploy --prod`
- **Cloudflare Pages**: Connect via GitHub
- **GitHub Pages**: See `HOSTING_READY.md`

📖 **Full deployment guide:** See [HOSTING_READY.md](HOSTING_READY.md) for detailed instructions.

## 📚 Documentation

- **[HOSTING_READY.md](HOSTING_READY.md)** - Complete hosting guide with all deployment options
- **[DEPLOY.md](DEPLOY.md)** - Basic deployment information
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Advanced security and configuration guide
- **[PAYMENT_PLAN.md](PAYMENT_PLAN.md)** - Monetization strategy
- **[DB_SCHEMA.sql](DB_SCHEMA.sql)** - Database schema for Supabase

## 🔐 Environment Variables

Required for production:

```bash
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

See `.env.example` for reference.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 5
- **AI**: Google Gemini 3 Flash
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (recommended)

## 📦 Project Structure

```
summerease---ai-summary-directory/
├── components/          # React components
├── services/           # API services (Gemini, Supabase)
├── utils/              # Utility functions
├── lib/                # Shared libraries
├── dist/               # Production build output
├── index.html          # Entry HTML
├── App.tsx             # Main App component
└── vite.config.ts      # Vite configuration
```

## ✨ Features

- AI-powered content summarization
- User authentication
- Secure data storage
- Responsive design
- Production-ready security headers
- SEO optimized

## 🤝 Contributing

This is a production-ready application. Feel free to fork and customize!

## 📄 License

Private - All rights reserved

---

**Built with ❤️ using React, Vite, Google Gemini AI, and Supabase**
