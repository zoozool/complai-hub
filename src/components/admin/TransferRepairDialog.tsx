import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Technician {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface TransferRepairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaintId: string;
  onSuccess: () => void;
}

export function TransferRepairDialog({
  open,
  onOpenChange,
  complaintId,
  onSuccess,
}: TransferRepairDialogProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTechnicians();
    }
  }, [open]);

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      // Get all users with service_technician role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "service_technician");

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        setTechnicians([]);
        setLoading(false);
        return;
      }

      const technicianIds = roles.map((r) => r.user_id);

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, first_name, last_name")
        .in("user_id", technicianIds);

      if (profilesError) throw profilesError;

      setTechnicians(profiles || []);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy techników.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedTechnician) {
      toast({
        title: "Wybierz technika",
        description: "Musisz wybrać technika, do którego przekażesz naprawę.",
        variant: "destructive",
      });
      return;
    }

    setTransferring(true);
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ assigned_technician_id: selectedTechnician })
        .eq("id", complaintId);

      if (error) throw error;

      const selectedTech = technicians.find((t) => t.user_id === selectedTechnician);
      const techName = selectedTech
        ? `${selectedTech.first_name || ""} ${selectedTech.last_name || ""}`.trim() || selectedTech.email
        : "innego technika";

      toast({
        title: "Naprawa przekazana",
        description: `Naprawa została przekazana do: ${techName}`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error transferring repair:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się przekazać naprawy.",
        variant: "destructive",
      });
    } finally {
      setTransferring(false);
    }
  };

  const getTechnicianDisplayName = (tech: Technician) => {
    const fullName = `${tech.first_name || ""} ${tech.last_name || ""}`.trim();
    return fullName || tech.email;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Przekaż naprawę
          </DialogTitle>
          <DialogDescription>
            Wybierz technika, któremu chcesz przekazać tę naprawę.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="technician">Technik</Label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Ładowanie listy techników...
              </div>
            ) : technicians.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">
                Brak dostępnych techników.
              </p>
            ) : (
              <Select
                value={selectedTechnician}
                onValueChange={setSelectedTechnician}
              >
                <SelectTrigger id="technician" className="w-full">
                  <SelectValue placeholder="Wybierz technika..." />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {technicians.map((tech) => (
                    <SelectItem key={tech.user_id} value={tech.user_id}>
                      {getTechnicianDisplayName(tech)}
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({tech.email})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={transferring || !selectedTechnician || loading}
          >
            {transferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Przekazywanie...
              </>
            ) : (
              "Przekaż"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
