# QR Code Feature - Setup Guide

## Quick Start

### 1. Database Migration

Run this SQL to add the address field to users table (if not already present):

```sql
ALTER TABLE users ADD COLUMN address VARCHAR(255);
```

The `qr_code` column in the `pets` table should already exist from the schema.

### 2. Backend Setup

No additional setup needed! The backend changes are already in place:
- QR codes are automatically generated when creating new pets
- Public API endpoint is available at `/api/public/pets/qr/{qrCode}`

### 3. Frontend Setup

The required npm packages have been installed:
```bash
npm install qrcode @types/qrcode
```

### 4. Test the Feature

#### Create a New Pet:
1. Start the backend: `mvn spring-boot:run` (from backend directory)
2. Start the frontend: `npm run dev` (from frontend directory)
3. Login and go to Owner Dashboard
4. Click "Add New Pet"
5. Fill in all required fields including gender
6. Submit the form
7. A unique QR code will be generated automatically

#### View QR Code:
1. Click on the pet card to open Pet Passport
2. Click the "QR Code" button
3. The QR code will be displayed
4. You can download it as a PNG image

#### Test QR Code Scanning:
1. Download the QR code image
2. Scan it with your phone camera or QR scanner app
3. It will open: `http://localhost:5173/pet-info/{qrCode}`
4. You should see the public pet information page

## Important Notes

### Owner Information
Make sure pet owners have their contact information filled in:
- Full Name (or username will be used)
- Phone Number
- Address (newly added field)

You can update this in the user profile or directly in the database:

```sql
UPDATE users 
SET phone_number = '+1234567890', 
    address = '123 Main St, City, State' 
WHERE id = 1;
```

### QR Code Generation
- QR codes are generated ONCE when a pet is created
- They are permanent and don't change
- Format: 16-character alphanumeric string (UUID-based)
- Stored in the `qr_code` column of the `pets` table

### Public Access
- The public pet info page (`/pet-info/{qrCode}`) works WITHOUT authentication
- Anyone with the QR code can view the pet information
- This is intentional for lost pet scenarios

## Troubleshooting

### QR Code Not Generating
**Problem:** QR code shows "Generating QR code..." forever

**Solutions:**
1. Check if the pet has a `qrCode` in the database:
   ```sql
   SELECT id, name, qr_code FROM pets WHERE id = YOUR_PET_ID;
   ```

2. If `qr_code` is NULL, the pet was created before this feature. Update manually:
   ```sql
   UPDATE pets SET qr_code = 'abc123def456' WHERE id = YOUR_PET_ID;
   ```
   (Use a unique random string)

3. Check browser console for errors

### Public Page Not Loading
**Problem:** Scanning QR code shows "Pet Not Found"

**Solutions:**
1. Verify the backend is running on port 8080
2. Check the QR code value in the database
3. Test the API directly:
   ```
   http://localhost:8080/api/public/pets/qr/YOUR_QR_CODE
   ```

4. Check CORS settings in `PublicPetController.java`

### Owner Information Missing
**Problem:** Owner contact shows "Not provided"

**Solutions:**
1. Update user information in database:
   ```sql
   UPDATE users 
   SET full_name = 'John Doe',
       phone_number = '+1234567890',
       address = '123 Main St'
   WHERE id = OWNER_ID;
   ```

2. Or add a user profile edit page in the frontend

## Production Deployment

### Environment Variables
Update the frontend API URL for production:

In `PublicPetInfo.tsx` and `PetPassport.tsx`, replace:
```typescript
const response = await fetch(`http://localhost:8080/api/public/pets/qr/${qrCode}`);
```

With:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const response = await fetch(`${API_URL}/api/public/pets/qr/${qrCode}`);
```

### QR Code URL
Update the QR code URL to use your production domain:

In `PetPassport.tsx`:
```typescript
const publicUrl = `${window.location.origin}/pet-info/${petData.qrCode}`;
```

This automatically uses the current domain, so it works in both development and production.

### Security Considerations
1. Rate limit the public API endpoint to prevent abuse
2. Consider adding analytics to track QR code scans
3. Add option for owners to temporarily disable their QR code
4. Consider adding a "report abuse" feature

## Next Steps

### Recommended Enhancements:
1. Add user profile page to edit contact information
2. Add QR code scan tracking/analytics
3. Send notification to owner when QR is scanned
4. Add emergency medical information to public page
5. Allow owners to add a reward message for lost pets
6. Add multi-language support for public page
7. Create printable QR code tags with pet name

### Testing Checklist:
- [ ] Create new pet and verify QR code is generated
- [ ] View QR code in pet passport
- [ ] Download QR code as PNG
- [ ] Scan QR code with phone
- [ ] Verify public page displays correctly
- [ ] Test with missing owner information
- [ ] Test with missing blood type
- [ ] Test on mobile devices
- [ ] Test QR code download on different browsers
- [ ] Test share functionality (if browser supports it)

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend logs
3. Verify database schema is up to date
4. Ensure all npm packages are installed
5. Clear browser cache and restart dev server
