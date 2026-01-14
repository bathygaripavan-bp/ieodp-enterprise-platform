-- ============================================
-- RUN THIS SQL SCRIPT TO FIX THE ERROR
-- ============================================
-- Copy and paste this entire script into MySQL Workbench or MySQL command line
-- This will fix the foreign key constraint error immediately
-- ============================================

USE ieodp_db1;

-- Drop the incorrect foreign key constraint
ALTER TABLE refresh_tokens DROP FOREIGN KEY FKjwc9veyjcjfkej6rnnbsijfvh;

-- Create the correct foreign key constraint
ALTER TABLE refresh_tokens 
ADD CONSTRAINT fk_refresh_token_user 
FOREIGN KEY (user_id) 
REFERENCES users (id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Done! Now try registering a user again.
