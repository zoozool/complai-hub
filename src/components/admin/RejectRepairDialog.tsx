import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RejectRepairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaintId: string;
  deviceSerial: string;
  onSuccess: () => void;
}

export function RejectRepairDialog({
  open,
  onOpenChange,
  complaintId,
  deviceSerial,
  onSuccess,
}: RejectRepairDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ 
          assigned_technician_id: null,
          service_notes: reason.trim() ? `Powód odrzucenia: ${reason.trim()}` : null
        })
        .eq("id", complaintId);

      if (error) throw error;

      toast.success("Naprawa odrzucona");
      setReason("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error rejecting repair:", error);
      toast.error("Nie udało się odrzucić naprawy");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Odrzuć naprawę</DialogTitle>
          <DialogDescription>
            Urządzenie: {deviceSerial}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Powód odrzucenia (opcjonalnie)</Label>
            <Textarea
              id="reason"
              placeholder="Podaj powód odrzucenia naprawy..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Odrzuć naprawę
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
