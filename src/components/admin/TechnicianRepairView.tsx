import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Wrench, Package, Calculator, Save, Loader2, Play, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface WarrantyComplaint {
  id: string;
  internal_complaint_number: string | null;
  device_type: string;
  device_serial_number: string;
  damage_description: string;
  status: string | null;
  submission_date: string;
  diagnosis: string | null;
  repair_cost: number | null;
  service_notes: string | null;
  return_first_name: string;
  return_last_name: string;
  return_email: string;
  return_phone: string;
  return_street: string;
  return_postal_code: string;
  return_city: string;
  warranty_repair: boolean;
  express_repair: boolean;
  reported_problem: string | null;
}

interface TechnicianRepairViewProps {
  complaint: WarrantyComplaint;
  onBack: () => void;
  onSuccess: () => void;
}

const FIXED_FEES = [
  { id: "warranty", label: "Gwarancyjne", price: 0 },
  { id: "xs_compact_obd", label: "XS/Compact/OBD", price: 70 },
  { id: "gtx_rs_notione", label: "GTX, RS, NotiOne GPS", price: 100 },
  { id: "partial", label: "Częściowa", price: 0 },
];

const SPARE_PARTS = [
  { id: "antena_gps_gt", label: "antena GPS(GT, GTR, XS, RS, F)", price: 20 },
  { id: "akumulator", label: "akumulator (GT, GTR, XS, RS, F, Noti)", price: 20 },
  { id: "pamiec_glowna_rs", label: "pamięć główna (RS)", price: 10 },
  { id: "pamiec_robocza_rs", label: "pamięć robocza (RS)", price: 90 },
  { id: "wyswietlacz_dotykowy_rs", label: "wyświetlacz dotykowy z szybką (RS)", price: 150 },
  { id: "wyswietlacz_gt", label: "wyświetlacz (GT, GTR)", price: 45 },
  { id: "szybka_wyswietlacza", label: "szybka wyświetlacza (GT, GTR)", price: 15 },
  { id: "glosniki", label: "głośniki (GT, GTR, RS)", price: 10 },
  { id: "glosnik_1w", label: "Głośnik 1W", price: 10 },
  { id: "obudowa_gtr", label: "obudowa (GTR)", price: 15 },
  { id: "plyta_glowna_rs", label: "płyta główna (RS)", price: 320 },
  { id: "mikrokontroler_gt", label: "mikrokontroler (GT, GTR, XS)", price: 30 },
  { id: "mikrokontroler_rs", label: "mikrokontroler (RS)", price: 40 },
  { id: "elementy_elektroniczne_2", label: "Elementy elektroniczne - 2 szt", price: 10 },
  { id: "elementy_elektroniczne_3", label: "Elementy elektroniczne - 3 szt", price: 15 },
  { id: "elementy_mechaniczne_1", label: "Elementy mechaniczne - 1 szt", price: 5 },
  { id: "elementy_mechaniczne_2", label: "Elementy mechaniczne - 2 szt", price: 10 },
  { id: "elementy_mechaniczne_3", label: "Elementy mechaniczne - 3 szt", price: 15 },
  { id: "plyta_glowna_gt", label: "płyta główna (GT, GTR, F)", price: 160 },
  { id: "plyta_glowna_xs", label: "płyta główna (XS)", price: 140 },
  { id: "adapter_usb", label: "Adatper USB 5V/2A", price: 0 },
  { id: "ekspres", label: "Ekspres", price: 99 },
  { id: "obudowa_rs", label: "obudowa (RS)", price: 20 },
  { id: "elementy_elektroniczne_1", label: "Elementy elektroniczne - 1 szt", price: 5 },
  { id: "modul_bt_rs", label: "moduł BT (RS)", price: 20 },
  { id: "antena_gsm", label: "antena GSM (GT, GTR, XS, RS, F)", price: 10 },
  { id: "mikrokontroler_c", label: "Mikrokontroler C", price: 20 },
  { id: "antena_gps_c", label: "Antena GPS C", price: 10 },
  { id: "plyta_zasilania", label: "Płyta główna - moduł zasilania", price: 50 },
  { id: "plyta_komunikacyjny", label: "Płyta główna - moduł komunikacyjny", price: 70 },
  { id: "kabel_zasilajacy", label: "kabel zasilający (microUSB/USB-C)", price: 0 },
  { id: "karta_sim", label: "Karta SIM", price: 0 },
  { id: "plyta_notione", label: "płyta główna(notiOne GPS)", price: 120 },
  { id: "klawiatura", label: "klawiatura (GT, GTR, XS, RS)", price: 15 },
  { id: "karta_sd", label: "karta SD (GT, GTR, XS)", price: 55 },
  { id: "elementy_montazowe", label: "Elementy montażowe", price: 5 },
  { id: "modul_gps_gt", label: "moduł GPS (GT, GTR, F)", price: 30 },
  { id: "modul_gsm_gt", label: "moduł GSM( GT, GTR)", price: 60 },
  { id: "modul_gps_gsm_gtr", label: "moduł GPS/GSM(GTR, XS, F)", price: 40 },
  { id: "modul_gps_gsm_rs", label: "moduł GPS/GSM (RS)", price: 110 },
  { id: "panel_pojemnosciowy", label: "panel pojemnościowy (GT, GTR)", price: 15 },
  { id: "usb_gniazdo", label: "USB/Gniazdo zasilania (GT, GTR, XS, RS, F)", price: 10 },
  { id: "obudowa_xs", label: "obudowa (XS, F, Noti)", price: 10 },
  { id: "folia", label: "Folia", price: 49 },
];

