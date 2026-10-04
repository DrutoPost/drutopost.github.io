import { getPageScope } from './pageScope';

export function getScopedKey(key: string, overrideScope?: string): string {
  const scope = overrideScope || getPageScope();
  return `${scope}_${key}`;
}

export function getScopedItem(key: string, overrideScope?: string): string | null {
  if (typeof window === 'undefined') return null;
  const scopeKey = getScopedKey(key, overrideScope);
  const scopedVal = localStorage.getItem(scopeKey);
  if (scopedVal !== null) return scopedVal;
  return localStorage.getItem(key);
}

export function setScopedItem(key: string, value: string, overrideScope?: string): void {
  if (typeof window === 'undefined') return;
  const scopeKey = getScopedKey(key, overrideScope);
  localStorage.setItem(scopeKey, value);
}

export function removeScopedItem(key: string, overrideScope?: string): void {
  if (typeof window === 'undefined') return;
  const scopeKey = getScopedKey(key, overrideScope);
  localStorage.removeItem(scopeKey);
  localStorage.removeItem(key);
}
