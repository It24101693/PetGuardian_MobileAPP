# Remote Testing Guide for PetGuardian

Your team members can test the app remotely using these methods:

## Option 1: EAS Update (Recommended - Most Reliable)

### Setup (One-time):
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
```

### Build and Share:
```bash
# Build for Android (takes ~15-20 min)
eas build --platform android --profile preview

# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

After build completes, EAS gives you a download link. Share this link with your team - they can install the APK (Android) or use TestFlight (iOS).

### Update the app without rebuilding:
```bash
eas update --branch preview
```

---

## Option 2: Use Cloudflare Tunnel (Free Alternative to ngrok)

### Install Cloudflare Tunnel:
```bash
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
# Or use package manager:
# Windows (with Chocolatey):
choco install cloudflared

# Or download directly:
# https://github.com/cloudflare/cloudflared/releases
```

### Start Backend with Cloudflare Tunnel:
```bash
# Terminal 1: Start your backend
cd node-backend
npm start

# Terminal 2: Create tunnel
cloudflared tunnel --url http://localhost:8080
```

This gives you a public URL like: `https://random-name.trycloudflare.com`

### Update mobile .env:
```env
API_BASE_URL=https://your-tunnel-url.trycloudflare.com/api
AI_SERVICE_URL=https://dulanajaya-pet-guardian-ai.hf.space
HF_TOKEN=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
PUBLIC_WEB_URL=https://your-tunnel-url.trycloudflare.com
```

### Start Expo:
```bash
cd mobile
npx expo start -c
```

Team members scan the QR code with Expo Go app.

---

## Option 3: Use Localtunnel (Simplest)

### Install:
```bash
npm install -g localtunnel
```

### Start Backend with Localtunnel:
```bash
# Terminal 1: Start backend
cd node-backend
npm start

# Terminal 2: Create tunnel
lt --port 8080 --subdomain petguardian-yourname
```

You'll get: `https://petguardian-yourname.loca.lt`

### Update mobile .env and restart Expo (same as Option 2)

---

## Option 4: Deploy Backend to Free Hosting

### Deploy to Railway (Free tier):

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your PetGuardian repo
5. Railway auto-detects and deploys your backend
6. Get your public URL: `https://yourapp.up.railway.app`

### Update mobile .env:
```env
API_BASE_URL=https://yourapp.up.railway.app/api
```

Now your backend is always accessible - no tunnel needed!

---

## Option 5: Use Your Existing Railway Deployment

You already have this in your .env:
```env
API_BASE_URL=https://petguardianmobileapp-production.up.railway.app/api
```

**This should work!** Just make sure:

1. Your Railway backend is running
2. Your local changes are pushed to Railway
3. Team members use Expo Go and scan QR code

### To update Railway:
```bash
cd node-backend
git add .
git commit -m "Update AI controller"
git push
```

Railway auto-deploys on push.

---

## Quick Test for Team Members:

### For Android:
1. Install "Expo Go" from Play Store
2. Open Expo Go
3. Scan QR code from your terminal
4. App loads and connects to Railway backend

### For iOS:
1. Install "Expo Go" from App Store
2. Open Camera app
3. Scan QR code from your terminal
4. Tap notification to open in Expo Go

---

## Troubleshooting:

### "Network response timed out"
- Backend is not accessible
- Check Railway deployment status
- Verify .env URLs are correct

### "Unable to resolve host"
- DNS issue
- Try restarting Expo: `npx expo start -c`
- Clear Expo cache

### "Tunnel connection failed"
- ngrok is down (common issue)
- Use Option 2 (Cloudflare) or Option 3 (Localtunnel) instead
- Or use Option 5 (Railway - no tunnel needed)

---

## Recommended Approach:

**For quick testing:** Use Option 5 (Railway) - it's already set up!

**For development:** Use Option 2 (Cloudflare Tunnel) - most reliable free tunnel

**For production testing:** Use Option 1 (EAS Build) - native app experience
