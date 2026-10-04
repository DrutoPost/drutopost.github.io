import { APP_VERSION, DB_SCHEMA_VERSION } from './versionConfig';
import { getPageScope } from './pageScope';
import { initDB, initAdDB, SECRET_DB_BASE, AD_DB_BASE, getScopedDbName } from './db';

export async function clearScopedStorage(overrideScope?: string): Promise<void> {
  const scope = overrideScope || getPageScope();

  const secretDbName = getScopedDbName(SECRET_DB_BASE, scope);
  const adDbName = getScopedDbName(AD_DB_BASE, scope);

  if (typeof indexedDB !== 'undefined') {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(secretDbName);
      req.onsuccess = req.onerror = () => resolve();
    });
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(adDbName);
      req.onsuccess = req.onerror = () => resolve();
    });
  }

  if (typeof localStorage !== 'undefined') {
    const prefix = `${scope}_`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}

export async function migrateScopedDatabase(oldVersion: number, newVersion: number, overrideScope?: string): Promise<void> {
  const scope = overrideScope || getPageScope();
  console.log(`[SmartVersioning] Migrating DB for scope '${scope}' from v${oldVersion} to v${newVersion}`);
  await initDB(scope, newVersion);
  await initAdDB(scope, newVersion);
}

export async function initializeSmartVersioning(overrideScope?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const scope = overrideScope || getPageScope();
  const appVersionKey = `${scope}_appVersion`;
  const schemaVersionKey = `${scope}_dbSchemaVersion`;

  const storedAppVersion = localStorage.getItem(appVersionKey);
  const storedSchemaVersion = parseInt(localStorage.getItem(schemaVersionKey) || '0', 10);

  console.log(`[SmartVersioning] Initializing for scope '${scope}'`);
  console.log('[SmartVersioning] Current versions:', { APP_VERSION, DB_SCHEMA_VERSION });
  console.log('[SmartVersioning] Stored versions:', { storedAppVersion, storedSchemaVersion });

  // Scenario 1: First time setup
  if (!storedAppVersion) {
    console.log('[SmartVersioning] First time setup for scope:', scope);
    localStorage.setItem(appVersionKey, APP_VERSION);
    localStorage.setItem(schemaVersionKey, String(DB_SCHEMA_VERSION));
    await initDB(scope, DB_SCHEMA_VERSION);
    await initAdDB(scope, DB_SCHEMA_VERSION);
    return;
  }

  // Scenario 2: Code updated but schema unchanged
  if (storedSchemaVersion === DB_SCHEMA_VERSION) {
    console.log('[SmartVersioning] App updated, schema unchanged — keeping data for scope:', scope);
    localStorage.setItem(appVersionKey, APP_VERSION);
    await initDB(scope, DB_SCHEMA_VERSION);
    await initAdDB(scope, DB_SCHEMA_VERSION);
    return;
  }

  // Scenario 3: Schema changed (upgrade/migration needed)
  if (storedSchemaVersion < DB_SCHEMA_VERSION) {
    console.log(`[SmartVersioning] Schema upgrade v${storedSchemaVersion} -> v${DB_SCHEMA_VERSION} for scope:`, scope);
    await migrateScopedDatabase(storedSchemaVersion, DB_SCHEMA_VERSION, scope);
    localStorage.setItem(appVersionKey, APP_VERSION);
    localStorage.setItem(schemaVersionKey, String(DB_SCHEMA_VERSION));
    return;
  }

  // Scenario 4: Downgrade detected
  if (storedSchemaVersion > DB_SCHEMA_VERSION) {
    console.warn('[SmartVersioning] Downgrade detected, clearing data for scope:', scope);
    await clearScopedStorage(scope);
    localStorage.setItem(appVersionKey, APP_VERSION);
    localStorage.setItem(schemaVersionKey, String(DB_SCHEMA_VERSION));
    await initDB(scope, DB_SCHEMA_VERSION);
    await initAdDB(scope, DB_SCHEMA_VERSION);
  }
}
