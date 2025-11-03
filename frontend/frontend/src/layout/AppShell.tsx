// src/layout/AppShell.tsx
import React from "react";
import {
    AppBar, Toolbar, Typography, CssBaseline, Drawer, Divider,
    Box, List, Chip, IconButton
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavItem } from "./NavItem";
import {useServices} from "@/services/ServicesContext";

const DRAWER_WIDTH = 280;

export interface AppShellProps {
    children: React.ReactNode;
    onMenuToggle: () => void;
    mobileOpen: boolean;
    pages: { key: string; label: string; icon: React.ReactNode }[];
}

export const AppShell: React.FC<AppShellProps> = ({ children, onMenuToggle, mobileOpen, pages }) => {
    const { cfg } = useServices();

    const drawer = (
        <div>
            <Toolbar><Typography variant="h6" noWrap>TR Micro-Calc</Typography></Toolbar>
            <Divider />
            <Box px={2} py={1}>
                <Chip label={cfg.mock ? "Mock-Modus" : "Live-API"} color={cfg.mock ? "default" : "primary"} size="small" />
            </Box>
            <List>
                {pages.map(p => (<NavItem key={p.key} pageKey={p.key} icon={p.icon} label={p.label} onClick={onMenuToggle}/>))}
            </List>
            <Box px={2} py={1}>
                <Typography variant="caption" color="text.secondary">
                    {cfg.tips ? "Tipp: Shift+Enter = neue Zeile" : ""}
                </Typography>
            </Box>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={onMenuToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Taschenrechner – Microservices Frontend
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer variant="temporary" open={mobileOpen} onClose={onMenuToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}>
                {drawer}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }} open>
                {drawer}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};
