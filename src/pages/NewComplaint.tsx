import { useState, useEffect } from 'react';
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
  const [serviceOptions, setServiceOptions] = useState<any[]>([]);
  const [packageContents, setPackageContents] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});
  const [selectedPackages, setSelectedPackages] = useState<Record<string, boolean>>({});

  const isBusinessPartner = userProfile?.user_type === 'business_partner';

  const [formData, setFormData] = useState({
    warrantyRepair: false,
    deviceType: '',
    deviceSerialNumber: '',
    damageDescription: '',
    returnFirstName: userProfile?.first_name || '',
    returnLastName: userProfile?.last_name || '',
    returnStreet: '',
    returnPostalCode: '',
    returnCity: '',
    returnPhone: userProfile?.phone_number || '',
    returnEmail: userProfile?.email || '',
    acceptedTerms: false,
    internalComplaintNumber: '',
    // Document type: 'receipt' or 'invoice'
    documentType: 'receipt' as 'receipt' | 'invoice',
    // VAT Invoice fields
    invoiceCompanyName: '',
    invoiceVatId: '',
    invoiceAddress: '',
    invoicePostalCode: '',
    invoiceCity: '',
  });

  // Update form data when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        returnFirstName: prev.returnFirstName || userProfile.first_name || '',
        returnLastName: prev.returnLastName || userProfile.last_name || '',
        returnPhone: prev.returnPhone || userProfile.phone_number || '',
        returnEmail: prev.returnEmail || userProfile.email || '',
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [servicesRes, packagesRes] = await Promise.all([
          supabase.from('service_options').select('*').eq('is_active', true).order('display_order'),
          supabase.from('package_contents').select('*').eq('is_active', true).order('display_order')
        ]);

        if (servicesRes.data) setServiceOptions(servicesRes.data);
        if (packagesRes.data) setPackageContents(packagesRes.data);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

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
      // Build package content fields dynamically
      const packageData: Record<string, boolean> = {};
      packageContents.forEach((item) => {
        const fieldKey = `package_${item.name.toLowerCase().replace(/\s+/g, '_')}`;
        packageData[fieldKey] = selectedPackages[item.id] || false;
      });

      const complaintData: any = {
        user_id: userProfile?.user_id,
        device_type: formData.deviceType,
        device_serial_number: formData.deviceSerialNumber,
        damage_description: formData.damageDescription,
        warranty_repair: formData.warrantyRepair,
        return_first_name: formData.returnFirstName,
        return_last_name: formData.returnLastName,
        return_street: formData.returnStreet,
        return_postal_code: formData.returnPostalCode,
        return_city: formData.returnCity,
        return_phone: formData.returnPhone,
        return_email: formData.returnEmail,
        ...packageData,
      };

      // Add VAT invoice data only if invoice document type is selected
      if (formData.documentType === 'invoice') {
        complaintData.invoice_company_name = formData.invoiceCompanyName;
        complaintData.invoice_vat_id = formData.invoiceVatId;
        complaintData.invoice_address = formData.invoiceAddress;
        complaintData.invoice_postal_code = formData.invoicePostalCode;
        complaintData.invoice_city = formData.invoiceCity;
      }

      // Add internal complaint number for business partners
      if (isBusinessPartner && formData.internalComplaintNumber) {
        complaintData.internal_complaint_number = formData.internalComplaintNumber;
      }

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

                  {serviceOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${option.id}`}
                        checked={selectedServices[option.id] || false}
                        onCheckedChange={(checked) => 
                          setSelectedServices(prev => ({ ...prev, [option.id]: !!checked }))
                        }
                      />
                      <Label htmlFor={`service-${option.id}`}>
                        {option.name} (+{option.price.toFixed(2)} zł)
                      </Label>
                    </div>
                  ))}
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

          {/* Document Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Dokument sprzedaży</CardTitle>
              <CardDescription>Wybierz rodzaj dokumentu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.documentType}
                onValueChange={(value: 'receipt' | 'invoice') => 
                  setFormData(prev => ({ ...prev, documentType: value }))
                }
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="receipt" id="receipt" />
                  <Label htmlFor="receipt">Paragon</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invoice" id="invoice" />
                  <Label htmlFor="invoice">Faktura VAT</Label>
                </div>
              </RadioGroup>

              {/* VAT Invoice fields - only when invoice is selected */}
              {formData.documentType === 'invoice' && (
                <div className="mt-6 pt-6 border-t space-y-6">
                  <h4 className="font-medium">Dane do faktury VAT</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="invoiceCompanyName">Nazwa firmy *</Label>
                      <Input
                        id="invoiceCompanyName"
                        value={formData.invoiceCompanyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceCompanyName: e.target.value }))}
                        placeholder="Nazwa firmy lub imię i nazwisko"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="invoiceVatId">NIP *</Label>
                      <Input
                        id="invoiceVatId"
                        value={formData.invoiceVatId}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceVatId: e.target.value }))}
                        placeholder="Numer NIP"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="invoiceAddress">Adres *</Label>
                      <Input
                        id="invoiceAddress"
                        value={formData.invoiceAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceAddress: e.target.value }))}
                        placeholder="Ulica i numer"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="invoicePostalCode">Kod pocztowy *</Label>
                      <Input
                        id="invoicePostalCode"
                        value={formData.invoicePostalCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoicePostalCode: e.target.value }))}
                        placeholder="00-000"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="invoiceCity">Miejscowość *</Label>
                      <Input
                        id="invoiceCity"
                        value={formData.invoiceCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceCity: e.target.value }))}
                        placeholder="Miejscowość"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
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
                {packageContents.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`package-${item.id}`}
                      checked={selectedPackages[item.id] || false}
                      onCheckedChange={(checked) => 
                        setSelectedPackages(prev => ({ ...prev, [item.id]: !!checked }))
                      }
                    />
                    <Label htmlFor={`package-${item.id}`}>{item.name}</Label>
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