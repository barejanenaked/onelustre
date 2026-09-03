import { createClient } from "@supabase/supabase-js";

/**
 * The Supabase project backing the book's shared storage. The URL and
 * publishable key below are safe to ship in client code — like any
 * Supabase anon/publishable key, they only grant what the table's row
 * level security policies allow (see the `book_storage` table: open
 * read/write, matching this app's existing "screen lock, not
 * encryption" security model rather than adding a false sense of auth).
 *
 * Both can be overridden at build time via VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY if this ever needs to point at a different
 * project (e.g. a Netlify env var), but there's a working default so
 * the app runs out of the box without extra deploy configuration.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rislppxgmyfplkkoeohy.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_4UUvVtoJkYr8xOtXY-FLhQ_QfgD727C";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
