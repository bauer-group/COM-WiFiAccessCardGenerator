import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { decryptSharePayload, parseSharePayload } from '@/utils/share';
import { importNetworks } from '@/db';
import type { SharePayload } from '@/types';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  encrypted: boolean;
  rawData: string;
  onImported: () => void;
}

export function ImportDialog({ open, onOpenChange, encrypted, rawData, onImported }: ImportDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [imported, setImported] = useState(false);

  const handleDecrypt = useCallback(async () => {
    setError('');
    try {
      const data = await decryptSharePayload(rawData, password);
      setPayload(data);
    } catch {
      setError(t('import.wrongPassword'));
    }
  }, [rawData, password, t]);

  const handleImport = useCallback(async () => {
    setImporting(true);
    try {
      const data = payload || parseSharePayload(rawData);
      await importNetworks(data.networks);
      setImported(true);
      onImported();
    } catch {
      setError(t('import.error'));
    } finally {
      setImporting(false);
    }
  }, [payload, rawData, onImported, t]);

  const handleClose = () => {
    // Clear the hash so the import dialog doesn't reopen
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    onOpenChange(false);
  };

  const networkCount = payload?.networks?.length ?? (!encrypted ? parseSharePayload(rawData)?.networks?.length ?? 0 : 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('import.title')}
          </DialogTitle>
          <DialogDescription>{t('import.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {imported ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-center font-medium">{t('import.success', { count: networkCount })}</p>
            </div>
          ) : (
            <>
              {encrypted && !payload && (
                <>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Lock className="h-4 w-4" />
                    {t('import.encrypted')}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="importPassword">{t('import.password')}</Label>
                    <Input
                      id="importPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('import.passwordPlaceholder')}
                      onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-[var(--destructive)]">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <Button onClick={handleDecrypt} disabled={!password} className="w-full">
                    {t('import.decrypt')}
                  </Button>
                </>
              )}

              {(!encrypted || payload) && !imported && (
                <>
                  <p className="text-sm">{t('import.networks', { count: networkCount })}</p>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-[var(--destructive)]">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <Button onClick={handleImport} disabled={importing} className="w-full">
                    <Download className="h-4 w-4" />
                    {t('import.import')}
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {imported ? t('common.done') : t('common.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
