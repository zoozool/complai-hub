import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Package, 
  Truck, 
  CheckCircle,
  Hash,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Wrench,
  Shield
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isBusinessPartner = userProfile?.user_type === 'business_partner';

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setComplaint(data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!complaint) return null;
    
    if (complaint.completion_date) {
      return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    } else if (complaint.incoming_tracking_number || complaint.outgoing_tracking_number) {
      return <Badge className="bg-info text-info-foreground">In Progress</Badge>;
    } else {
      return <Badge className="bg-warning text-warning-foreground">Submitted</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM dd, yyyy HH:mm');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
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

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Complaint not found</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Main Info */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <FileText className="mr-3 h-6 w-6 text-primary" />
                  Complaint Details
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Device Serial: <span className="font-mono font-medium">{complaint.device_serial_number}</span>
                </p>
              </div>
              {isBusinessPartner && complaint.internal_complaint_number && (
                <div className="text-right">
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Hash className="h-3 w-3 mr-1" />
                    Internal Number
                  </div>
                  <p className="font-mono font-medium">{complaint.internal_complaint_number}</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Device Information */}
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <Wrench className="mr-2 h-4 w-4" />
                Device Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-muted-foreground">Device Type</span>
                  <p className="font-medium">{complaint.device_type}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Serial Number</span>
                  <p className="font-mono">{complaint.device_serial_number}</p>
                </div>
              </div>
            </div>

            {/* Damage Description */}
            <div>
              <h4 className="font-medium text-foreground mb-2">Damage Description</h4>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-foreground">{complaint.damage_description}</p>
              </div>
            </div>

            {/* Service Options */}
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Service Options
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-4 w-4 ${complaint.warranty_repair ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className={complaint.warranty_repair ? 'text-foreground' : 'text-muted-foreground'}>
                    Warranty Repair
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-4 w-4 ${complaint.express_repair ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className={complaint.express_repair ? 'text-foreground' : 'text-muted-foreground'}>
                    Express Repair (+99 zł)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-4 w-4 ${complaint.screen_protection_foil ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className={complaint.screen_protection_foil ? 'text-foreground' : 'text-muted-foreground'}>
                    Screen Protection (+49 zł)
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium">Complaint Submitted</p>
                    <p className="text-sm text-muted-foreground">{formatDate(complaint.submission_date)}</p>
                  </div>
                </div>
                
                {complaint.incoming_tracking_number && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-info rounded-full"></div>
                    <div>
                      <p className="font-medium">Device Received</p>
                      <p className="text-sm text-muted-foreground">
                        Tracking: <span className="font-mono">{complaint.incoming_tracking_number}</span>
                      </p>
                    </div>
                  </div>
                )}

                {complaint.outgoing_tracking_number && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <div>
                      <p className="font-medium">Device Shipped</p>
                      <p className="text-sm text-muted-foreground">
                        Tracking: <span className="font-mono">{complaint.outgoing_tracking_number}</span>
                      </p>
                    </div>
                  </div>
                )}

                {complaint.completion_date && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <div>
                      <p className="font-medium">Complaint Completed</p>
                      <p className="text-sm text-muted-foreground">{formatDate(complaint.completion_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Return Address */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Return Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{complaint.return_first_name} {complaint.return_last_name}</p>
                <p className="text-muted-foreground">{complaint.return_street}</p>
                <p className="text-muted-foreground">{complaint.return_postal_code} {complaint.return_city}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{complaint.return_phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{complaint.return_email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Contents */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Package Contents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Device', included: complaint.package_device },
                  { label: 'Original Packaging', included: complaint.package_original_packaging },
                  { label: 'Mount', included: complaint.package_mount },
                  { label: 'Adapter', included: complaint.package_adapter },
                  { label: 'USB Cable', included: complaint.package_usb_cable },
                  { label: 'Receipt Copy', included: complaint.package_receipt_copy },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className={`h-4 w-4 ${item.included ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${item.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Tracking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Incoming Shipment</span>
                </div>
                {complaint.incoming_tracking_number ? (
                  <Badge variant="outline" className="font-mono">
                    {complaint.incoming_tracking_number}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Not assigned</span>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Outgoing Shipment</span>
                </div>
                {complaint.outgoing_tracking_number ? (
                  <Badge variant="outline" className="font-mono">
                    {complaint.outgoing_tracking_number}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Not assigned</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Repair Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Repair Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.diagnosis && (
                <div>
                  <span className="text-sm text-muted-foreground">Diagnosis</span>
                  <p className="text-foreground">{complaint.diagnosis}</p>
                </div>
              )}
              
              {complaint.repair_cost && (
                <div>
                  <span className="text-sm text-muted-foreground">Repair Cost</span>
                  <p className="font-medium text-lg">{formatCurrency(complaint.repair_cost)}</p>
                </div>
              )}

              {complaint.invoice_data && (
                <div>
                  <span className="text-sm text-muted-foreground">Invoice Information</span>
                  <p className="text-foreground">{complaint.invoice_data}</p>
                </div>
              )}

              {!complaint.diagnosis && !complaint.repair_cost && !complaint.invoice_data && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Repair information will be available once the device is processed.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplaintDetails;