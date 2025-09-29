import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateComplaintDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateComplaintDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    device_type: '',
    device_serial_number: '',
    damage_description: '',
    reported_problem: '',
    return_first_name: '',
    return_last_name: '',
    return_email: '',
    return_phone: '',
    return_street: '',
    return_postal_code: '',
    return_city: '',
    warranty_repair: false,
    express_repair: false,
    screen_protection_foil: false,
    package_device: true,
    package_original_packaging: false,
    package_mount: false,
    package_adapter: false,
    package_usb_cable: false,
    package_receipt_copy: false,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, company_name, email, user_type')
          .order('first_name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('complaints')
        .insert([{
          ...formData,
          submission_date: new Date().toISOString(),
          status: 'submitted'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Complaint created successfully",
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        user_id: '',
        device_type: '',
        device_serial_number: '',
        damage_description: '',
        reported_problem: '',
        return_first_name: '',
        return_last_name: '',
        return_email: '',
        return_phone: '',
        return_street: '',
        return_postal_code: '',
        return_city: '',
        warranty_repair: false,
        express_repair: false,
        screen_protection_foil: false,
        package_device: true,
        package_original_packaging: false,
        package_mount: false,
        package_adapter: false,
        package_usb_cable: false,
        package_receipt_copy: false,
      });
    } catch (error) {
      console.error('Error creating complaint:', error);
      toast({
        title: "Error",
        description: "Failed to create complaint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: any) => {
    if (user.company_name) {
      return `${user.company_name} (${user.email})`;
    }
    return `${user.first_name} ${user.last_name} (${user.email})`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Complaint</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div>
            <Label htmlFor="user_id">Assign to User</Label>
            <Select value={formData.user_id} onValueChange={(value) => setFormData({...formData, user_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user: any) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {getUserDisplayName(user)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Device Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="device_type">Device Type</Label>
              <Select value={formData.device_type} onValueChange={(value) => setFormData({...formData, device_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="smartwatch">Smartwatch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="device_serial_number">Device Serial Number</Label>
              <Input
                id="device_serial_number"
                value={formData.device_serial_number}
                onChange={(e) => setFormData({...formData, device_serial_number: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="damage_description">Damage Description</Label>
            <Textarea
              id="damage_description"
              value={formData.damage_description}
              onChange={(e) => setFormData({...formData, damage_description: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="reported_problem">Reported Problem</Label>
            <Textarea
              id="reported_problem"
              value={formData.reported_problem}
              onChange={(e) => setFormData({...formData, reported_problem: e.target.value})}
            />
          </div>

          {/* Return Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Return Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="return_first_name">First Name</Label>
                <Input
                  id="return_first_name"
                  value={formData.return_first_name}
                  onChange={(e) => setFormData({...formData, return_first_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_last_name">Last Name</Label>
                <Input
                  id="return_last_name"
                  value={formData.return_last_name}
                  onChange={(e) => setFormData({...formData, return_last_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_email">Email</Label>
                <Input
                  id="return_email"
                  type="email"
                  value={formData.return_email}
                  onChange={(e) => setFormData({...formData, return_email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_phone">Phone</Label>
                <Input
                  id="return_phone"
                  value={formData.return_phone}
                  onChange={(e) => setFormData({...formData, return_phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_street">Street Address</Label>
                <Input
                  id="return_street"
                  value={formData.return_street}
                  onChange={(e) => setFormData({...formData, return_street: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_postal_code">Postal Code</Label>
                <Input
                  id="return_postal_code"
                  value={formData.return_postal_code}
                  onChange={(e) => setFormData({...formData, return_postal_code: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_city">City</Label>
                <Input
                  id="return_city"
                  value={formData.return_city}
                  onChange={(e) => setFormData({...formData, return_city: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Service Options</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'warranty_repair', label: 'Warranty Repair' },
                { key: 'express_repair', label: 'Express Repair' },
                { key: 'screen_protection_foil', label: 'Screen Protection Foil' },
              ].map(option => (
                <div key={option.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.key}
                    checked={formData[option.key as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) => setFormData({...formData, [option.key]: checked})}
                  />
                  <Label htmlFor={option.key}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Package Contents */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Package Contents</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'package_device', label: 'Device' },
                { key: 'package_original_packaging', label: 'Original Packaging' },
                { key: 'package_mount', label: 'Mount' },
                { key: 'package_adapter', label: 'Adapter' },
                { key: 'package_usb_cable', label: 'USB Cable' },
                { key: 'package_receipt_copy', label: 'Receipt Copy' },
              ].map(option => (
                <div key={option.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.key}
                    checked={formData[option.key as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) => setFormData({...formData, [option.key]: checked})}
                  />
                  <Label htmlFor={option.key}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.user_id}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Complaint
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}