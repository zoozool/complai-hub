import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface ComplaintDetailsDialogProps {
  complaint: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function ComplaintDetailsDialog({
  complaint,
  open,
  onOpenChange,
  isLoading = false,
}: ComplaintDetailsDialogProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      submitted: "secondary",
      received: "default",
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
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  };

  const getClientName = () => {
    const profile = complaint.profiles;
    if (profile?.company_name) {
      return profile.company_name;
    }
    return `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'N/A';
  };

  const getTechnicianName = () => {
    const technician = complaint.technician;
    if (!technician) return "Unassigned";
    return `${technician.first_name || ''} ${technician.last_name || ''}`.trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complaint Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !complaint ? (
          <div className="text-center py-12 text-muted-foreground">
            No complaint data available.
          </div>
        ) : (
          <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complaint ID</p>
                <p>{complaint.internal_complaint_number || complaint.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                {getStatusBadge(complaint.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client/Partner</p>
                <p>{getClientName()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Technician</p>
                <p>{getTechnicianName()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                <p>{formatDate(complaint.submission_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Date</p>
                <p>{complaint.completion_date ? formatDate(complaint.completion_date) : "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Device Info */}
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Device Type</p>
                <p>{complaint.device_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                <p>{complaint.device_serial_number}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Damage Description</p>
                <p>{complaint.damage_description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                <p>{complaint.diagnosis || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service Notes</p>
                <p>{complaint.service_notes || "No notes"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Repair Cost</p>
                  <p>{complaint.repair_cost ? `$${complaint.repair_cost}` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Warranty Repair</p>
                  <p>{complaint.warranty_repair ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Numer paczki</p>
                <p>{complaint.incoming_tracking_number || "Nie podano"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incoming Tracking</p>
                <p>{complaint.incoming_tracking_number || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outgoing Tracking</p>
                <p>{complaint.outgoing_tracking_number || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Package Contents */}
          <Card>
            <CardHeader>
              <CardTitle>Package Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'package_device', label: 'Device' },
                  { key: 'package_original_packaging', label: 'Original Packaging' },
                  { key: 'package_mount', label: 'Mount' },
                  { key: 'package_adapter', label: 'Adapter' },
                  { key: 'package_usb_cable', label: 'USB Cable' },
                  { key: 'package_receipt_copy', label: 'Receipt Copy' },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${complaint[item.key] ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}