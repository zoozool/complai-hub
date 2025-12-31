import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Shield, Building, User } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
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
          title: "Błąd logowania",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
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
        title: "Błąd rejestracji",
        description: "Hasła nie są identyczne",
        variant: "destructive",
      });
      return;
    }

    if (registerForm.password.length < 6) {
      toast({
        title: "Błąd rejestracji",
        description: "Hasło musi mieć co najmniej 6 znaków",
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
          title: "Błąd rejestracji",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Rejestracja udana",
          description: "Sprawdź swoją skrzynkę e-mail, aby potwierdzić konto",
        });
        setActiveTab('signin');
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: "Błąd",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "E-mail wysłany",
          description: "Sprawdź swoją skrzynkę e-mail, aby zresetować hasło.",
        });
        setForgotPasswordOpen(false);
        setForgotPasswordEmail('');
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
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
          <p className="text-muted-foreground mt-2">Portal zarządzania reklamacjami</p>
        </div>

        <Card className="shadow-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Logowanie</TabsTrigger>
              <TabsTrigger value="register">Rejestracja</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <CardHeader>
                <CardTitle>Witaj ponownie</CardTitle>
                <CardDescription>Zaloguj się, aby zarządzać reklamacjami</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="twoj@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Hasło</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => setLoginForm(prev => ({ ...prev, rememberMe: checked === true }))}
                      />
                      <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                        Zapamiętaj mnie
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Zapomniałeś hasła?
                    </button>
                  </div>
                  
                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Konta demo:</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Klient indywidualny:</strong> test.client@example.com / Test123!</p>
                      <p><strong>Partner biznesowy:</strong> test.partner@example.com / Partner123!</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Zaloguj się
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Utwórz konto</CardTitle>
                <CardDescription>Zarejestruj się, aby zgłaszać reklamacje</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Typ konta</Label>
                    <RadioGroup
                      value={registerForm.userType}
                      onValueChange={(value) => setRegisterForm(prev => ({ ...prev, userType: value }))}
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Klient indywidualny
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business_partner" id="business" />
                        <Label htmlFor="business" className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          Partner biznesowy
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Imię</Label>
                      <Input
                        id="firstName"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nazwisko</Label>
                      <Input
                        id="lastName"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="twoj@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Numer telefonu</Label>
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
                        <Label htmlFor="companyName">Nazwa firmy</Label>
                        <Input
                          id="companyName"
                          value={registerForm.companyName}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, companyName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="vatId">NIP</Label>
                        <Input
                          id="vatId"
                          value={registerForm.vatId}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, vatId: e.target.value }))}
                          placeholder="123-456-78-90"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyAddress">Adres firmy</Label>
                        <Input
                          id="companyAddress"
                          value={registerForm.companyAddress}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, companyAddress: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceEmail">E-mail kontaktowy serwisu</Label>
                        <Input
                          id="serviceEmail"
                          type="email"
                          value={registerForm.serviceContactEmail}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, serviceContactEmail: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="servicePhone">Telefon kontaktowy serwisu</Label>
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
                      <Label htmlFor="register-password">Hasło</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
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
                    Utwórz konto
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetowanie hasła</DialogTitle>
            <DialogDescription>
              Wprowadź swój adres e-mail, a wyślemy Ci link do zresetowania hasła.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="forgot-email">E-mail</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="twoj@email.com"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setForgotPasswordOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" disabled={isSendingReset}>
                {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Wyślij link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
