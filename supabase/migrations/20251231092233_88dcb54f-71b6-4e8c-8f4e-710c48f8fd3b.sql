-- Add new status 'received' to complaint_status enum
ALTER TYPE public.complaint_status ADD VALUE IF NOT EXISTS 'received' AFTER 'submitted';