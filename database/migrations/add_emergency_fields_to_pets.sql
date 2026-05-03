-- Add emergency information fields to pets table
-- Run this migration to add the missing columns

-- Add allergies column
ALTER TABLE pets 
ADD COLUMN allergies VARCHAR(1000);

-- Add emergency_notes column
ALTER TABLE pets 
ADD COLUMN emergency_notes TEXT;

-- Add emergency_contact column
ALTER TABLE pets 
ADD COLUMN emergency_contact VARCHAR(150);

-- Verify the columns were added
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'pets' 
AND COLUMN_NAME IN ('allergies', 'emergency_notes', 'emergency_contact');
