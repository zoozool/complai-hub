import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/hooks/useRole";
import { Package, Smartphone } from "lucide-react";

export default function AcceptDevice() {
  const { isAdmin, isEmployee, loading: roleLoading } = useRole();
  const { toast } = useToast();
  const [packageNumber, setPackageNumber] = useState("");
  const [deviceNumber, setDeviceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // TODO: Implement device acceptance logic
    // For now, just show a success message
    toast({
      title: "Urządzenie przyjęte",
      description: `Paczka: ${packageNumber}, Urządzenie: ${deviceNumber}`,
    });
    
    setPackageNumber("");
    setDeviceNumber("");
    setIsSubmitting(false);
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
