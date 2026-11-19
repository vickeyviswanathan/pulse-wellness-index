import type { EmployeeProfile, OfflineAssessmentRecord } from '../types/pulse';

const DB_NAME = 'pulse_india_offline_v1';
const DB_VERSION = 1;
const STORE_PROFILE = 'employee_profile';
const STORE_QUEUE = 'clinician_offline_queue';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveEmployeeProfileOffline(profile: EmployeeProfile): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PROFILE, 'readwrite');
      tx.objectStore(STORE_PROFILE).put(profile);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    localStorage.setItem('pulse_employee_profile_fallback', JSON.stringify(profile));
  }
}

export async function loadEmployeeProfileOffline(): Promise<EmployeeProfile | null> {
  try {
    const db = await openDb();
    return await new Promise<EmployeeProfile | null>((resolve, reject) => {
      const tx = db.transaction(STORE_PROFILE, 'readonly');
      const req = tx.objectStore(STORE_PROFILE).get('EMP-AARAV-01');
      req.onsuccess = () => resolve((req.result as EmployeeProfile) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const raw = localStorage.getItem('pulse_employee_profile_fallback');
    return raw ? (JSON.parse(raw) as EmployeeProfile) : null;
  }
}

export async function saveAssessmentToOfflineQueue(record: OfflineAssessmentRecord): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_QUEUE, 'readwrite');
      tx.objectStore(STORE_QUEUE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const existing = await loadOfflineQueue();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)];
    localStorage.setItem('pulse_clinician_queue_fallback', JSON.stringify(updated));
  }
}

export async function loadOfflineQueue(): Promise<OfflineAssessmentRecord[]> {
  try {
    const db = await openDb();
    return await new Promise<OfflineAssessmentRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_QUEUE, 'readonly');
      const req = tx.objectStore(STORE_QUEUE).getAll();
      req.onsuccess = () => {
        const list = (req.result as OfflineAssessmentRecord[]) ?? [];
        resolve(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const raw = localStorage.getItem('pulse_clinician_queue_fallback');
    return raw ? (JSON.parse(raw) as OfflineAssessmentRecord[]) : [];
  }
}

export async function markAllQueuedRecordsSynced(): Promise<OfflineAssessmentRecord[]> {
  const records = await loadOfflineQueue();
  const updated = records.map((r) => ({ ...r, synced: true }));
  for (const r of updated) {
    await saveAssessmentToOfflineQueue(r);
  }
  return updated;
}
