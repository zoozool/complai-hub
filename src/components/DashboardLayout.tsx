import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Navigate } from 'react-router-dom';
import { LogOut, Plus, Truck, FileText, Shield, Building, User, Settings, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, userProfile, signOut, loading } = useAuth();
  const { isAdmin, isEmployee, isTechnician } = useRole();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isBusinessPartner = userProfile?.user_type === 'business_partner';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-dashboard-header border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">ComplaiHub</h1>
                <p className="text-sm text-primary-foreground/70">
                  {isBusinessPartner ? 'Business Partner Portal' : 'Client Portal'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-primary-foreground">
                {isBusinessPartner ? (
                  <Building className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {isBusinessPartner 
                    ? userProfile?.company_name || 'Business Partner'
                    : `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 'User'
                  }
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 h-14">
            {!isTechnician() && (
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>My Complaints</span>
              </Button>
            )}

            {!isTechnician() && (
              <Button
                variant="ghost"
                onClick={() => navigate('/new-complaint')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Complaint</span>
              </Button>
            )}

            {isBusinessPartner && (
              <Button
                variant="ghost"
                onClick={() => navigate('/schedule-pickup')}
                className="flex items-center space-x-2"
              >
                <Truck className="h-4 w-4" />
                <span>Schedule Pickup</span>
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2"
            >
              <UserCircle className="h-4 w-4" />
              <span>My Profile</span>
            </Button>

            {(isAdmin() || isEmployee() || isTechnician()) && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Admin Panel</span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;