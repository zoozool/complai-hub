-- Allow technicians to unassign themselves from complaints (reject repair)
CREATE POLICY "Technicians can unassign themselves from complaints"
ON public.complaints
FOR UPDATE
USING (
  has_role(auth.uid(), 'service_technician'::app_role) 
  AND assigned_technician_id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'service_technician'::app_role) 
  AND assigned_technician_id IS NULL
);