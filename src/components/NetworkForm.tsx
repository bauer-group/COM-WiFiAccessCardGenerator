import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Save, X } from 'lucide-react';
import { TagInput } from '@/components/TagInput';
import { getAllTags } from '@/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WifiNetwork, SecurityType, AuthMode, EapMethod, EapPhase2 } from '@/types';

interface NetworkFormProps {
  network?: WifiNetwork;
  onSave: (data: Omit<WifiNetwork, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const SECURITY_TYPES: SecurityType[] = ['open', 'WPA', 'WPA2', 'WPA3'];
const EAP_METHODS: EapMethod[] = ['PEAP', 'TLS', 'TTLS', 'LEAP', 'PWD'];
const EAP_PHASE2: EapPhase2[] = ['MSCHAPV2', 'GTC', 'PAP'];

export function NetworkForm({ network, onSave, onCancel }: NetworkFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState(network?.name ?? '');
  const [ssid, setSsid] = useState(network?.ssid ?? '');
  const [hidden, setHidden] = useState(network?.hidden ?? false);
  const [security, setSecurity] = useState<SecurityType>(network?.security ?? 'WPA2');
  const [authMode, setAuthMode] = useState<AuthMode>(network?.authMode ?? 'psk');
  const [password, setPassword] = useState(network?.password ?? '');
  const [eapMethod, setEapMethod] = useState<EapMethod>(network?.eapMethod ?? 'PEAP');
  const [eapIdentity, setEapIdentity] = useState(network?.eapIdentity ?? '');
  const [eapAnonymousIdentity, setEapAnonymousIdentity] = useState(network?.eapAnonymousIdentity ?? '');
  const [eapPhase2, setEapPhase2] = useState<EapPhase2>(network?.eapPhase2 ?? 'MSCHAPV2');
  const [location, setLocation] = useState(network?.location ?? '');
  const [notes, setNotes] = useState(network?.notes ?? '');
  const [tags, setTags] = useState<string[]>(network?.tags ?? []);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    getAllTags().then(setAllTags);
  }, []);

  useEffect(() => {
    if (security === 'open') {
      setAuthMode('psk');
      setPassword('');
    }
  }, [security]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name || ssid,
      ssid,
      hidden,
      security,
      authMode: security === 'open' ? 'psk' : authMode,
      password: security !== 'open' ? password : undefined,
      eapMethod: authMode === 'eap' && security !== 'open' ? eapMethod : undefined,
      eapIdentity: authMode === 'eap' && security !== 'open' ? eapIdentity : undefined,
      eapAnonymousIdentity: authMode === 'eap' && security !== 'open' ? eapAnonymousIdentity || undefined : undefined,
      eapPhase2: authMode === 'eap' && security !== 'open' ? eapPhase2 : undefined,
      location: location || undefined,
      notes: notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const MIN_PSK_LENGTH = 8;
  const MAX_PSK_LENGTH = 63;
  const pskTooShort = authMode === 'psk' && security !== 'open' && password.length > 0 && password.length < MIN_PSK_LENGTH;
  const pskTooLong = authMode === 'psk' && security !== 'open' && password.length > MAX_PSK_LENGTH;
  const isValid = ssid.trim().length > 0
    && (security === 'open' || (authMode === 'psk' && password.length >= MIN_PSK_LENGTH && password.length <= MAX_PSK_LENGTH) || authMode === 'eap');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{network ? t('networks.edit') : t('networks.add')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ssid">{t('form.ssid')} *</Label>
              <Input
                id="ssid"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder={t('form.ssidPlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t('form.name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('form.namePlaceholder')}
              />
            </div>
          </div>

          {/* Hidden Network */}
          <div className="flex items-center gap-3">
            <Switch id="hidden" checked={hidden} onCheckedChange={setHidden} />
            <div>
              <Label htmlFor="hidden">{t('form.hidden')}</Label>
              <p className="text-xs text-[var(--muted-foreground)]">{t('form.hiddenHint')}</p>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-2">
            <Label>{t('form.security')}</Label>
            <Select value={security} onValueChange={(v) => setSecurity(v as SecurityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECURITY_TYPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`form.securityTypes.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auth Mode (only for non-open) */}
          {security !== 'open' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('form.authMode')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={authMode === 'psk' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuthMode('psk')}
                  >
                    {t('form.psk')}
                  </Button>
                  <Button
                    type="button"
                    variant={authMode === 'eap' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuthMode('eap')}
                  >
                    {t('form.eap')}
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('form.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('form.passwordPlaceholder')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    aria-label={showPassword ? t('form.passwordHide') : t('form.passwordShow')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {authMode === 'psk' && (
                  <div className="flex items-center justify-between">
                    {pskTooShort ? (
                      <p className="text-xs text-[var(--destructive)]">{t('form.passwordTooShort', { min: MIN_PSK_LENGTH })}</p>
                    ) : pskTooLong ? (
                      <p className="text-xs text-[var(--destructive)]">{t('form.passwordTooLong', { max: MAX_PSK_LENGTH })}</p>
                    ) : (
                      <p className="text-xs text-[var(--muted-foreground)]">{t('form.passwordHint', { min: MIN_PSK_LENGTH, max: MAX_PSK_LENGTH })}</p>
                    )}
                    {password.length > 0 && (
                      <span className="text-xs text-[var(--muted-foreground)]">{password.length}/{MAX_PSK_LENGTH}</span>
                    )}
                  </div>
                )}
              </div>

              {/* EAP Fields */}
              {authMode === 'eap' && (
                <div className="space-y-4 rounded-lg border border-[var(--border)] p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t('form.eapMethod')}</Label>
                      <Select value={eapMethod} onValueChange={(v) => setEapMethod(v as EapMethod)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EAP_METHODS.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('form.eapPhase2')}</Label>
                      <Select value={eapPhase2} onValueChange={(v) => setEapPhase2(v as EapPhase2)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EAP_PHASE2.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eapIdentity">{t('form.eapIdentity')}</Label>
                    <Input
                      id="eapIdentity"
                      value={eapIdentity}
                      onChange={(e) => setEapIdentity(e.target.value)}
                      placeholder={t('form.eapIdentityPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eapAnonId">
                      {t('form.eapAnonymousIdentity')} <span className="text-[var(--muted-foreground)] text-xs">({t('common.optional')})</span>
                    </Label>
                    <Input
                      id="eapAnonId"
                      value={eapAnonymousIdentity}
                      onChange={(e) => setEapAnonymousIdentity(e.target.value)}
                      placeholder={t('form.eapAnonymousIdentityPlaceholder')}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location & Notes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">
                {t('form.location')} <span className="text-[var(--muted-foreground)] text-xs">({t('common.optional')})</span>
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('form.locationPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">
                {t('form.notes')} <span className="text-[var(--muted-foreground)] text-xs">({t('common.optional')})</span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('form.notesPlaceholder')}
                rows={2}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>
              {t('form.tags')} <span className="text-[var(--muted-foreground)] text-xs">({t('common.optional')})</span>
            </Label>
            <TagInput
              value={tags}
              onChange={setTags}
              suggestions={allTags}
              placeholder={t('form.tagsPlaceholder')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4" />
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={!isValid}>
              <Save className="h-4 w-4" />
              {t('form.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
