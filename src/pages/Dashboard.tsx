import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Calendar, Package, Truck, Hash, Building, User } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const { isTechnician } = useRole();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isBusinessPartner = userProfile?.user_type === 'business_partner';

  // Redirect technicians to admin dashboard
  if (isTechnician()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('submission_date', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (complaint: any) => {
    if (complaint.completion_date) {
      return <Badge variant="secondary" className="bg-success text-success-foreground">Completed</Badge>;
    } else if (complaint.incoming_tracking_number || complaint.outgoing_tracking_number) {
      return <Badge variant="secondary" className="bg-info text-info-foreground">In Progress</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Submitted</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-card rounded-lg p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome back, {isBusinessPartner 
                  ? userProfile?.company_name 
                  : `${userProfile?.first_name} ${userProfile?.last_name}`
                }
              </h2>
              <p className="text-muted-foreground">
                {isBusinessPartner 
                  ? 'Manage your business complaints and schedule pickups'
                  : 'Track your device complaints and repair status'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              {isBusinessPartner ? (
                <Building className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">
                {isBusinessPartner ? 'Business Partner' : 'Individual Client'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {complaints.filter((c: any) => 
                  !c.completion_date && (c.incoming_tracking_number || c.outgoing_tracking_number)
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {complaints.filter((c: any) => c.completion_date).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Complaints</span>
              <div className="flex gap-2">
                {!isBusinessPartner && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/order-courier')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Order Courier / Parcel Locker
                  </Button>
                )}
                <Button onClick={() => navigate('/new-complaint')}>
                  Submit New Complaint
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {complaints.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No complaints yet</h3>
                <p className="text-muted-foreground mb-4">
                  Submit your first complaint to get started
                </p>
                <Button onClick={() => navigate('/new-complaint')}>
                  Submit Complaint
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-dashboard-table-header">
                      <TableHead>Device Serial</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Incoming Tracking</TableHead>
                      <TableHead>Outgoing Tracking</TableHead>
                      {isBusinessPartner && <TableHead>Internal #</TableHead>}
                      <TableHead>Completion Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint: any) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            onClick={() => navigate(`/complaint/${complaint.id}`)}
                            className="p-0 h-auto font-medium text-primary hover:underline"
                          >
                            {complaint.device_serial_number}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(complaint.submission_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(complaint)}</TableCell>
                        <TableCell>
                          {complaint.incoming_tracking_number ? (
                            <Badge variant="outline">{complaint.incoming_tracking_number}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {complaint.outgoing_tracking_number ? (
                            <Badge variant="outline">{complaint.outgoing_tracking_number}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        {isBusinessPartner && (
                          <TableCell>
                            {complaint.internal_complaint_number ? (
                              <div className="flex items-center space-x-1">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{complaint.internal_complaint_number}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          {complaint.completion_date ? (
                            formatDate(complaint.completion_date)
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/complaint/${complaint.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;