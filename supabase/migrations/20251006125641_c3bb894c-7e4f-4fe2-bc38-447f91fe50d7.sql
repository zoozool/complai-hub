-- Create service_options table for configurable service options
CREATE TABLE public.service_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create package_contents table for configurable package items
CREATE TABLE public.package_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_contents ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_options
CREATE POLICY "Anyone can view active service options"
  ON public.service_options
  FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'main_administrator'));

CREATE POLICY "Admins can manage service options"
  ON public.service_options
  FOR ALL
  USING (has_role(auth.uid(), 'main_administrator'));

-- RLS policies for package_contents
CREATE POLICY "Anyone can view active package contents"
  ON public.package_contents
  FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'main_administrator'));

CREATE POLICY "Admins can manage package contents"
  ON public.package_contents
  FOR ALL
  USING (has_role(auth.uid(), 'main_administrator'));

-- Add triggers for updated_at
CREATE TRIGGER update_service_options_updated_at
  BEFORE UPDATE ON public.service_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_package_contents_updated_at
  BEFORE UPDATE ON public.package_contents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default service options
INSERT INTO public.service_options (name, price, display_order) VALUES
  ('Express Repair', 99.00, 1),
  ('Screen Protection Foil', 49.00, 2);

-- Insert default package contents
INSERT INTO public.package_contents (name, display_order) VALUES
  ('Device', 1),
  ('Original Packaging', 2),
  ('Mount', 3),
  ('Adapter', 4),
  ('USB Cable', 5),
  ('Purchase Receipt Copy', 6);