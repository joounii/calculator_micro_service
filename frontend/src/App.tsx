// src/App.tsx
import React, { useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Box, Paper, Switch, Typography, Toolbar } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import FunctionsIcon from "@mui/icons-material/Functions";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import HistoryIcon from "@mui/icons-material/History";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CodeIcon from "@mui/icons-material/Code";

import { makeTheme } from "./theme";
import { AppShell } from "./layout/AppShell";
import { useLocalPageState } from "./layout/useLocalPageState";

import { BasicOpsPanel } from "./pages/BasicOpsPanel";
import { AdvancedMathPanel } from "./pages/AdvancedMathPanel";
import { UnitsPanel } from "./pages/UnitsPanel";
import { ExpressionPanel } from "./pages/ExpressionPanel";
import { HistoryPanel } from "./pages/HistoryPanel";
import { AISolverPanel } from "./pages/AISolverPanel";
import { SettingsPanel } from "./pages/SettingsPanel";
import { ProfilePanel } from "./pages/ProfilePanel";
import { ServicesProvider } from "./services/ServicesContext";

/* --------------------------------- Helpers -------------------------------- */

function useLocalStorage<T>(key: string, initialValue: T) {
    const [val, setVal] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initialValue;
        } catch { return initialValue; }
    });
    React.useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
    return [val, setVal] as const;
}

/* --------------------------------- Pages ---------------------------------- */

export const PAGES: { key: string; label: string; icon: React.ReactNode; component: React.FC }[] = [
    { key: "basic",    label: "Grundrechnen", icon: <CalculateIcon/>,      component: BasicOpsPanel },
    { key: "advanced", label: "Erweitert",    icon: <FunctionsIcon/>,      component: AdvancedMathPanel },
    { key: "convert",  label: "Einheiten",    icon: <SwapHorizIcon/>,      component: UnitsPanel },
    { key: "expr",     label: "Ausdruck",     icon: <CodeIcon/>,           component: ExpressionPanel },
    { key: "history",  label: "Verlauf",      icon: <HistoryIcon/>,        component: HistoryPanel },
    { key: "ai",       label: "AI-Solver",    icon: <PsychologyIcon/>,     component: AISolverPanel },
    { key: "settings", label: "Settings",     icon: <SettingsIcon/>,       component: SettingsPanel },
    { key: "profile",  label: "Profil",       icon: <AccountCircleIcon/>,  component: ProfilePanel },
];

const ActivePageRenderer: React.FC = () => {
    const { active } = useLocalPageState();
    const Page = (PAGES.find(p => p.key === active)?.component ?? PAGES[0].component) as React.FC;
    return <Page />;
};

/* ---------------------------------- App ----------------------------------- */

export default function App() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dark, setDark] = useLocalStorage("tr.dark", false);
    const theme = useMemo(() => makeTheme(dark), [dark]);

    return (
        <ThemeProvider theme={theme}>
            <ServicesProvider>
                <AppShell onMenuToggle={() => setMobileOpen(!mobileOpen)} mobileOpen={mobileOpen} pages={PAGES}>
                    <ActivePageRenderer />
                    {/* Floating Dark-Mode Toggle */}
                    <Box position="fixed" bottom={16} right={16}>
                        <Paper sx={{ p: 1.5, borderRadius: 2, display: "flex", alignItems: "center", gap: 1 }} elevation={6}>
                            <Typography variant="body2">Dark</Typography>
                            <Switch checked={dark} onChange={e => setDark(e.target.checked)} />
                        </Paper>
                    </Box>
                </AppShell>
            </ServicesProvider>
        </ThemeProvider>
    );
}
