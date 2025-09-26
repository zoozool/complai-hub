import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, FileText, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const deviceTypes = [
  'Yanosik RS',
  'Yanosik GT/GTR/GTS',
  'Yanosik XS',
  'Yanosik GTM',
  'Yanosik Alert',
  'Yanosik Connect'
];

const NewComplaint = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const isBusinessPartner = userProfile?.user_type === 'business_partner';

  const [formData, setFormData] = useState({
    warrantyRepair: false,
    expressRepair: false,
    deviceType: '',
    screenProtection: false,
    deviceSerialNumber: '',
    damageDescription: '',
    returnFirstName: userProfile?.first_name || '',
    returnLastName: userProfile?.last_name || '',
    returnStreet: '',
    returnPostalCode: '',
    returnCity: '',
    returnPhone: userProfile?.phone_number || '',
    returnEmail: userProfile?.email || '',
    packageDevice: false,
    packageOriginalPackaging: false,
    packageMount: false,
    packageAdapter: false,
    packageUsbCable: false,
    packageReceiptCopy: false,
    acceptedTerms: false,
    internalComplaintNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the RMA procedure terms to continue",
        variant: "destructive",
      });
      return;
    }

    if (!formData.deviceType || !formData.deviceSerialNumber || !formData.damageDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const complaintData = {
        user_id: userProfile?.user_id,
        device_type: formData.deviceType,
        device_serial_number: formData.deviceSerialNumber,
        damage_description: formData.damageDescription,
        warranty_repair: formData.warrantyRepair,
        express_repair: formData.expressRepair,
        screen_protection_foil: formData.screenProtection,
        return_first_name: formData.returnFirstName,
        return_last_name: formData.returnLastName,
        return_street: formData.returnStreet,
        return_postal_code: formData.returnPostalCode,
        return_city: formData.returnCity,
        return_phone: formData.returnPhone,
        return_email: formData.returnEmail,
        package_device: formData.packageDevice,
        package_original_packaging: formData.packageOriginalPackaging,
        package_mount: formData.packageMount,
        package_adapter: formData.packageAdapter,
        package_usb_cable: formData.packageUsbCable,
        package_receipt_copy: formData.packageReceiptCopy,
        ...(isBusinessPartner && formData.internalComplaintNumber && {
          internal_complaint_number: formData.internalComplaintNumber,
        }),
      };

      const { error } = await supabase
        .from('complaints')
        .insert(complaintData);

      if (error) throw error;

      setShowThankYou(true);
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit complaint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showThankYou) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-card">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">Complaint Submitted Successfully!</CardTitle>
              <CardDescription className="text-lg">
                Your complaint has been submitted. Please wait for contact from the technical department.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You will receive an email confirmation shortly with your complaint details and next steps.
                </p>
              </div>
              <div className="flex space-x-4 justify-center">
                <Button onClick={() => navigate('/dashboard')}>
                  View My Complaints
                </Button>
                <Button variant="outline" onClick={() => navigate('/new-complaint')}>
                  Submit Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Submit New Complaint</h2>
          <p className="text-muted-foreground">
            Fill out the form below to submit a device repair complaint. All required fields are marked with an asterisk (*).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Device Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="deviceType">Device Type *</Label>
                  <Select
                    value={formData.deviceType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, deviceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deviceSerialNumber">Device Serial Number *</Label>
                  <Input
                    id="deviceSerialNumber"
                    value={formData.deviceSerialNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, deviceSerialNumber: e.target.value }))}
                    placeholder="Enter serial number"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="damageDescription">Damage Description *</Label>
                <Textarea
                  id="damageDescription"
                  value={formData.damageDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, damageDescription: e.target.value }))}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  required
                />
              </div>

              {/* Service Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Service Options</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="warrantyRepair"
                      checked={formData.warrantyRepair}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, warrantyRepair: !!checked }))
                      }
                    />
                    <Label htmlFor="warrantyRepair">Warranty Repair</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="expressRepair"
                      checked={formData.expressRepair}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, expressRepair: !!checked }))
                      }
                    />
                    <Label htmlFor="expressRepair">Express Repair (+99 zł)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="screenProtection"
                      checked={formData.screenProtection}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, screenProtection: !!checked }))
                      }
                    />
                    <Label htmlFor="screenProtection">Screen Protection Foil Service (+49 zł)</Label>
                  </div>
                </div>
              </div>

              {isBusinessPartner && (
                <div>
                  <Label htmlFor="internalComplaintNumber">Internal Complaint Number</Label>
                  <Input
                    id="internalComplaintNumber"
                    value={formData.internalComplaintNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, internalComplaintNumber: e.target.value }))}
                    placeholder="Internal reference number"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Return Address */}
          <Card>
            <CardHeader>
              <CardTitle>Return Address</CardTitle>
              <CardDescription>Where should we send the repaired device?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="returnFirstName">First Name *</Label>
                  <Input
                    id="returnFirstName"
                    value={formData.returnFirstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnFirstName: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="returnLastName">Last Name *</Label>
                  <Input
                    id="returnLastName"
                    value={formData.returnLastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnLastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="returnStreet">Street Address *</Label>
                <Input
                  id="returnStreet"
                  value={formData.returnStreet}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnStreet: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="returnPostalCode">Postal Code *</Label>
                  <Input
                    id="returnPostalCode"
                    value={formData.returnPostalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnPostalCode: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="returnCity">City *</Label>
                  <Input
                    id="returnCity"
                    value={formData.returnCity}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnCity: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="returnPhone">Phone Number *</Label>
                  <Input
                    id="returnPhone"
                    value={formData.returnPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnPhone: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="returnEmail">Email *</Label>
                  <Input
                    id="returnEmail"
                    type="email"
                    value={formData.returnEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnEmail: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Contents */}
          <Card>
            <CardHeader>
              <CardTitle>Package Contents</CardTitle>
              <CardDescription>Select all items included in the package</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'packageDevice', label: 'Device', key: 'packageDevice' },
                  { id: 'packageOriginalPackaging', label: 'Original Packaging', key: 'packageOriginalPackaging' },
                  { id: 'packageMount', label: 'Mount', key: 'packageMount' },
                  { id: 'packageAdapter', label: 'Adapter', key: 'packageAdapter' },
                  { id: 'packageUsbCable', label: 'USB Cable', key: 'packageUsbCable' },
                  { id: 'packageReceiptCopy', label: 'Purchase Receipt Copy', key: 'packageReceiptCopy' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={formData[item.key as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, [item.key]: !!checked }))
                      }
                    />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Terms and Submit */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, acceptedTerms: !!checked }))
                    }
                  />
                  <Label htmlFor="acceptedTerms" className="text-sm">
                    I have read and accept the RMA procedure *
                  </Label>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.acceptedTerms}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Complaint
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewComplaint;