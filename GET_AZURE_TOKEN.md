# 🔑 How to Get AZURE_STATIC_WEB_APPS_API_TOKEN

## 📍 Where to Find It

The `AZURE_STATIC_WEB_APPS_API_TOKEN` is **only available AFTER you create an Azure Static Web App resource**.

---

## ✅ Step-by-Step Guide

### **Step 1: Create Azure Static Web App First**

You need to create the Azure resource before you can get the token.

1. **Go to Azure Portal**: [https://portal.azure.com](https://portal.azure.com)

2. **Click "Create a resource"** (big + button or "Create a resource" button)

3. **Search for "Static Web App"** in the search box

4. **Click "Create"**

---

### **Step 2: Fill in the Configuration**

#### **Basics Tab:**

- **Subscription**: Select your Azure subscription
- **Resource Group**: 
  - Click "Create new"
  - Name it: `summerease-rg`
- **Name**: `summerease-app` (or any unique name)
- **Plan type**: **Free** (for now)
- **Region for Azure Functions API**: 
  - **IMPORTANT**: Pick from the dropdown - it only shows regions allowed for your subscription!
  - Try: **Central US**, **East US**, or **West US 2**
  - The dropdown will filter to show ONLY allowed regions

#### **Deployment Details:**

- **Source**: **GitHub**
- Click **"Sign in with GitHub"** (if not already signed in)
- **Organization**: `ashish2784` (your GitHub username)
- **Repository**: `SummerEaseAI`
- **Branch**: `main`

#### **Build Details:**

- **Build Presets**: Select **"Custom"**
- **App location**: `/` (just a forward slash)
- **Api location**: (leave empty)
- **Output location**: `dist`

---

### **Step 3: Review and Create**

1. Click **"Review + create"**
2. Wait for validation (should say "Validation passed")
3. Click **"Create"**
4. Wait 1-2 minutes for deployment to complete

---

### **Step 4: Get the Deployment Token**

Once the Azure Static Web App is created:

#### **Method 1: From Overview Page**

1. Azure will show **"Deployment complete"**
2. Click **"Go to resource"**
3. You'll see the **Overview** page
4. In the top menu, click **"Manage deployment token"**
5. A popup appears with the token
6. Click **"Copy"** button
7. **Save this token** - you'll need it for GitHub!

#### **Method 2: From Settings**

1. Go to your Static Web App in Azure Portal
2. In the left sidebar, scroll down to **"Settings"**
3. Click **"Configuration"**
4. At the top, you'll see **"Manage deployment token"** button
5. Click it
6. Copy the token

---

## 📋 What to Do With the Token

### **Add It to GitHub Secrets:**

1. Go to your GitHub repo: `https://github.com/ashish2784/SummerEaseAI`
2. Click **Settings** (top right)
3. In left sidebar: **Secrets and variables** → **Actions**
4. Click **"New repository secret"**
5. Add:
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: Paste the token you copied
6. Click **"Add secret"**

---

## 🎯 Complete GitHub Secrets Checklist

You need **5 secrets total** in GitHub:

### **Secrets You Add Manually:**

- [ ] `VITE_SUPABASE_URL` (from your .env.local)
- [ ] `VITE_SUPABASE_ANON_KEY` (from your .env.local)
- [ ] `VITE_GEMINI_API_KEY` (from your .env.local)
- [ ] `VITE_RAZORPAY_KEY_ID` (from your .env.local)
- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN` (from Azure Portal - see above)

### **Secret Added Automatically:**

- ✅ `GITHUB_TOKEN` (GitHub adds this automatically - you don't need to do anything)

---

## 🚨 Important Notes

### **The Token is Secret!**

- ⚠️ **Never share this token publicly**
- ⚠️ **Never commit it to Git**
- ⚠️ **Only add it to GitHub Secrets**
- This token allows deployments to your Azure resource

### **Token Format:**

The token looks like this:
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz...
```
(A long string of random characters, about 100+ characters)

### **If You Lose the Token:**

1. Go to Azure Portal → Your Static Web App
2. Click "Manage deployment token"
3. Click "Reset deployment token"
4. Copy the new token
5. Update it in GitHub Secrets

---

## 🔄 What Happens After Adding the Token

Once you add `AZURE_STATIC_WEB_APPS_API_TOKEN` to GitHub Secrets:

1. **Commit and push** any change to your repo:
   ```bash
   git add .
   git commit -m "Trigger deployment"
   git push origin main
   ```

2. **GitHub Actions will run** automatically:
   - Go to: `https://github.com/ashish2784/SummerEaseAI/actions`
   - You'll see "Azure Static Web Apps CI/CD" workflow running
   - Wait 2-5 minutes for it to complete

3. **Your app will be deployed**:
   - Go to Azure Portal → Your Static Web App
   - Click "Browse" to see your live app!
   - URL will be: `https://summerease-app.azurestaticapps.net`

---

## ✅ Quick Verification

To verify everything is set up correctly:

### **Check GitHub Secrets:**

Go to: `https://github.com/ashish2784/SummerEaseAI/settings/secrets/actions`

You should see:
```
✅ AZURE_STATIC_WEB_APPS_API_TOKEN
✅ VITE_GEMINI_API_KEY
✅ VITE_RAZORPAY_KEY_ID
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_SUPABASE_URL
```

### **Check Workflow File:**

The file `.github/workflows/azure-static-web-apps.yml` should exist in your repo.

### **Trigger Deployment:**

```bash
# Make any small change
git commit --allow-empty -m "Trigger Azure deployment"
git push origin main
```

Then watch: `https://github.com/ashish2784/SummerEaseAI/actions`

---

## 🆘 Troubleshooting

### **"I created Azure resource but don't see the token"**

- Click "Manage deployment token" in the top menu of your Static Web App
- Or go to Settings → Configuration → Manage deployment token

### **"I can't create Azure Static Web App - region error"**

- The region dropdown shows ONLY allowed regions
- Pick **any region** from the dropdown
- If dropdown is empty, your subscription might have restrictions
- Try: Central US, East US, West US 2, West Europe

### **"Workflow runs but fails"**

- Check if all 5 GitHub Secrets are added correctly
- Check GitHub Actions logs for specific error
- Verify the token is correct (try resetting it in Azure)

---

## 🎉 Summary

**To get the token:**
1. ✅ Create Azure Static Web App in Azure Portal
2. ✅ After creation, click "Manage deployment token"
3. ✅ Copy the token
4. ✅ Add it to GitHub Secrets as `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. ✅ Push code to trigger deployment

**You can't get the token without creating the Azure resource first!**

---

**Created**: February 12, 2026  
**Last Updated**: February 12, 2026
