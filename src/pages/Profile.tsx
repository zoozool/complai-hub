import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Profile data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  
  // Business partner fields
  const [companyName, setCompanyName] = useState('');
  const [vatId, setVatId] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [serviceContactEmail, setServiceContactEmail] = useState('');
  const [serviceContactPhone, setServiceContactPhone] = useState('');
  
  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const isBusinessPartner = userProfile?.user_type === 'business_partner';

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.first_name || '');
      setLastName(userProfile.last_name || '');
      setEmail(userProfile.email || '');
      setPhoneNumber(userProfile.phone_number || '');
      setStreet(userProfile.street || '');
      setPostalCode(userProfile.postal_code || '');
      setCity(userProfile.city || '');
      setCountry(userProfile.country || '');
      setCompanyName(userProfile.company_name || '');
      setVatId(userProfile.vat_id || '');
      setCompanyAddress(userProfile.company_address || '');
      setServiceContactEmail(userProfile.service_contact_email || '');
      setServiceContactPhone(userProfile.service_contact_phone || '');
    }
  }, [userProfile]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    
    try {
      // Verify old password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: oldPassword,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Old password is incorrect",
          variant: "destructive",
        });
        setPasswordLoading(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password changed successfully. Please log in again.",
      });

      // Sign out and redirect to auth page
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: any = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        street: street,
        postal_code: postalCode,
        city: city,
        country: country,
        updated_at: new Date().toISOString(),
      };

      if (isBusinessPartner) {
        updates.company_name = companyName;
        updates.vat_id = vatId;
        updates.company_address = companyAddress;
        updates.service_contact_email = serviceContactEmail;
        updates.service_contact_phone = serviceContactPhone;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {/* Change Password Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Old Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Profile Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Account Data */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Data */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Address Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Business Partner Fields */}
              {isBusinessPartner && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vatId">VAT ID (NIP)</Label>
                        <Input
                          id="vatId"
                          value={vatId}
                          onChange={(e) => setVatId(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyAddress">Company Address</Label>
                        <Input
                          id="companyAddress"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceContactEmail">Service Contact Email</Label>
                        <Input
                          id="serviceContactEmail"
                          type="email"
                          value={serviceContactEmail}
                          onChange={(e) => setServiceContactEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceContactPhone">Service Contact Phone</Label>
                        <Input
                          id="serviceContactPhone"
                          type="tel"
                          value={serviceContactPhone}
                          onChange={(e) => setServiceContactPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
