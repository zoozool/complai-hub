-- Add 'verified' status to complaint_status enum
ALTER TYPE public.complaint_status ADD VALUE IF NOT EXISTS 'verified' AFTER 'completed';