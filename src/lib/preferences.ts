const prefix = 'forest3d.';
export function readPreference(name: string, fallback: boolean) {
  try {
    const value = localStorage.getItem(prefix + name);
    return value === null ? fallback : value === 'true';
  } catch { return fallback; }
}
export function writePreference(name: string, value: boolean) {
  try { localStorage.setItem(prefix + name, String(value)); } catch { /* Storage is optional. */ }
}
