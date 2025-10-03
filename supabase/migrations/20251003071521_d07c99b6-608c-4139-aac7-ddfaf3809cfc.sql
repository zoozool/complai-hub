-- Add only missing foreign key constraints

-- Add foreign key from complaints.assigned_technician_id to profiles.user_id (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'complaints_assigned_technician_id_fkey'
  ) THEN
    ALTER TABLE public.complaints
    ADD CONSTRAINT complaints_assigned_technician_id_fkey 
    FOREIGN KEY (assigned_technician_id) 
    REFERENCES public.profiles(user_id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key from user_roles.user_id to profiles.user_id (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_id_profiles_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(user_id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_technician_id ON public.complaints(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);