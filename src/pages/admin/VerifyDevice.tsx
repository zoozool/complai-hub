import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/hooks/useRole";
import { Smartphone, Search, ArrowLeft, CheckCircle, AlertCircle, Wrench, ClipboardCheck, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface Complaint {
  id: string;
  device_serial_number: string;
  device_type: string;
  status: string;
  internal_complaint_number: string | null;
  damage_description: string;
  warranty_repair: boolean;
  express_repair: boolean;
  diagnosis: string | null;
  service_notes: string | null;
  repair_cost: number | null;
  submission_date: string;
  completion_date: string | null;
}

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  notes: string | null;
  changed_by: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface UsedPart {
  id: string;
  spare_part_name: string;
  spare_part_price: number;
}

const statusLabels: Record<string, string> = {
  submitted: "Zgłoszone",
  received: "W serwisie",
  in_progress: "W naprawie",
  completed: "Zakończone",
  verified: "Zweryfikowane",
  awaiting_shipment: "Oczekuje na wysyłkę",
  cancelled: "Anulowane",
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    submitted: "outline",
    received: "secondary",
    in_progress: "default",
    completed: "default",
    verified: "default",
    awaiting_shipment: "secondary",
    cancelled: "destructive",
  };
  return variants[status] || "outline";
};

export default function VerifyDevice() {
  const { isAdmin, isEmployee, loading: roleLoading } = useRole();
  const { toast } = useToast();
  const [deviceNumber, setDeviceNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [usedParts, setUsedParts] = useState<UsedPart[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Verification checklist
  const [checkPowerOn, setCheckPowerOn] = useState(false);
  const [checkGPS, setCheckGPS] = useState(false);
  const [checkGSM, setCheckGSM] = useState(false);
  const [checkSound, setCheckSound] = useState(false);

  const resetChecklist = () => {
    setCheckPowerOn(false);
    setCheckGPS(false);
    setCheckGSM(false);
    setCheckSound(false);
  };

  const allChecksCompleted = checkPowerOn && checkGPS && checkGSM && checkSound;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceNumber.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź numer urządzenia",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    resetChecklist();
    
    try {
      // Find the latest completed complaint for this device
      const { data: complaints, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("device_serial_number", deviceNumber.trim())
        .in("status", ["completed"])
        .order("submission_date", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!complaints || complaints.length === 0) {
        setComplaint(null);
        setStatusHistory([]);
        setUsedParts([]);
        setSearchPerformed(true);
        toast({
          title: "Nie znaleziono",
          description: `Nie znaleziono zakończonej naprawy dla urządzenia: ${deviceNumber}`,
          variant: "destructive",
        });
        return;
      }

      const foundComplaint = complaints[0];
      setComplaint(foundComplaint);
      setSearchPerformed(true);

      // Fetch status history
      const { data: history } = await supabase
        .from("complaint_status_history")
        .select("*")
        .eq("complaint_id", foundComplaint.id)
        .order("changed_at", { ascending: true });

      if (history && history.length > 0) {
        // Fetch profiles for each history entry
        const userIds = [...new Set(history.map(h => h.changed_by))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", userIds);

        const profileMap = profiles?.reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as Record<string, typeof profiles[0]>) || {};

        setStatusHistory(history.map(h => ({
          ...h,
          profile: profileMap[h.changed_by]
        })));
      }

      // Fetch used parts
      const { data: parts } = await supabase
        .from("complaint_parts")
        .select("id, spare_part_name, spare_part_price")
        .eq("complaint_id", foundComplaint.id);

      setUsedParts(parts || []);
      
    } catch (error: any) {
      console.error("Error searching:", error);
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się wyszukać urządzenia",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerify = async () => {
    if (!complaint) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from("complaints")
        .update({ status: "verified" })
        .eq("id", complaint.id);

      if (updateError) throw updateError;

      await supabase
        .from("complaint_status_history")
        .insert([{
          complaint_id: complaint.id,
          old_status: complaint.status as "submitted" | "received" | "in_progress" | "completed" | "verified" | "awaiting_shipment" | "cancelled",
          new_status: "verified" as const,
          changed_by: user?.id || "",
          notes: "Weryfikacja pozytywna - wszystkie testy przeszły pomyślnie"
        }]);

      toast({
        title: "Urządzenie zweryfikowane",
        description: `Reklamacja ${complaint.internal_complaint_number || complaint.id} - status zmieniony na "Zweryfikowane"`,
      });
      
      handleReset();
      
    } catch (error: any) {
      console.error("Error verifying device:", error);
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się zweryfikować urządzenia",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToService = async () => {
    if (!complaint) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const failedChecks: string[] = [];
      if (!checkPowerOn) failedChecks.push("urządzenie się nie włącza");
      if (!checkGPS) failedChecks.push("brak zasięgu GPS");
      if (!checkGSM) failedChecks.push("brak zasięgu GSM");
      if (!checkSound) failedChecks.push("brak dźwięku");
      
      const { error: updateError } = await supabase
        .from("complaints")
        .update({ status: "in_progress" })
        .eq("id", complaint.id);

      if (updateError) throw updateError;

      await supabase
        .from("complaint_status_history")
        .insert([{
          complaint_id: complaint.id,
          old_status: complaint.status as "submitted" | "received" | "in_progress" | "completed" | "verified" | "awaiting_shipment" | "cancelled",
          new_status: "in_progress" as const,
          changed_by: user?.id || "",
          notes: `Weryfikacja negatywna - powrót do naprawy. Problemy: ${failedChecks.join(", ")}`
        }]);

      toast({
        title: "Urządzenie zwrócone do serwisu",
        description: `Reklamacja ${complaint.internal_complaint_number || complaint.id} - status zmieniony na "W naprawie"`,
      });
      
      handleReset();
      
    } catch (error: any) {
      console.error("Error returning to service:", error);
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się zwrócić urządzenia do serwisu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDeviceNumber("");
    setComplaint(null);
    setStatusHistory([]);
    setUsedParts([]);
    setSearchPerformed(false);
    resetChecklist();
  };

  if (roleLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin() && !isEmployee()) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Brak dostępu do tej strony</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weryfikacja urządzenia</h1>
          <p className="text-muted-foreground">
            Sprawdź poprawność naprawy przed wysyłką do klienta
          </p>
        </div>

        {/* Search Form */}
        {!searchPerformed && (
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Wyszukaj urządzenie
              </CardTitle>
              <CardDescription>
                Wprowadź numer urządzenia aby sprawdzić naprawę
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceNumber" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Numer urządzenia (S/N)
                  </Label>
                  <Input
                    id="deviceNumber"
                    placeholder="Wprowadź numer seryjny urządzenia"
                    value={deviceNumber}
                    onChange={(e) => setDeviceNumber(e.target.value)}
                    disabled={isSearching}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSearching}>
                  {isSearching ? "Wyszukiwanie..." : "Wyszukaj"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Not Found */}
        {searchPerformed && !complaint && (
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Nie znaleziono zakończonej naprawy dla urządzenia: {deviceNumber}
                </p>
                <Button variant="outline" onClick={handleReset}>
                  Wróć do wyszukiwania
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complaint Details */}
        {searchPerformed && complaint && (
          <div className="space-y-6">
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Wróć do wyszukiwania
            </Button>

            {/* Repair Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Informacje o naprawie
                  </CardTitle>
                  <Badge variant={getStatusVariant(complaint.status)}>
                    {statusLabels[complaint.status] || complaint.status}
                  </Badge>
                </div>
                <CardDescription>
                  {complaint.internal_complaint_number || complaint.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Device Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Typ urządzenia</h4>
                    <p>{complaint.device_type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Numer seryjny</h4>
                    <p>{complaint.device_serial_number}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Data zgłoszenia</h4>
                    <p>{format(new Date(complaint.submission_date), "dd MMMM yyyy, HH:mm", { locale: pl })}</p>
                  </div>
                  {complaint.completion_date && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Data zakończenia</h4>
                      <p>{format(new Date(complaint.completion_date), "dd MMMM yyyy, HH:mm", { locale: pl })}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {complaint.warranty_repair && <Badge variant="secondary">Gwarancja</Badge>}
                    {complaint.express_repair && <Badge variant="default">Express</Badge>}
                  </div>
                </div>

                <Separator />

                {/* Damage Description */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Opis uszkodzenia</h4>
                  <p className="whitespace-pre-wrap">{complaint.damage_description}</p>
                </div>

                {/* Diagnosis */}
                {complaint.diagnosis && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Diagnoza</h4>
                      <p className="whitespace-pre-wrap">{complaint.diagnosis}</p>
                    </div>
                  </>
                )}

                {/* Service Notes */}
                {complaint.service_notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Notatki serwisowe
                      </h4>
                      <p className="whitespace-pre-wrap">{complaint.service_notes}</p>
                    </div>
                  </>
                )}

                {/* Used Parts */}
                {usedParts.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Wymienione części
                      </h4>
                      <div className="space-y-2">
                        {usedParts.map((part) => (
                          <div key={part.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                            <span>{part.spare_part_name}</span>
                            <span className="font-medium">{Number(part.spare_part_price).toFixed(2)} PLN</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between p-2 border-t pt-3 mt-2">
                          <span className="font-medium">Suma części:</span>
                          <span className="font-bold">
                            {usedParts.reduce((sum, part) => sum + Number(part.spare_part_price), 0).toFixed(2)} PLN
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Repair Cost */}
                {complaint.repair_cost !== null && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Całkowity koszt naprawy</h4>
                      <p className="text-lg font-semibold">{complaint.repair_cost.toFixed(2)} PLN</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status History */}
            {statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historia statusów</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statusHistory.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.old_status && (
                              <>
                                <Badge variant="outline">{statusLabels[entry.old_status] || entry.old_status}</Badge>
                                <span className="text-muted-foreground">→</span>
                              </>
                            )}
                            <Badge variant={getStatusVariant(entry.new_status)}>
                              {statusLabels[entry.new_status] || entry.new_status}
                            </Badge>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(entry.changed_at), "dd.MM.yyyy HH:mm", { locale: pl })}
                            {entry.profile && (
                              <span> • {entry.profile.first_name} {entry.profile.last_name || entry.profile.email}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Checklista weryfikacyjna
                </CardTitle>
                <CardDescription>
                  Sprawdź poprawność działania urządzenia przed wysyłką
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-md">
                    <Checkbox 
                      id="check-power" 
                      checked={checkPowerOn}
                      onCheckedChange={(checked) => setCheckPowerOn(checked === true)}
                    />
                    <Label htmlFor="check-power" className="flex-1 cursor-pointer">
                      Czy urządzenie się włącza?
                    </Label>
                    {checkPowerOn ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-md">
                    <Checkbox 
                      id="check-gps" 
                      checked={checkGPS}
                      onCheckedChange={(checked) => setCheckGPS(checked === true)}
                    />
                    <Label htmlFor="check-gps" className="flex-1 cursor-pointer">
                      Czy złapał zasięg GPS?
                    </Label>
                    {checkGPS ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-md">
                    <Checkbox 
                      id="check-gsm" 
                      checked={checkGSM}
                      onCheckedChange={(checked) => setCheckGSM(checked === true)}
                    />
                    <Label htmlFor="check-gsm" className="flex-1 cursor-pointer">
                      Czy złapał zasięg GSM?
                    </Label>
                    {checkGSM ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-md">
                    <Checkbox 
                      id="check-sound" 
                      checked={checkSound}
                      onCheckedChange={(checked) => setCheckSound(checked === true)}
                    />
                    <Label htmlFor="check-sound" className="flex-1 cursor-pointer">
                      Czy jest dźwięk?
                    </Label>
                    {checkSound ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  {allChecksCompleted ? (
                    <Button 
                      onClick={handleVerify} 
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Zapisywanie..." : "Zweryfikuj urządzenie"}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleReturnToService} 
                      disabled={isSubmitting}
                      variant="destructive"
                    >
                      {isSubmitting ? "Zapisywanie..." : "Powrót do serwisu"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
