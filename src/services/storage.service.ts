/**
 * StorageService — Thin abstraction over localStorage.
 * 
 * When a real backend is introduced, replace the body of each method
 * with an API call. The rest of the app remains unchanged.
 */

const STORAGE_PREFIX = "financeflow_";

export const StorageService = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      console.error(`[StorageService] Failed to read key: ${key}`);
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch {
      console.error(`[StorageService] Failed to write key: ${key}`);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch {
      console.error(`[StorageService] Failed to remove key: ${key}`);
    }
  },

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      console.error("[StorageService] Failed to clear storage");
    }
  },
};
