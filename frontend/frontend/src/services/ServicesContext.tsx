// src/context/ServicesContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ServiceRegistry } from "../services/ServiceRegistry";

/* --------------------------------- Types ---------------------------------- */

export interface ServicesContextValue {
    services: ServiceRegistry;
    cfg: {
        baseUrl: string; setBaseUrl: (v: string) => void;
        token: string; setToken: (v: string) => void;
        mock: boolean; setMock: (v: boolean) => void;
        locale: string; setLocale: (v: string) => void;
        tips: boolean; setTips: (v: boolean) => void;
    };
}

/* --------------------------- React Context/Hook --------------------------- */

const ServicesContext = createContext<ServicesContextValue | null>(null);

export function useServices(): ServicesContextValue {
    const ctx = useContext(ServicesContext);
    if (!ctx) throw new Error("useServices must be used within <ServicesProvider>");
    return ctx;
}

/* ------------------------------ Local Storage ----------------------------- */

function useLocalStorage<T>(key: string, initialValue: T) {
    const [val, setVal] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }, [key, val]);

    return [val, setVal] as const;
}

/* -------------------------------- Provider -------------------------------- */

export const ServicesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [baseUrl, setBaseUrl] = useLocalStorage("tr.baseUrl", "");
    const [token, setToken]   = useLocalStorage("tr.token", "");
    const [mock, setMock]     = useLocalStorage("tr.mock", true);
    const [locale, setLocale] = useLocalStorage("tr.locale", "de-CH");
    const [tips, setTips]     = useLocalStorage("tr.tips", true);

    // Einmalige Service-Instanz
    const services = useMemo(() => new ServiceRegistry({ baseUrl, token, mock }), []);
    // Laufende Konfig-Änderungen in den Client übertragen
    useEffect(() => { services.applyConfig({ baseUrl, token, mock }); }, [services, baseUrl, token, mock]);

    const value = useMemo<ServicesContextValue>(() => ({
        services,
        cfg: { baseUrl, setBaseUrl, token, setToken, mock, setMock, locale, setLocale, tips, setTips },
    }), [services, baseUrl, token, mock, locale, tips]);

    return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
};
