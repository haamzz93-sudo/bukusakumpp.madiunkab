import { KategoriPerizinan } from '../types/perizinan';
import { KATEGORI_PERIZINAN } from '../data/perizinanMadiunData';
import { getApiBaseUrl } from './apiConfig';

const KLASTER_STORAGE_KEY = 'bukusaku_klaster_data';
const BACKEND_URL = getApiBaseUrl();

// Get all clusters from localStorage or default data
export const getStoredKlaster = (): KategoriPerizinan[] => {
  try {
    const saved = localStorage.getItem(KLASTER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Gagal membaca data klaster dari storage:', err);
  }
  return KATEGORI_PERIZINAN;
};

// Sync Klaster from SQLite Database
export const syncKlasterFromDatabase = async (): Promise<KategoriPerizinan[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/klaster`);
    if (res.ok) {
      const json = await res.json();
      if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
        // Map database response to KategoriPerizinan structure
        const mapped: KategoriPerizinan[] = json.data.map((c: any) => ({
          key: c.key,
          name: c.name,
          description: c.description,
          icon: c.key,
          questionCount: Array.isArray(c.questions) ? c.questions.length : 0,
          questions: Array.isArray(c.questions) ? c.questions : []
        }));
        saveStoredKlaster(mapped);
        return mapped;
      }
    }
  } catch (e) {
    // Offline fallback
  }
  return getStoredKlaster();
};

// Listeners for live sync
type KlasterListener = (klaster: KategoriPerizinan[]) => void;
const listeners: Set<KlasterListener> = new Set();

export const subscribeKlaster = (listener: KlasterListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyKlasterChange = (data: KategoriPerizinan[]) => {
  listeners.forEach((listener) => {
    try {
      listener(data);
    } catch (e) {
      console.error('Error in klaster listener:', e);
    }
  });
  window.dispatchEvent(new CustomEvent('bukusaku:klaster-updated', { detail: data }));
};

// Save entire cluster list
export const saveStoredKlaster = (data: KategoriPerizinan[]): void => {
  try {
    localStorage.setItem(KLASTER_STORAGE_KEY, JSON.stringify(data));
    notifyKlasterChange(data);
  } catch (err) {
    console.error('Gagal menyimpan data klaster:', err);
  }
};

// Add a new question to a specific cluster
export const addQuestionToKlaster = (categoryKey: string, question: string): boolean => {
  const cleanQ = question.trim();
  if (!cleanQ) return false;

  const current = getStoredKlaster();
  const index = current.findIndex(c => c.key === categoryKey);
  if (index === -1) return false;

  const updatedCategory = { ...current[index] };
  const existingQuestions = [...updatedCategory.questions];
  
  if (!existingQuestions.includes(cleanQ)) {
    existingQuestions.push(cleanQ);
    updatedCategory.questions = existingQuestions;
    updatedCategory.questionCount = existingQuestions.length;
    
    current[index] = updatedCategory;
    saveStoredKlaster(current);

    // Sync to SQLite database
    fetch(`${BACKEND_URL}/api/klaster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: categoryKey, question: cleanQ })
    }).catch(err => console.warn('Database add question error:', err));

    return true;
  }
  return false;
};

// Edit a question in a specific cluster
export const updateQuestionInKlaster = (categoryKey: string, questionIndex: number, newQuestion: string): boolean => {
  const cleanQ = newQuestion.trim();
  if (!cleanQ) return false;

  const current = getStoredKlaster();
  const catIndex = current.findIndex(c => c.key === categoryKey);
  if (catIndex === -1) return false;

  const updatedCategory = { ...current[catIndex] };
  const existingQuestions = [...updatedCategory.questions];

  if (questionIndex >= 0 && questionIndex < existingQuestions.length) {
    existingQuestions[questionIndex] = cleanQ;
    updatedCategory.questions = existingQuestions;
    
    current[catIndex] = updatedCategory;
    saveStoredKlaster(current);
    return true;
  }
  return false;
};

// Delete a question from a specific cluster
export const deleteQuestionFromKlaster = (categoryKey: string, questionIndex: number): boolean => {
  const current = getStoredKlaster();
  const catIndex = current.findIndex(c => c.key === categoryKey);
  if (catIndex === -1) return false;

  const updatedCategory = { ...current[catIndex] };
  const existingQuestions = [...updatedCategory.questions];

  if (questionIndex >= 0 && questionIndex < existingQuestions.length) {
    const deletedQ = existingQuestions[questionIndex];
    existingQuestions.splice(questionIndex, 1);
    updatedCategory.questions = existingQuestions;
    updatedCategory.questionCount = existingQuestions.length;

    current[catIndex] = updatedCategory;
    saveStoredKlaster(current);

    // Sync delete to SQLite database
    fetch(`${BACKEND_URL}/api/klaster`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: categoryKey, question: deletedQ })
    }).catch(err => console.warn('Database delete question error:', err));

    return true;
  }
  return false;
};

// Add a new cluster category
export const addKlaster = (newCat: KategoriPerizinan): boolean => {
  const current = getStoredKlaster();
  if (current.some(c => c.key === newCat.key)) {
    return false;
  }
  current.push({
    ...newCat,
    questionCount: newCat.questions?.length || 0
  });
  saveStoredKlaster(current);
  return true;
};

// Update cluster details (name, desc, etc.)
export const updateKlaster = (categoryKey: string, updated: Partial<KategoriPerizinan>): boolean => {
  const current = getStoredKlaster();
  const idx = current.findIndex(c => c.key === categoryKey);
  if (idx === -1) return false;

  current[idx] = {
    ...current[idx],
    ...updated,
    questionCount: updated.questions ? updated.questions.length : current[idx].questions.length
  };
  saveStoredKlaster(current);
  return true;
};

// Delete an entire cluster
export const deleteKlaster = (categoryKey: string): boolean => {
  const current = getStoredKlaster();
  const filtered = current.filter(c => c.key !== categoryKey);
  if (filtered.length === current.length) return false;

  saveStoredKlaster(filtered);
  return true;
};

// Reset all clusters to default official dataset
export const resetKlasterToDefault = (): void => {
  localStorage.removeItem(KLASTER_STORAGE_KEY);
  notifyKlasterChange(KATEGORI_PERIZINAN);

  // Sync reset to SQLite database
  fetch(`${BACKEND_URL}/api/klaster/reset`, {
    method: 'POST'
  }).catch(err => console.warn('Database reset klaster error:', err));
};
