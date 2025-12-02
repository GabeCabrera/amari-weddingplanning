-- Add plannerName column to tenants table
ALTER TABLE tenants ADD COLUMN planner_name TEXT DEFAULT 'Planner';
