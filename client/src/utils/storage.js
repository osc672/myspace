// client/src/utils/storage.js
// User-namespaced LocalStorage utilities using verified Google sub ID

const PREFIX = 'myspace_user_';

function key(sub, name) {
  return `${PREFIX}${sub}_${name}`;
}

export function getItem(sub, name) {
  try {
    const raw = localStorage.getItem(key(sub, name));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setItem(sub, name, value) {
  try {
    localStorage.setItem(key(sub, name), JSON.stringify(value));
  } catch {
    // QuotaExceededError - silently ignore
  }
}

export function removeItem(sub, name) {
  try {
    localStorage.removeItem(key(sub, name));
  } catch { /* ignore */ }
}

