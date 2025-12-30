-- Allow technicians to claim unassigned warranty repairs
CREATE POLICY "Technicians can claim unassigned warranty repairs" 
ON public.complaints 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'service_technician'::app_role) 
  AND warranty_repair = true 
  AND assigned_technician_id IS NULL
)
WITH CHECK (
  has_role(auth.uid(), 'service_technician'::app_role) 
  AND assigned_technician_id = auth.uid()
);