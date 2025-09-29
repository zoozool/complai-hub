import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AssignTechnicianDialogProps {
  complaint: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignTechnicianDialog({
  complaint,
  open,
  onOpenChange,
  onSuccess,
}: AssignTechnicianDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            profiles!inner(first_name, last_name)
          `)
          .eq('role', 'service_technician');

        if (error) throw error;
        setTechnicians(data || []);
      } catch (error) {
        console.error('Error fetching technicians:', error);
      }
    };

    if (open) {
      fetchTechnicians();
      setSelectedTechnician(complaint?.assigned_technician_id || '');
    }
  }, [open, complaint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          assigned_technician_id: selectedTechnician || null,
          status: selectedTechnician ? 'in_progress' : 'submitted'
        })
        .eq('id', complaint.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: selectedTechnician ? "Technician assigned successfully" : "Technician unassigned",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast({
        title: "Error",
        description: "Failed to assign technician",
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
          <DialogTitle>Assign Technician</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="technician">Select Technician</Label>
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassign</SelectItem>
                {technicians.map((tech: any) => (
                  <SelectItem key={tech.user_id} value={tech.user_id}>
                    {tech.profiles.first_name} {tech.profiles.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedTechnician ? 'Assign' : 'Unassign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}