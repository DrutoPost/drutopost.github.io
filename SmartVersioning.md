The core idea: **Keep data when the code updates, but clear data only when the database structure actually changes.**

---

## How It Works Conceptually

You track **two separate versions**:

1. **APP_VERSION** — Changes when you update code (UI, logic, features)
   - Examples: 1.0.0 → 1.0.1 → 1.0.5 → 1.1.0
   - Does NOT trigger data clearing

2. **DB_SCHEMA_VERSION** — Changes ONLY when you modify IndexedDB structure
   - Examples: 1 → 2 → 3 (only when you add/remove/rename stores or change what fields are stored)
   - DOES trigger data migration/clearing

**Example timeline:**
```
Day 1: APP v1.0, SCHEMA v1 → Deploy
Day 3: Fix button color → APP v1.0.1, SCHEMA v1 (unchanged) → Data stays
Day 5: Add new field to images → APP v1.1, SCHEMA v2 → Data migrates
Day 7: Optimize canvas → APP v1.1.1, SCHEMA v2 (unchanged) → Data stays
```

---

## Step-by-Step Implementation

### Step 1: Define Your Versions

In a config file or at the top of your app:

```javascript
// config.js
export const APP_VERSION = "1.0.0";
export const DB_SCHEMA_VERSION = 1;
```

### Step 2: Check Versions on Startup

```javascript
import { APP_VERSION, DB_SCHEMA_VERSION } from './config.js';

function initializeApp() {
  const storedAppVersion = localStorage.getItem('appVersion');
  const storedSchemaVersion = parseInt(localStorage.getItem('dbSchemaVersion') || '0');
  
  console.log('Current versions:', { APP_VERSION, DB_SCHEMA_VERSION });
  console.log('Stored versions:', { storedAppVersion, storedSchemaVersion });
  
  // Scenario 1: First time ever (no stored version)
  if (!storedAppVersion) {
    console.log('First time setup');
    localStorage.setItem('appVersion', APP_VERSION);
    localStorage.setItem('dbSchemaVersion', String(DB_SCHEMA_VERSION));
    openDB().then(() => startApp());
    return;
  }
  
  // Scenario 2: App code updated but schema unchanged (keep data, no migration)
  if (storedSchemaVersion === DB_SCHEMA_VERSION) {
    console.log('App updated but schema same — keeping data');
    localStorage.setItem('appVersion', APP_VERSION);
    openDB().then(() => startApp());
    return;
  }
  
  // Scenario 3: Schema changed (need to migrate or clear data)
  if (storedSchemaVersion < DB_SCHEMA_VERSION) {
    console.log(`Schema changed: v${storedSchemaVersion} → v${DB_SCHEMA_VERSION}`);
    migrateDatabase(storedSchemaVersion, DB_SCHEMA_VERSION).then(() => {
      localStorage.setItem('appVersion', APP_VERSION);
      localStorage.setItem('dbSchemaVersion', String(DB_SCHEMA_VERSION));
      location.reload(); // Refresh with new schema
    });
    return;
  }
  
  // Scenario 4: Downgrade (shouldn't happen, but handle it)
  if (storedSchemaVersion > DB_SCHEMA_VERSION) {
    console.warn('Downgrade detected, clearing data for safety');
    clearAllStorage().then(() => {
      localStorage.setItem('appVersion', APP_VERSION);
      localStorage.setItem('dbSchemaVersion', String(DB_SCHEMA_VERSION));
      location.reload();
    });
  }
}

initializeApp();
```

### Step 3: Open/Create IndexedDB

```javascript
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myAppDB', DB_SCHEMA_VERSION);
    
    request.onerror = () => {
      console.error('DB open failed:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      console.log('DB opened successfully');
      resolve(request.result);
    };
    
    // This fires when DB_SCHEMA_VERSION increases
    request.onupgradeneeded = (event) => {
      console.log('onupgradeneeded triggered');
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      
      // Only run migration if schema actually changed
      if (oldVersion < DB_SCHEMA_VERSION) {
        runMigration(db, oldVersion, DB_SCHEMA_VERSION);
      }
    };
  });
}
```

