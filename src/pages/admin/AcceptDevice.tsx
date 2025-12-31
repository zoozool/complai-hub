import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/hooks/useRole";
import { Package, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AcceptDevice() {
  const { isAdmin, isEmployee, loading: roleLoading } = useRole();
  const { toast } = useToast();
  const [packageNumber, setPackageNumber] = useState("");
  const [deviceNumber, setDeviceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foundComplaint, setFoundComplaint] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!packageNumber.trim() || !deviceNumber.trim()) {
      toast({
        title: "Błąd",
        description: "Wypełnij wszystkie pola",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find complaint by device serial number
      const { data: complaint, error: findError } = await supabase
        .from("complaints")
        .select("id, device_serial_number, device_type, status, internal_complaint_number")
        .eq("device_serial_number", deviceNumber.trim())
        .maybeSingle();

      if (findError) throw findError;

      if (!complaint) {
        toast({
          title: "Nie znaleziono",
          description: `Nie znaleziono reklamacji dla urządzenia: ${deviceNumber}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if device was already accepted (status is not 'submitted')
      if (complaint.status !== "submitted") {
        toast({
          title: "Urządzenie już przyjęte",
          description: `To urządzenie zostało już przyjęte do serwisu. Aktualny status: ${complaint.status}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update complaint status to 'received' and set package number
      const { error: updateError } = await supabase
        .from("complaints")
        .update({
          status: "received",
          incoming_tracking_number: packageNumber.trim(),
        })
        .eq("id", complaint.id);

      if (updateError) throw updateError;

      // Log status change in history
      await supabase
        .from("complaint_status_history")
        .insert({
          complaint_id: complaint.id,
          old_status: complaint.status,
          new_status: "received",
          changed_by: user?.id,
        });

      setFoundComplaint(complaint);
      
      toast({
        title: "Urządzenie przyjęte",
        description: `Reklamacja ${complaint.internal_complaint_number || complaint.id} - status zmieniony na "Przyjęto do serwisu"`,
      });
      
      setPackageNumber("");
      setDeviceNumber("");
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

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Dane przesyłki
            </CardTitle>
            <CardDescription>
              Wprowadź numery paczki i urządzenia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceNumber" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Numer urządzenia
                </Label>
                <Input
                  id="deviceNumber"
                  placeholder="Wprowadź numer urządzenia"
                  value={deviceNumber}
                  onChange={(e) => setDeviceNumber(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Przetwarzanie..." : "Przyjmij urządzenie"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
