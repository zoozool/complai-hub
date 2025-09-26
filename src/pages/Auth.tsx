import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Loader2, Shield, Building, User } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'individual',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyName: '',
    vatId: '',
    companyAddress: '',
    serviceContactEmail: '',
    serviceContactPhone: '',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (registerForm.password.length < 6) {
      toast({
        title: "Registration Failed",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        user_type: registerForm.userType,
        first_name: registerForm.firstName,
        last_name: registerForm.lastName,
        phone_number: registerForm.phoneNumber,
        ...(registerForm.userType === 'business_partner' && {
          company_name: registerForm.companyName,
          vat_id: registerForm.vatId,
          company_address: registerForm.companyAddress,
          service_contact_email: registerForm.serviceContactEmail,
          service_contact_phone: registerForm.serviceContactPhone,
        }),
      };

      const { error } = await signUp(registerForm.email, registerForm.password, userData);
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Please check your email for verification instructions",
        });
        setActiveTab('signin');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ComplaiHub</h1>
          <p className="text-muted-foreground mt-2">Product Complaint Management Portal</p>
        </div>

        <Card className="shadow-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to your account to manage complaints</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Demo Accounts:</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Individual:</strong> test.client@example.com / Test123!</p>
                      <p><strong>Business:</strong> test.partner@example.com / Partner123!</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Register to start submitting complaints</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Account Type</Label>
                    <RadioGroup
                      value={registerForm.userType}
                      onValueChange={(value) => setRegisterForm(prev => ({ ...prev, userType: value }))}
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Individual Client
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business_partner" id="business" />
                        <Label htmlFor="business" className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          Business Partner
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={registerForm.phoneNumber}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+48 123 456 789"
                      required
                    />
                  </div>

                  {registerForm.userType === 'business_partner' && (
                    <>
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={registerForm.companyName}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, companyName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="vatId">VAT ID (NIP)</Label>
                        <Input
                          id="vatId"
                          value={registerForm.vatId}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, vatId: e.target.value }))}
                          placeholder="123-456-78-90"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyAddress">Company Address</Label>
                        <Input
                          id="companyAddress"
                          value={registerForm.companyAddress}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, companyAddress: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceEmail">Service Contact Email</Label>
                        <Input
                          id="serviceEmail"
                          type="email"
                          value={registerForm.serviceContactEmail}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, serviceContactEmail: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="servicePhone">Service Contact Phone</Label>
                        <Input
                          id="servicePhone"
                          value={registerForm.serviceContactPhone}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, serviceContactPhone: e.target.value }))}
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;