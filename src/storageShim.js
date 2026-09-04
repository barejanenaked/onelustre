/**
 * One Lustre was built inside Claude's artifact environment, where
 * `window.storage` is a real, hosted, cross-device key-value store
 * provided by Anthropic. That API does not exist outside Claude.ai.
 *
 * This file gives the exact same four methods (get / set / delete /
 * list), backed by a Supabase table (see `src/supabaseClient.js`), so
 * the app runs unmodified once deployed on its own — and, unlike a
 * localStorage-backed version, the book is one shared source of truth:
 * an edit Jane makes on her phone shows up for her, Vanessa, and every
 * supplier on any device, because it's read from and written to the
 * same database row rather than to one browser's private storage.
 *
 * The `book_storage` table has a composite primary key on (key, shared)
 * — that's the same "personal vs shared namespace" distinction the
 * original artifact API and the localStorage shim both used.
 */

import { supabase } from "./supabaseClient.js";

const TABLE = "book_storage";

const storageShim = {
  async get(key, shared = false) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", key)
      .eq("shared", shared)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      // The real API throws (or in some paths returns null) for a
      // missing key. Throwing matches what One Lustre's own code
      // already expects and catches.
      throw new Error(`No value stored for "${key}"`);
    }
    return { key, value: data.value, shared };
  },

  async set(key, value, shared = false) {
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        { key, shared, value, updated_at: new Date().toISOString() },
        { onConflict: "key,shared" }
      );
    if (error) throw error;
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq("key", key)
      .eq("shared", shared)
      .select("key");
    if (error) throw error;
    return { key, deleted: (data || []).length > 0, shared };
  },

  async list(prefix = "", shared = false) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("key")
      .eq("shared", shared)
      .like("key", `${prefix}%`);
    if (error) throw error;
    const keys = (data || []).map((row) => row.key);
    return { keys, prefix, shared };
  },
};

export function installStorageShim() {
  if (typeof window !== "undefined" && !window.storage) {
    window.storage = storageShim;
  }
}
