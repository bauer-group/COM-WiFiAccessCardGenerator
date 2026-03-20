import { QRCodeSVG } from 'qrcode.react';
import { generateWifiQrString, formatSecurityType } from '@/utils/wifi-qr';
import { getPrintLabels, type PrintLabels } from '@/utils/print-labels';
import type { WifiNetwork, PrintLayout } from '@/types';

interface PrintViewProps {
  networks: WifiNetwork[];
  layout: PrintLayout;
  languages: string[];
  multilingual: boolean;
  showGuide?: boolean;
}

export function PrintView({ networks, layout, languages, multilingual, showGuide = false }: PrintViewProps) {
  const langs = languages.length > 0 ? languages : ['en'];

  if (layout === 'sticker') {
    return <StickerLayout networks={networks} langs={langs} multilingual={multilingual} />;
  }
  if (layout === 'card') {
    return <CardLayout networks={networks} langs={langs} multilingual={multilingual} />;
  }
  return <SheetLayout networks={networks} langs={langs} multilingual={multilingual} showGuide={showGuide} />;
}

/**
 * Deduplicate label texts across languages (e.g. "Password" appears the same in multiple langs).
 * Returns unique strings preserving order.
 */
function uniqueTexts(labels: PrintLabels[], field: keyof PrintLabels): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const l of labels) {
    const text = l[field];
    if (!seen.has(text)) {
      seen.add(text);
      result.push(text);
    }
  }
  return result;
}

/**
 * Stacked multilingual label row — primary language larger, additional languages smaller + muted.
 * Prevents horizontal overflow when many languages are selected.
 */
function LabelRow({ labels, field, value }: { labels: PrintLabels[]; field: keyof PrintLabels; value: string }) {
  const texts = uniqueTexts(labels, field);
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '10px' }}>
      <div style={{ minWidth: '100px', flexShrink: 0 }}>
        {texts.map((text, i) => (
          <div key={i} style={{
            fontSize: i === 0 ? '12px' : '10px',
            color: i === 0 ? '#6B635C' : '#A69E97',
            lineHeight: 1.35,
          }}>
            {text}
          </div>
        ))}
      </div>
      <span style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

/**
 * Stacked scan hint — each language on its own line.
 */
function ScanHint({ labels }: { labels: PrintLabels[] }) {
  const texts = uniqueTexts(labels, 'scanToConnect');
  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid #E0DBD6', paddingTop: '12px' }}>
      {texts.map((text, i) => (
        <p key={i} style={{
          fontSize: '11px',
          color: i === 0 ? '#887F78' : '#A69E97',
          lineHeight: 1.5,
          marginBottom: i < texts.length - 1 ? '4px' : 0,
        }}>
          {text}
        </p>
      ))}
    </div>
  );
}

/**
 * Stacked notice texts (hidden network, open network, enterprise auth).
 */
function NoticeTexts({ labels, field, color }: { labels: PrintLabels[]; field: keyof PrintLabels; color: string }) {
  const texts = uniqueTexts(labels, field);
  return (
    <div style={{ marginTop: '10px' }}>
      {texts.map((text, i) => (
        <p key={i} style={{
          fontSize: i === 0 ? '13px' : '11px',
          color: i === 0 ? color : '#A69E97',
          lineHeight: 1.45,
          fontStyle: field === 'hiddenNetwork' ? 'italic' : 'normal',
          marginBottom: i < texts.length - 1 ? '3px' : 0,
        }}>
          {text}
        </p>
      ))}
    </div>
  );
}

