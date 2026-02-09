#!/bin/bash

# SummerEase - Quick Deployment Script
# This script helps you deploy to Vercel quickly

echo "🚀 SummerEase - Quick Deployment"
echo "================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

# Check if .env.local has real values
if grep -q "PLACEHOLDER_API_KEY" .env.local 2>/dev/null; then
    echo "⚠️  WARNING: .env.local still contains PLACEHOLDER_API_KEY"
    echo "   Make sure to set real environment variables in Vercel dashboard after deployment!"
    echo ""
fi

# Build the project first
echo "📦 Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo ""
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add environment variables:"
echo "   - GEMINI_API_KEY"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "3. Redeploy or wait for automatic redeployment"
echo ""
echo "✨ Your app will be live shortly!"
