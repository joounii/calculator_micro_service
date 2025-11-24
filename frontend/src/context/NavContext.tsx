// src/context/NavContext.tsx
"use client";
import React from "react";

const KEY = "tr.activePage";
const DEFAULT_PAGE = "basic";

type NavContextValue = { active: string; setActive: (key: string) => void };
const NavContext = React.createContext<NavContextValue | null>(null);

export const NavProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    // 1. Server + erster Client-Render: IMMER derselbe Default
    const [active, setActive] = React.useState<string>(DEFAULT_PAGE);

    // 2. Danach (nur im Browser) aus localStorage nachziehen
    React.useEffect(() => {
        try {
            const saved = window.localStorage.getItem(KEY);
            if (saved && saved !== active) setActive(saved);
        } catch {}
        // absichtlich leeres Dep-Array: nur einmal nach Mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setActiveSafe = React.useCallback((key: string) => {
        setActive(key);
        try { window.localStorage.setItem(KEY, key); } catch {}
    }, []);

    const value = React.useMemo<NavContextValue>(() => ({
        active, setActive: setActiveSafe
    }), [active, setActiveSafe]);

    return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
};

export function useNav(): NavContextValue {
    const ctx = React.useContext(NavContext);
    if (!ctx) throw new Error("useNav must be used within <NavProvider>");
    return ctx;
}
