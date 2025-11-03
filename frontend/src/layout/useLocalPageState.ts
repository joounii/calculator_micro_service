// src/layout/useLocalPageState.ts
import { useEffect, useState } from "react";

const KEY = "tr.activePage";

export function useLocalPageState() {
    const [active, setActive] = useState<string>(() => {
        try { return localStorage.getItem(KEY) || "basic"; } catch { return "basic"; }
    });
    useEffect(() => { try { localStorage.setItem(KEY, active); } catch {} }, [active]);
    return { active, setActive };
}
