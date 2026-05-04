# 🎯 START HERE - Team Testing Setup

## 🚀 Quick Start (2 minutes)

### Step 1: Check Your Setup
```bash
check-setup.bat
```

### Step 2: Start the App
```bash
cd mobile
npx expo start -c
```

### Step 3: Share QR Code
- Your team members scan the QR code with **Expo Go** app
- Backend is already on Railway (no tunnel needed!)

**That's it!** ✅

---

## 📚 Detailed Guides

- **TEAM_TESTING_QUICKSTART.md** - Quick reference for daily use
- **REMOTE_TESTING_GUIDE.md** - All testing methods explained
- **check-setup.bat** - Verify your setup is correct

---

## 🔧 Helper Scripts

### For Windows:

**Check everything is working:**
```bash
check-setup.bat
```

**Start with LocalTunnel (if Railway is down):**
```bash
start-with-localtunnel.bat
```

**Start with Cloudflare Tunnel:**
```bash
start-with-tunnel.bat
```

---

## ❓ Common Issues

### "Tunnel connection failed"
**Solution:** Don't use `--tunnel` flag. Use Railway instead:
```bash
cd mobile
npx expo start -c
```

### "Network request failed"
**Solution:** Check if Railway backend is running at:
https://petguardianmobileapp-production.up.railway.app/api

### "Cannot connect"
**Solution:** Make sure mobile/.env has correct URLs:
```env
API_BASE_URL=https://petguardianmobileapp-production.up.railway.app/api
PUBLIC_WEB_URL=https://petguardianmobileapp-production.up.railway.app
```

---

## 📱 For Team Members

### Install Expo Go:
- **Android:** Play Store → Search "Expo Go"
- **iOS:** App Store → Search "Expo Go"

### Test the App:
1. Open Expo Go app
2. Scan QR code from terminal
3. App loads automatically
4. Test features!

---

## 🎓 What's Configured

✅ Backend on Railway (always accessible)  
✅ AI Service on HuggingFace (always accessible)  
✅ Mobile app with Expo Go (scan QR code)  
✅ Looper AI Assistant (working)  
✅ Disease Detection (working)  
✅ Breed Classification (working)  

---

## 💡 Pro Tip

**Best practice for team testing:**

1. Keep Railway backend running (it's free tier)
2. Only start Expo locally when testing
3. Team members just scan QR code
4. No tunnel needed!

**If you need a tunnel:**
- Use LocalTunnel (easiest): `start-with-localtunnel.bat`
- Or Cloudflare Tunnel (most reliable): `start-with-tunnel.bat`

---

## 🆘 Need Help?

1. Run `check-setup.bat` to diagnose issues
2. Check TEAM_TESTING_QUICKSTART.md for solutions
3. Verify Railway is running at https://railway.app

---

## 🎉 You're Ready!

Your app is configured to work with Railway backend. Just run:

```bash
cd mobile
npx expo start -c
```

Share the QR code and your team can test! 🚀
