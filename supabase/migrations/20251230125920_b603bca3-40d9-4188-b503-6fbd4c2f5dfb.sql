-- Drop the conflicting SELECT policy
DROP POLICY IF EXISTS "Admins and technicians can view spare parts" ON public.spare_parts;

-- Drop the existing ALL policy
DROP POLICY IF EXISTS "Admins can manage spare parts" ON public.spare_parts;

-- Create proper policies for admins (full CRUD)
CREATE POLICY "Admins can manage spare parts" 
ON public.spare_parts 
FOR ALL 
USING (has_role(auth.uid(), 'main_administrator'::app_role))
WITH CHECK (has_role(auth.uid(), 'main_administrator'::app_role));

-- Create SELECT policy for technicians only
CREATE POLICY "Technicians can view spare parts" 
ON public.spare_parts 
FOR SELECT 
USING (has_role(auth.uid(), 'service_technician'::app_role));