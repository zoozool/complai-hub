import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EditComplaintDialogProps {
  complaint: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userRole: string | null;
}

export function EditComplaintDialog({
  complaint,
  open,
  onOpenChange,
  onSuccess,
  userRole,
}: EditComplaintDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    diagnosis: '',
    repair_cost: '',
    service_notes: '',
    incoming_tracking_number: '',
    outgoing_tracking_number: '',
    completion_date: '',
  });

  const isAdmin = userRole === 'main_administrator';
  const isTechnician = userRole === 'service_technician';

  useEffect(() => {
    if (complaint) {
      setFormData({
        status: complaint.status || '',
        diagnosis: complaint.diagnosis || '',
        repair_cost: complaint.repair_cost || '',
        service_notes: complaint.service_notes || '',
        incoming_tracking_number: complaint.incoming_tracking_number || '',
        outgoing_tracking_number: complaint.outgoing_tracking_number || '',
        completion_date: complaint.completion_date ? 
          new Date(complaint.completion_date).toISOString().split('T')[0] : '',
      });
    }
  }, [complaint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {};

      // Admins can update everything, technicians can update status to in_progress or completed
      if (isAdmin) {
        updateData.status = formData.status;
      } else if (isTechnician) {
        // Technicians can only update status to in_progress or completed
        if (formData.status === 'in_progress' || formData.status === 'completed') {
          updateData.status = formData.status;
        }
      }

      if (isAdmin || isTechnician) {
        updateData.diagnosis = formData.diagnosis;
        updateData.repair_cost = formData.repair_cost ? parseFloat(formData.repair_cost) : null;
        updateData.service_notes = formData.service_notes;
        updateData.incoming_tracking_number = formData.incoming_tracking_number;
        updateData.outgoing_tracking_number = formData.outgoing_tracking_number;
        
        if (formData.completion_date) {
          updateData.completion_date = new Date(formData.completion_date).toISOString();
        }

        // Auto-update status if completion date is set
        if (formData.completion_date && !updateData.status) {
          updateData.status = 'completed';
        }
      }

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaint.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Complaint updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast({
        title: "Error",
        description: "Failed to update complaint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Complaint</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(isAdmin || isTechnician) && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {isAdmin && <SelectItem value="submitted">Submitted</SelectItem>}
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  {isAdmin && <SelectItem value="awaiting_shipment">Awaiting Shipment</SelectItem>}
                  {isAdmin && <SelectItem value="cancelled">Cancelled</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              placeholder="Enter diagnosis details"
            />
          </div>

          <div>
            <Label htmlFor="repair_cost">Repair Cost</Label>
            <Input
              id="repair_cost"
              type="number"
              step="0.01"
              value={formData.repair_cost}
              onChange={(e) => setFormData({...formData, repair_cost: e.target.value})}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="service_notes">Service Notes</Label>
            <Textarea
              id="service_notes"
              value={formData.service_notes}
              onChange={(e) => setFormData({...formData, service_notes: e.target.value})}
              placeholder="Enter service notes"
            />
          </div>

          <div>
            <Label htmlFor="incoming_tracking">Incoming Tracking Number</Label>
            <Input
              id="incoming_tracking"
              value={formData.incoming_tracking_number}
              onChange={(e) => setFormData({...formData, incoming_tracking_number: e.target.value})}
              placeholder="Enter incoming tracking number"
            />
          </div>

          <div>
            <Label htmlFor="outgoing_tracking">Outgoing Tracking Number</Label>
            <Input
              id="outgoing_tracking"
              value={formData.outgoing_tracking_number}
              onChange={(e) => setFormData({...formData, outgoing_tracking_number: e.target.value})}
              placeholder="Enter outgoing tracking number"
            />
          </div>

          <div>
            <Label htmlFor="completion_date">Completion Date</Label>
            <Input
              id="completion_date"
              type="date"
              value={formData.completion_date}
              onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Complaint
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}