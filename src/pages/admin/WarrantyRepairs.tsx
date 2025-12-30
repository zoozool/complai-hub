import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck } from "lucide-react";

interface WarrantyComplaint {
  id: string;
  internal_complaint_number: string | null;
  device_type: string;
  device_serial_number: string;
  damage_description: string;
  status: string | null;
  submission_date: string;
  diagnosis: string | null;
  repair_cost: number | null;
}

export default function WarrantyRepairs() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<WarrantyComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarrantyComplaints();
  }, [user]);

  const fetchWarrantyComplaints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("id, internal_complaint_number, device_type, device_serial_number, damage_description, status, submission_date, diagnosis, repair_cost")
        .eq("warranty_repair", true)
        .eq("assigned_technician_id", user.id)
        .order("submission_date", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching warranty complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusColors: Record<string, string> = {
      submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      awaiting_shipment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return statusColors[status || "submitted"] || statusColors.submitted;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Warranty Repairs</h1>
            <p className="text-muted-foreground">Devices assigned to you under warranty</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : complaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No warranty repairs assigned to you</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {complaint.internal_complaint_number || complaint.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={getStatusBadge(complaint.status)}>
                      {complaint.status?.replace("_", " ") || "Submitted"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Device:</span>
                      <p className="font-medium">{complaint.device_type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Serial:</span>
                      <p className="font-medium">{complaint.device_serial_number}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Description:</span>
                    <p className="text-sm">{complaint.damage_description}</p>
                  </div>
                  {complaint.diagnosis && (
                    <div>
                      <span className="text-muted-foreground text-sm">Diagnosis:</span>
                      <p className="text-sm">{complaint.diagnosis}</p>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground pt-2">
                    Submitted: {new Date(complaint.submission_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
