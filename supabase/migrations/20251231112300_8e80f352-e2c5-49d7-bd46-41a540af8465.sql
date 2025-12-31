-- Add UPDATE policy for employees to update complaints
CREATE POLICY "Employees can update all complaints" 
ON public.complaints 
FOR UPDATE 
USING (has_role(auth.uid(), 'employee'::app_role));