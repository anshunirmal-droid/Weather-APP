// Small, safe wrappers around localStorage (it can throw in private mode or when full).

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full — ignore */
  }
}

/** Short random id for rules, log entries, etc. */
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
