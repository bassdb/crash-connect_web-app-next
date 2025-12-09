-- =====================================================
-- User Management Setup: Enums
-- =====================================================
-- This migration creates the necessary enums for the user management system
-- including application roles and permissions for RBAC (Role-Based Access Control)

-- Create app_role enum for user roles
CREATE TYPE app_role AS ENUM (
  'superadmin',
  'owner', 
  'consumer',
  'creator',
  'admin',
  'team_admin'
);

-- Create app_permission enum for granular permissions
CREATE TYPE app_permission AS ENUM (
  'consumers.manage',
  'creators.manage',
  'owner.manage',
  'user_profiles.read',
  'users.delete',
  'users.update',
  'users.create',
  'user_roles.update',
  'user_roles.view',
  'credits.manage',
  'example_teams.manage',
  'team_assets.manage',
  'team_categories.allowCRUD',
  'team_categories.create',
  'teams.allowCRUD'
);

-- Add comments for documentation
COMMENT ON TYPE app_role IS 'Application roles for user authorization';
COMMENT ON TYPE app_permission IS 'Granular permissions for role-based access control';