### Step 4: Migration Function

This is where you handle what changes between schema versions:

```javascript
function runMigration(db, oldVersion, newVersion) {
  console.log(`Running migration from v${oldVersion} to v${newVersion}`);
  
  // Migration from v0 or v1 to v1 (first time setup)
  if (oldVersion < 1) {
    console.log('Creating initial database structure (v1)');
    
    // Create object stores
    if (!db.objectStoreNames.contains('images')) {
      db.createObjectStore('images', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('cache')) {
      db.createObjectStore('cache', { keyPath: 'key' });
    }
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'key' });
    }
  }
  
  // Migration from v1 to v2
  if (oldVersion < 2) {
    console.log('Migrating from v1 to v2');
    
    // Example: Add new 'metadata' store
    if (!db.objectStoreNames.contains('metadata')) {
      db.createObjectStore('metadata', { keyPath: 'id' });
    }
    
    // Example: Transform existing data
    // Add 'createdAt' field to all images if missing
    if (db.objectStoreNames.contains('images')) {
      const transaction = event.target.transaction;
      const imagesStore = transaction.objectStore('images');
      
      imagesStore.getAll().onsuccess = (evt) => {
        evt.target.result.forEach(image => {
          if (!image.createdAt) {
            image.createdAt = Date.now();
            imagesStore.put(image); // Update the record
          }
        });
      };
    }
  }
  
  // Migration from v2 to v3
  if (oldVersion < 3) {
    console.log('Migrating from v2 to v3');
    
    // Delete old store
    if (db.objectStoreNames.contains('oldStore')) {
      db.deleteObjectStore('oldStore');
    }
    
    // Add new store
    if (!db.objectStoreNames.contains('projects')) {
      db.createObjectStore('projects', { keyPath: 'id' });
    }
  }
}
```

### Step 5: Helper Functions

```javascript
async function clearAllStorage() {
  // Clear all IndexedDB databases
  const dbs = await indexedDB.databases();
  for (const db of dbs) {
    console.log('Deleting database:', db.name);
    indexedDB.deleteDatabase(db.name);
  }
  
  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  console.log('All storage cleared');
}

function startApp() {
  console.log('Starting app with clean data');
  // Initialize your canvas app, load settings, etc.
  initializeCanvasApp();
}
```

---

## What Happens in Different Scenarios

### Scenario A: User has v1.0.0, you release v1.0.5 (same schema)

**Your version file after update:**
```json
{
  "appVersion": "1.0.5",
  "dbSchemaVersion": 1
}
```

**What happens:**
1. User opens site with old v1.0.0 app code and schema v1 data
2. App checks: storedSchemaVersion (1) === DB_SCHEMA_VERSION (1) ✓
3. ✅ **Data stays completely untouched**
4. App just updates appVersion in localStorage and starts normally
5. User's cached images, canvas data, settings all work as before

**Time:** Instant, no reload needed

---

### Scenario B: User has v1.0.0, you release v1.1.0 with new image fields (schema changed)

**Your code changes:**
```javascript
// OLD (v1.0.0)
// images store: { id, filename, blob }

// NEW (v1.1.0)
// images store: { id, filename, blob, tags, category, uploadDate }
```

**Your version file:**
```json
{
  "appVersion": "1.1.0",
  "dbSchemaVersion": 2
}
```

**What happens:**
1. User opens site with old v1.0.0 code and schema v1 data
2. App checks: storedSchemaVersion (1) < DB_SCHEMA_VERSION (2) → migration needed!
3. `onupgradeneeded` fires
4. Migration function runs:
   ```javascript
   if (oldVersion < 2) {
     // Transform existing images
     const images = db.transaction(['images'], 'readonly').objectStore('images');
     images.getAll().onsuccess = (evt) => {
       evt.target.result.forEach(image => {
         image.tags = []; // Add new field with default
         image.category = 'general'; // Add new field with default
         image.uploadDate = Date.now(); // Add new field with default
         images.put(image); // Save updated record
       });
     };
   }
   ```
