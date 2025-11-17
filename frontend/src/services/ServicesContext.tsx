// src/context/ServicesContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ServiceRegistry } from "../services/ServiceRegistry";

export interface ServicesContextValue {
    services: ServiceRegistry;
    cfg: {
        baseUrl: string; setBaseUrl: (v: string) => void;
        token: string;   setToken:   (v: string) => void;
        mock: boolean;   setMock:    (v: boolean) => void;
        locale: string;  setLocale:  (v: string) => void;
        tips: boolean;   setTips:    (v: boolean) => void;
    };
}
const ServicesContext = createContext<ServicesContextValue | null>(null);
export function useServices(): ServicesContextValue {
    const ctx = useContext(ServicesContext);
    if (!ctx) throw new Error("useServices must be used within <ServicesProvider>");
    return ctx;
}

// 🚫 kein localStorage im Initializer!
function useLocalStorage<T>(key: string, initialValue: T) {
    const [val, setVal] = useState<T>(initialValue);

    // Nach Mount: aktuellen Wert laden
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const raw = window.localStorage.getItem(key);
            setVal(raw ? (JSON.parse(raw) as T) : initialValue);
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]); // nur auf Key reagieren

    // Änderungen persistieren
    useEffect(() => {
        if (typeof window === "undefined") return;
        try { window.localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }, [key, val]);

    return [val, setVal] as const;
}

export const ServicesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [baseUrl, setBaseUrl] = useLocalStorage<string>("tr.baseUrl", "");
    const [token,   setToken]   = useLocalStorage<string>("tr.token",   "");
    const [mock,    setMock]    = useLocalStorage<boolean>("tr.mock",   true);
    const [locale,  setLocale]  = useLocalStorage<string>("tr.locale",  "de-CH");
    const [tips,    setTips]    = useLocalStorage<boolean>("tr.tips",   true);

    // Stabile Registry-Instanz
    const [services] = useState(() => new ServiceRegistry());

    // Config in die Registry schieben
    useEffect(() => { services.applyConfig({ baseUrl, token, mock }); }, [services, baseUrl, token, mock]);

    const cfg = useMemo(() => ({
        baseUrl, setBaseUrl, token, setToken, mock, setMock, locale, setLocale, tips, setTips
    }), [baseUrl, token, mock, locale, tips]);

    const value = useMemo<ServicesContextValue>(() => ({ services, cfg }), [services, cfg]);

    return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
};