/* ─── Information Sheet (A4) ──────────────────────── */
function SheetLayout({ networks, langs, multilingual, showGuide = false }: { networks: WifiNetwork[]; langs: string[]; multilingual: boolean; showGuide?: boolean }) {
  return (
    <div>
      {networks.map((network, idx) => {
        const qr = generateWifiQrString(network);
        const sec = formatSecurityType(network);
        const langList = multilingual ? langs : [langs[0]];
        const labels = langList.map((l) => getPrintLabels(l));

        return (
          <div
            key={network.id ?? idx}
            className={idx > 0 ? 'print-break-before' : ''}
            style={{
              padding: '15mm 15mm',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: '#231F1C',
              pageBreakAfter: idx < networks.length - 1 ? 'always' : 'auto',
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '3px solid #FF8500', paddingBottom: '12px', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>
                {network.name}
              </h1>
              {network.location && (
                <p style={{ fontSize: '15px', color: '#6B635C', margin: '6px 0 0' }}>{network.location}</p>
              )}
            </div>

            {/* Content */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              {/* QR Code */}
              <div style={{
                flexShrink: 0,
                padding: '14px',
                border: '1px solid #E0DBD6',
                borderRadius: '12px',
                background: '#fff',
                lineHeight: 0,
              }}>
                <QRCodeSVG value={qr} size={220} level="M" marginSize={0} bgColor="#ffffff" fgColor="#231F1C" />
              </div>

              {/* Details */}
              <div style={{ flex: 1 }}>
                <LabelRow labels={labels} field="networkName" value={network.ssid} />
                <LabelRow labels={labels} field="security" value={sec} />

                {network.security !== 'open' && network.authMode === 'psk' && network.password && (
                  <LabelRow labels={labels} field="password" value={network.password} />
                )}

                {network.security === 'open' && (
                  <NoticeTexts labels={labels} field="noPassword" color="#22C55E" />
                )}

                {network.authMode === 'eap' && (
                  <NoticeTexts labels={labels} field="enterpriseAuth" color="#3B82F6" />
                )}

                {network.hidden && (
                  <NoticeTexts labels={labels} field="hiddenNetwork" color="#EAB308" />
                )}

                <ScanHint labels={labels} />
              </div>
            </div>

            {network.notes && (
              <div style={{ marginTop: '28px', padding: '14px 16px', background: '#F9F8F6', borderRadius: '8px', fontSize: '13px', color: '#6B635C', lineHeight: 1.5 }}>
                {network.notes}
              </div>
            )}

            {/* Optional connection guide */}
            {showGuide && <ConnectionGuide labels={labels} />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Illustrated Connection Guide (for sheet layout) ── */
function ConnectionGuide({ labels }: { labels: PrintLabels[] }) {
  const texts = {
    title: uniqueTexts(labels, 'guideTitle'),
    step1: uniqueTexts(labels, 'guideStep1'),
    step2: uniqueTexts(labels, 'guideStep2'),
    step3: uniqueTexts(labels, 'guideStep3'),
    step4: uniqueTexts(labels, 'guideStep4'),
  };

  const stepIconSize = 48;
  const iconColor = '#FF8500';
  const iconBg = '#FFF7ED';

  const steps = [
    { texts: texts.step1, icon: (
      <svg width={stepIconSize} height={stepIconSize} viewBox="0 0 48 48" fill="none">
        <rect x="12" y="6" width="24" height="36" rx="4" stroke={iconColor} strokeWidth="2.5" fill="none" />
        <circle cx="24" cy="19" r="6" stroke={iconColor} strokeWidth="2" fill={iconBg} />
        <circle cx="24" cy="19" r="2.5" fill={iconColor} />
        <rect x="20" y="34" width="8" height="3" rx="1.5" fill={iconColor} opacity="0.4" />
      </svg>
    )},
    { texts: texts.step2, icon: (
      <svg width={stepIconSize} height={stepIconSize} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="8" width="20" height="20" rx="2" stroke={iconColor} strokeWidth="2" fill={iconBg} />
        <rect x="7" y="11" width="4" height="4" fill={iconColor} />
        <rect x="13" y="11" width="4" height="4" fill={iconColor} />
        <rect x="7" y="17" width="4" height="4" fill={iconColor} />
        <rect x="13" y="17" width="4" height="4" fill={iconColor} />
        <rect x="10" y="14" width="4" height="4" fill={iconBg} />
        <rect x="26" y="12" width="18" height="28" rx="3" stroke={iconColor} strokeWidth="2" fill="none" />
        <line x1="22" y1="22" x2="30" y2="18" stroke={iconColor} strokeWidth="1.5" strokeDasharray="3 2" />
      </svg>
    )},
    { texts: texts.step3, icon: (
      <svg width={stepIconSize} height={stepIconSize} viewBox="0 0 48 48" fill="none">
        <rect x="12" y="6" width="24" height="36" rx="4" stroke={iconColor} strokeWidth="2.5" fill="none" />
        <rect x="16" y="14" width="16" height="10" rx="3" fill={iconBg} stroke={iconColor} strokeWidth="1.5" />
        <text x="24" y="21.5" textAnchor="middle" fontSize="7" fontWeight="700" fill={iconColor}>WiFi</text>
        <circle cx="24" cy="35" r="4" fill={iconColor} opacity="0.2" />
        <path d="M22 33 L24 37 L26 33" fill={iconColor} opacity="0.5" />
      </svg>
    )},
    { texts: texts.step4, icon: (
      <svg width={stepIconSize} height={stepIconSize} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" fill={iconBg} stroke={iconColor} strokeWidth="2.5" />
        <path d="M16 24 L22 30 L32 18" stroke={iconColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )},
  ];

  return (
    <div style={{ marginTop: '32px', borderTop: '2px solid #E0DBD6', paddingTop: '24px' }}>
      {/* Guide title — multilingual stacked */}
      <div style={{ marginBottom: '20px' }}>
        {texts.title.map((text, i) => (
          <div key={i} style={{
            fontSize: i === 0 ? '16px' : '12px',
            fontWeight: i === 0 ? 700 : 400,
            color: i === 0 ? '#231F1C' : '#A69E97',
            lineHeight: 1.4,
          }}>
            {text}
          </div>
        ))}
      </div>

      {/* 4 Steps in a row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        {steps.map((step, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
            {/* Step number */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '24px', height: '24px', borderRadius: '50%',
              background: iconColor, color: '#fff', fontSize: '13px', fontWeight: 700,
              marginBottom: '10px',
            }}>
              {idx + 1}
            </div>

            {/* Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              {step.icon}
            </div>

            {/* Label — multilingual stacked */}
            {step.texts.map((text, i) => (
              <div key={i} style={{
                fontSize: i === 0 ? '12px' : '10px',
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? '#231F1C' : '#A69E97',
                lineHeight: 1.35,
              }}>
                {text}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Build flat list of (network, lang) pairs for compact layouts.
 * When multilingual: one item per language per network.
 * Otherwise: one item per network in the primary language.
 */
function buildCompactItems(networks: WifiNetwork[], langs: string[], multilingual: boolean) {
  const langList = multilingual ? langs : [langs[0]];
  const items: { network: WifiNetwork; lang: string; key: string }[] = [];
  for (const network of networks) {
    for (const lang of langList) {
      items.push({ network, lang, key: `${network.id ?? network.ssid}-${lang}` });
    }
  }
  return items;
}

/* ─── Sticker (small, multiple per page) ─────────── */
function StickerLayout({ networks, langs, multilingual }: { networks: WifiNetwork[]; langs: string[]; multilingual: boolean }) {
  const items = buildCompactItems(networks, langs, multilingual);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#231F1C',
    }}>
      {items.map(({ network, lang, key }) => {
        const qr = generateWifiQrString(network);
        const sec = formatSecurityType(network);
        const labels = getPrintLabels(lang);

        return (
          <div
            key={key}
            className="print-avoid-break"
            style={{
              border: '1px dashed #C4BDB7',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <div style={{ flexShrink: 0, background: '#fff', padding: '4px', borderRadius: '6px', lineHeight: 0 }}>
              <QRCodeSVG value={qr} size={72} level="M" marginSize={0} bgColor="#ffffff" fgColor="#231F1C" />
            </div>
            <div style={{ flex: 1, minWidth: 0, fontSize: '11px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {network.name}
              </div>
              <div style={{ color: '#6B635C' }}>
                {labels.networkName}: <span style={{ fontFamily: 'monospace' }}>{network.ssid}</span>
              </div>
              <div style={{ color: '#6B635C' }}>
                {labels.security}: <span style={{ fontWeight: 600 }}>{sec}</span>
              </div>
              {network.password && network.authMode === 'psk' && (
                <div style={{ color: '#6B635C' }}>
                  {labels.password}: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{network.password}</span>
                </div>
              )}
              {network.security === 'open' && (
                <div style={{ color: '#22C55E', fontSize: '10px' }}>{labels.noPassword}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Card (credit card size, laminated) ─────────── */
function CardLayout({ networks, langs, multilingual }: { networks: WifiNetwork[]; langs: string[]; multilingual: boolean }) {
  const items = buildCompactItems(networks, langs, multilingual);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, auto)',
      gap: '20px',
      padding: '20px',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#231F1C',
    }}>
      {items.map(({ network, lang, key }) => {
        const qr = generateWifiQrString(network);
        const sec = formatSecurityType(network);
        const labels = getPrintLabels(lang);

        return (
          <div
            key={key}
            className="print-avoid-break"
            style={{
              width: '85.6mm',
              height: '53.98mm',
              border: '1px solid #E0DBD6',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #ffffff 0%, #F9F8F6 100%)',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Top: Name + badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>{network.name}</div>
              <div style={{
                fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '9999px',
                background: network.security === 'open' ? '#FEF9C3' : '#DCFCE7',
                color: network.security === 'open' ? '#A16207' : '#15803D',
                whiteSpace: 'nowrap',
              }}>
                {sec}
              </div>
            </div>

            {/* Middle: QR + credentials */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, margin: '6px 0' }}>
              <div style={{ flexShrink: 0, background: '#fff', padding: '3px', borderRadius: '4px', border: '1px solid #E0DBD6', lineHeight: 0 }}>
                <QRCodeSVG value={qr} size={64} level="M" marginSize={0} bgColor="#ffffff" fgColor="#231F1C" />
              </div>
              <div style={{ flex: 1, fontSize: '10px', lineHeight: 1.5, overflow: 'hidden' }}>
                <div style={{ color: '#6B635C' }}>
                  {labels.networkName}: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{network.ssid}</span>
                </div>
                {network.password && network.authMode === 'psk' && (
                  <div style={{ color: '#6B635C' }}>
                    {labels.password}: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{network.password}</span>
                  </div>
                )}
                {network.security === 'open' && (
                  <div style={{ color: '#22C55E' }}>{labels.noPassword}</div>
                )}
                {network.authMode === 'eap' && (
                  <div style={{ color: '#3B82F6', fontSize: '9px' }}>{labels.enterpriseAuth}</div>
                )}
              </div>
            </div>

            {/* Bottom: Scan hint */}
            <div style={{ fontSize: '8px', color: '#A69E97', textAlign: 'center' }}>
              {labels.scanToConnect}
            </div>
          </div>
        );
      })}
    </div>
  );
}
