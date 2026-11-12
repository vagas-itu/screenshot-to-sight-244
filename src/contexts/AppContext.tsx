import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Journey, PersonaId, PersonaInfo, PersonaState, Transaction, Conversation } from "@/types";
import { PERSONAS, seedState } from "@/services/mockData";
import { applyAddTransaction, applyApproveJourney, applyCompleteMission } from "@/services/finance";

const KEY = "tokeni:v1";

interface Stored {
  onboarded: boolean;
  active: PersonaId | null;
  data: Partial<Record<PersonaId, PersonaState>>;
}

interface Ctx {
  ready: boolean;
  onboarded: boolean;
  persona: PersonaInfo | null;
  state: PersonaState | null;
  finishOnboarding: () => void;
  signIn: (id: PersonaId) => void;
  signOut: () => void;
  update: (fn: (s: PersonaState) => PersonaState) => void;
  addTransaction: (t: Omit<Transaction, "id">) => Transaction;
  approveJourney: (j: Journey) => void;
  completeMission: (id: string) => void;
  saveConversation: (c: Conversation) => void;
  resetPersona: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Stored>({ onboarded: false, active: null, data: {} });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStore(JSON.parse(raw));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(store));
  }, [store, ready]);

  const update = useCallback((fn: (s: PersonaState) => PersonaState) => {
    setStore((st) => {
      if (!st.active) return st;
      const cur = st.data[st.active] ?? seedState(st.active);
      return { ...st, data: { ...st.data, [st.active]: fn(cur) } };
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const active = store.active;
    return {
      ready,
      onboarded: store.onboarded,
      persona: active ? PERSONAS[active] : null,
      state: active ? store.data[active] ?? null : null,
      finishOnboarding: () => setStore((s) => ({ ...s, onboarded: true })),
      signIn: (id) => setStore((s) => ({ ...s, onboarded: true, active: id, data: { ...s.data, [id]: s.data[id] ?? seedState(id) } })),
      signOut: () => setStore((s) => ({ ...s, active: null })),
      update,
      addTransaction: (t) => {
        const full = { ...t, id: `TK-${Date.now().toString(36).toUpperCase()}` };
        update((s) => applyAddTransaction(s, full));
        return full;
      },
      approveJourney: (j) => update((s) => applyApproveJourney(s, j)),
      completeMission: (id) => update((s) => applyCompleteMission(s, id)),
      saveConversation: (c) => update((s) => ({ ...s, conversations: [c, ...s.conversations.filter((x) => x.id !== c.id)] })),
      resetPersona: () => setStore((s) => (s.active ? { ...s, data: { ...s.data, [s.active]: seedState(s.active) } } : s)),
    };
  }, [store, ready, update]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}

/** For screens inside the signed-in shell, where persona/state are guaranteed. */
export function useSession() {
  const c = useApp();
  return { ...c, persona: c.persona!, state: c.state! };
}
