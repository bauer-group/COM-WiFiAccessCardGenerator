import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PrintView } from './PrintView';
import { getSettings } from '@/db';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, type PrintLayout, type WifiNetwork } from '@/types';

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networks: WifiNetwork[];
  defaultLanguage?: string;
}

/**
 * CSS for print output — suppresses browser headers/footers via @page margin: 0.
 */
const PRINT_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; padding: 0; }
  .print-break-before { break-before: page; }
  .print-avoid-break { break-inside: avoid; }
  @page {
    margin: 0;
    size: auto;
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

export function PrintDialog({ open, onOpenChange, networks, defaultLanguage }: PrintDialogProps) {
  const { t, i18n } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<PrintLayout>('sheet');
  const [multilingual, setMultilingual] = useState(false);
  const [printLangs, setPrintLangs] = useState<string[]>([defaultLanguage || i18n.language?.split('-')[0] || 'en']);
  const [downloading, setDownloading] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Reset settingsLoaded when dialog closes, so re-opening re-reads from DB
  useEffect(() => {
    if (!open) setSettingsLoaded(false);
  }, [open]);

  // Load saved print defaults from IndexedDB on each open
  useEffect(() => {
    if (!open || settingsLoaded) return;
    getSettings().then((s) => {
      setLayout(s.defaultPrintLayout);
      setMultilingual(s.printMultilingual);
      const uiLang = i18n.language?.split('-')[0] || 'en';
      if (s.printLanguages.length > 0) {
        setPrintLangs(s.printLanguages);
      } else {
        setPrintLangs([defaultLanguage || uiLang]);
      }
      setSettingsLoaded(true);
    });
  }, [open, settingsLoaded, defaultLanguage, i18n.language]);

  const toggleLang = useCallback((lang: string) => {
    setPrintLangs((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang],
    );
  }, []);

  /** Build full HTML document string from the preview content */
  const buildPrintHtml = useCallback(() => {
    const content = printRef.current;
    if (!content) return null;
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>WiFi Credentials</title>
  <style>${PRINT_CSS}</style>
</head>
<body>${content.innerHTML}</body>
</html>`;
  }, []);

  /** Print via hidden iframe — no blank page flash */
  const handlePrint = useCallback(() => {
    const html = buildPrintHtml();
    if (!html) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Clean up after print dialog closes
      setTimeout(() => {
        if (iframe.parentNode) document.body.removeChild(iframe);
      }, 1000);
    }, 300);
  }, [buildPrintHtml]);

  /** Generate real PDF file and trigger download */
  const handleDownloadPdf = useCallback(async () => {
    const content = printRef.current;
    if (!content) return;

    setDownloading(true);
    try {
      // Lazy-load heavy PDF libs (tree-shaken from main bundle)
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ]);

      // Render the preview to a high-res canvas
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      const pdf = new jsPDF({
        orientation: scaledHeight > pdfHeight ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // If content fits on one page
      if (scaledHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
      } else {
        // Multi-page: slice the canvas into A4-sized pages
        const pageCanvasHeight = pdfHeight / ratio;
        let remainingHeight = imgHeight;
        let srcY = 0;
        let page = 0;

        while (remainingHeight > 0) {
          if (page > 0) pdf.addPage();

          const sliceHeight = Math.min(pageCanvasHeight, remainingHeight);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, srcY, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);

          const pageImgData = pageCanvas.toDataURL('image/png');
          const pageScaledHeight = sliceHeight * ratio;
          pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pageScaledHeight);

          srcY += sliceHeight;
          remainingHeight -= sliceHeight;
          page++;
        }
      }

      // PDF metadata
      const appTitle = t('app.title');
      pdf.setProperties({
        title: `${appTitle} – ${networks.map((n) => n.name).join(', ')}`,
        author: 'BAUER GROUP',
        subject: appTitle,
        keywords: 'WiFi, QR, credentials',
        creator: `${appTitle} v${__APP_VERSION__}`,
      });

      // Filename: localized prefix + network name, keeping Unicode intact
      const networkName = networks.length === 1
        ? networks[0].name
        : `${networks.length} ${t('nav.networks')}`;
      const safeChars = (s: string) => s.replace(/[<>:"/\\|?*]/g, '-').substring(0, 60);
      pdf.save(`${safeChars(appTitle)} - ${safeChars(networkName)}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [networks, t]);

  if (networks.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('print.preview')}</DialogTitle>
          <DialogDescription>{t('print.selectNetworks', { count: networks.length })}</DialogDescription>
        </DialogHeader>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-end border-b border-[var(--border)] pb-4">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('print.layout')}</Label>
            <Select value={layout} onValueChange={(v) => setLayout(v as PrintLayout)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sheet">{t('print.layouts.sheet')}</SelectItem>
                <SelectItem value="sticker">{t('print.layouts.sticker')}</SelectItem>
                <SelectItem value="card">{t('print.layouts.card')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{t('print.language')}</Label>
            <Select
              value={printLangs[0]}
              onValueChange={(v) => setPrintLangs((prev) => [v, ...prev.filter((l) => l !== v)])}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, label]) => (
                  <SelectItem key={code} value={code}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="multilingual" checked={multilingual} onCheckedChange={setMultilingual} />
            <Label htmlFor="multilingual" className="text-xs">{t('print.multilingual')}</Label>
          </div>

          {multilingual && (
            <div className="w-full">
              <Label className="text-xs mb-1.5 block">{t('print.selectLanguages')}</Label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => toggleLang(code)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      printLangs.includes(code)
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
        </div>

        {/* Preview — width matches A4 proportions for accurate WYSIWYG */}
        <div className="border border-[var(--border)] rounded-lg bg-white overflow-auto max-h-[50vh]">
          <div ref={printRef} style={{ minWidth: '700px' }}>
            <PrintView
              networks={networks}
              layout={layout}
              languages={printLangs}
              multilingual={multilingual}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf} disabled={downloading}>
            {downloading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Download className="h-4 w-4" />
            }
            {t('common.download')} PDF
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            {t('print.print')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
