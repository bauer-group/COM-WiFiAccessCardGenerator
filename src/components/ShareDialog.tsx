import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Copy, Check, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { createShareLink, MAX_URL_LENGTH } from '@/utils/share';
import type { WifiNetwork } from '@/types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networks: WifiNetwork[];
}

export function ShareDialog({ open, onOpenChange, networks }: ShareDialogProps) {
  const { t } = useTranslation();
  const [useEncryption, setUseEncryption] = useState(false);
  const [password, setPassword] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const urlTooLong = shareLink.length > MAX_URL_LENGTH;

  const generate = useCallback(async () => {
    setGenerating(true);
    setError('');
    try {
      const link = await createShareLink(networks, useEncryption ? password : undefined);
      setShareLink(link);
    } catch {
      setError(t('common.error'));
    } finally {
      setGenerating(false);
    }
  }, [networks, useEncryption, password, t]);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareLink]);

  const handleClose = () => {
    setShareLink('');
    setPassword('');
    setUseEncryption(false);
    setCopied(false);
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            {t('share.title')}
          </DialogTitle>
          <DialogDescription>{t('share.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            {t('import.networks', { count: networks.length })}
          </p>

          {/* Encryption toggle */}
          <div className="flex items-center gap-3">
            <Switch id="encrypt" checked={useEncryption} onCheckedChange={(v) => { setUseEncryption(v); setShareLink(''); }} />
            <div>
              <Label htmlFor="encrypt" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                {t('share.encrypt')}
              </Label>
              <p className="text-xs text-[var(--muted-foreground)]">{t('share.encryptHint')}</p>
            </div>
          </div>

          {useEncryption && (
            <div className="space-y-2">
              <Label htmlFor="sharePassword">{t('share.password')}</Label>
              <Input
                id="sharePassword"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setShareLink(''); }}
                placeholder={t('share.passwordPlaceholder')}
              />
            </div>
          )}

          {!shareLink ? (
            <>
              <Button
                onClick={generate}
                disabled={generating || (useEncryption && password.length < 1)}
                className="w-full"
              >
                <ShieldCheck className="h-4 w-4" />
                {t('share.generate')}
              </Button>
              {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
            </>
          ) : (
            <div className="space-y-2">
              <Label>{t('share.link')}</Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="font-mono text-xs"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button variant="outline" size="icon" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600">{t('share.linkCopied')}</p>
              )}
              {urlTooLong && (
                <div className="flex items-start gap-2 p-2.5 rounded-md bg-[var(--warning-bg)] text-[var(--warning)]">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium">{t('share.urlTooLong')}</p>
                    <p className="opacity-80 mt-0.5">{t('share.urlTooLongHint', { length: shareLink.length.toLocaleString(), max: MAX_URL_LENGTH.toLocaleString() })}</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-[var(--muted-foreground)]">
                {shareLink.length.toLocaleString()} {t('share.characters')}
                {useEncryption && <span> &middot; AES-256-GCM</span>}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>{t('share.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
