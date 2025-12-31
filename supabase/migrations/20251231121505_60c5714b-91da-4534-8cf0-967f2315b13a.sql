-- Create table to store parts used in repairs
CREATE TABLE public.complaint_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  spare_part_id UUID NOT NULL REFERENCES public.spare_parts(id) ON DELETE CASCADE,
  spare_part_name TEXT NOT NULL,
  spare_part_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(complaint_id, spare_part_id)
);

-- Enable RLS
ALTER TABLE public.complaint_parts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage complaint parts"
ON public.complaint_parts
FOR ALL
USING (has_role(auth.uid(), 'main_administrator'::app_role));

CREATE POLICY "Employees can view complaint parts"
ON public.complaint_parts
FOR SELECT
USING (has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Technicians can manage parts for assigned complaints"
ON public.complaint_parts
FOR ALL
USING (
  has_role(auth.uid(), 'service_technician'::app_role) 
  AND EXISTS (
    SELECT 1 FROM complaints c 
    WHERE c.id = complaint_parts.complaint_id 
    AND c.assigned_technician_id = auth.uid()
  )
);

CREATE POLICY "Technicians can view parts for completed complaints"
ON public.complaint_parts
FOR SELECT
USING (has_role(auth.uid(), 'service_technician'::app_role));