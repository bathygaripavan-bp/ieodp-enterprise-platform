-- Quick fix for workflow_items foreign key constraint error
-- Run this in MySQL to fix: "Cannot add or update a child row: a foreign key constraint fails"

USE ieodp_db1;

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE workflow_items DROP FOREIGN KEY FKi9o2bejr35tcehv7pcdytyu27;

-- Step 2: Recreate foreign key for assigned_to_id pointing to users table
ALTER TABLE workflow_items
ADD CONSTRAINT fk_workflow_assigned_to_user
FOREIGN KEY (assigned_to_id) 
REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 3: Check if created_by_id also has wrong constraint and fix it
-- (This will fail if constraint doesn't exist - that's OK)
ALTER TABLE workflow_items DROP FOREIGN KEY IF EXISTS fk_workflow_created_by_user;

ALTER TABLE workflow_items
ADD CONSTRAINT fk_workflow_created_by_user
FOREIGN KEY (created_by_id) 
REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Done! Now try creating a workflow again.
