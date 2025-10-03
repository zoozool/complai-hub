import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  technicianFilter: string;
  setTechnicianFilter: (value: string) => void;
  dateRange: { from: string; to: string };
  setDateRange: (range: { from: string; to: string }) => void;
  showTechnicianFilter?: boolean;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  technicianFilter,
  setTechnicianFilter,
  dateRange,
  setDateRange,
  showTechnicianFilter = true,
}: SearchFiltersProps) {
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    const fetchTechnicians = async () => {
      if (!showTechnicianFilter) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            profiles!inner(first_name, last_name)
          `)
          .eq('role', 'service_technician');

        if (error) throw error;
        setTechnicians(data || []);
      } catch (error) {
        console.error('Error fetching technicians:', error);
      }
    };

    fetchTechnicians();
  }, [showTechnicianFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setTechnicianFilter("");
    setDateRange({ from: "", to: "" });
  };

  const hasActiveFilters = searchTerm || statusFilter || technicianFilter || dateRange.from || dateRange.to;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Search & Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="awaiting_shipment">Awaiting Shipment</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {showTechnicianFilter && (
            <Select value={technicianFilter || "all"} onValueChange={(value) => setTechnicianFilter(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Assigned Technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {technicians.map((tech: any) => (
                  <SelectItem key={tech.user_id} value={tech.user_id}>
                    {tech.profiles.first_name} {tech.profiles.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="From date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
            <Input
              type="date"
              placeholder="To date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}