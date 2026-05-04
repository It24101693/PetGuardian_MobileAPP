# 🚀 Quick Start - Team Testing Guide

## ✅ EASIEST METHOD: Use Railway (Already Configured!)

Your `.env` already has Railway configured:
```
API_BASE_URL=https://petguardianmobileapp-production.up.railway.app/api
```

### Steps:
1. **Make sure Railway is running** (check https://railway.app dashboard)
2. **Push your latest changes to Railway:**
   ```bash
   cd node-backend
   git add .
   git commit -m "Update AI controller"
   git push
   ```
3. **Start Expo locally:**
   ```bash
   cd mobile
   npx expo start -c
   ```
4. **Share QR code** with team members
5. Team members scan with **Expo Go app**

**That's it!** No tunnel needed. Backend is on Railway, frontend runs on their phones.

---

## 🔧 ALTERNATIVE: Use LocalTunnel (If Railway is down)

### One-time setup:
```bash
npm install -g localtunnel
```

### Every time you start:

**Option A: Use the script (Windows)**
```bash
start-with-localtunnel.bat
```

**Option B: Manual steps**

1. **Terminal 1 - Start Backend:**
   ```bash
   cd node-backend
   npm start
   ```

2. **Terminal 2 - Start Tunnel:**
   ```bash
   lt --port 8080 --subdomain petguardian-yourname
   ```
   
   You'll get: `https://petguardian-yourname.loca.lt`

3. **Update mobile/.env:**
   ```env
   API_BASE_URL=https://petguardian-yourname.loca.lt/api
   PUBLIC_WEB_URL=https://petguardian-yourname.loca.lt
   ```

4. **Terminal 3 - Start Expo:**
   ```bash
   cd mobile
   npx expo start -c
   ```

5. **Share the QR code** with your team

---

## 📱 For Team Members

### Android:
1. Install **Expo Go** from Play Store
2. Open Expo Go app
3. Scan the QR code
4. App loads automatically

### iOS:
1. Install **Expo Go** from App Store
2. Open Camera app
3. Scan the QR code
4. Tap notification to open in Expo Go

---

## 🐛 Troubleshooting

### "Network request failed"
- Backend is not accessible
- Check if Railway/tunnel is running
- Verify .env URLs match tunnel URL

### "Tunnel connection failed" (ngrok error)
- Don't use `--tunnel` flag
- Use Railway or LocalTunnel instead
- Command: `npx expo start -c` (no --tunnel)

### "Cannot connect to Metro"
- Clear Expo cache: `npx expo start -c`
- Restart Expo Go app
- Check firewall settings

### First time using LocalTunnel shows "Forbidden"
- Open the tunnel URL in browser first
- Click "Click to Continue"
- Then the app will work

---

## 💡 Pro Tips

1. **Use Railway for stable testing** - no need to keep your computer on
2. **Use LocalTunnel for development** - quick setup, free
3. **Share the same tunnel URL** - team doesn't need to update QR code
4. **Keep tunnel running** - don't close the terminal window

---

## 🎯 Recommended Workflow

**For daily development:**
```bash
# Use Railway - already configured!
cd mobile
npx expo start -c
# Share QR code with team
```

**If Railway is down:**
```bash
# Use LocalTunnel
start-with-localtunnel.bat
# Or follow manual steps above
```

**For production testing:**
```bash
# Build native app with EAS
cd mobile
eas build --platform android --profile preview
# Share download link with team
```
