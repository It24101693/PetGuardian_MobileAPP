# Testing QR Code on Mobile Phone

## Quick Setup Guide

### Step 1: Find Your Computer's IP Address

**On Windows (Command Prompt or PowerShell):**
```bash
ipconfig
```
Look for "IPv4 Address" - it will be something like `192.168.1.100` or `10.0.0.5`

**On Mac/Linux (Terminal):**
```bash
ifconfig
# or
ip addr show
```
Look for `inet` address (not 127.0.0.1)

Example: `192.168.1.100`

### Step 2: Update Vite Configuration

I've already updated `frontend/vite.config.js` to allow network access:
```javascript
server: {
  host: '0.0.0.0', // Allow access from local network
  port: 5173,
}
```

### Step 3: Restart Frontend Server

1. Stop the current frontend server (Ctrl+C)
2. Start it again:
   ```bash
   cd frontend
   npm run dev
   ```

3. You should see output like:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.100:5173/
   ```

### Step 4: Update Backend CORS (if needed)

The backend needs to allow requests from your IP address. Check if `WebConfig.java` allows all origins or add your IP:

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOrigins("*") // This should work
            .allowedMethods("*")
            .allowedHeaders("*");
}
```

### Step 5: Connect Your Phone

1. Make sure your phone is on the **same WiFi network** as your computer
2. Open your phone's browser
3. Go to: `http://YOUR_IP:5173` (e.g., `http://192.168.1.100:5173`)
4. You should see the PetGuardian website

### Step 6: Test QR Code

1. On your computer, open a pet's passport
2. Click "QR Code" button
3. Download the QR code image
4. Scan it with your phone's camera
5. It should open the public pet info page!

## Troubleshooting

### Problem: Can't access from phone

**Solution 1: Check Firewall**
- Windows: Allow port 5173 through Windows Firewall
- Mac: System Preferences → Security & Privacy → Firewall → Firewall Options → Allow incoming connections

**Solution 2: Check WiFi**
- Make sure both devices are on the same network
- Some public/guest WiFi networks block device-to-device communication

**Solution 3: Try different port**
If 5173 is blocked, change the port in `vite.config.js`:
```javascript
server: {
  host: '0.0.0.0',
  port: 3000, // Try a different port
}
```

### Problem: QR code still points to localhost

The QR code URL is generated dynamically using `window.location.origin`, so it should automatically use your IP address when accessed from the network.

To verify:
1. Access the site from your phone: `http://YOUR_IP:5173`
2. Open a pet passport
3. Click QR Code
4. The QR code should now point to `http://YOUR_IP:5173/pet-info/...`

### Problem: Backend not accessible

If the backend is also on localhost:8080, you need to:

1. Update Spring Boot to listen on all interfaces:
   In `application.properties`:
   ```properties
   server.address=0.0.0.0
   ```

2. Or access backend via IP:
   Update API calls in frontend to use your IP:
   ```javascript
   const API_URL = 'http://192.168.1.100:8080';
   ```

## Alternative: Use ngrok (For Remote Testing)

If you want to test from anywhere (not just local network):

1. Install ngrok: https://ngrok.com/download

2. Start ngrok for frontend:
   ```bash
   ngrok http 5173
   ```

3. Start ngrok for backend:
   ```bash
   ngrok http 8080
   ```

4. Update API URLs in frontend to use ngrok URLs

5. QR codes will work from anywhere!

## Production Deployment

For production, deploy to a hosting service:

**Frontend Options:**
- Vercel (recommended for React)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Backend Options:**
- Heroku
- AWS EC2/ECS
- Google Cloud Run
- DigitalOcean

Once deployed, QR codes will automatically use your production domain!

## Quick Test Commands

**Find your IP (Windows):**
```bash
ipconfig | findstr IPv4
```

**Find your IP (Mac/Linux):**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Test if port is accessible:**
From your phone's browser, try:
```
http://YOUR_IP:5173
```

If you see the PetGuardian website, you're good to go!

## Current Setup

After the changes I made:
- ✅ Frontend configured to accept network connections
- ✅ QR codes use dynamic URLs (will work with your IP)
- ✅ Backend has CORS enabled for all origins

Just restart your frontend server and access it from your phone using your computer's IP address!
