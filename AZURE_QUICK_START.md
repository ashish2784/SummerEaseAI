# 🚀 Azure Deployment Quick Reference

## One-Command Deployment Check

```bash
npm run deploy:azure
```

This will automatically:
- ✅ Verify Node.js version
- ✅ Check environment variables
- ✅ Install dependencies
- ✅ Build production bundle
- ✅ Validate critical files
- ✅ Check Git status

---

## 📝 Quick Setup Checklist

### 1. Local Preparation
```bash
# Run deployment check
npm run deploy:azure

# Commit changes
git add .
git commit -m "Add favicon and Azure deployment config"
git push origin main
```

### 2. Azure Portal Setup
1. Go to [portal.azure.com](https://portal.azure.com)
2. Create Resource → Static Web App
3. Configure:
   - **Name**: `summerease-ai`
   - **Region**: East US 2 (or closest)
   - **Source**: GitHub
   - **Repository**: Your repo
   - **Branch**: `main`
   - **Build Preset**: Custom
   - **App location**: `/`
   - **Output location**: `dist`

### 3. Environment Variables (Azure Portal)
Navigate to: Static Web App → Configuration → Application settings

Add these variables:
```
VITE_SUPABASE_URL=your_value
VITE_SUPABASE_ANON_KEY=your_value
VITE_GEMINI_API_KEY=your_value
VITE_RAZORPAY_KEY_ID=your_value
```

### 4. GitHub Secrets
Navigate to: GitHub Repo → Settings → Secrets → Actions

Add the same variables as above, plus:
```
AZURE_STATIC_WEB_APPS_API_TOKEN=auto_generated_by_azure
```

---

## 🌐 Your URLs

**Azure URL**: `https://summerease-ai.azurestaticapps.net`  
**Custom Domain**: Configure in Azure Portal → Custom domains

---

## 🔧 Files Added

| File | Purpose |
|------|---------|
| `favicon.png` | Innovative favicon with sun/AI design |
| `staticwebapp.config.json` | Azure routing & security config |
| `.github/workflows/azure-static-web-apps.yml` | CI/CD pipeline |
| `AZURE_DEPLOYMENT.md` | Comprehensive deployment guide |
| `deploy-azure.sh` | Pre-deployment validation script |

---

## ⚡ Quick Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Azure deployment check
npm run deploy:azure

# Vercel deployment (alternative)
npm run deploy:vercel
```

---

## 🆘 Troubleshooting

**Build fails?**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Environment variables not working?**
- Check they're prefixed with `VITE_`
- Verify in Azure Portal → Configuration
- Redeploy after adding variables

**404 errors?**
- Check `staticwebapp.config.json` exists
- Verify `output_location: "dist"` in workflow
- Ensure SPA fallback is configured

---

## 📊 Deployment Status

Check deployment status:
- **GitHub Actions**: Repository → Actions tab
- **Azure Portal**: Static Web App → Deployments

---

## 🎉 Success Indicators

- ✅ GitHub Actions workflow completes
- ✅ Azure shows "Ready" status
- ✅ App accessible at Azure URL
- ✅ Favicon appears in browser tab
- ✅ All features work (auth, AI, payments)

---

**Need help?** See `AZURE_DEPLOYMENT.md` for detailed instructions.
