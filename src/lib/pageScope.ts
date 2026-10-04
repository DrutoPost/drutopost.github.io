export function getPageScope(): string {
  if (typeof window === 'undefined') return 'root';
  let path = window.location.pathname;
  path = path.replace(/index\.html$/, '');
  path = path.replace(/^\/+|\/+$/g, '');
  if (!path) return 'root';
  return path.replace(/[^a-zA-Z0-9_-]/g, '_');
}
