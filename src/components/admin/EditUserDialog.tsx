import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface EditUserDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    company_name: '',
    vat_id: '',
    company_address: '',
    service_contact_phone: '',
    service_contact_email: '',
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        company_name: user.company_name || '',
        vat_id: user.vat_id || '',
        company_address: user.company_address || '',
        service_contact_phone: user.service_contact_phone || '',
        service_contact_email: user.service_contact_email || '',
        is_active: user.is_active ?? true,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User details updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent successfully",
      });
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setSendingReset(false);
    }
  };

  const handleToggleActive = () => {
    setFormData({ ...formData, is_active: !formData.is_active });
    setShowDeactivateDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Account Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.is_active ? 'Account is active' : 'Account is deactivated'}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={() => setShowDeactivateDialog(true)}
              />
            </div>

            {/* Password Reset */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Password Reset</Label>
                <p className="text-sm text-muted-foreground">
                  Send password reset email to {user?.email}
                </p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSendPasswordReset}
                disabled={sendingReset}
              >
                {sendingReset ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Reset Email
              </Button>
            </div>

            {user?.user_type === 'individual' ? (
              <>
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="vat_id">VAT ID</Label>
                  <Input
                    id="vat_id"
                    value={formData.vat_id}
                    onChange={(e) => setFormData({...formData, vat_id: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="company_address">Company Address</Label>
                  <Input
                    id="company_address"
                    value={formData.company_address}
                    onChange={(e) => setFormData({...formData, company_address: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="service_contact_phone">Service Contact Phone</Label>
                  <Input
                    id="service_contact_phone"
                    value={formData.service_contact_phone}
                    onChange={(e) => setFormData({...formData, service_contact_phone: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="service_contact_email">Service Contact Email</Label>
                  <Input
                    id="service_contact_email"
                    type="email"
                    value={formData.service_contact_email}
                    onChange={(e) => setFormData({...formData, service_contact_email: e.target.value})}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {formData.is_active ? 'Deactivate User Account?' : 'Activate User Account?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {formData.is_active 
                ? 'This will prevent the user from accessing the system. You can reactivate the account at any time.'
                : 'This will restore the user\'s access to the system.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive}>
              {formData.is_active ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}