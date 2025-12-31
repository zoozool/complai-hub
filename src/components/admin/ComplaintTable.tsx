import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, UserCheck, Eye, UserPlus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { EditComplaintDialog } from "./EditComplaintDialog";
import { AssignTechnicianDialog } from "./AssignTechnicianDialog";
import { DeleteComplaintDialog } from "./DeleteComplaintDialog";
import { ComplaintDetailsDialog } from "./ComplaintDetailsDialog";
import { useComplaintDetails } from "@/hooks/useComplaintDetails";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComplaintTableProps {
  complaints: any[];
  onRefresh: () => void;
  userRole: string | null;
}

export function ComplaintTable({ complaints, onRefresh, userRole }: ComplaintTableProps) {
  const { user } = useAuth();
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [deletingComplaint, setDeletingComplaint] = useState(null);
  const [viewingComplaintId, setViewingComplaintId] = useState<string | null>(null);
  const [assigningToMeId, setAssigningToMeId] = useState<string | null>(null);
  
  const { complaint: viewingComplaint, isLoading: isLoadingDetails, fetchComplaint, clearComplaint } = useComplaintDetails();

  const handleAssignToMe = async (complaintId: string) => {
    if (!user) return;
    setAssigningToMeId(complaintId);
    
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ assigned_technician_id: user.id })
        .eq("id", complaintId);

      if (error) throw error;

      toast.success("Naprawa została przypisana do Ciebie");
      onRefresh();
    } catch (error) {
      console.error("Error assigning repair:", error);
      toast.error("Nie udało się przypisać naprawy");
    } finally {
      setAssigningToMeId(null);
    }
  };

  const handleViewDetails = async (complaintId: string) => {
    setViewingComplaintId(complaintId);
    await fetchComplaint(complaintId);
  };

  const handleCloseDetails = () => {
    setViewingComplaintId(null);
    clearComplaint();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      submitted: "secondary",
      received: "default",
      in_progress: "default",
      completed: "outline",
      awaiting_shipment: "secondary",
      cancelled: "destructive",
    };
    
    const statusLabels: Record<string, string> = {
      submitted: "Zgłoszone",
      received: "W serwisie",
      in_progress: "W naprawie",
      completed: "Zakończone",
      awaiting_shipment: "Oczekuje na wysyłkę",
      cancelled: "Anulowane",
    };
    
    return (
      <Badge variant={variants[status] || "default"}>
        {statusLabels[status] || status?.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getClientName = (complaint: any) => {
    const profile = complaint.profiles;
    if (profile?.company_name) {
      return profile.company_name;
    }
    const nameFromProfile = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
    if (nameFromProfile) return nameFromProfile;
    const nameFromReturn = `${complaint.return_first_name || ''} ${complaint.return_last_name || ''}`.trim();
    return nameFromReturn || 'N/A';
  };

  const getTechnicianName = (complaint: any) => {
    const technician = complaint.technician;
    if (technician) {
      const name = `${technician.first_name || ''} ${technician.last_name || ''}`.trim();
      return name || 'Przypisany';
    }
    // Fallback: check if assigned_technician_id exists
    if (complaint.assigned_technician_id) {
      return 'Przypisany';
    }
    return "Nieprzypisany";
  };

  const canEdit = userRole === 'main_administrator' || userRole === 'service_technician';
  const canDelete = userRole === 'main_administrator';
  const canAssign = userRole === 'main_administrator';
  const canSelfAssign = userRole === 'service_technician';

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Device Serial</TableHead>
              <TableHead>Client/Partner</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Technician</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell className="font-mono text-sm">
                  {complaint.internal_complaint_number || complaint.id.slice(0, 8)}
                </TableCell>
                <TableCell>{complaint.device_serial_number}</TableCell>
                <TableCell>{getClientName(complaint)}</TableCell>
                <TableCell>{formatDate(complaint.submission_date)}</TableCell>
                <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                <TableCell>{getTechnicianName(complaint)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(complaint.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {canEdit && (
                        <DropdownMenuItem onClick={() => setEditingComplaint(complaint)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canAssign && (
                        <DropdownMenuItem onClick={() => setAssigningComplaint(complaint)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Assign Technician
                        </DropdownMenuItem>
                      )}
                      {canSelfAssign && !complaint.assigned_technician_id && (
                        <DropdownMenuItem 
                          onClick={() => handleAssignToMe(complaint.id)}
                          disabled={assigningToMeId === complaint.id}
                        >
                          {assigningToMeId === complaint.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="mr-2 h-4 w-4" />
                          )}
                          Przypisz do mnie
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem 
                          onClick={() => setDeletingComplaint(complaint)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {complaints.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No complaints found matching your criteria.
        </div>
      )}

      <EditComplaintDialog
        complaint={editingComplaint}
        open={!!editingComplaint}
        onOpenChange={() => setEditingComplaint(null)}
        onSuccess={onRefresh}
        userRole={userRole}
      />

      <AssignTechnicianDialog
        complaint={assigningComplaint}
        open={!!assigningComplaint}
        onOpenChange={() => setAssigningComplaint(null)}
        onSuccess={onRefresh}
      />

      <DeleteComplaintDialog
        complaint={deletingComplaint}
        open={!!deletingComplaint}
        onOpenChange={() => setDeletingComplaint(null)}
        onSuccess={onRefresh}
      />

      <ComplaintDetailsDialog
        complaint={viewingComplaint}
        open={!!viewingComplaintId}
        onOpenChange={handleCloseDetails}
        isLoading={isLoadingDetails}
      />
    </>
  );
}