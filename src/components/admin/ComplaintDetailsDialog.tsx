import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ComplaintDetailsDialogProps {
  complaint: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: string;
  changer_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export function ComplaintDetailsDialog({
  complaint,
  open,
  onOpenChange,
  isLoading = false,
}: ComplaintDetailsDialogProps) {
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (open && complaint?.id) {
      fetchStatusHistory(complaint.id);
    }
  }, [open, complaint?.id]);

  const fetchStatusHistory = async (complaintId: string) => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from("complaint_status_history")
        .select(`
          id,
          old_status,
          new_status,
          changed_at,
          changed_by
        `)
        .eq("complaint_id", complaintId)
        .order("changed_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each changer
      if (data && data.length > 0) {
        const changerIds = [...new Set(data.map(h => h.changed_by))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", changerIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        const enrichedData = data.map(h => ({
          ...h,
          changer_profile: profileMap.get(h.changed_by) as StatusHistoryEntry["changer_profile"],
        }));
        
        setStatusHistory(enrichedData);
      } else {
        setStatusHistory([]);
      }
    } catch (error) {
      console.error("Error fetching status history:", error);
    } finally {
      setHistoryLoading(false);
    }
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
      submitted: "Zgłoszono",
      received: "W serwisie",
      in_progress: "W naprawie",
      completed: "Zakończono",
      awaiting_shipment: "Oczekuje na wysyłkę",
      cancelled: "Anulowano",
    };
    
    return (
      <Badge variant={variants[status] || "default"}>
        {statusLabels[status] || status?.replace('_', ' ').toUpperCase()}
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

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historia zmian statusu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak historii zmian</p>
              ) : (
                <div className="space-y-3">
                  {statusHistory.map((entry) => (
                    <div key={entry.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {entry.old_status && (
                            <>
                              {getStatusBadge(entry.old_status)}
                              <span className="text-muted-foreground">→</span>
                            </>
                          )}
                          {getStatusBadge(entry.new_status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.changer_profile 
                            ? `${entry.changer_profile.first_name || ''} ${entry.changer_profile.last_name || ''}`.trim() || entry.changer_profile.email
                            : 'Nieznany użytkownik'}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {format(new Date(entry.changed_at), "dd.MM.yyyy")}
                        <br />
                        {format(new Date(entry.changed_at), "HH:mm")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}