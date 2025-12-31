import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { ComplaintTable } from "@/components/admin/ComplaintTable";
import { SearchFilters } from "@/components/admin/SearchFilters";
import { CreateComplaintDialog } from "@/components/admin/CreateComplaintDialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { role, isAdmin, isTechnician } = useRole();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('complaints')
        .select(`*`)
        .order('submission_date', { ascending: false });

      // Apply role-based filtering - for technicians show received/in_progress devices
      if (isTechnician()) {
        // Show devices that are received or in_progress (assigned to this technician or unassigned)
        query = query.in('status', ['received', 'in_progress']);
      }

      // Apply search filters
      if (searchTerm) {
        query = query.or(`device_serial_number.ilike.%${searchTerm}%,internal_complaint_number.ilike.%${searchTerm}%,return_first_name.ilike.%${searchTerm}%,return_last_name.ilike.%${searchTerm}%,return_email.ilike.%${searchTerm}%`);
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter as any);
      }

      if (technicianFilter) {
        query = query.eq('assigned_technician_id', technicianFilter);
      }

      if (dateRange.from) {
        query = query.gte('submission_date', dateRange.from);
      }

      if (dateRange.to) {
        query = query.lte('submission_date', dateRange.to);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: "Error",
        description: "Failed to fetch complaints",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user, role, searchTerm, statusFilter, technicianFilter, dateRange]);

  const refreshComplaints = () => {
    fetchComplaints();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isTechnician() ? 'Urządzenia do naprawy' : 'Complaint Management'}
            </h1>
            <p className="text-muted-foreground">
              {isTechnician() 
                ? 'Urządzenia ze statusem "W serwisie" lub "W naprawie"'
                : 'Manage all complaints in the system'
              }
            </p>
          </div>
          {isAdmin() && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Complaint
            </Button>
          )}
        </div>

        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          technicianFilter={technicianFilter}
          setTechnicianFilter={setTechnicianFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          showTechnicianFilter={!isTechnician()}
        />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ComplaintTable 
            complaints={complaints} 
            onRefresh={refreshComplaints}
            userRole={role}
          />
        )}

        {isAdmin() && (
          <CreateComplaintDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={refreshComplaints}
          />
        )}
      </div>
    </AdminLayout>
  );
}