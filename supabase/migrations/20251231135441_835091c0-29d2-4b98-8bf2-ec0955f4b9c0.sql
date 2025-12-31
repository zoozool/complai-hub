-- Add VAT invoice fields to complaints table
ALTER TABLE public.complaints
ADD COLUMN invoice_company_name text,
ADD COLUMN invoice_vat_id text,
ADD COLUMN invoice_address text,
ADD COLUMN invoice_postal_code text,
ADD COLUMN invoice_city text;