import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Download, Upload, AlertCircle, Wifi, Github, Shield, Globe, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useTheme } from '@/context/ThemeContext';
import { getSettings, updateSettings, exportAllNetworks, importNetworks, db } from '@/db';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, type PrintLayout, type AppSettings } from '@/types';

interface SettingsPanelProps {
  onBack: () => void;
}

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [settings, setSettingsState] = useState<AppSettings | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    getSettings().then(setSettingsState);
  }, []);

  const update = useCallback(async (updates: Partial<AppSettings>) => {
    await updateSettings(updates);
    setSettingsState((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const handleExport = useCallback(async () => {
    const networks = await exportAllNetworks();
    const data = JSON.stringify({ version: 1, networks, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wifi-access-cards-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.networks) {
        await importNetworks(data.networks);
        window.location.reload();
      }
    };
    input.click();
  }, []);

  const handleDeleteAll = useCallback(async () => {
    await db.networks.clear();
    setDeleteConfirmOpen(false);
    window.location.reload();
  }, []);

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>&larr; {t('common.back')}</Button>
        <h2 className="text-xl font-bold">{t('settings.title')}</h2>
      </div>

      {/* Interface Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.uiLanguage')}</CardTitle>
          <CardDescription>{t('settings.uiLanguageHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={i18n.language?.split('-')[0] || 'en'}
            onValueChange={(lang) => {
              i18n.changeLanguage(lang);
              update({ uiLanguage: lang });
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, label]) => (
                <SelectItem key={code} value={code}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Print Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.printDefaults')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('print.layout')}</Label>
            <Select
              value={settings.defaultPrintLayout}
              onValueChange={(v) => update({ defaultPrintLayout: v as PrintLayout })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sheet">{t('print.layouts.sheet')}</SelectItem>
                <SelectItem value="sticker">{t('print.layouts.sticker')}</SelectItem>
                <SelectItem value="card">{t('print.layouts.card')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('print.language')}</Label>
            <Select
              value={settings.printLanguages[0] || i18n.language?.split('-')[0] || 'en'}
              onValueChange={(v) => {
                const langs = settings.printLanguages.length > 0
                  ? [v, ...settings.printLanguages.filter((l) => l !== v)]
                  : [v];
                update({ printLanguages: langs });
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, label]) => (
                  <SelectItem key={code} value={code}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[var(--muted-foreground)]">{t('print.languageHint')}</p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="multiDefault"
              checked={settings.printMultilingual}
              onCheckedChange={(v) => update({ printMultilingual: v })}
            />
            <div>
              <Label htmlFor="multiDefault">{t('print.multilingual')}</Label>
              <p className="text-xs text-[var(--muted-foreground)]">{t('print.multilingualHint')}</p>
            </div>
          </div>

          {settings.printMultilingual && (
            <div>
              <Label className="text-xs mb-1.5 block">{t('print.selectLanguages')}</Label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => {
                      const current = settings.printLanguages;
                      const updated = current.includes(code)
                        ? current.filter((l) => l !== code)
                        : [...current, code];
                      update({ printLanguages: updated.length > 0 ? updated : [code] });
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      settings.printLanguages.includes(code)
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.theme')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t_) => (
              <Button
                key={t_}
                variant={theme === t_ ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme(t_)}
              >
                {t(`settings.themes.${t_}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.data')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              {t('settings.exportAll')}
            </Button>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="h-4 w-4" />
              {t('settings.importData')}
            </Button>
          </div>
          <Separator />
          <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            {t('settings.deleteAll')}
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--primary)] text-white">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{t('app.title')}</CardTitle>
              <CardDescription>v{__APP_VERSION__} &middot; BAUER GROUP</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">{t('app.description')}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[var(--muted)]">
              <QrCode className="h-5 w-5 text-[var(--primary)]" />
              <span className="text-xs text-center text-[var(--muted-foreground)]">QR-Codes</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[var(--muted)]">
              <Globe className="h-5 w-5 text-[var(--primary)]" />
              <span className="text-xs text-center text-[var(--muted-foreground)]">16 {t('print.multilingual').toLowerCase()}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[var(--muted)]">
              <Shield className="h-5 w-5 text-[var(--primary)]" />
              <span className="text-xs text-center text-[var(--muted-foreground)]">{t('settings.storage')}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[var(--muted)]">
              <Wifi className="h-5 w-5 text-[var(--primary)]" />
              <span className="text-xs text-center text-[var(--muted-foreground)]">{t('settings.noAccount')}</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a
              href="https://github.com/bauer-group/COM-WiFiAccessCardGenerator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <span className="text-[var(--muted-foreground)]">&middot;</span>
            <span className="text-xs text-[var(--muted-foreground)]">MIT License</span>
            <span className="text-[var(--muted-foreground)]">&middot;</span>
            <span className="text-xs text-[var(--muted-foreground)]">PWA &middot; React &middot; TypeScript</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[var(--destructive)]">
              <AlertCircle className="h-5 w-5" />
              {t('settings.deleteAll')}
            </DialogTitle>
            <DialogDescription>{t('settings.deleteAllConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteAll}>
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
