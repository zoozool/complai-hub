import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, Play, Download, Search } from "lucide-react";
import { TechnicianRepairView } from "@/components/admin/TechnicianRepairView";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";
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
  service_notes: string | null;
  return_first_name: string;
  return_last_name: string;
  return_email: string;
  return_phone: string;
  return_street: string;
  return_postal_code: string;
  return_city: string;
  warranty_repair: boolean;
  express_repair: boolean;
  reported_problem: string | null;
}

export default function WarrantyRepairs() {
  const { user } = useAuth();
  const { role } = useRole();
  const [complaints, setComplaints] = useState<WarrantyComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<WarrantyComplaint | null>(null);
  const [startingRepairId, setStartingRepairId] = useState<string | null>(null);
  const [fetchingRepair, setFetchingRepair] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");
  const [fetchingBySerial, setFetchingBySerial] = useState(false);

  useEffect(() => {
    fetchWarrantyComplaints();
  }, [user]);

  const fetchWarrantyComplaints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          id, internal_complaint_number, device_type, device_serial_number, 
          damage_description, status, submission_date, diagnosis, repair_cost,
          service_notes, return_first_name, return_last_name, return_email,
          return_phone, return_street, return_postal_code, return_city,
          warranty_repair, express_repair, reported_problem
        `)
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

  const handleComplaintClick = (complaint: WarrantyComplaint) => {
    setSelectedComplaint(complaint);
  };

  const handleBack = () => {
    setSelectedComplaint(null);
  };

  const handleSuccess = () => {
    setSelectedComplaint(null);
    fetchWarrantyComplaints();
  };

  const handleStartRepair = async (e: React.MouseEvent, complaint: WarrantyComplaint) => {
    e.stopPropagation(); // Prevent card click
    setStartingRepairId(complaint.id);
    
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: "in_progress" })
        .eq("id", complaint.id);

      if (error) throw error;

      toast.success("Naprawa rozpoczęta");
      fetchWarrantyComplaints();
    } catch (error) {
      console.error("Error starting repair:", error);
      toast.error("Nie udało się rozpocząć naprawy");
    } finally {
      setStartingRepairId(null);
    }
  };

  const handleFetchRepair = async () => {
    if (!user) return;
    setFetchingRepair(true);

    try {
      // Find the oldest unassigned warranty complaint
      // Priority: express_repair first, then oldest submission_date
      const { data: availableRepairs, error: fetchError } = await supabase
        .from("complaints")
        .select("id, express_repair, submission_date")
        .eq("warranty_repair", true)
        .is("assigned_technician_id", null)
        .in("status", ["submitted", "awaiting_shipment"])
        .order("express_repair", { ascending: false }) // Express first
        .order("submission_date", { ascending: true }) // Oldest first
        .limit(1);

      if (fetchError) throw fetchError;

      if (!availableRepairs || availableRepairs.length === 0) {
        toast.info("Brak dostępnych napraw do pobrania");
        setFetchingRepair(false);
        return;
      }

      const repairToAssign = availableRepairs[0];

      // Assign the repair to the current technician
      const { error: updateError } = await supabase
        .from("complaints")
        .update({ assigned_technician_id: user.id })
        .eq("id", repairToAssign.id);

      if (updateError) throw updateError;

      toast.success("Naprawa została przypisana do Ciebie");
      fetchWarrantyComplaints();
    } catch (error) {
      console.error("Error fetching repair:", error);
      toast.error("Nie udało się pobrać naprawy");
    } finally {
      setFetchingRepair(false);
    }
  };

  const handleFetchBySerial = async () => {
    if (!user) return;
    const trimmedSerial = serialNumber.trim();
    
    if (!trimmedSerial) {
      toast.error("Wpisz numer seryjny urządzenia");
      return;
    }

    if (trimmedSerial.length > 100) {
      toast.error("Numer seryjny jest za długi");
      return;
    }

    setFetchingBySerial(true);

    try {
      // Find the unassigned warranty complaint with this serial number
      const { data: matchingRepairs, error: fetchError } = await supabase
        .from("complaints")
        .select("id, device_serial_number")
        .eq("warranty_repair", true)
        .is("assigned_technician_id", null)
        .ilike("device_serial_number", trimmedSerial)
        .limit(1);

      if (fetchError) throw fetchError;

      if (!matchingRepairs || matchingRepairs.length === 0) {
        toast.error("Nie znaleziono nieprzypisanej naprawy gwarancyjnej o tym numerze seryjnym");
        setFetchingBySerial(false);
        return;
      }

      const repairToAssign = matchingRepairs[0];

      // Assign the repair to the current technician
      const { error: updateError } = await supabase
        .from("complaints")
        .update({ assigned_technician_id: user.id })
        .eq("id", repairToAssign.id);

      if (updateError) throw updateError;

      toast.success(`Naprawa urządzenia ${repairToAssign.device_serial_number} została przypisana do Ciebie`);
      setSerialNumber("");
      fetchWarrantyComplaints();
    } catch (error) {
      console.error("Error fetching repair by serial:", error);
      toast.error("Nie udało się pobrać naprawy");
    } finally {
      setFetchingBySerial(false);
    }
  };

  // Show detail view if a complaint is selected
  if (selectedComplaint) {
    return (
      <AdminLayout>
        <TechnicianRepairView
          complaint={selectedComplaint}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Naprawy gwarancyjne</h1>
              <p className="text-muted-foreground">Urządzenia przypisane do Ciebie</p>
            </div>
          </div>
          {role === "service_technician" && (
            <div className="flex items-center gap-2">
              <Button onClick={handleFetchRepair} disabled={fetchingRepair}>
                {fetchingRepair ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Pobierz naprawę
              </Button>
            </div>
          )}
        </div>

        {/* Serial number search */}
        {role === "service_technician" && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="Wpisz numer seryjny urządzenia..."
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFetchBySerial();
                    }}
                    maxLength={100}
                  />
                </div>
                <Button 
                  onClick={handleFetchBySerial} 
                  disabled={fetchingBySerial || !serialNumber.trim()}
                >
                  {fetchingBySerial ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Przypisz po numerze
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : complaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Brak napraw gwarancyjnych przypisanych do Ciebie</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <Card 
                key={complaint.id} 
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleComplaintClick(complaint)}
              >
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
                      <span className="text-muted-foreground">Urządzenie:</span>
                      <p className="font-medium">{complaint.device_type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Numer seryjny:</span>
                      <p className="font-medium">{complaint.device_serial_number}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Opis uszkodzenia:</span>
                    <p className="text-sm">{complaint.damage_description}</p>
                  </div>
                  {complaint.diagnosis && (
                    <div>
                      <span className="text-muted-foreground text-sm">Diagnoza:</span>
                      <p className="text-sm">{complaint.diagnosis}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Zgłoszono: {new Date(complaint.submission_date).toLocaleDateString("pl-PL")}
                    </span>
                    {complaint.status === "submitted" && (
                      <Button
                        size="sm"
                        onClick={(e) => handleStartRepair(e, complaint)}
                        disabled={startingRepairId === complaint.id}
                      >
                        {startingRepairId === complaint.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Play className="h-4 w-4 mr-1" />
                        )}
                        Rozpocznij naprawę
                      </Button>
                    )}
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
