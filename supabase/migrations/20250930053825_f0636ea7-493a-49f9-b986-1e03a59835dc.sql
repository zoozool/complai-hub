-- Drop the old trigger and function
DROP TRIGGER IF EXISTS assign_test_roles_on_profile_creation ON public.profiles;
DROP FUNCTION IF EXISTS public.assign_test_user_roles();

-- Function to automatically assign roles based on neptis.pl email addresses
CREATE OR REPLACE FUNCTION public.assign_test_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign role based on email address
  IF NEW.email = 'admin@neptis.pl' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'main_administrator')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email = 'employee@neptis.pl' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'employee')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email = 'technician@neptis.pl' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'service_technician')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER assign_test_roles_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_test_user_roles();

-- Manually assign roles to existing users
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'main_administrator'
FROM public.profiles
WHERE email = 'admin@neptis.pl'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'employee'
FROM public.profiles
WHERE email = 'employee@neptis.pl'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'service_technician'
FROM public.profiles
WHERE email = 'technician@neptis.pl'
ON CONFLICT (user_id, role) DO NOTHING;