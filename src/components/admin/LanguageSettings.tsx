import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Plus, Search, Globe, Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslations } from '@/hooks/useTranslations';

interface Translation {
  id: string;
  key: string;
  language_code: string;
  value: string;
  category: string;
}

const CATEGORIES = [
  { value: 'menu', label: 'Menu' },
  { value: 'settings', label: 'Ustawienia' },
  { value: 'common', label: 'Ogólne' },
  { value: 'complaints', label: 'Reklamacje' },
  { value: 'dashboard', label: 'Panel główny' },
];

const LANGUAGES = [
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export const LanguageSettings = () => {
  const { language, setLanguage, refetch } = useTranslations();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    pl: '',
    en: '',
    category: 'common',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTranslations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) {
      console.error('Error fetching translations:', error);
      toast.error('Błąd podczas pobierania tłumaczeń');
    } else {
      setTranslations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const handleSaveEdit = async (translation: Translation) => {
    setSaving(true);
    const { error } = await supabase
      .from('translations')
      .update({ value: editValue })
      .eq('id', translation.id);

    if (error) {
      toast.error('Błąd podczas zapisywania');
    } else {
      toast.success('Zapisano');
      setEditingId(null);
      fetchTranslations();
      refetch();
    }
    setSaving(false);
  };

  const handleAddTranslation = async () => {
    if (!newTranslation.key || !newTranslation.pl) {
      toast.error('Wypełnij klucz i wartość polską');
      return;
    }

    setSaving(true);
    
    // Insert Polish version
    const { error: plError } = await supabase
      .from('translations')
      .insert({
        key: newTranslation.key,
        language_code: 'pl',
        value: newTranslation.pl,
        category: newTranslation.category,
      });

    if (plError) {
      toast.error('Błąd podczas dodawania tłumaczenia PL');
      setSaving(false);
      return;
    }

    // Insert English version if provided
    if (newTranslation.en) {
      const { error: enError } = await supabase
        .from('translations')
        .insert({
          key: newTranslation.key,
          language_code: 'en',
          value: newTranslation.en,
          category: newTranslation.category,
        });

      if (enError) {
        toast.error('Błąd podczas dodawania tłumaczenia EN');
      }
    }

    toast.success('Dodano tłumaczenie');
    setNewTranslation({ key: '', pl: '', en: '', category: 'common' });
    setShowAddForm(false);
    fetchTranslations();
    refetch();
    setSaving(false);
  };

  const handleDeleteTranslation = async (key: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to tłumaczenie?')) return;

    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('key', key);

    if (error) {
      toast.error('Błąd podczas usuwania');
    } else {
      toast.success('Usunięto');
      fetchTranslations();
      refetch();
    }
  };

  // Group translations by key
  const groupedTranslations = translations.reduce((acc, tr) => {
    if (!acc[tr.key]) {
      acc[tr.key] = { key: tr.key, category: tr.category, pl: null, en: null };
    }
    if (tr.language_code === 'pl') acc[tr.key].pl = tr;
    if (tr.language_code === 'en') acc[tr.key].en = tr;
    return acc;
  }, {} as Record<string, { key: string; category: string; pl: Translation | null; en: Translation | null }>);

  const filteredGroups = Object.values(groupedTranslations).filter((group) => {
    const matchesSearch =
      group.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.pl?.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.en?.value.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Ustawienia językowe
          </CardTitle>
          <div className="flex items-center gap-2">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage(lang.code)}
              >
                {lang.flag} {lang.name}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj tłumaczeń..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Wszystkie
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Add new translation form */}
        {showAddForm ? (
          <Card className="border-dashed">
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Klucz</Label>
                  <Input
                    placeholder="np. menu.new_item"
                    value={newTranslation.key}
                    onChange={(e) =>
                      setNewTranslation({ ...newTranslation, key: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Kategoria</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newTranslation.category}
                    onChange={(e) =>
                      setNewTranslation({ ...newTranslation, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>🇵🇱 Polski</Label>
                  <Input
                    placeholder="Wartość po polsku"
                    value={newTranslation.pl}
                    onChange={(e) =>
                      setNewTranslation({ ...newTranslation, pl: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>🇬🇧 English</Label>
                  <Input
                    placeholder="English value"
                    value={newTranslation.en}
                    onChange={(e) =>
                      setNewTranslation({ ...newTranslation, en: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTranslation} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Zapisz
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Anuluj
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowAddForm(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj nowe tłumaczenie
          </Button>
        )}

        {/* Translations list */}
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
            <div className="col-span-3">Klucz</div>
            <div className="col-span-1">Kategoria</div>
            <div className="col-span-3">🇵🇱 Polski</div>
            <div className="col-span-3">🇬🇧 English</div>
            <div className="col-span-2">Akcje</div>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {filteredGroups.map((group) => (
              <div key={group.key} className="grid grid-cols-12 gap-2 p-3 items-center text-sm">
                <div className="col-span-3 font-mono text-xs break-all">{group.key}</div>
                <div className="col-span-1">
                  <Badge variant="outline" className="text-xs">
                    {group.category}
                  </Badge>
                </div>
                <div className="col-span-3">
                  {editingId === group.pl?.id ? (
                    <div className="flex gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => group.pl && handleSaveEdit(group.pl)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="truncate">{group.pl?.value || '-'}</span>
                      {group.pl && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => {
                            setEditingId(group.pl!.id);
                            setEditValue(group.pl!.value);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="col-span-3">
                  {editingId === group.en?.id ? (
                    <div className="flex gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => group.en && handleSaveEdit(group.en)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="truncate">{group.en?.value || '-'}</span>
                      {group.en && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => {
                            setEditingId(group.en!.id);
                            setEditValue(group.en!.value);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="col-span-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (group.pl) {
                        setEditingId(group.pl.id);
                        setEditValue(group.pl.value);
                      }
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDeleteTranslation(group.key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nie znaleziono tłumaczeń
          </div>
        )}
      </CardContent>
    </Card>
  );
};
