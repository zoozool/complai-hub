import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, FileText, Users, Truck, CheckCircle, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-dashboard-header border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">ComplaiHub</h1>
                <p className="text-sm text-primary-foreground/70">Product Complaint Portal</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary-hover"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Professional Complaint Management System
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Streamline your device repair process with our comprehensive complaint tracking portal. 
              Submit complaints, track repair status, and manage returns efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-gradient-primary"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Why Choose ComplaiHub?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides everything you need to manage device complaints efficiently and transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-card">
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Easy Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Submit complaints quickly with our intuitive form system. Track device types, warranty status, and package contents.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <CardTitle>Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Monitor your complaint status, tracking numbers, and repair progress in real-time through your dashboard.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-info mx-auto mb-4" />
                <CardTitle>Business Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Dedicated business partner features with internal complaint numbers and pickup scheduling capabilities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="text-center">
                <Truck className="h-12 w-12 text-warning mx-auto mb-4" />
                <CardTitle>Pickup Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Business partners can schedule device pickups with pre-filled company information for streamlined logistics.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-card">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-muted-foreground mb-8">
            Join hundreds of customers and business partners who trust ComplaiHub for their device repair needs.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-primary"
          >
            Sign Up Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dashboard-header border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-primary mr-2" />
              <span className="text-primary-foreground font-medium">ComplaiHub</span>
            </div>
          </div>
          <p className="text-center text-primary-foreground/70 mt-4">
            Professional complaint management for device repairs and service tracking.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
