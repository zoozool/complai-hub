import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, UserCheck, Eye } from "lucide-react";
import { format } from "date-fns";
import { EditComplaintDialog } from "./EditComplaintDialog";
import { AssignTechnicianDialog } from "./AssignTechnicianDialog";
import { DeleteComplaintDialog } from "./DeleteComplaintDialog";
import { ComplaintDetailsDialog } from "./ComplaintDetailsDialog";

interface ComplaintTableProps {
  complaints: any[];
  onRefresh: () => void;
  userRole: string | null;
}

export function ComplaintTable({ complaints, onRefresh, userRole }: ComplaintTableProps) {
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [deletingComplaint, setDeletingComplaint] = useState(null);
  const [viewingComplaint, setViewingComplaint] = useState(null);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      submitted: "secondary",
      in_progress: "default",
      completed: "outline",
      awaiting_shipment: "secondary",
      cancelled: "destructive",
    };
    
    return (
      <Badge variant={variants[status] || "default"}>
        {status?.replace('_', ' ').toUpperCase()}
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
    if (!technician) return "Unassigned";
    return `${technician.first_name || ''} ${technician.last_name || ''}`.trim();
  };

  const canEdit = userRole === 'main_administrator' || userRole === 'service_technician';
  const canDelete = userRole === 'main_administrator';
  const canAssign = userRole === 'main_administrator';

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
                      <DropdownMenuItem onClick={() => setViewingComplaint(complaint)}>
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
        open={!!viewingComplaint}
        onOpenChange={() => setViewingComplaint(null)}
      />
    </>
  );
}