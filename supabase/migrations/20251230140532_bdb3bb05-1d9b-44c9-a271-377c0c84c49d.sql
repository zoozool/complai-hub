-- Allow service technicians to view unassigned warranty repairs (so they can fetch them)
CREATE POLICY "Service technicians can view unassigned warranty repairs"
ON public.complaints
FOR SELECT
USING (
  has_role(auth.uid(), 'service_technician'::app_role) 
  AND warranty_repair = true 
  AND assigned_technician_id IS NULL
);