# Azure Static Web Apps Deployment Guide

## 🚀 Overview

This guide will walk you through deploying SummerEase to **Azure Static Web Apps**, a modern hosting platform optimized for static sites and SPAs with global CDN distribution.

---

## 📋 Prerequisites

1. **Azure Account** - [Sign up for free](https://azure.microsoft.com/free/)
2. **GitHub Account** - Your repository should be on GitHub
3. **Azure CLI** (optional) - [Install Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)

---

## 🎯 Deployment Steps

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Azure deployment"
git push origin main
```

### Step 2: Create Azure Static Web App

#### Option A: Using Azure Portal (Recommended for First-Time)

1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Click "Create a resource"
   - Search for "Static Web App"
   - Click "Create"

2. **Configure Basic Settings**
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Create new or select existing
   - **Name**: `summerease-ai` (or your preferred name)
   - **Plan Type**: Free (for development) or Standard (for production)
   - **Region**: Choose closest to your users (e.g., East US 2, West Europe)

3. **Configure Deployment**
   - **Source**: GitHub
   - **Organization**: Your GitHub username
   - **Repository**: `SummerEaseAI` (or your repo name)
   - **Branch**: `main`

4. **Build Configuration**
   - **Build Presets**: Select "Custom"
   - **App location**: `/`
   - **Api location**: `` (leave empty)
   - **Output location**: `dist`

5. **Review and Create**
   - Click "Review + create"
   - Click "Create"

Azure will automatically:
- Create a GitHub Actions workflow in your repository
- Set up CI/CD pipeline
- Deploy your application

#### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name summerease-rg --location eastus2

# Create static web app
az staticwebapp create \
  --name summerease-ai \
  --resource-group summerease-rg \
  --source https://github.com/YOUR_USERNAME/SummerEaseAI \
  --location eastus2 \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

### Step 3: Configure Environment Variables

1. **In Azure Portal**:
   - Navigate to your Static Web App
   - Go to "Configuration" in the left menu
   - Click "Application settings"
   - Add the following environment variables:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

2. **In GitHub Secrets** (for CI/CD):
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Add the same environment variables as secrets
   - Also add: `AZURE_STATIC_WEB_APPS_API_TOKEN` (automatically created by Azure)

### Step 4: Verify Deployment

1. **Check GitHub Actions**:
   - Go to your repository's "Actions" tab
   - You should see a workflow running
   - Wait for it to complete (usually 2-5 minutes)

2. **Access Your Application**:
   - In Azure Portal, go to your Static Web App
   - Click "Browse" or copy the URL
   - Your app should be live at: `https://your-app-name.azurestaticapps.net`

---

## 🔧 Configuration Files

### `staticwebapp.config.json`
This file configures routing, headers, and security settings for Azure Static Web Apps.

**Key Features**:
- ✅ SPA routing with fallback to `index.html`
- ✅ Security headers (XSS, CORS, CSP)
- ✅ Cache control for static assets
- ✅ MIME type configuration

### `.github/workflows/azure-static-web-apps.yml`
GitHub Actions workflow for automated deployment.

**Features**:
- ✅ Automatic deployment on push to `main`
- ✅ Build optimization with dependency caching
- ✅ Environment variable injection
- ✅ PR preview deployments

---

## 🌐 Custom Domain Setup

### Add Custom Domain

1. **In Azure Portal**:
   - Navigate to your Static Web App
   - Go to "Custom domains"
   - Click "Add"
   - Choose "Custom domain on other DNS"

2. **Configure DNS**:
   - Add a CNAME record pointing to your Azure Static Web App URL
   - Example:
     ```
     Type: CNAME
     Name: www
     Value: your-app-name.azurestaticapps.net
     ```

3. **Validate and Enable**:
   - Azure will validate the DNS record
   - SSL certificate is automatically provisioned (free)
   - Your app will be accessible at your custom domain

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use Azure Application Settings for production secrets
- ✅ Use GitHub Secrets for CI/CD pipeline
- ✅ Rotate API keys regularly

### Headers
The `staticwebapp.config.json` includes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 📊 Monitoring & Analytics

### Azure Monitor
1. Navigate to your Static Web App
2. Go to "Monitoring" → "Metrics"
3. View:
   - Request count
   - Data transfer
   - Response times
   - Error rates

### Application Insights (Optional)
For advanced monitoring:
```bash
az staticwebapp appsettings set \
  --name summerease-ai \
  --setting-names APPLICATIONINSIGHTS_CONNECTION_STRING=your_connection_string
```

---

## 🚨 Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Verify all dependencies in `package.json`
- Ensure `vite.config.ts` is correct

### Environment Variables Not Working
- Verify they're set in Azure Portal → Configuration
- Ensure they're prefixed with `VITE_`
- Rebuild and redeploy

### 404 Errors
- Check `staticwebapp.config.json` routing rules
- Verify `output_location: "dist"` in workflow
- Ensure SPA fallback is configured

### Slow Performance
- Enable caching in `staticwebapp.config.json`
- Use Azure CDN for static assets
- Optimize images and bundle size

---

## 💰 Cost Estimation

### Free Tier
- ✅ 100 GB bandwidth/month
- ✅ 0.5 GB storage
- ✅ Custom domains with SSL
- ✅ Perfect for development and small projects

### Standard Tier (~$9/month)
- ✅ 100 GB bandwidth included
- ✅ Additional bandwidth: $0.20/GB
- ✅ SLA: 99.95% uptime
- ✅ Staging environments
- ✅ Custom authentication

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **On Push to Main**:
   - Checks out code
   - Installs dependencies
   - Builds production bundle
   - Deploys to Azure

2. **On Pull Request**:
   - Creates preview deployment
   - Provides unique URL for testing
   - Automatically closes on PR merge

---

## 📝 Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow (Supabase)
- [ ] Test AI summarization (Gemini API)
- [ ] Test payment integration (Razorpay)
- [ ] Check responsive design on mobile
- [ ] Verify favicon appears
- [ ] Test all environment variables
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts
- [ ] Update README with production URL

---

## 🎉 Success!

Your SummerEase application is now live on Azure Static Web Apps with:
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ CI/CD pipeline
- ✅ Scalable infrastructure
- ✅ 99.95% SLA (Standard tier)

**Production URL**: `https://your-app-name.azurestaticapps.net`

---

## 📚 Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)

---

## 🆘 Support

If you encounter issues:
1. Check Azure Portal logs
2. Review GitHub Actions workflow logs
3. Consult [Azure Static Web Apps troubleshooting](https://docs.microsoft.com/azure/static-web-apps/troubleshooting)
4. Open an issue on GitHub

---

**Last Updated**: February 12, 2026
**Version**: 1.0.0
