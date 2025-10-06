import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
  display_order: number;
}

interface PackageContent {
  id: string;
  name: string;
  is_active: boolean;
  display_order: number;
}

export default function ComplaintSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [packageContents, setPackageContents] = useState<PackageContent[]>([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [newService, setNewService] = useState({ name: '', price: 0 });
  const [newPackage, setNewPackage] = useState({ name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, packagesRes] = await Promise.all([
        supabase.from('service_options').select('*').order('display_order'),
        supabase.from('package_contents').select('*').order('display_order')
      ]);

      if (servicesRes.error) throw servicesRes.error;
      if (packagesRes.error) throw packagesRes.error;

      setServiceOptions(servicesRes.data || []);
      setPackageContents(packagesRes.data || []);
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

  const addServiceOption = async () => {
    if (!newService.name || newService.price < 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid name and price",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('service_options').insert({
        name: newService.name,
        price: newService.price,
        display_order: serviceOptions.length + 1,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Service option added" });
      setNewService({ name: '', price: 0 });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateServiceOption = async (id: string, updates: Partial<ServiceOption>) => {
    try {
      const { error } = await supabase
        .from('service_options')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Service option updated" });
      setEditingService(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteServiceOption = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service option?")) return;

    try {
      const { error } = await supabase.from('service_options').delete().eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Service option deleted" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addPackageContent = async () => {
    if (!newPackage.name) {
      toast({
        title: "Validation Error",
        description: "Please provide a name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('package_contents').insert({
        name: newPackage.name,
        display_order: packageContents.length + 1,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Package content added" });
      setNewPackage({ name: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updatePackageContent = async (id: string, updates: Partial<PackageContent>) => {
    try {
      const { error } = await supabase
        .from('package_contents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Package content updated" });
      setEditingPackage(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePackageContent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package content?")) return;

    try {
      const { error } = await supabase.from('package_contents').delete().eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Package content deleted" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Complaint Settings</h1>
          <p className="text-muted-foreground">Configure service options and package contents for complaint forms</p>
        </div>

        {/* Service Options */}
        <Card>
          <CardHeader>
            <CardTitle>Service Options</CardTitle>
            <CardDescription>Manage additional services with pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Service */}
            <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="new-service-name">Service Name</Label>
                <Input
                  id="new-service-name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g., Express Repair"
                />
              </div>
              <div className="w-32">
                <Label htmlFor="new-service-price">Price (PLN)</Label>
                <Input
                  id="new-service-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addServiceOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Service Options List */}
            <div className="space-y-2">
              {serviceOptions.map((option) => (
                <div key={option.id} className="flex items-center gap-2 p-3 border rounded-lg">
                  {editingService === option.id ? (
                    <>
                      <Input
                        value={option.name}
                        onChange={(e) => setServiceOptions(serviceOptions.map(o => 
                          o.id === option.id ? { ...o, name: e.target.value } : o
                        ))}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={option.price}
                        onChange={(e) => setServiceOptions(serviceOptions.map(o => 
                          o.id === option.id ? { ...o, price: parseFloat(e.target.value) } : o
                        ))}
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateServiceOption(option.id, {
                          name: option.name,
                          price: option.price,
                        })}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingService(null);
                          fetchData();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-medium">{option.name}</span>
                        <span className="text-muted-foreground ml-2">+{option.price.toFixed(2)} PLN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={option.is_active}
                          onCheckedChange={(checked) => updateServiceOption(option.id, { is_active: checked })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingService(option.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteServiceOption(option.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Package Contents */}
        <Card>
          <CardHeader>
            <CardTitle>Package Contents</CardTitle>
            <CardDescription>Manage checklist items for package contents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Package Content */}
            <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="new-package-name">Item Name</Label>
                <Input
                  id="new-package-name"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ name: e.target.value })}
                  placeholder="e.g., Charging Cable"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addPackageContent}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Package Contents List */}
            <div className="space-y-2">
              {packageContents.map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-3 border rounded-lg">
                  {editingPackage === item.id ? (
                    <>
                      <Input
                        value={item.name}
                        onChange={(e) => setPackageContents(packageContents.map(p => 
                          p.id === item.id ? { ...p, name: e.target.value } : p
                        ))}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => updatePackageContent(item.id, { name: item.name })}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingPackage(null);
                          fetchData();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={(checked) => updatePackageContent(item.id, { is_active: checked })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingPackage(item.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePackageContent(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}