5. App updates dbSchemaVersion to 2 in localStorage
6. Page reloads with new code
7. ✅ **User's images still exist, but now have the new fields**

**Time:** A few seconds (depends on how many images they have)

---

### Scenario C: User skips multiple versions (v1.0.0 → v1.2.0)

If v1.1.0 had schema change to v2, and v1.2.0 has schema change to v3:

**v1.1.0 migration code:**
```javascript
if (oldVersion < 2) { /* add tags field */ }
```

**v1.2.0 migration code:**
```javascript
if (oldVersion < 2) { /* add tags field */ }
if (oldVersion < 3) { /* add comments store */ }
```

**What happens:**
1. User jumps from v1.0.0 (schema v1) to v1.2.0 (schema v3)
2. `onupgradeneeded` fires with oldVersion=1, newVersion=3
3. Both migrations run:
   - First: adds tags (v1→v2)
   - Second: adds comments store (v2→v3)
4. ✅ **All transformations applied in order, data preserved**

---

## Real Example: Your Canvas Image App

Let's say you're building an image editor:

**Version 1.0 (Initial):**
```javascript
// config.js
export const APP_VERSION = "1.0.0";
export const DB_SCHEMA_VERSION = 1;

// db.js
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  if (event.oldVersion < 1) {
    // Create stores
    db.createObjectStore('images', { keyPath: 'id' });
    db.createObjectStore('settings', { keyPath: 'key' });
  }
};

// Data structure
// images: { id, filename, blob, width, height }
// settings: { key, value }
```

User creates 10 images and closes the browser.

**Version 1.0.5 (Bug fix, no schema change):**
```javascript
export const APP_VERSION = "1.0.5";
export const DB_SCHEMA_VERSION = 1; // SAME

// You fixed some canvas rendering bug
// User reopens site → data stays, app works with 10 images
```

**Version 1.1.0 (Add filters):**
```javascript
export const APP_VERSION = "1.1.0";
export const DB_SCHEMA_VERSION = 2; // CHANGED

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  if (event.oldVersion < 1) {
    db.createObjectStore('images', { keyPath: 'id' });
    db.createObjectStore('settings', { keyPath: 'key' });
  }
  
  if (event.oldVersion < 2) {
    // Add new store for filter presets
    db.createObjectStore('filters', { keyPath: 'id' });
    
    // Add 'appliedFilters' field to existing images
    const tx = event.target.transaction;
    const imagesStore = tx.objectStore('images');
    
    imagesStore.getAll().onsuccess = (evt) => {
      evt.target.result.forEach(image => {
        image.appliedFilters = []; // New field
        imagesStore.put(image);
      });
    };
  }
};

// Data structure
// images: { id, filename, blob, width, height, appliedFilters }
// settings: { key, value }
// filters: { id, name, settings } [NEW]
```

User upgrades → **onupgradeneeded fires**, adds `appliedFilters` to their 10 images, creates `filters` store → all 10 images accessible with new feature

**Version 1.1.5 (UI polish):**
```javascript
export const APP_VERSION = "1.1.5";
export const DB_SCHEMA_VERSION = 2; // SAME

// Small CSS/UI changes
// User reopens → data stays, everything works
```

---

## Implementation Checklist

```javascript
// ✅ 1. Split versions
const APP_VERSION = "1.0.5";        // Update every release
const DB_SCHEMA_VERSION = 1;        // Update ONLY when schema changes

// ✅ 2. Check both versions on startup
if (storedSchemaVersion === DB_SCHEMA_VERSION) {
  // Just update APP_VERSION, keep data
}

if (storedSchemaVersion < DB_SCHEMA_VERSION) {
  // Run migration, then reload
}

// ✅ 3. Write migrations incrementally
if (oldVersion < 2) { /* v1→v2 */ }
if (oldVersion < 3) { /* v2→v3 */ }
if (oldVersion < 4) { /* v3→v4 */ }

// ✅ 4. Always preserve old migration code
// Don't delete old migrations! Users might skip versions

// ✅ 5. Test locally
// Change storedSchemaVersion in DevTools to test migrations
```
