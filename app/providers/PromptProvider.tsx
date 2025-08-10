"use client";
import React, { createContext, useEffect, useState } from "react";
import { parseTextToPrompts } from "@/lib/promptParser";

// Simple IndexedDB wrapper for prompts (async persistence)
const DB_NAME = "convelyze";
const STORE_NAME = "prompts";
async function savePromptsToIDB(prompts: string[]) {
  try {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    return new Promise<void>((resolve, reject) => {
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(prompts, "last");
        tx.oncomplete = () => { resolve(); db.close(); };
        tx.onerror = (e) => { reject(e); db.close(); };
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore IDB errors
  }
}

async function loadPromptsFromIDB(): Promise<string[] | null> {
  try {
    const req = indexedDB.open(DB_NAME, 1);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) { db.close(); return resolve(null); }
        const tx = db.transaction(STORE_NAME, "readonly");
        const r = tx.objectStore(STORE_NAME).get("last");
        r.onsuccess = () => { resolve(r.result ?? null); db.close(); };
        r.onerror = () => { resolve(null); db.close(); };
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export type PromptStore = {
  prompts: string[] | null;
  setPrompts: (p: string[] | null) => void;
  clearPrompts: () => void;
};

export const PromptContext = createContext<PromptStore>({
  prompts: null,
  setPrompts: () => {},
  clearPrompts: () => {},
});

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPromptsState] = useState<string[] | null>(() => {
    try {
      const raw = globalThis?.localStorage?.getItem("cvx_last_prompts");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // sync to localStorage
    try {
      if (prompts === null) globalThis?.localStorage?.removeItem("cvx_last_prompts");
      else globalThis?.localStorage?.setItem("cvx_last_prompts", JSON.stringify(prompts));
    } catch {}
    // async persist to IDB
    if (prompts && prompts.length > 0) {
      savePromptsToIDB(prompts).catch(()=>{/*ignore*/});
    }
  }, [prompts]);

  useEffect(() => {
    // try load from IDB on mount if no localStorage
    if (prompts === null) {
      loadPromptsFromIDB().then((p) => { if (p && p.length) setPromptsState(p); });
    }
  }, []);

  const setPrompts = (p: string[] | null) => setPromptsState(p);
  const clearPrompts = () => setPromptsState(null);

  return (
    <PromptContext.Provider value={{ prompts, setPrompts, clearPrompts }}>
      {children}
    </PromptContext.Provider>
  );
}
