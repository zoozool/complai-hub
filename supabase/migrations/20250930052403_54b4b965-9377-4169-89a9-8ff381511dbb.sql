-- Function to automatically assign roles to test users based on email
CREATE OR REPLACE FUNCTION public.assign_test_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign role based on email address
  IF NEW.email = 'admin@test.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'main_administrator')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email = 'employee@test.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'employee')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email = 'technician@test.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'service_technician')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign roles when a profile is created
CREATE TRIGGER assign_test_roles_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_test_user_roles();