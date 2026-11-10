"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Map as LibreMap } from "maplibre-gl";
import { api } from "@/lib/client";
import type { AppState, Category, Command, Place } from "@/lib/types";

type AppContext = {
  state: AppState | null; error: string; notice: string; busy: boolean;
  query: string; setQuery: (value: string) => void;
  category: Category | "전체"; setCategory: (value: Category | "전체") => void;
  mutate: (command: Command, message: string) => Promise<boolean>;
  notify: (message: string) => void; reload: () => void;
  mapRef: React.RefObject<LibreMap | null>; focusPlaces: (places: Place[]) => void;
};
const Context = createContext<AppContext | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [error, setError] = useState("");
  const [notice, notify] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "전체">("전체");
  const mapRef = useRef<LibreMap | null>(null);
  const reload = useCallback(() => {
    setError("");
    api.load().then(setState).catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : "예시 데이터를 불러오지 못했습니다."); });
  }, []);
  useEffect(reload, [reload]);
  const mutate = async (command: Command, message: string) => {
    setBusy(true);
    setError("");
    try { setState(await api.mutate(command)); notify(`${message} (예시)`); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : "변경을 반영하지 못했습니다."); return false; }
    finally { setBusy(false); }
  };
  const focusPlaces = useCallback((places: Place[]) => {
    const map = mapRef.current;
    const first = places[0];
    if (!map || !first) return;
    const mobile = innerWidth <= 760;
    const padding = mobile ? { top: 120, bottom: innerHeight * 0.56 + 144, left: 50, right: 70 } : { top: 120, bottom: 100, left: 460, right: 390 };
    const lngs = places.map(place => place.lng), lats = places.map(place => place.lat);
    map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding, maxZoom: places.length === 1 ? 15 : 13.7, duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500 });
  }, []);
  return <Context.Provider value={{ state, error, notice, busy, query, setQuery, category, setCategory, mutate, notify, reload, mapRef, focusPlaces }}>{children}</Context.Provider>;
}

export function useApp() {
  const context = useContext(Context);
  if (!context) throw new Error("AppProvider is required");
  return context;
}
