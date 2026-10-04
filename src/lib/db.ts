import { getPageScope } from './pageScope';
import { DB_SCHEMA_VERSION } from './versionConfig';

export interface AutoRecord {
  id: string;
  url: string;
  title: string;
  imageUrl: string;
  previewUrl: string;
  timestamp: string;
  postTime?: string;
  contentId?: number;
  highlightedIndices?: number[];
}

export interface AdData {
  id: string;
  name: string;
  data: string;
}

export const SECRET_DB_BASE = 'SecretBGDB';
export const AD_DB_BASE = 'AdImagesDB';
export const PHOTOCARDS_STORE = 'photocards';
export const ADS_STORE = 'ads';

export function getScopedDbName(baseName: string, overrideScope?: string): string {
  const scope = overrideScope || getPageScope();
  return `${scope}_${baseName}`;
}

export const initDB = (overrideScope?: string, version = DB_SCHEMA_VERSION): Promise<IDBDatabase> => {
  const dbName = getScopedDbName(SECRET_DB_BASE, overrideScope);
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return resolve({} as IDBDatabase);
    }
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTOCARDS_STORE)) {
        db.createObjectStore(PHOTOCARDS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteRecordDB = async (id: string, overrideScope?: string) => {
  if (typeof indexedDB === 'undefined') return true;
  const db = await initDB(overrideScope);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOCARDS_STORE, 'readwrite');
    const store = tx.objectStore(PHOTOCARDS_STORE);
    store.delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const clearRecordsDB = async (overrideScope?: string) => {
  if (typeof indexedDB === 'undefined') return true;
  const db = await initDB(overrideScope);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOCARDS_STORE, 'readwrite');
    const store = tx.objectStore(PHOTOCARDS_STORE);
    store.clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const saveRecordDB = async (record: AutoRecord, overrideScope?: string) => {
  if (typeof indexedDB === 'undefined') return true;
  const db = await initDB(overrideScope);
  const allRecords = await new Promise<AutoRecord[]>((resolve, reject) => {
    const tx = db.transaction(PHOTOCARDS_STORE, 'readonly');
    const store = tx.objectStore(PHOTOCARDS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (allRecords.length >= 50) {
    const sorted = allRecords.sort((a, b) => (a.contentId || new Date(a.timestamp).getTime()) - (b.contentId || new Date(b.timestamp).getTime()));
    const toDeleteCount = (allRecords.length - 50) + 1;
    const deleteTx = db.transaction(PHOTOCARDS_STORE, 'readwrite');
    const deleteStore = deleteTx.objectStore(PHOTOCARDS_STORE);
    for (let i = 0; i < toDeleteCount; i++) deleteStore.delete(sorted[i].id);
    await new Promise((resolve) => { deleteTx.oncomplete = resolve; });
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOCARDS_STORE, 'readwrite');
    tx.objectStore(PHOTOCARDS_STORE).put(record);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllRecordsDB = async (overrideScope?: string): Promise<AutoRecord[]> => {
  if (typeof indexedDB === 'undefined') return [];
  const db = await initDB(overrideScope);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOCARDS_STORE, 'readonly');
    const store = tx.objectStore(PHOTOCARDS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const initAdDB = (overrideScope?: string, version = DB_SCHEMA_VERSION): Promise<IDBDatabase> => {
  const dbName = getScopedDbName(AD_DB_BASE, overrideScope);
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return resolve({} as IDBDatabase);
    }
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ADS_STORE)) {
        db.createObjectStore(ADS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getSelectedAd = async (id: string, overrideScope?: string): Promise<AdData | undefined> => {
  if (typeof indexedDB === 'undefined') return undefined;
  const db = await initAdDB(overrideScope);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ADS_STORE, 'readonly');
    const request = tx.objectStore(ADS_STORE).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllAdsDB = async (overrideScope?: string): Promise<AdData[]> => {
  if (typeof indexedDB === 'undefined') return [];
  const db = await initAdDB(overrideScope);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ADS_STORE, 'readonly');
    const request = tx.objectStore(ADS_STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveAdDB = async (ad: AdData, overrideScope?: string) => {
  if (typeof indexedDB === 'undefined') return true;
  const db = await initAdDB(overrideScope);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ADS_STORE, 'readwrite');
    tx.objectStore(ADS_STORE).put(ad);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const deleteAdDB = async (id: string, overrideScope?: string) => {
  if (typeof indexedDB === 'undefined') return true;
  const db = await initAdDB(overrideScope);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ADS_STORE, 'readwrite');
    tx.objectStore(ADS_STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};
