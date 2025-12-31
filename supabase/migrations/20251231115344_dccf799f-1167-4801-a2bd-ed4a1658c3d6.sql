-- Allow technicians to view devices with 'received' status (ready for repair)
CREATE POLICY "Service technicians can view received devices" 
ON public.complaints 
FOR SELECT 
USING (
  has_role(auth.uid(), 'service_technician'::app_role) 
  AND status = 'received'
);

-- Allow technicians to claim received devices (assign to themselves)
CREATE POLICY "Technicians can claim received devices" 
ON public.complaints 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'service_technician'::app_role) 
  AND status = 'received' 
  AND assigned_technician_id IS NULL
)
WITH CHECK (
  has_role(auth.uid(), 'service_technician'::app_role) 
  AND assigned_technician_id = auth.uid()
);