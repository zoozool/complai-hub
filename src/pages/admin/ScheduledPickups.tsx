import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Loader2, Truck } from "lucide-react";

interface PickupRequest {
  id: string;
  company_name: string;
  vat_id: string;
  address: string;
  service_contact_email: string;
  service_contact_phone: string;
  status: string;
  requested_date: string;
  scheduled_date: string | null;
  created_at: string;
}

export default function ScheduledPickups() {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pickup_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPickups(data || []);
    } catch (error) {
      console.error("Error fetching pickup requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Oczekuje</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Zaplanowany</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Zrealizowany</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Anulowany</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: pl });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Zaplanowane odbiory</h1>
          <p className="text-muted-foreground">
            Lista zgłoszeń odbiorów od partnerów biznesowych
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zgłoszenia odbiorów ({pickups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pickups.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Brak zgłoszeń odbiorów
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Data zgłoszenia</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickups.map((pickup) => (
                  <TableRow key={pickup.id}>
                    <TableCell className="font-medium">
                      {pickup.company_name}
                    </TableCell>
                    <TableCell>{pickup.vat_id}</TableCell>
                    <TableCell>{pickup.address}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{pickup.service_contact_email}</div>
                        <div className="text-muted-foreground">
                          {pickup.service_contact_phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(pickup.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
