-- =====================================================
-- User Management Setup: Custom Access Token Hook
-- =====================================================
-- This migration creates a custom access token hook function that
-- enriches JWT tokens with user role information from the user_roles table

-- Function to add user role and profile data to JWT access token claims
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  declare
    claims jsonb;
    user_role text;
    user_avatar_url text;
    user_full_name text;
    user_username text;
  begin
    -- Fetch the user role from user_roles table
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;

    -- Fetch profile data from profiles table
    select avatar_url, full_name, username 
    into user_avatar_url, user_full_name, user_username
    from public.profiles 
    where id = (event->>'user_id')::uuid;

    claims := event->'claims';

    -- Set user role claim (with fallback to 'consumer')
    if user_role is not null then
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', to_jsonb('consumer'));
    end if;

    -- Set profile claims (only if values exist)
    if user_avatar_url is not null then
      claims := jsonb_set(claims, '{avatar_url}', to_jsonb(user_avatar_url));
    end if;

    if user_full_name is not null then
      claims := jsonb_set(claims, '{full_name}', to_jsonb(user_full_name));
    end if;

    if user_username is not null then
      claims := jsonb_set(claims, '{username}', to_jsonb(user_username));
    end if;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified event
    return event;
  end;
$$;

-- Add function comment
COMMENT ON FUNCTION custom_access_token_hook(jsonb) IS 'Custom hook to add user role and profile data (avatar_url, full_name, username) to JWT access token claims';

-- Grant necessary permissions
-- Note: This function will be called by Supabase Auth system
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO postgres;
