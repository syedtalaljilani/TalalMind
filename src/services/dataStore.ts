import AsyncStorage from "@react-native-async-storage/async-storage";
import { ensureSession, supabase } from "./supabaseClient";

type Listener = (key: string) => void;

const memoryCache = new Map<string, any>();
const hydrating = new Map<string, Promise<void>>();
const retryTimers = new Map<string, ReturnType<typeof setTimeout>>();
const listeners = new Set<Listener>();
const loggedWarns = new Set<string>();
let initialized = false;

// Global circuit breaker: when Supabase auth/network keeps failing (e.g.
// "Anonymous sign-ins are disabled"), pause server sync instead of spamming
// warnings and retries. The app keeps working from the local cache meanwhile.
let gateUntil = 0;
let gateLogged = false;
const GATE_MS = 60_000;

const isGated = () => Date.now() < gateUntil;

const gateFor = (error: unknown) => {
  if (!gateLogged) {
    gateLogged = true;
    const message =
      error instanceof Error ? error.message : String(error);
    console.warn(
      `[DataStore] Supabase sync paused (${message}). Using local cache; will retry in ${GATE_MS / 1000}s.`,
    );
  }
  gateUntil = Date.now() + GATE_MS;
};

const resetGate = () => {
  gateUntil = 0;
  if (gateLogged) {
    gateLogged = false;
    loggedWarns.clear();
    console.warn("[DataStore] Supabase sync resumed.");
  }
};

const isAuthError = (e: unknown): boolean => {
  if (!e || typeof e !== "object") return false;
  const err = e as { name?: string; status?: number; message?: string };
  return (
    err.name === "AuthApiError" ||
    err.status === 422 ||
    (typeof err.message === "string" &&
      err.message.toLowerCase().includes("anonymous sign-ins"))
  );
};

const warnOnce = (key: string, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const signature = `${key}: ${message}`;
  if (loggedWarns.has(signature)) return;
  loggedWarns.add(signature);
  console.warn(`[DataStore] sync for "${key}" failed: ${message}`);
};

const notify = (key: string) => {
  listeners.forEach((fn) => {
    try {
      fn(key);
    } catch (e) {
      console.warn("[DataStore] listener error", e);
    }
  });
};

const writeCache = async (key: string, value: any) => {
  memoryCache.set(key, value);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[DataStore] cache write "${key}" failed`, e);
  }
};

const fetchFromServer = async (key: string): Promise<any | undefined> => {
  if (!supabase || isGated()) return undefined;
  try {
    await ensureSession();
    const { data, error } = await supabase
      .from("app_state")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    resetGate();
    return data ? data.value : undefined;
  } catch (e) {
    if (isAuthError(e)) {
      gateFor(e);
    } else {
      warnOnce(key, e);
    }
    return undefined;
  }
};

const pushToServer = (key: string, value: any): Promise<void> => {
  if (!supabase || isGated()) return Promise.resolve();
  return ensureSession()
    .then(() =>
      supabase!.from("app_state").upsert({ key, value }, { onConflict: "user_id,key" }),
    )
    .then(({ error }) => {
      if (error) throw error;
    })
    .then(() => {
      resetGate();
    })
    .catch((e) => {
      if (isAuthError(e)) {
        gateFor(e);
        return;
      }
      warnOnce(key, e);
      if (retryTimers.has(key)) return;
      retryTimers.set(
        key,
        setTimeout(() => {
          retryTimers.delete(key);
          void pushToServer(key, memoryCache.get(key));
        }, 15000),
      );
    });
};

export const DataStore = {
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Load the AsyncStorage cache into memory and warm the given keys from Supabase. */
  async init(warmKeys: string[] = []): Promise<void> {
    if (initialized) return;
    initialized = true;
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      for (const [key, raw] of pairs) {
        if (!raw) continue;
        try {
          memoryCache.set(key, JSON.parse(raw));
        } catch {
          // ignore malformed entries
        }
      }
    } catch (e) {
      console.warn("[DataStore] cache load failed", e);
    }
    await ensureSession().catch(() => {});
    warmKeys.forEach((key) => void DataStore.hydrate(key));
  },

  /**
   * Read a value for a key. Resolves from the local cache first (fast),
   * then syncs from Supabase in the background. Only when nothing is cached
   * locally does it wait on the network.
   */
  async get(key: string): Promise<any | undefined> {
    if (memoryCache.has(key)) {
      void DataStore.hydrate(key);
      return memoryCache.get(key);
    }
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const value = JSON.parse(raw);
        memoryCache.set(key, value);
        void DataStore.hydrate(key);
        return value;
      }
    } catch {
      // ignore
    }
    const serverValue = await fetchFromServer(key);
    if (serverValue !== undefined) {
      await writeCache(key, serverValue);
    }
    return serverValue;
  },

  /** Write locally (instant) and push to Supabase in the background. */
  async set(key: string, value: any): Promise<void> {
    await writeCache(key, value);
    notify(key);
    void pushToServer(key, value);
  },

  /** Fetch a key from Supabase and update the local cache if the server has it. */
  async hydrate(key: string): Promise<void> {
    if (hydrating.has(key)) return hydrating.get(key)!;
    const p = (async () => {
      try {
        const serverValue = await fetchFromServer(key);
        if (serverValue !== undefined) {
          const current = memoryCache.get(key);
          if (JSON.stringify(current) !== JSON.stringify(serverValue)) {
            await writeCache(key, serverValue);
            notify(key);
          }
        } else if (memoryCache.has(key)) {
          await pushToServer(key, memoryCache.get(key));
        }
      } catch {
        // offline — keep local cache
      } finally {
        hydrating.delete(key);
      }
    })();
    hydrating.set(key, p);
    return p;
  },
};
