-- Create user profiles table with business partner support
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'business_partner')),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  
  -- Business partner specific fields
  company_name TEXT,
  vat_id TEXT,
  company_address TEXT,
  service_contact_email TEXT,
  service_contact_phone TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic complaint info
  device_serial_number TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('Yanosik RS', 'Yanosik GT/GTR/GTS', 'Yanosik XS', 'Yanosik GTM', 'Yanosik Alert', 'Yanosik Connect')),
  damage_description TEXT NOT NULL,
  
  -- Service options
  warranty_repair BOOLEAN NOT NULL DEFAULT false,
  express_repair BOOLEAN NOT NULL DEFAULT false,
  screen_protection_foil BOOLEAN NOT NULL DEFAULT false,
  
  -- Package contents
  package_device BOOLEAN NOT NULL DEFAULT false,
  package_original_packaging BOOLEAN NOT NULL DEFAULT false,
  package_mount BOOLEAN NOT NULL DEFAULT false,
  package_adapter BOOLEAN NOT NULL DEFAULT false,
  package_usb_cable BOOLEAN NOT NULL DEFAULT false,
  package_receipt_copy BOOLEAN NOT NULL DEFAULT false,
  
  -- Return address
  return_first_name TEXT NOT NULL,
  return_last_name TEXT NOT NULL,
  return_street TEXT NOT NULL,
  return_postal_code TEXT NOT NULL,
  return_city TEXT NOT NULL,
  return_phone TEXT NOT NULL,
  return_email TEXT NOT NULL,
  
  -- Tracking and status
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_date TIMESTAMP WITH TIME ZONE,
  incoming_tracking_number TEXT,
  outgoing_tracking_number TEXT,
  
  -- Business partner specific
  internal_complaint_number TEXT,
  
  -- Repair details (filled by admin/technician)
  reported_problem TEXT,
  diagnosis TEXT,
  repair_cost DECIMAL(10,2),
  invoice_data TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pickup requests table for business partners
CREATE TABLE public.pickup_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  company_name TEXT NOT NULL,
  vat_id TEXT NOT NULL,
  address TEXT NOT NULL,
  service_contact_email TEXT NOT NULL,
  service_contact_phone TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed')),
  requested_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for complaints
CREATE POLICY "Users can view their own complaints" 
ON public.complaints 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own complaints" 
ON public.complaints 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints" 
ON public.complaints 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for pickup requests
CREATE POLICY "Users can view their own pickup requests" 
ON public.pickup_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pickup requests" 
ON public.pickup_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pickup requests" 
ON public.pickup_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pickup_requests_updated_at
  BEFORE UPDATE ON public.pickup_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();