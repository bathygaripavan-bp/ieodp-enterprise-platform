-- Fix Foreign Key Constraint Issue
-- This script fixes the foreign key constraint that references the wrong table name
-- Run this script in your MySQL database to fix the foreign key constraint

USE ieodp_db1;

-- Step 1: Find the incorrect foreign key constraint name
-- The constraint name from the error is: FKjwc9veyjcjfkej6rnnbsijfvh
-- But to be safe, let's find all foreign keys on refresh_tokens table first

-- List all foreign keys on refresh_tokens table:
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'ieodp_db1'
    AND TABLE_NAME = 'refresh_tokens'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Step 2: Drop all incorrect foreign key constraints (replace with actual constraint name if different)
-- If you see a constraint referencing 'user' instead of 'users', drop it:
ALTER TABLE refresh_tokens DROP FOREIGN KEY IF EXISTS FKjwc9veyjcjfkej6rnnbsijfvh;

-- Alternative: Drop all foreign keys and recreate (if above doesn't work)
-- First, get all foreign key names:
-- SELECT CONSTRAINT_NAME 
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = 'ieodp_db1' 
--   AND TABLE_NAME = 'refresh_tokens' 
--   AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Step 3: Create the correct foreign key constraint referencing 'users' table
ALTER TABLE refresh_tokens 
ADD CONSTRAINT fk_refresh_token_user 
FOREIGN KEY (user_id) 
REFERENCES users (id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 4: Verify the constraint was created correctly
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'ieodp_db1'
    AND TABLE_NAME = 'refresh_tokens'
    AND REFERENCED_TABLE_NAME = 'users';
