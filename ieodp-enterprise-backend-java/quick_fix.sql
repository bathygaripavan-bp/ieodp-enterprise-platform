-- Quick Fix for Foreign Key Constraint Error
-- Run this in MySQL to fix the refresh_tokens foreign key constraint

USE ieodp_db1;

-- Step 1: Drop the incorrect foreign key constraint
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'ieodp_db1' 
      AND TABLE_NAME = 'refresh_tokens' 
      AND REFERENCED_TABLE_NAME = 'user'  -- Wrong table name
    LIMIT 1
);

SET @sql = CONCAT('ALTER TABLE refresh_tokens DROP FOREIGN KEY ', @constraint_name);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Create the correct foreign key constraint
ALTER TABLE refresh_tokens 
ADD CONSTRAINT fk_refresh_token_user 
FOREIGN KEY (user_id) 
REFERENCES users (id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 3: Verify it's fixed
SELECT 
    'Constraint fixed successfully!' AS Status,
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
