-- Create spare_parts table for technician repair parts
CREATE TABLE public.spare_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

-- Admins can manage spare parts
CREATE POLICY "Admins can manage spare parts"
ON public.spare_parts
FOR ALL
USING (has_role(auth.uid(), 'main_administrator'::app_role));

-- Anyone can view active spare parts
CREATE POLICY "Anyone can view active spare parts"
ON public.spare_parts
FOR SELECT
USING ((is_active = true) OR has_role(auth.uid(), 'main_administrator'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_spare_parts_updated_at
BEFORE UPDATE ON public.spare_parts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();