export function TechnicianRepairView({ complaint, onBack, onSuccess }: TechnicianRepairViewProps) {
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(complaint.status);
  const [technicianNotes, setTechnicianNotes] = useState(complaint.service_notes || "");
  const [otherComponents, setOtherComponents] = useState("");
  const [diagnosis, setDiagnosis] = useState(complaint.diagnosis || "");
  const [manualCost, setManualCost] = useState<string>(complaint.repair_cost?.toString() || "");
  const [useManualCost, setUseManualCost] = useState(false);
  const [selectedFixedFee, setSelectedFixedFee] = useState<string>("warranty");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  const calculatedCost = useMemo(() => {
    const fixedFee = FIXED_FEES.find(f => f.id === selectedFixedFee)?.price || 0;
    const partsTotal = selectedParts.reduce((sum, partId) => {
      const part = SPARE_PARTS.find(p => p.id === partId);
      return sum + (part?.price || 0);
    }, 0);
    return fixedFee + partsTotal;
  }, [selectedFixedFee, selectedParts]);

  const finalCost = useManualCost && manualCost ? parseFloat(manualCost) : calculatedCost;

  const handlePartToggle = (partId: string) => {
    setSelectedParts(prev => 
      prev.includes(partId) 
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          service_notes: technicianNotes,
          diagnosis: diagnosis,
          repair_cost: finalCost,
        })
        .eq("id", complaint.id);

      if (error) throw error;

      toast({
        title: "Zapisano",
        description: "Dane naprawy zostały zapisane.",
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving repair data:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać danych.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: "in_progress" | "completed") => {
    setUpdatingStatus(true);
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      // If completing, also save all repair data
      if (newStatus === "completed") {
        updateData.service_notes = technicianNotes;
        updateData.diagnosis = diagnosis;
        updateData.repair_cost = finalCost;
        updateData.completion_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("complaints")
        .update(updateData)
        .eq("id", complaint.id);

      if (error) throw error;

      setCurrentStatus(newStatus);
      toast({
        title: newStatus === "in_progress" ? "Naprawa rozpoczęta" : "Naprawa zakończona",
        description: newStatus === "in_progress" 
          ? "Status zmieniony na 'W trakcie naprawy'." 
          : "Status zmieniony na 'Zakończone'.",
      });

      if (newStatus === "completed") {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić statusu.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusColors: Record<string, string> = {
      submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      awaiting_shipment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return statusColors[status || "submitted"] || statusColors.submitted;
  };

  // Split spare parts into two columns
  const midPoint = Math.ceil(SPARE_PARTS.length / 2);
  const leftColumnParts = SPARE_PARTS.slice(0, midPoint);
  const rightColumnParts = SPARE_PARTS.slice(midPoint);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">
            Naprawa: {complaint.internal_complaint_number || complaint.id.slice(0, 8)}
          </h1>
          <p className="text-muted-foreground">Panel serwisanta</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={getStatusBadge(currentStatus)}>
            {currentStatus?.replace("_", " ") || "Submitted"}
          </Badge>
          
          {/* Status action buttons */}
          {currentStatus === "submitted" && (
            <Button 
              onClick={() => handleStatusChange("in_progress")}
              disabled={updatingStatus}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {updatingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Rozpocznij naprawę
            </Button>
          )}
          
          {currentStatus === "in_progress" && (
            <Button 
              onClick={() => handleStatusChange("completed")}
              disabled={updatingStatus}
              className="bg-green-600 hover:bg-green-700"
            >
              {updatingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Zakończ naprawę
            </Button>
          )}
        </div>
      </div>

      {/* Read-only Complaint Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Szczegóły zgłoszenia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Urządzenie</span>
              <p className="font-medium">{complaint.device_type}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Numer seryjny</span>
              <p className="font-medium font-mono">{complaint.device_serial_number}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Data zgłoszenia</span>
              <p className="font-medium">{new Date(complaint.submission_date).toLocaleDateString("pl-PL")}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Typ naprawy</span>
              <div className="flex gap-2">
                {complaint.warranty_repair && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Gwarancja</Badge>
                )}
                {complaint.express_repair && (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">Ekspres</Badge>
                )}
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <span className="text-muted-foreground">Klient</span>
              <p className="font-medium">{complaint.return_first_name} {complaint.return_last_name}</p>
              <p className="text-xs text-muted-foreground">{complaint.return_email} • {complaint.return_phone}</p>
            </div>
            <div className="space-y-1 lg:col-span-3">
              <span className="text-muted-foreground">Adres zwrotny</span>
              <p className="font-medium">{complaint.return_street}, {complaint.return_postal_code} {complaint.return_city}</p>
            </div>
            <div className="space-y-1 lg:col-span-3">
              <span className="text-muted-foreground">Opis uszkodzenia</span>
              <p className="font-medium bg-muted/50 p-3 rounded-md">{complaint.damage_description}</p>
            </div>
            {complaint.reported_problem && (
              <div className="space-y-1 lg:col-span-3">
                <span className="text-muted-foreground">Zgłoszony problem</span>
                <p className="font-medium bg-muted/50 p-3 rounded-md">{complaint.reported_problem}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technician Input Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Dane naprawy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="technicianNotes">Notatki serwisanta</Label>
              <Textarea
                id="technicianNotes"
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                placeholder="Wpisz notatki dotyczące naprawy..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnoza</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Wpisz diagnozę..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="otherComponents">Inne komponenty</Label>
            <Input
              id="otherComponents"
              value={otherComponents}
              onChange={(e) => setOtherComponents(e.target.value)}
              placeholder="Wpisz inne komponenty (jeśli dotyczy)..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Fixed Fees */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Opłata stała</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedFixedFee} onValueChange={setSelectedFixedFee} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FIXED_FEES.map((fee) => (
              <div key={fee.id} className="flex items-center space-x-2">
                <RadioGroupItem value={fee.id} id={fee.id} />
                <Label htmlFor={fee.id} className="flex-1 cursor-pointer">
                  <span>{fee.label}</span>
                  <span className="text-muted-foreground ml-1">[{fee.price.toFixed(2)} zł]</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Spare Parts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Części</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
            <div className="space-y-2">
              {leftColumnParts.map((part) => (
                <div key={part.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={part.id}
                    checked={selectedParts.includes(part.id)}
                    onCheckedChange={() => handlePartToggle(part.id)}
                  />
                  <Label htmlFor={part.id} className="flex-1 cursor-pointer text-sm">
                    <span>{part.label}</span>
                    <span className="text-muted-foreground ml-1">[{part.price.toFixed(2)} zł]</span>
                  </Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {rightColumnParts.map((part) => (
                <div key={part.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={part.id}
                    checked={selectedParts.includes(part.id)}
                    onCheckedChange={() => handlePartToggle(part.id)}
                  />
                  <Label htmlFor={part.id} className="flex-1 cursor-pointer text-sm">
                    <span>{part.label}</span>
                    <span className="text-muted-foreground ml-1">[{part.price.toFixed(2)} zł]</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card className="border-primary/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Podsumowanie kosztów
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-md">
              <span className="text-muted-foreground">Opłata stała</span>
              <p className="text-lg font-bold">
                {(FIXED_FEES.find(f => f.id === selectedFixedFee)?.price || 0).toFixed(2)} zł
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-md">
              <span className="text-muted-foreground">Części ({selectedParts.length})</span>
              <p className="text-lg font-bold">
                {selectedParts.reduce((sum, partId) => {
                  const part = SPARE_PARTS.find(p => p.id === partId);
                  return sum + (part?.price || 0);
                }, 0).toFixed(2)} zł
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-md border border-primary/30">
              <span className="text-muted-foreground">Suma kalkulowana</span>
              <p className="text-xl font-bold text-primary">{calculatedCost.toFixed(2)} zł</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="useManualCost"
                  checked={useManualCost}
                  onCheckedChange={(checked) => setUseManualCost(!!checked)}
                />
                <Label htmlFor="useManualCost" className="cursor-pointer">
                  Użyj ręcznej kwoty
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="manualCost" className="whitespace-nowrap">Koszt naprawy:</Label>
                <Input
                  id="manualCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualCost}
                  onChange={(e) => {
                    setManualCost(e.target.value);
                    if (e.target.value) setUseManualCost(true);
                  }}
                  placeholder={calculatedCost.toFixed(2)}
                  className="max-w-[150px]"
                />
                <span className="text-muted-foreground">zł</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Końcowy koszt naprawy</span>
              <p className="text-2xl font-bold text-primary">{finalCost.toFixed(2)} zł</p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onBack}>
              Anuluj
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Zapisz naprawę
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
