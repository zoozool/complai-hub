
-- Create translations table
CREATE TABLE public.translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'pl',
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(key, language_code)
);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Admins can manage translations
CREATE POLICY "Admins can manage translations" 
ON public.translations 
FOR ALL 
USING (has_role(auth.uid(), 'main_administrator'::app_role))
WITH CHECK (has_role(auth.uid(), 'main_administrator'::app_role));

-- Everyone can read translations
CREATE POLICY "Anyone can read translations" 
ON public.translations 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Polish translations
INSERT INTO public.translations (key, language_code, value, category) VALUES
-- Menu
('menu.dashboard', 'pl', 'Panel główny', 'menu'),
('menu.complaints', 'pl', 'Reklamacje', 'menu'),
('menu.users', 'pl', 'Użytkownicy', 'menu'),
('menu.warranty_repairs', 'pl', 'Naprawy gwarancyjne', 'menu'),
('menu.settings', 'pl', 'Ustawienia', 'menu'),
('menu.logout', 'pl', 'Wyloguj', 'menu'),
-- Settings
('settings.title', 'pl', 'Ustawienia', 'settings'),
('settings.service_options', 'pl', 'Opcje serwisowe', 'settings'),
('settings.package_contents', 'pl', 'Zawartość przesyłki', 'settings'),
('settings.spare_parts', 'pl', 'Części zamienne', 'settings'),
('settings.languages', 'pl', 'Języki', 'settings'),
-- Common
('common.save', 'pl', 'Zapisz', 'common'),
('common.cancel', 'pl', 'Anuluj', 'common'),
('common.edit', 'pl', 'Edytuj', 'common'),
('common.delete', 'pl', 'Usuń', 'common'),
('common.add', 'pl', 'Dodaj', 'common'),
('common.search', 'pl', 'Szukaj', 'common'),
('common.loading', 'pl', 'Ładowanie...', 'common'),
('common.no_data', 'pl', 'Brak danych', 'common'),
-- English translations
('menu.dashboard', 'en', 'Dashboard', 'menu'),
('menu.complaints', 'en', 'Complaints', 'menu'),
('menu.users', 'en', 'Users', 'menu'),
('menu.warranty_repairs', 'en', 'Warranty Repairs', 'menu'),
('menu.settings', 'en', 'Settings', 'menu'),
('menu.logout', 'en', 'Logout', 'menu'),
('settings.title', 'en', 'Settings', 'settings'),
('settings.service_options', 'en', 'Service Options', 'settings'),
('settings.package_contents', 'en', 'Package Contents', 'settings'),
('settings.spare_parts', 'en', 'Spare Parts', 'settings'),
('settings.languages', 'en', 'Languages', 'settings'),
('common.save', 'en', 'Save', 'common'),
('common.cancel', 'en', 'Cancel', 'common'),
('common.edit', 'en', 'Edit', 'common'),
('common.delete', 'en', 'Delete', 'common'),
('common.add', 'en', 'Add', 'common'),
('common.search', 'en', 'Search', 'common'),
('common.loading', 'en', 'Loading...', 'common'),
('common.no_data', 'en', 'No data', 'common');
