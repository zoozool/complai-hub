import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, ArrowLeft } from 'lucide-react';

export default function SchedulePickup() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company_name: userProfile?.company_name || '',
    vat_id: userProfile?.vat_id || '',
    address: userProfile?.company_address || '',
    service_contact_email: userProfile?.service_contact_email || '',
    service_contact_phone: userProfile?.service_contact_phone || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('pickup_requests')
        .insert({
          company_name: formData.company_name,
          vat_id: formData.vat_id,
          address: formData.address,
          service_contact_email: formData.service_contact_email,
          service_contact_phone: formData.service_contact_phone,
          user_id: userProfile?.user_id
        });

      if (error) throw error;

      toast({
        title: "Pickup Request Submitted",
        description: "Your pickup request has been submitted successfully. We will contact you to schedule the pickup.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting pickup request:', error);
      toast({
        title: "Error",
        description: "Failed to submit pickup request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant border-primary/10">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Schedule Device Pickup
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Request a pickup for your devices. All fields are pre-filled with your registration data but can be edited if needed.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vat_id">VAT ID (NIP)</Label>
                    <Input
                      id="vat_id"
                      name="vat_id"
                      value={formData.vat_id}
                      onChange={handleInputChange}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Company Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="border-primary/20 focus:border-primary min-h-[100px]"
                      placeholder="Enter complete company address including street, postal code, and city"
                    />
                  </div>

                  <div>
                    <Label htmlFor="service_contact_email">Service Contact Email</Label>
                    <Input
                      id="service_contact_email"
                      name="service_contact_email"
                      type="email"
                      value={formData.service_contact_email}
                      onChange={handleInputChange}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="service_contact_phone">Service Contact Phone</Label>
                    <Input
                      id="service_contact_phone"
                      name="service_contact_phone"
                      type="tel"
                      value={formData.service_contact_phone}
                      onChange={handleInputChange}
                      required
                      className="border-primary/20 focus:border-primary"
                      placeholder="+48 600 700 800"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3"
                  >
                    {loading ? 'Submitting...' : 'Schedule Pickup'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}