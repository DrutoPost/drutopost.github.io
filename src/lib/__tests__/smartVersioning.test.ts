import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPageScope } from '../pageScope';
import { getScopedKey, getScopedItem, setScopedItem, removeScopedItem } from '../scopedStorage';
import { getScopedDbName, SECRET_DB_BASE, AD_DB_BASE } from '../db';
import { initializeSmartVersioning, clearScopedStorage } from '../smartVersioning';
import { APP_VERSION, DB_SCHEMA_VERSION } from '../versionConfig';
import versionJson from '../../../version.json';

describe('pageScope', () => {
  it('extracts correct scope from pathname', () => {
    const setPath = (pathname: string) => {
      Object.defineProperty(window, 'location', {
        value: { pathname },
        writable: true,
      });
    };

    setPath('/demo/');
    expect(getPageScope()).toBe('demo');

    setPath('/DEEF/index.html');
    expect(getPageScope()).toBe('DEEF');

    setPath('/LMX');
    expect(getPageScope()).toBe('LMX');

    setPath('/IPA/');
    expect(getPageScope()).toBe('IPA');

    setPath('/');
    expect(getPageScope()).toBe('root');

    setPath('/cloned-page-123/');
    expect(getPageScope()).toBe('cloned-page-123');
  });
});

describe('scopedStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isolates storage items between different page scopes', () => {
    setScopedItem('bg_theme', 'night', 'demo');
    setScopedItem('bg_theme', 'day', 'LMX');

    expect(getScopedItem('bg_theme', 'demo')).toBe('night');
    expect(getScopedItem('bg_theme', 'LMX')).toBe('day');
  });

  it('removes scoped item cleanly', () => {
    setScopedItem('bg_selected_ad', 'ad_123', 'DEEF');
    expect(getScopedItem('bg_selected_ad', 'DEEF')).toBe('ad_123');

    removeScopedItem('bg_selected_ad', 'DEEF');
    expect(getScopedItem('bg_selected_ad', 'DEEF')).toBeNull();
  });
});

describe('scoped IndexedDB names', () => {
  it('generates unique DB names per webpage path', () => {
    expect(getScopedDbName(SECRET_DB_BASE, 'demo')).toBe('demo_SecretBGDB');
    expect(getScopedDbName(SECRET_DB_BASE, 'LMX')).toBe('LMX_SecretBGDB');
    expect(getScopedDbName(AD_DB_BASE, 'DEEF')).toBe('DEEF_AdImagesDB');
    expect(getScopedDbName(AD_DB_BASE, 'root')).toBe('root_AdImagesDB');
  });
});

describe('smartVersioning', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handles Scenario 1: First time setup', async () => {
    await initializeSmartVersioning('demo');
    expect(localStorage.getItem('demo_appVersion')).toBe(APP_VERSION);
    expect(localStorage.getItem('demo_dbSchemaVersion')).toBe(String(DB_SCHEMA_VERSION));
  });

  it('handles Scenario 2: App updated but schema same', async () => {
    localStorage.setItem('demo_appVersion', '0.9.0');
    localStorage.setItem('demo_dbSchemaVersion', String(DB_SCHEMA_VERSION));

    await initializeSmartVersioning('demo');
    expect(localStorage.getItem('demo_appVersion')).toBe(APP_VERSION);
    expect(localStorage.getItem('demo_dbSchemaVersion')).toBe(String(DB_SCHEMA_VERSION));
  });

  it('handles Scenario 4: Downgrade clears storage for that scope', async () => {
    localStorage.setItem('demo_appVersion', '2.0.0');
    localStorage.setItem('demo_dbSchemaVersion', '99');
    localStorage.setItem('demo_bg_theme', 'custom');

    await initializeSmartVersioning('demo');
    expect(localStorage.getItem('demo_appVersion')).toBe(APP_VERSION);
    expect(localStorage.getItem('demo_dbSchemaVersion')).toBe(String(DB_SCHEMA_VERSION));
    expect(localStorage.getItem('demo_bg_theme')).toBeNull();
  });
});

describe('version.json structure', () => {
  it('contains valid version formatted as timestamp date/time', () => {
    expect(versionJson).toHaveProperty('version');
    expect(typeof versionJson.version).toBe('string');
    // Version format check: e.g. YYYY.MM.DD.HH.mm
    expect(versionJson.version).toMatch(/^\d{4}\.\d{2}\.\d{2}\.\d{2}\.\d{2}$/);
  });
});
