import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  Wifi, WifiOff, Lock, ShieldCheck, MapPin, Pencil, Trash2,
  Copy, Share2, Printer, Eye, EyeOff, Check, StickyNote, Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { generateWifiQrString, formatSecurityType } from '@/utils/wifi-qr';
import type { WifiNetwork } from '@/types';

interface NetworkCardProps {
  network: WifiNetwork;
  onEdit: (network: WifiNetwork) => void;
  onDelete: (network: WifiNetwork) => void;
  onPrint: (network: WifiNetwork) => void;
  onShare: (network: WifiNetwork) => void;
}

export function NetworkCard({ network, onEdit, onDelete, onPrint, onShare }: NetworkCardProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const qrString = generateWifiQrString(network);
  const securityLabel = formatSecurityType(network);

  const copyPassword = useCallback(async () => {
    if (!network.password) return;
    await navigator.clipboard.writeText(network.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [network.password]);

  const SecurityIcon = network.security === 'open' ? WifiOff :
    network.authMode === 'eap' ? ShieldCheck : Lock;

  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="p-4">
        {/* Top: QR + Info side by side */}
        <div className="flex gap-3 sm:gap-4">
          <div className="flex-shrink-0 self-start rounded-lg bg-white p-1.5 sm:p-2 shadow-sm border border-[var(--border)] leading-[0]">
            <QRCodeSVG
              value={qrString}
              size={88}
              level="M"
              marginSize={0}
              bgColor="#ffffff"
              fgColor="#231F1C"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + Badge */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold truncate">{network.name}</h3>
              <Badge variant={network.security === 'open' ? 'warning' : 'success'} className="flex-shrink-0">
                <SecurityIcon className="h-3 w-3 mr-1" />
                {securityLabel}
              </Badge>
            </div>

            {/* SSID */}
            <div className="flex items-center gap-2 mt-0.5">
              <Wifi className="h-3.5 w-3.5 text-[var(--muted-foreground)] flex-shrink-0" />
              <span className="text-sm text-[var(--muted-foreground)] truncate font-mono">{network.ssid}</span>
              {network.hidden && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{t('form.hidden')}</Badge>
              )}
            </div>

            {/* Password */}
            {network.security !== 'open' && network.authMode === 'psk' && network.password && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">{t('form.password')}:</span>
                <code className="text-sm font-mono bg-[var(--muted)] px-2 py-0.5 rounded select-all truncate">
                  {showPassword ? network.password : '\u2022'.repeat(Math.min(network.password.length, 16))}
                </code>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex-shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  aria-label={showPassword ? t('form.passwordHide') : t('form.passwordShow')}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={copyPassword}
                  className="flex-shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  aria-label={t('common.copy')}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            {/* EAP info */}
            {network.authMode === 'eap' && (
              <div className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                <span>{network.eapMethod}</span>
                {network.eapIdentity && <span> &middot; {network.eapIdentity}</span>}
              </div>
            )}

            {/* Location */}
            {network.location && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{network.location}</span>
              </div>
            )}

            {/* Notes */}
            {network.notes && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-1 flex items-start gap-1.5 text-xs text-[var(--muted-foreground)] cursor-default">
                    <StickyNote className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{network.notes}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm">
                  <p className="text-xs whitespace-pre-wrap">{network.notes}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Tags */}
            {network.tags && network.tags.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                <Tag className="h-3 w-3 text-[var(--muted-foreground)] flex-shrink-0" />
                {network.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom: action buttons — always horizontal */}
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onPrint(network)}>
              <Printer className="h-3 w-3" />
              {t('print.title')}
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onShare(network)}>
              <Share2 className="h-3 w-3" />
              {t('share.title')}
            </Button>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onEdit(network)}>
              <Pencil className="h-3 w-3" />
              {t('common.edit')}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-[var(--destructive)] hover:text-[var(--destructive)]" onClick={() => onDelete(network)}>
              <Trash2 className="h-3 w-3" />
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
