import type { WifiNetwork } from '@/types';

/**
 * Escape special characters in WiFi QR code fields.
 * Per the WIFI: URI scheme, these characters must be backslash-escaped: \, ;, ,, ", :
 */
function escapeField(value: string): string {
  return value.replace(/([\\;,":])/g, '\\$1');
}

/**
 * Generate the standard WIFI: URI string for QR code encoding.
 * Format: WIFI:T:<type>;S:<ssid>;P:<password>;H:<hidden>;;
 *
 * This format is recognized by iOS, Android, and most QR code readers.
 */
export function generateWifiQrString(network: WifiNetwork): string {
  const parts: string[] = [];

  // Security type
  if (network.security === 'open') {
    parts.push('T:nopass');
  } else if (network.authMode === 'eap') {
    parts.push('T:WPA2-EAP');
  } else {
    // For PSK modes, use 'WPA' which works universally
    parts.push('T:WPA');
  }

  // SSID
  parts.push(`S:${escapeField(network.ssid)}`);

  // Password
  if (network.authMode === 'psk' && network.password) {
    parts.push(`P:${escapeField(network.password)}`);
  } else if (network.authMode === 'eap') {
    if (network.password) {
      parts.push(`P:${escapeField(network.password)}`);
    }
    if (network.eapIdentity) {
      parts.push(`I:${escapeField(network.eapIdentity)}`);
    }
  }

  // Hidden
  if (network.hidden) {
    parts.push('H:true');
  }

  return `WIFI:${parts.join(';')};;`;
}

/**
 * Format security type for display.
 */
export function formatSecurityType(network: WifiNetwork): string {
  if (network.security === 'open') return 'Open';
  const base = network.security;
  const mode = network.authMode === 'eap' ? ' Enterprise' : ' PSK';
  return base + mode;
}
