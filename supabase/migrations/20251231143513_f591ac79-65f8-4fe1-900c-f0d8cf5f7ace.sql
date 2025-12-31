
-- 1. Remove duplicate employee role for user who is already main_administrator
DELETE FROM public.user_roles 
WHERE id = '75cfc673-418e-42bb-9234-ca00c854bfe1';

-- 2. Reset complaint status from 'in_progress' to 'received' since it has no assigned technician
-- This ensures it appears in technician queue for proper assignment
UPDATE public.complaints 
SET status = 'received', 
    updated_at = now()
WHERE id = '16e2523a-6b62-43c0-a8fb-49fe1582680c' 
  AND status = 'in_progress' 
  AND assigned_technician_id IS NULL;
