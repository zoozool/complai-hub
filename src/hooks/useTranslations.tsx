import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Translation {
  id: string;
  key: string;
  language_code: string;
  value: string;
  category: string;
}

interface TranslationsContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  translations: Translation[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const TranslationsContext = createContext<TranslationsContextType | undefined>(undefined);

export const TranslationsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('app_language') || 'pl';
  });
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTranslations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) {
      console.error('Error fetching translations:', error);
    } else {
      setTranslations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    const translation = translations.find(
      (tr) => tr.key === key && tr.language_code === language
    );
    if (translation) {
      return translation.value;
    }
    // Fallback to Polish
    const fallback = translations.find(
      (tr) => tr.key === key && tr.language_code === 'pl'
    );
    return fallback?.value || key;
  };

  return (
    <TranslationsContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations,
        loading,
        refetch: fetchTranslations,
      }}
    >
      {children}
    </TranslationsContext.Provider>
  );
};

export const useTranslations = () => {
  const context = useContext(TranslationsContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a TranslationsProvider');
  }
  return context;
};
