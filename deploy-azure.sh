#!/bin/bash

# SummerEase Azure Deployment Script
# This script prepares and validates your application for Azure deployment

set -e  # Exit on error

echo "🚀 SummerEase Azure Deployment Preparation"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "   Node.js version: $NODE_VERSION"

if [[ "$NODE_VERSION" < "v18" ]]; then
    echo -e "${RED}❌ Node.js 18 or higher is required${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version is compatible${NC}"
echo ""

# Step 2: Check if environment variables are set
echo "🔐 Checking environment variables..."
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo "   Please create .env.local with required variables"
    exit 1
fi

# Check for required variables
REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_GEMINI_API_KEY" "VITE_RAZORPAY_KEY_ID")
for VAR in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$VAR=" .env.local; then
        echo -e "${YELLOW}⚠️  Warning: $VAR not found in .env.local${NC}"
    else
        echo -e "${GREEN}✅ $VAR is set${NC}"
    fi
done
echo ""

# Step 3: Install dependencies
echo "📥 Installing dependencies..."
npm ci
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Run build
echo "🔨 Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 5: Check build output
echo "📊 Checking build output..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo "   Build size: $DIST_SIZE"
    echo -e "${GREEN}✅ Build output created${NC}"
else
    echo -e "${RED}❌ Build output directory not found${NC}"
    exit 1
fi
echo ""

# Step 6: Verify critical files
echo "🔍 Verifying critical files..."
CRITICAL_FILES=("dist/index.html" "favicon.png" "staticwebapp.config.json")
for FILE in "${CRITICAL_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "${GREEN}✅ $FILE exists${NC}"
    else
        echo -e "${RED}❌ $FILE not found${NC}"
        exit 1
    fi
done
echo ""

# Step 7: Check Git status
echo "📝 Checking Git status..."
if [ -d .git ]; then
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
        echo "   Consider committing before deployment"
    else
        echo -e "${GREEN}✅ Working directory is clean${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Not a Git repository${NC}"
fi
echo ""

# Step 8: Summary
echo "=========================================="
echo -e "${GREEN}🎉 Pre-deployment checks complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for Azure deployment'"
echo "   git push origin main"
echo ""
echo "2. Follow the Azure deployment guide:"
echo "   See AZURE_DEPLOYMENT.md for detailed instructions"
echo ""
echo "3. Set up Azure Static Web App:"
echo "   - Go to portal.azure.com"
echo "   - Create new Static Web App"
echo "   - Connect to your GitHub repository"
echo ""
echo "4. Configure environment variables in Azure Portal"
echo ""
echo "=========================================="
