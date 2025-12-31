-- Create table for status change history
CREATE TABLE public.complaint_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  old_status complaint_status,
  new_status complaint_status NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage status history"
ON public.complaint_status_history
FOR ALL
USING (has_role(auth.uid(), 'main_administrator'));

CREATE POLICY "Employees can view status history"
ON public.complaint_status_history
FOR SELECT
USING (has_role(auth.uid(), 'employee'));

CREATE POLICY "Technicians can view status history for assigned complaints"
ON public.complaint_status_history
FOR SELECT
USING (
  has_role(auth.uid(), 'service_technician') AND
  EXISTS (
    SELECT 1 FROM public.complaints c 
    WHERE c.id = complaint_id 
    AND (c.assigned_technician_id = auth.uid() OR c.assigned_technician_id IS NULL)
  )
);

CREATE POLICY "Users can view status history for their complaints"
ON public.complaint_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.complaints c 
    WHERE c.id = complaint_id 
    AND c.user_id = auth.uid()
  )
);

-- Allow inserting status history when updating complaints
CREATE POLICY "Admins can insert status history"
ON public.complaint_status_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'main_administrator'));

CREATE POLICY "Employees can insert status history"
ON public.complaint_status_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'employee'));

CREATE POLICY "Technicians can insert status history"
ON public.complaint_status_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'service_technician'));

-- Create index for faster lookups
CREATE INDEX idx_status_history_complaint_id ON public.complaint_status_history(complaint_id);
CREATE INDEX idx_status_history_changed_at ON public.complaint_status_history(changed_at DESC);