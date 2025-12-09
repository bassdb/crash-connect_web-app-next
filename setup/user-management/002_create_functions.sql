-- =====================================================
-- User Management Setup: Functions
-- =====================================================
-- This migration creates the necessary functions for user management
-- including profile creation triggers and permission checking

-- Function to check if current user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(requested_permission app_permission)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
declare
  bind_permissions int;
  user_role public.app_role;
begin
  -- Fetch user role once and store it to reduce number of calls
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = user_role;

  return bind_permissions > 0;
end;
$$;

-- Function to handle new user creation (creates profile entry and assigns consumer role)
-- CREATE OR REPLACE FUNCTION handle_new_user()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- begin
--   -- Create profile entry
--   insert into public.profiles (id, full_name, avatar_url, email)
--   values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  
--   -- Assign default consumer role
--   insert into public.user_roles (user_id, role)
--   values (new.id, 'consumer');
  
--   return new;
-- end;
-- $$;

-- Function to check if current user can delete target user
CREATE OR REPLACE FUNCTION can_delete_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  target_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();

  -- Get target user's role
  SELECT role INTO target_user_role
  FROM public.user_roles
  WHERE user_id = target_user_id;

  -- Check if current user has 'users.delete' permission
  IF NOT has_permission('users.delete') THEN
    RETURN false;
  END IF;

  -- Prevent deletion of superadmin users
  IF target_user_role IN ('superadmin') THEN
    RETURN false;
  END IF;

  -- If all checks pass, user can be deleted
  RETURN true;
END;
$$;

-- Add function comments
COMMENT ON FUNCTION has_permission(app_permission) IS 'Check if current user has specific permission';
COMMENT ON FUNCTION handle_new_user() IS 'Trigger function to create profile and assign consumer role on user signup';
COMMENT ON FUNCTION can_delete_user(uuid) IS 'Check if current user can delete target user';
