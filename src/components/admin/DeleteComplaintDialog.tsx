import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteComplaintDialogProps {
  complaint: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteComplaintDialog({
  complaint,
  open,
  onOpenChange,
  onSuccess,
}: DeleteComplaintDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', complaint.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Complaint deleted successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast({
        title: "Error",
        description: "Failed to delete complaint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Complaint
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this complaint? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg">
          <p><strong>ID:</strong> {complaint?.internal_complaint_number || complaint?.id}</p>
          <p><strong>Device:</strong> {complaint?.device_serial_number}</p>
          <p><strong>Status:</strong> {complaint?.status}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Complaint
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}