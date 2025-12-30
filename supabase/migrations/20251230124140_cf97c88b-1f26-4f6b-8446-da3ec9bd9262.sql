-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can view active spare parts" ON public.spare_parts;

-- Create new policy that allows admins and technicians to view spare parts
CREATE POLICY "Admins and technicians can view spare parts"
ON public.spare_parts
FOR SELECT
USING (
  has_role(auth.uid(), 'main_administrator'::app_role) 
  OR has_role(auth.uid(), 'service_technician'::app_role)
);