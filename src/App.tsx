import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Settings, Wifi, Search, Share2, Printer, X, ChevronRight, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { NetworkForm } from '@/components/NetworkForm';
import { NetworkCard } from '@/components/NetworkCard';
import { PrintDialog } from '@/components/PrintDialog';
import { ShareDialog } from '@/components/ShareDialog';
import { ImportDialog } from '@/components/ImportDialog';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';
import { getAllNetworks, addNetwork, updateNetwork, deleteNetwork } from '@/db';
import { parseShareFragment } from '@/utils/share';
import type { WifiNetwork } from '@/types';

type View = 'list' | 'add' | 'edit' | 'settings';

export default function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('list');
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [editingNetwork, setEditingNetwork] = useState<WifiNetwork | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [printNetworks, setPrintNetworks] = useState<WifiNetwork[]>([]);
  const [shareNetworks, setShareNetworks] = useState<WifiNetwork[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<WifiNetwork | null>(null);

  // Import from URL
  const [importData, setImportData] = useState<{ encrypted: boolean; data: string } | null>(null);

  const loadNetworks = useCallback(async () => {
    const all = await getAllNetworks();
    setNetworks(all);
  }, []);

  // Initial load
  useEffect(() => {
    loadNetworks();
  }, [loadNetworks]);

  // Check URL for import data
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const parsed = parseShareFragment(hash);
    if (parsed) setImportData(parsed);
  }, []);

  const handleSave = useCallback(async (data: Omit<WifiNetwork, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNetwork?.id) {
      await updateNetwork(editingNetwork.id, data);
    } else {
      await addNetwork(data);
    }
    await loadNetworks();
    setView('list');
    setEditingNetwork(null);
  }, [editingNetwork, loadNetworks]);

  const handleEdit = useCallback((network: WifiNetwork) => {
    setEditingNetwork(network);
    setView('edit');
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget?.id) {
      await deleteNetwork(deleteTarget.id);
      await loadNetworks();
    }
    setDeleteTarget(null);
  }, [deleteTarget, loadNetworks]);

  const handlePrint = useCallback((network: WifiNetwork) => {
    setPrintNetworks([network]);
  }, []);

  const handleShare = useCallback((network: WifiNetwork) => {
    setShareNetworks([network]);
  }, []);

  // Tag filter
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const n of networks) {
      if (n.tags) for (const t of n.tags) tagSet.add(t);
    }
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [networks]);

  const filteredNetworks = useMemo(() => {
    let result = networks;
    if (selectedTag) {
      result = result.filter((n) => n.tags?.includes(selectedTag));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) =>
        n.name.toLowerCase().includes(q) ||
        n.ssid.toLowerCase().includes(q) ||
        n.location?.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [networks, selectedTag, searchQuery]);

  const hasTags = allTags.length > 0;
  const UNGROUPED = '__ungrouped__';

  const groupedNetworks = useMemo(() => {
    if (!hasTags) return null;
    const groups = new Map<string, WifiNetwork[]>();
    for (const network of filteredNetworks) {
      if (!network.tags || network.tags.length === 0) {
        if (!groups.has(UNGROUPED)) groups.set(UNGROUPED, []);
        groups.get(UNGROUPED)!.push(network);
      } else {
        for (const tag of network.tags) {
          if (!groups.has(tag)) groups.set(tag, []);
          groups.get(tag)!.push(network);
        }
      }
    }
    return groups;
  }, [hasTags, filteredNetworks]);

  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="no-print sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/80">
          <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--primary)] text-white">
                <Wifi className="h-4 w-4" />
              </div>
              <h1 className="text-base font-bold hidden sm:block">{t('app.title')}</h1>
            </div>
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setView(view === 'settings' ? 'list' : 'settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
          {view === 'settings' ? (
            <SettingsPanel onBack={() => setView('list')} />
          ) : view === 'add' || view === 'edit' ? (
            <NetworkForm
              network={editingNetwork ?? undefined}
              onSave={handleSave}
              onCancel={() => { setView('list'); setEditingNetwork(null); }}
            />
          ) : (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('networks.search')}
                      className="pl-9"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {networks.length > 0 && (
                    <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                      {t('networks.count', { count: filteredNetworks.length })}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {networks.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setPrintNetworks(networks)}>
                        <Printer className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t('print.printAll')}</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShareNetworks(networks)}>
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t('share.shareAll')}</span>
                      </Button>
                    </>
                  )}
                  <Button size="sm" onClick={() => { setEditingNetwork(null); setView('add'); }}>
                    <Plus className="h-4 w-4" />
                    {t('networks.add')}
                  </Button>
                </div>
              </div>

              {/* Tag filter bar */}
              {hasTags && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      !selectedTag
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]'
                    }`}
                  >
                    {t('tags.all')}
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        selectedTag === tag
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                          : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Network list */}
              {filteredNetworks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-16 w-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
                    <Wifi className="h-8 w-8 text-[var(--muted-foreground)]" />
                  </div>
                  <h3 className="font-semibold text-lg">{t('networks.empty')}</h3>
                  <p className="text-[var(--muted-foreground)] mt-1 mb-4">{t('networks.emptyHint')}</p>
                  <Button onClick={() => { setEditingNetwork(null); setView('add'); }}>
                    <Plus className="h-4 w-4" />
                    {t('networks.add')}
                  </Button>
                </div>
              ) : groupedNetworks ? (
                /* Grouped view — when any network has tags */
                <div className="space-y-3">
                  {Array.from(groupedNetworks.entries()).map(([groupKey, groupNets]) => {
                    const isCollapsed = collapsedGroups.has(groupKey);
                    const label = groupKey === UNGROUPED ? t('tags.ungrouped') : groupKey;

                    return (
                      <div key={groupKey}>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => toggleGroup(groupKey)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                          >
                            <ChevronRight className={`h-4 w-4 transition-transform ${!isCollapsed ? 'rotate-90' : ''}`} />
                            <span>{label}</span>
                          </button>
                          <Badge variant="secondary" className="text-[10px]">{groupNets.length}</Badge>
                          <div className="flex-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-[var(--muted-foreground)]"
                            onClick={() => setPrintNetworks(groupNets)}
                            title={t('tags.printGroup')}
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-[var(--muted-foreground)]"
                            onClick={() => setShareNetworks(groupNets)}
                            title={t('tags.shareGroup')}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {!isCollapsed && (
                          <div className="grid gap-4 ml-6">
                            {groupNets.map((network) => (
                              <NetworkCard
                                key={network.id}
                                network={network}
                                onEdit={handleEdit}
                                onDelete={setDeleteTarget}
                                onPrint={handlePrint}
                                onShare={handleShare}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Flat view — when no network has tags */
                <div className="grid gap-4">
                  {filteredNetworks.map((network) => (
                    <NetworkCard
                      key={network.id}
                      network={network}
                      onEdit={handleEdit}
                      onDelete={setDeleteTarget}
                      onPrint={handlePrint}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="no-print border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted-foreground)]">
          <div>{t('settings.storage')} &middot; {t('settings.noAccount')}</div>
          <div className="mt-1 opacity-60">
            <a href="https://github.com/bauer-group/COM-WiFiAccessCardGenerator" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors underline decoration-dotted underline-offset-2">
              {t('app.title')} v{__APP_VERSION__}
            </a> &middot; BAUER GROUP
          </div>
        </footer>

        {/* Delete confirmation */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('networks.deleteConfirm', { name: deleteTarget?.name })}</DialogTitle>
              <DialogDescription>{t('networks.deleteConfirmText')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>{t('common.delete')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Print dialog */}
        <PrintDialog
          open={printNetworks.length > 0}
          onOpenChange={(open) => !open && setPrintNetworks([])}
          networks={printNetworks}
        />

        {/* Share dialog */}
        <ShareDialog
          open={shareNetworks.length > 0}
          onOpenChange={(open) => !open && setShareNetworks([])}
          networks={shareNetworks}
        />

        {/* PWA update prompt */}
        <PWAUpdatePrompt />

        {/* Import dialog */}
        {importData && (
          <ImportDialog
            open={!!importData}
            onOpenChange={(open) => !open && setImportData(null)}
            encrypted={importData.encrypted}
            rawData={importData.data}
            onImported={loadNetworks}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
