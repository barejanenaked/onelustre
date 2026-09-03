/**
 * One Lustre was built inside Claude's artifact environment, where
 * `window.storage` is a real, hosted, cross-device key-value store
 * provided by Anthropic. That API does not exist outside Claude.ai.
 *
 * This file gives the exact same three methods (get / set / delete),
 * backed by the browser's own localStorage, so the app runs unmodified
 * once deployed on its own.
 *
 * IMPORTANT — read this before you rely on it:
 * localStorage lives in ONE browser, on ONE device. It is NOT shared
 * between people. If you (the jeweller) open this site on your phone
 * and add a stone, that stone will NOT appear when your client opens
 * the same public link on her laptop — her browser has its own,
 * completely separate storage.
 *
 * That means this shim is honest and correct for:
 *   - trying the app out
 *   - a single-device personal copy
 *   - a demo
 *
 * It is NOT a substitute for a real shared backend. For the book to
 * behave the same way once deployed as it does inside Claude — one
 * source of truth that you edit and everyone else reads — the app
 * needs a real database behind it (Supabase is a natural fit, and
 * the underlying data shape here — one JSON document per book — maps
 * onto a single table with very little rework).
 */

const PREFIX = "one-lustre:";

function readAll() {
  try {
    const raw = localStorage.getItem(PREFIX + "__store__");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(store) {
  localStorage.setItem(PREFIX + "__store__", JSON.stringify(store));
}

function scopedKey(key, shared) {
  return `${shared ? "shared" : "personal"}::${key}`;
}

const storageShim = {
  async get(key, shared = false) {
    const store = readAll();
    const k = scopedKey(key, shared);
    if (!(k in store)) {
      // The real API throws (or in some paths returns null) for a
      // missing key. Throwing matches what One Lustre's own code
      // already expects and catches.
      throw new Error(`No value stored for "${key}"`);
    }
    return { key, value: store[k], shared };
  },

  async set(key, value, shared = false) {
    const store = readAll();
    store[scopedKey(key, shared)] = value;
    writeAll(store);
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    const store = readAll();
    const k = scopedKey(key, shared);
    const existed = k in store;
    delete store[k];
    writeAll(store);
    return { key, deleted: existed, shared };
  },

  async list(prefix = "", shared = false) {
    const store = readAll();
    const tag = shared ? "shared::" : "personal::";
    const keys = Object.keys(store)
      .filter((k) => k.startsWith(tag))
      .map((k) => k.slice(tag.length))
      .filter((k) => k.startsWith(prefix));
    return { keys, prefix, shared };
  },
};

export function installStorageShim() {
  if (typeof window !== "undefined" && !window.storage) {
    window.storage = storageShim;
  }
}
