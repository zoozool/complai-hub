-- Create courier_orders table
CREATE TABLE public.courier_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,
  vat_id TEXT,
  street TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 15.00,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courier_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own courier orders"
ON public.courier_orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own courier orders"
ON public.courier_orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own courier orders"
ON public.courier_orders
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_courier_orders_updated_at
BEFORE UPDATE ON public.courier_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();