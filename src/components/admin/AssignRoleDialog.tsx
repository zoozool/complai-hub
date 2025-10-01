import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AssignRoleDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignRoleDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: AssignRoleDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    if (user?.user_roles && user.user_roles.length > 0) {
      setSelectedRole(user.user_roles[0].role);
    } else {
      setSelectedRole('');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, remove all existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id);

      if (deleteError) throw deleteError;

      // Then add the new role if one was selected
      if (selectedRole) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert([{ user_id: user.user_id, role: selectedRole as any }]);

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: selectedRole 
          ? "User role assigned successfully" 
          : "User role removed successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error managing user role:', error);
      toast({
        title: "Error",
        description: "Failed to manage user role",
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
          <DialogTitle>Manage User Role</DialogTitle>
          <DialogDescription>
            Assign or remove administrative roles for this user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Role (Regular User)</SelectItem>
                <SelectItem value="main_administrator">Main Administrator</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="service_technician">Service Technician</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-1 text-sm">
            <p><strong>User:</strong> {user?.email}</p>
            <p><strong>Current Role:</strong> {
              user?.user_roles && user.user_roles.length > 0 
                ? user.user_roles[0].role.replace('_', ' ').toUpperCase()
                : 'No Role'
            }</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
