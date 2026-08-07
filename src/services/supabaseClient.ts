import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.includes("supabase.co") &&
    !supabaseUrl.includes("YOUR-PROJECT-REF"),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

let authReadyPromise: Promise<void> | null = null;

/**
 * Ensures a session exists so RLS (auth.uid()) works.
 * Signs in with the account credentials from .env (email + password auth —
 * enabled by default on Supabase, no anonymous-sign-in toggle needed).
 * Safe to call from anywhere; resolves when the session is ready.
 */
export const ensureSession = async (): Promise<void> => {
  if (!supabase) return;
  if (!authReadyPromise) {
    authReadyPromise = (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) return;

      const email = process.env.EXPO_PUBLIC_SUPABASE_EMAIL || "";
      const password = process.env.EXPO_PUBLIC_SUPABASE_PASSWORD || "";
      if (!email || !password) {
        throw new Error("Supabase login credentials are not set in .env");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    })().catch((e) => {
      authReadyPromise = null;
      throw e;
    });
  }
  return authReadyPromise;
};
