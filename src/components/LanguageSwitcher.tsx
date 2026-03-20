import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/types';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0] || 'en') as SupportedLanguage;

  return (
    <Select value={currentLang} onValueChange={(lang) => i18n.changeLanguage(lang)}>
      <SelectTrigger className="w-auto gap-2 border-none bg-transparent shadow-none h-9 px-2">
        <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, label]) => (
          <SelectItem key={code} value={code}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
