-- Allow employees to view all pickup requests
CREATE POLICY "Employees can view all pickup requests"
ON public.pickup_requests
FOR SELECT
USING (has_role(auth.uid(), 'employee'::app_role));

-- Allow admins to view and manage all pickup requests
CREATE POLICY "Admins can manage all pickup requests"
ON public.pickup_requests
FOR ALL
USING (has_role(auth.uid(), 'main_administrator'::app_role));