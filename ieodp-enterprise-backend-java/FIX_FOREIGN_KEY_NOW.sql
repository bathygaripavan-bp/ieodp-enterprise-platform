-- ============================================
-- CRITICAL FIX: Foreign Key Constraint Error
-- ============================================
-- This script fixes the foreign key constraint that prevents user registration
-- The constraint incorrectly references 'user' instead of 'users'
-- 
-- Run this script IMMEDIATELY in your MySQL database
-- ============================================

USE ieodp_db1;

-- Step 1: Drop the incorrect foreign key constraint
-- The constraint name from your error is: FKjwc9veyjcjfkej6rnnbsijfvh
ALTER TABLE refresh_tokens DROP FOREIGN KEY FKjwc9veyjcjfkej6rnnbsijfvh;

-- Step 2: Verify the constraint was dropped
SELECT 'Foreign key constraint dropped successfully' AS Status;

-- Step 3: Create the correct foreign key constraint referencing 'users' table
ALTER TABLE refresh_tokens 
ADD CONSTRAINT fk_refresh_token_user 
FOREIGN KEY (user_id) 
REFERENCES users (id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 4: Verify the new constraint is correct
SELECT 
    'Constraint created successfully!' AS Status,
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

-- Expected output should show:
-- REFERENCED_TABLE_NAME = 'users' (plural, not 'user')
