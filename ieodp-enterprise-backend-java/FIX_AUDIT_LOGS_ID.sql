-- Fix audit_logs table: Enable AUTO_INCREMENT on id column
-- This fixes the error: "Field 'id' doesn't have a default value"

USE ieodp_db1;

-- Check current structure
DESCRIBE audit_logs;

-- Modify the id column to be AUTO_INCREMENT
ALTER TABLE audit_logs 
MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

-- Verify the change
DESCRIBE audit_logs;

-- Expected result: id column should show "auto_increment" in Extra column
