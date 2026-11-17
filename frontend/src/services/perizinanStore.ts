import { Perizinan } from '../types/perizinan';
import default80Items from '../data/allPerizinan80.json';
import { getApiBaseUrl } from './apiConfig';

const STORAGE_KEY = 'bukusaku_perizinan_master_v1';
const LISTEN_EVENT = 'bukusaku_perizinan_updated';
const BACKEND_URL = getApiBaseUrl();

// Helper to load perizinan items
export const getStoredPerizinan = (): Perizinan[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading perizinan from localStorage:', e);
  }
  return default80Items as unknown as Perizinan[];
};

// Sync Perizinan from SQLite Database
export const syncPerizinanFromDatabase = async (): Promise<Perizinan[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/perizinan`);
    if (res.ok) {
      const json = await res.json();
      if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        window.dispatchEvent(new CustomEvent(LISTEN_EVENT, { detail: json.data }));
        return json.data;
      }
    }
  } catch (e) {
    // Offline fallback
  }
  return getStoredPerizinan();
};

// Save items to localStorage and trigger change event
export const savePerizinanList = (items: Perizinan[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(LISTEN_EVENT, { detail: items }));
  } catch (e) {
    console.error('Error saving perizinan to localStorage:', e);
  }
};

// Add a new perizinan (persists to SQLite database)
export const addPerizinanItem = (item: Omit<Perizinan, 'id' | 'slug'>): Perizinan => {
  const current = getStoredPerizinan();
  const maxId = current.reduce((max, cur) => (cur.id > max ? cur.id : max), 0);
  const newId = maxId + 1;
  const newSlug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newItem: Perizinan = {
    ...item,
    id: newId,
    slug: newSlug
  };

  const updated = [newItem, ...current];
  savePerizinanList(updated);

  // Sync to SQLite database
  fetch(`${BACKEND_URL}/api/perizinan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newItem)
  }).catch((err) => console.warn('Database save error:', err));

  return newItem;
};

// Update an existing perizinan (persists to SQLite database)
export const updatePerizinanItem = (id: number, updates: Partial<Perizinan>): Perizinan | null => {
  const current = getStoredPerizinan();
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updatedItem: Perizinan = {
    ...current[index],
    ...updates
  };

  current[index] = updatedItem;
  savePerizinanList(current);

  // Sync to SQLite database
  fetch(`${BACKEND_URL}/api/perizinan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedItem)
  }).catch((err) => console.warn('Database update error:', err));

  return updatedItem;
};

// Delete a perizinan (persists to SQLite database)
export const deletePerizinanItem = (id: number): boolean => {
  const current = getStoredPerizinan();
  const filtered = current.filter(p => p.id !== id);
  if (filtered.length === current.length) return false;

  savePerizinanList(filtered);

  // Sync delete to SQLite database
  fetch(`${BACKEND_URL}/api/perizinan/${id}`, {
    method: 'DELETE'
  }).catch((err) => console.warn('Database delete error:', err));

  return true;
};

// Reset to default 80 items in SQLite database
export const resetPerizinanToDefault = (): Perizinan[] => {
  savePerizinanList(default80Items as unknown as Perizinan[]);

  // Trigger backend SQLite reset
  fetch(`${BACKEND_URL}/api/perizinan/reset`, {
    method: 'POST'
  }).catch((err) => console.warn('Database reset error:', err));

  return default80Items as unknown as Perizinan[];
};

// Subscribe to changes
export const subscribePerizinan = (callback: (items: Perizinan[]) => void) => {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<Perizinan[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getStoredPerizinan());
    }
  };
  window.addEventListener(LISTEN_EVENT, handler);
  return () => window.removeEventListener(LISTEN_EVENT, handler);
};
