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
import { Package, Smartphone, CheckCircle, AlertCircle, Search, History, ArrowLeft } from "lucide-react";
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
  screen_protection_foil: boolean;
  package_device: boolean;
  package_original_packaging: boolean;
  package_mount: boolean;
  package_adapter: boolean;
  package_usb_cable: boolean;
  package_receipt_copy: boolean;
  return_first_name: string;
  return_last_name: string;
  return_email: string;
  return_phone: string;
  return_street: string;
  return_postal_code: string;
  return_city: string;
  submission_date: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  submitted: "Zgłoszone",
  received: "W serwisie",
  in_progress: "W naprawie",
  completed: "Zakończone",
  shipped: "Wysłane",
  cancelled: "Anulowane",
};

const getStatusVariant = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    submitted: "outline",
    received: "secondary",
    in_progress: "default",
    completed: "default",
    shipped: "default",
    cancelled: "destructive",
  };
  return variants[status] || "outline";
};

export default function AcceptDevice() {
  const { isAdmin, isEmployee, loading: roleLoading } = useRole();
  const { toast } = useToast();
  const [packageNumber, setPackageNumber] = useState("");
  const [deviceNumber, setDeviceNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search results
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(null);
  const [previousComplaints, setPreviousComplaints] = useState<Complaint[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Package content confirmation
  const [confirmedDevice, setConfirmedDevice] = useState(false);
  const [confirmedPackaging, setConfirmedPackaging] = useState(false);
  const [confirmedMount, setConfirmedMount] = useState(false);
  const [confirmedAdapter, setConfirmedAdapter] = useState(false);
  const [confirmedUsb, setConfirmedUsb] = useState(false);
  const [confirmedReceipt, setConfirmedReceipt] = useState(false);

  const resetConfirmations = () => {
    setConfirmedDevice(false);
    setConfirmedPackaging(false);
    setConfirmedMount(false);
    setConfirmedAdapter(false);
    setConfirmedUsb(false);
    setConfirmedReceipt(false);
  };

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
    resetConfirmations();
    
    try {
      // Find all complaints for this device, ordered by date
      const { data: complaints, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("device_serial_number", deviceNumber.trim())
        .order("submission_date", { ascending: false });

      if (error) throw error;

      if (!complaints || complaints.length === 0) {
        setCurrentComplaint(null);
        setPreviousComplaints([]);
        setSearchPerformed(true);
        toast({
          title: "Nie znaleziono",
          description: `Nie znaleziono reklamacji dla urządzenia: ${deviceNumber}`,
          variant: "destructive",
        });
        return;
      }

      // Latest complaint is the first one
      setCurrentComplaint(complaints[0]);
      setPreviousComplaints(complaints.slice(1));
      setSearchPerformed(true);
      
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

  const handleAccept = async () => {
    if (!currentComplaint) return;
    
    // Check if device was already accepted
    if (currentComplaint.status !== "submitted") {
      toast({
        title: "Urządzenie już przyjęte",
        description: `To urządzenie zostało już przyjęte. Aktualny status: ${statusLabels[currentComplaint.status] || currentComplaint.status}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update complaint status to 'received' and set package number
      const { error: updateError } = await supabase
        .from("complaints")
        .update({
          status: "received",
          incoming_tracking_number: packageNumber.trim(),
        })
        .eq("id", currentComplaint.id);

      if (updateError) throw updateError;

      // Log status change in history
      await supabase
        .from("complaint_status_history")
        .insert({
          complaint_id: currentComplaint.id,
          old_status: currentComplaint.status,
          new_status: "received",
          changed_by: user?.id,
        });

      toast({
        title: "Urządzenie przyjęte",
        description: `Reklamacja ${currentComplaint.internal_complaint_number || currentComplaint.id} - status zmieniony na "W serwisie"`,
      });
      
      // Reset form
      setPackageNumber("");
      setDeviceNumber("");
      setCurrentComplaint(null);
      setPreviousComplaints([]);
      setSearchPerformed(false);
      resetConfirmations();
      
    } catch (error: any) {
      console.error("Error accepting device:", error);
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się przyjąć urządzenia",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPackageNumber("");
    setDeviceNumber("");
    setCurrentComplaint(null);
    setPreviousComplaints([]);
    setSearchPerformed(false);
    resetConfirmations();
  };

  // Check if all declared items are confirmed
  const allItemsConfirmed = () => {
    if (!currentComplaint) return false;
    
    // Check each declared item
    if (currentComplaint.package_device && !confirmedDevice) return false;
    if (currentComplaint.package_original_packaging && !confirmedPackaging) return false;
    if (currentComplaint.package_mount && !confirmedMount) return false;
    if (currentComplaint.package_adapter && !confirmedAdapter) return false;
    if (currentComplaint.package_usb_cable && !confirmedUsb) return false;
    if (currentComplaint.package_receipt_copy && !confirmedReceipt) return false;
    
    return true;
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
          <h1 className="text-3xl font-bold tracking-tight">Przyjmij urządzenie</h1>
          <p className="text-muted-foreground">
            Formularz do przyjmowania paczek i urządzeń na serwis
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
                Wprowadź numery paczki i urządzenia aby wyszukać zgłoszenie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="packageNumber" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Numer paczki
                  </Label>
                  <Input
                    id="packageNumber"
                    placeholder="Wprowadź numer paczki"
                    value={packageNumber}
                    onChange={(e) => setPackageNumber(e.target.value)}
                    disabled={isSearching}
                  />
                </div>

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

        {/* Complaint Details */}
        {searchPerformed && currentComplaint && (
          <div className="space-y-6">
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Wróć do wyszukiwania
            </Button>

            {/* Current Complaint Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Aktualne zgłoszenie RMA
                  </CardTitle>
                  <Badge variant={getStatusVariant(currentComplaint.status)}>
                    {statusLabels[currentComplaint.status] || currentComplaint.status}
                  </Badge>
                </div>
                <CardDescription>
                  {currentComplaint.internal_complaint_number || currentComplaint.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Device Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Typ urządzenia</h4>
                    <p>{currentComplaint.device_type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Numer seryjny</h4>
                    <p>{currentComplaint.device_serial_number}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Data zgłoszenia</h4>
                    <p>{format(new Date(currentComplaint.submission_date), "dd MMMM yyyy, HH:mm", { locale: pl })}</p>
                  </div>
                  <div className="flex gap-2">
                    {currentComplaint.warranty_repair && <Badge variant="secondary">Gwarancja</Badge>}
                    {currentComplaint.express_repair && <Badge variant="default">Express</Badge>}
                    {currentComplaint.screen_protection_foil && <Badge variant="outline">Folia ochronna</Badge>}
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Opis uszkodzenia</h4>
                  <p className="whitespace-pre-wrap">{currentComplaint.damage_description}</p>
                </div>

                <Separator />

                {/* Return Address */}
                <div>
                  <h4 className="font-medium mb-2">Dane do zwrotu</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Imię i nazwisko:</span>
                      <p>{currentComplaint.return_first_name} {currentComplaint.return_last_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p>{currentComplaint.return_email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Telefon:</span>
                      <p>{currentComplaint.return_phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Adres:</span>
                      <p>{currentComplaint.return_street}, {currentComplaint.return_postal_code} {currentComplaint.return_city}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Package Contents Confirmation */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Weryfikacja zawartości paczki
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Potwierdź, że zawartość paczki zgadza się z deklaracją klienta:
                  </p>
                  
                  <div className="space-y-3">
                    {currentComplaint.package_device && (
                      <div className="flex items-center space-x-3 p-2 border rounded-md">
                        <Checkbox 
                          id="confirm-device" 
                          checked={confirmedDevice}
                          onCheckedChange={(checked) => setConfirmedDevice(checked === true)}
                        />
                        <Label htmlFor="confirm-device" className="flex-1 cursor-pointer">
                          Urządzenie
                        </Label>
                        {confirmedDevice ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    
                    {currentComplaint.package_original_packaging && (
                      <div className="flex items-center space-x-3 p-2 border rounded-md">
                        <Checkbox 
                          id="confirm-packaging" 
                          checked={confirmedPackaging}
                          onCheckedChange={(checked) => setConfirmedPackaging(checked === true)}
                        />
                        <Label htmlFor="confirm-packaging" className="flex-1 cursor-pointer">
                          Oryginalne opakowanie
                        </Label>
                        {confirmedPackaging ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    
                    {currentComplaint.package_mount && (
                      <div className="flex items-center space-x-3 p-2 border rounded-md">
                        <Checkbox 
                          id="confirm-mount" 
                          checked={confirmedMount}
                          onCheckedChange={(checked) => setConfirmedMount(checked === true)}
                        />
                        <Label htmlFor="confirm-mount" className="flex-1 cursor-pointer">
                          Uchwyt
                        </Label>
                        {confirmedMount ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    
                    {currentComplaint.package_adapter && (
                      <div className="flex items-center space-x-3 p-2 border rounded-md">
                        <Checkbox 
                          id="confirm-adapter" 
                          checked={confirmedAdapter}
                          onCheckedChange={(checked) => setConfirmedAdapter(checked === true)}
                        />
                        <Label htmlFor="confirm-adapter" className="flex-1 cursor-pointer">
                          Adapter / Ładowarka
                        </Label>
                        {confirmedAdapter ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    
                    {currentComplaint.package_usb_cable && (
                      <div className="flex items-center space-x-3 p-2 border rounded-md">
                        <Checkbox 
                          id="confirm-usb" 
                          checked={confirmedUsb}
                          onCheckedChange={(checked) => setConfirmedUsb(checked === true)}
                        />
                        <Label htmlFor="confirm-usb" className="flex-1 cursor-pointer">
                          Kabel USB
                        </Label>
                        {confirmedUsb ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    
                    {currentComplaint.package_receipt_copy && (
                      <div className="flex items-center space-x-3 p-2 border rounded-md">
                        <Checkbox 
                          id="confirm-receipt" 
                          checked={confirmedReceipt}
                          onCheckedChange={(checked) => setConfirmedReceipt(checked === true)}
                        />
                        <Label htmlFor="confirm-receipt" className="flex-1 cursor-pointer">
                          Kopia paragonu/faktury
                        </Label>
                        {confirmedReceipt ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Accept Button */}
                <div className="flex flex-col gap-2">
                  {currentComplaint.status !== "submitted" ? (
                    <div className="p-4 bg-muted rounded-md text-center">
                      <AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        To urządzenie zostało już przyjęte ({statusLabels[currentComplaint.status] || currentComplaint.status})
                      </p>
                    </div>
                  ) : !allItemsConfirmed() ? (
                    <div className="p-4 bg-muted rounded-md text-center">
                      <AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Potwierdź wszystkie zadeklarowane elementy paczki aby przyjąć urządzenie
                      </p>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleAccept} 
                      disabled={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Przyjmowanie..." : "Przyjmij urządzenie"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Previous Complaints */}
            {previousComplaints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historia zgłoszeń dla tego urządzenia ({previousComplaints.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {previousComplaints.map((complaint) => (
                      <div key={complaint.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {complaint.internal_complaint_number || complaint.id.slice(0, 8)}
                          </span>
                          <Badge variant={getStatusVariant(complaint.status)}>
                            {statusLabels[complaint.status] || complaint.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Data: {format(new Date(complaint.submission_date), "dd.MM.yyyy HH:mm", { locale: pl })}</p>
                          <p className="line-clamp-2">{complaint.damage_description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* No results message */}
        {searchPerformed && !currentComplaint && (
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Nie znaleziono zgłoszenia</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Brak reklamacji dla numeru seryjnego: {deviceNumber}
                </p>
                <Button onClick={handleReset}>Wyszukaj ponownie</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
