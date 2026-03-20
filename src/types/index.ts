export type SecurityType = 'open' | 'WPA' | 'WPA2' | 'WPA3';

export type EapMethod = 'PEAP' | 'TLS' | 'TTLS' | 'LEAP' | 'PWD';

export type EapPhase2 = 'MSCHAPV2' | 'GTC' | 'PAP';

export type AuthMode = 'psk' | 'eap';

export interface WifiNetwork {
  id?: number;
  ssid: string;
  hidden: boolean;
  security: SecurityType;
  authMode: AuthMode;
  /** PSK password (for authMode 'psk') */
  password?: string;
  /** EAP fields (for authMode 'eap') */
  eapMethod?: EapMethod;
  eapIdentity?: string;
  eapAnonymousIdentity?: string;
  eapPhase2?: EapPhase2;
  /** Metadata */
  name: string;
  location?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id?: number;
  uiLanguage: string;
  printLanguages: string[];
  printMultilingual: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultPrintLayout: PrintLayout;
}

export type PrintLayout = 'sheet' | 'sticker' | 'card';

export interface SharePayload {
  version: 1;
  networks: WifiNetwork[];
  exportedAt: string;
}

export type SupportedLanguage = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'tr' | 'ar' | 'zh' | 'ja' | 'ko' | 'pl' | 'ru' | 'ka' | 'th' | 'vi';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  tr: 'Türkçe',
  pl: 'Polski',
  ru: 'Русский',
  ar: 'العربية',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ka: 'ქართული',
  th: 'ไทย',
  vi: 'Tiếng Việt',
};
