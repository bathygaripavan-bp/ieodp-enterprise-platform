-- Fix workflow_items foreign key constraints
-- Problem: Foreign keys reference 'user' table instead of 'users' table
-- This fixes the error: "Cannot add or update a child row: a foreign key constraint fails"

USE ieodp_db1;

-- Check current foreign keys
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'ieodp_db1' 
    AND TABLE_NAME = 'workflow_items'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Drop the incorrect foreign key constraint for assigned_to_id
ALTER TABLE workflow_items 
DROP FOREIGN KEY FKi9o2bejr35tcehv7pcdytyu27;

-- Drop the incorrect foreign key constraint for created_by_id (if it exists)
-- First, find the constraint name
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'ieodp_db1' 
    AND TABLE_NAME = 'workflow_items' 
    AND COLUMN_NAME = 'created_by_id'
    AND REFERENCED_TABLE_NAME = 'user'
    LIMIT 1
);

-- Drop if found
SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE workflow_items DROP FOREIGN KEY ', @constraint_name), 
    'SELECT "No constraint found for created_by_id"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Recreate foreign key for assigned_to_id pointing to users table
ALTER TABLE workflow_items
ADD CONSTRAINT fk_workflow_assigned_to_user
FOREIGN KEY (assigned_to_id) 
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Recreate foreign key for created_by_id pointing to users table
ALTER TABLE workflow_items
ADD CONSTRAINT fk_workflow_created_by_user
FOREIGN KEY (created_by_id) 
REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Verify the fix
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'ieodp_db1' 
    AND TABLE_NAME = 'workflow_items'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Expected result: Both foreign keys should reference 'users' table, not 'user'
