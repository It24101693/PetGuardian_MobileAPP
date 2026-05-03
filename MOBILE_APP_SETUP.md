# PetGuardian Mobile App – Full Stack Setup Guide

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native + Expo (SDK 51) |
| Backend API | Node.js + Express.js |
| Database | MongoDB Atlas |
| Image Storage | Cloudinary |
| Auth | JWT + bcrypt |
| AI Scanner | Python Flask (existing ai-service) |

---

## Directory Structure
```
PetGuardian-group5-AIML/
├── node-backend/   ← NEW Node.js + Express.js API
├── mobile/         ← NEW React Native (Expo) App
├── backend/        ← Original Spring Boot (unchanged)
└── frontend/       ← Original React Web (unchanged)
```

---

## Step 1 – MongoDB Atlas Setup

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free account
2. Create a new **free cluster** (M0 tier)
3. In **Database Access** → Add a user with username/password
4. In **Network Access** → Allow `0.0.0.0/0` (allow all IPs)
5. Click **Connect** → **Drivers** → Copy the connection string

---

## Step 2 – Cloudinary Setup

1. Go to [https://cloudinary.com](https://cloudinary.com) → Create free account
2. From dashboard, note your **Cloud Name**, **API Key**, **API Secret**

---

## Step 3 – Backend Setup

```bash
cd node-backend

# Install dependencies
npm install

# Create .env from template
copy .env.example .env
```

Edit `.env`:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/petguardian?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
AI_SERVICE_URL=http://localhost:5000
```

Start the backend:
```bash
npm run dev
# Server runs at http://localhost:5001
# Test: http://localhost:5001/api/health
```

---

## Step 4 – Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Create .env from template
copy .env.example .env
```

Edit `.env`:
```env
API_BASE_URL=http://localhost:5001/api
```

> ⚠️ **On Android Emulator**: use `http://10.0.2.2:5001/api` instead of localhost  
> ⚠️ **On Physical Device**: use your computer's LAN IP, e.g. `http://192.168.1.x:5001/api`

Start the mobile app:
```bash
npx expo start
```

Then press:
- `a` — Android emulator
- `i` — iOS simulator
- Scan QR with **Expo Go** app (physical device)

---

## Step 5 – Seed Sample Vets (Optional)

Run this in MongoDB Atlas dashboard (Data Explorer → petguardian → vets → INSERT):
```json
{
  "name": "Dr. Sarah Ahmed",
  "clinicName": "PetCare Clinic",
  "specialization": ["Small Animals", "General Practice"],
  "phone": "+1-555-0123",
  "city": "New York",
  "isEmergency": false,
  "isAvailable": true,
  "rating": 4.8,
  "location": { "type": "Point", "coordinates": [-73.935242, 40.730610] }
}
```

---

## API Endpoints Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login + get JWT |
| GET  | `/api/auth/me` | ✅ | Get current user |

### Pets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/pets` | ✅ | All pets (owner: own, admin: all) |
| GET | `/api/pets/owner/:id` | ✅ | Pets by owner |
| GET | `/api/pets/qr/:code` | ✅ | Pet by QR code |
| POST | `/api/pets` | ✅ | Create pet (multipart) |
| PUT | `/api/pets/:id` | ✅ | Update pet (multipart) |
| DELETE | `/api/pets/:id` | ✅ | Delete pet |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health/pet/:petId` | ✅ | Get full health passport |
| PUT | `/api/health/:id` | ✅ | Update passport fields |
| POST | `/api/health/:id/vaccinations` | ✅ | Add vaccination |
| POST | `/api/health/:id/records` | ✅ | Add medical record |
| POST | `/api/health/:id/allergies` | ✅ | Add allergy |

### Vets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/vets` | Public | All vets |
| GET | `/api/vets/emergency` | Public | Emergency vets |
| GET | `/api/vets/nearby?lat=&lng=&radius=` | Public | Nearby vets |
| POST | `/api/vets` | Admin | Add vet |

### Community
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/community` | ✅ | All posts (paginated) |
| POST | `/api/community` | ✅ | Create post |
| POST | `/api/community/:id/like` | ✅ | Like/unlike |
| POST | `/api/community/:id/comment` | ✅ | Add comment |

### Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/appointments` | ✅ | My appointments (role-filtered) |
| POST | `/api/appointments` | ✅ | Book appointment |
| PUT | `/api/appointments/:id` | ✅ | Update (status, cancel, etc.) |

### AI Scans
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/scans/pet/:petId` | ✅ | Scan history for pet |
| POST | `/api/scans` | ✅ | Upload + AI scan (multipart) |

---

## Group Member Responsibility

| Member | Module | Backend Files | Mobile Screens |
|--------|--------|--------------|----------------|
| **1 – Auth** | Authentication | `authController.js`, `routes/auth.js`, `models/User.js` | `login.tsx`, `register.tsx`, `AuthContext.tsx` |
| **2 – Pets** | Pet Management | `petController.js`, `routes/pets.js`, `models/Pet.js` | `dashboard.tsx`, `add-pet.tsx`, `PetCard.tsx` |
| **3 – Health** | Health Passport | `healthController.js`, `routes/health.js`, `models/HealthPassport.js`, `Vaccination.js`, `MedicalRecord.js` | `pet/[id].tsx`, `VaccinationCard.tsx` |
| **4 – Vets & Appts** | Appointments | `vetController.js`, `appointmentController.js`, `models/Vet.js`, `Appointment.js` | `vets.tsx`, `appointments.tsx`, `AppointmentCard.tsx` |
| **5 – Community** | Social Feed | `communityController.js`, `models/CommunityPost.js` | `community.tsx`, `CommunityPostCard.tsx` |
| **6 – Admin & AI** | Admin + Scanner | `userController.js`, `scanController.js`, `models/SymptomScan.js` | `scan.tsx`, `admin/dashboard.tsx` |

---

## Deployment (Render / Railway)

### Backend on Render
1. Push code to GitHub
2. Create new **Web Service** on Render
3. Set **Root Directory** to `node-backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add all `.env` variables in Render's **Environment** tab
7. Copy the deployed URL (e.g. `https://petguardian-api.onrender.com`)

### Mobile — update API URL
In `mobile/.env`:
```env
API_BASE_URL=https://petguardian-api.onrender.com/api
```

Rebuild the Expo app with the production URL.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` on emulator | Change `localhost` → `10.0.2.2` for Android |
| MongoDB connection timeout | Check Atlas Network Access whitelist |
| Cloudinary upload fails | Verify API key/secret in `.env` |
| AI scanner times out | Check Python service is running on port 5000 |
| JWT expired | Token expires in 7d — re-login to get fresh token |
