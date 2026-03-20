import Dexie, { type EntityTable } from 'dexie';
import type { WifiNetwork, AppSettings } from '@/types';

const db = new Dexie('WifiCredentialsDB') as Dexie & {
  networks: EntityTable<WifiNetwork, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
};

db.version(1).stores({
  networks: '++id, ssid, name, createdAt, updatedAt',
  settings: '++id',
});

export { db };

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.toCollection().first();
  if (existing) return existing;

  const defaults: AppSettings = {
    uiLanguage: 'en',
    printLanguages: [],
    printMultilingual: false,
    theme: 'system',
    defaultPrintLayout: 'sheet',
  };
  const id = await db.settings.add(defaults);
  return { ...defaults, id: id as number };
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const settings = await getSettings();
  await db.settings.update(settings.id!, updates);
}

export async function addNetwork(network: Omit<WifiNetwork, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date().toISOString();
  return (await db.networks.add({
    ...network,
    createdAt: now,
    updatedAt: now,
  })) as number;
}

export async function updateNetwork(id: number, updates: Partial<WifiNetwork>): Promise<void> {
  await db.networks.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteNetwork(id: number): Promise<void> {
  await db.networks.delete(id);
}

export async function getAllNetworks(): Promise<WifiNetwork[]> {
  return db.networks.orderBy('updatedAt').reverse().toArray();
}

export async function getNetwork(id: number): Promise<WifiNetwork | undefined> {
  return db.networks.get(id);
}

export async function importNetworks(networks: WifiNetwork[]): Promise<number> {
  const now = new Date().toISOString();
  const toAdd = networks.map(({ id: _id, ...n }) => ({
    ...n,
    createdAt: n.createdAt || now,
    updatedAt: now,
  }));
  await db.networks.bulkAdd(toAdd);
  return toAdd.length;
}

export async function exportAllNetworks(): Promise<WifiNetwork[]> {
  return db.networks.toArray();
}
