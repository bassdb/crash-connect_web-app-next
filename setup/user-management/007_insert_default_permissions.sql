-- =====================================================
-- User Management Setup: Default Role Permissions
-- =====================================================
-- This migration inserts the default permissions for each role
-- defining the RBAC permission matrix

-- Insert permissions for superadmin role (all permissions)
INSERT INTO role_permissions (role, permission) VALUES
  ('superadmin', 'consumers.manage'),
  ('superadmin', 'creators.manage'),
  ('superadmin', 'owner.manage'),
  ('superadmin', 'user_profiles.read'),
  ('superadmin', 'users.delete'),
  ('superadmin', 'users.update'),
  ('superadmin', 'users.create'),
  ('superadmin', 'user_roles.update'),
  ('superadmin', 'user_roles.view'),
  ('superadmin', 'credits.manage'),
  ('superadmin', 'example_teams.manage'),
  ('superadmin', 'team_assets.manage'),
  ('superadmin', 'team_categories.allowCRUD'),
  ('superadmin', 'team_categories.create'),
  ('superadmin', 'teams.allowCRUD');

-- Insert permissions for owner role
INSERT INTO role_permissions (role, permission) VALUES
  ('owner', 'consumers.manage'),
  ('owner', 'creators.manage'),
  ('owner', 'user_profiles.read'),
  ('owner', 'users.update'),
  ('owner', 'users.create'),
  ('owner', 'user_roles.update'),
  ('owner', 'user_roles.view'),
  ('owner', 'credits.manage'),
  ('owner', 'example_teams.manage'),
  ('owner', 'team_assets.manage'),
  ('owner', 'team_categories.allowCRUD'),
  ('owner', 'team_categories.create'),
  ('owner', 'teams.allowCRUD');

-- Insert permissions for admin role
INSERT INTO role_permissions (role, permission) VALUES
  ('admin', 'user_profiles.read'),
  ('admin', 'users.update'),
  ('admin', 'users.create'),
  ('admin', 'user_roles.view'),
  ('admin', 'credits.manage'),
  ('admin', 'team_assets.manage'),
  ('admin', 'team_categories.allowCRUD'),
  ('admin', 'teams.allowCRUD');

-- Insert permissions for team_admin role
INSERT INTO role_permissions (role, permission) VALUES
  ('team_admin', 'team_assets.manage'),
  ('team_admin', 'teams.allowCRUD');

-- Insert permissions for creator role
-- No specific permissions assigned to creator role

-- Insert permissions for consumer role (basic permissions)
-- No specific permissions assigned to consumer role
