# Fix Emergency Details - Database Migration

## Problem
Emergency details (Emergency Contact, Known Allergies, Health Notes) entered during pet registration are not being saved or displayed after restart.

## Root Cause
The database table `pets` was missing the columns for emergency information.

## Solution

### Step 1: Run Database Migration

Execute the SQL migration script to add the missing columns:

```bash
# Connect to your MySQL database and run:
mysql -u root -p petguardian < database/migrations/add_emergency_fields_to_pets.sql
```

Or manually run these SQL commands in your database:

```sql
-- Add allergies column
ALTER TABLE pets 
ADD COLUMN IF NOT EXISTS allergies VARCHAR(1000);

-- Add emergency_notes column
ALTER TABLE pets 
ADD COLUMN IF NOT EXISTS emergency_notes TEXT;

-- Add emergency_contact column
ALTER TABLE pets 
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(150);
```

### Step 2: Restart Backend

After running the migration, restart your Spring Boot backend:

```bash
cd backend
mvn spring-boot:run
```

### Step 3: Test

1. Register a new pet with emergency details
2. Check that the details appear in the Pet Passport
3. Edit the emergency details
4. Restart the system and verify the details persist

## What Was Fixed

### Backend (PetService.java)
- ✅ Added emergency fields to `updatePet()` method
- ✅ Added emergency fields copy to Health Passport during `createPet()`

### Frontend (PetContext.tsx)
- ✅ Updated `updatePet()` to send all emergency fields to backend
- ✅ Added dateOfBirth, bloodType, imageUrl to update payload

### Database
- ✅ Created migration script to add missing columns

## Verification

After migration, verify the columns exist:

```sql
DESCRIBE pets;
```

You should see:
- `allergies` VARCHAR(1000)
- `emergency_notes` TEXT
- `emergency_contact` VARCHAR(150)
