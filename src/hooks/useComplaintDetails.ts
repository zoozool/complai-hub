import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  internal_complaint_number: string | null;
  status: string | null;
  device_type: string;
  device_serial_number: string;
  damage_description: string;
  diagnosis: string | null;
  service_notes: string | null;
  repair_cost: number | null;
  warranty_repair: boolean;
  express_repair: boolean;
  submission_date: string;
  completion_date: string | null;
  incoming_tracking_number: string | null;
  outgoing_tracking_number: string | null;
  assigned_technician_id: string | null;
  user_id: string;
  return_first_name: string;
  return_last_name: string;
  return_email: string;
  return_phone: string;
  return_street: string;
  return_city: string;
  return_postal_code: string;
  package_device: boolean;
  package_original_packaging: boolean;
  package_mount: boolean;
  package_adapter: boolean;
  package_usb_cable: boolean;
  package_receipt_copy: boolean;
  screen_protection_foil: boolean;
  invoice_data: string | null;
  reported_problem: string | null;
  created_at: string;
  updated_at: string;
}

interface UseComplaintDetailsReturn {
  complaint: Complaint | null;
  isLoading: boolean;
  error: string | null;
  fetchComplaint: (id: string) => Promise<void>;
  clearComplaint: () => void;
}

export function useComplaintDetails(): UseComplaintDetailsReturn {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchComplaint = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('get-complaint', {
        body: { id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch complaint');
      }

      const data = response.data;

      if (data.error) {
        // Handle specific error codes
        if (data.error === 'Complaint not found') {
          setError('Complaint not found');
          toast({
            title: "Not Found",
            description: "The requested complaint could not be found.",
            variant: "destructive",
          });
        } else if (data.error === 'Access denied. Admin role required.') {
          setError('Access denied');
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this complaint.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setComplaint(data.data);
    } catch (err: any) {
      console.error('Error fetching complaint:', err);
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: "Error",
        description: err.message || "Failed to fetch complaint details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearComplaint = useCallback(() => {
    setComplaint(null);
    setError(null);
  }, []);

  return {
    complaint,
    isLoading,
    error,
    fetchComplaint,
    clearComplaint,
  };
}
