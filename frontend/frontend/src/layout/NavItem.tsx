// src/layout/NavItem.tsx
import React from "react";
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useLocalPageState } from "./useLocalPageState";

export interface NavItemProps {
    pageKey: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ pageKey, icon, label, onClick }) => {
    const { active, setActive } = useLocalPageState();
    const selected = active === pageKey;

    return (
        <ListItem disablePadding>
            <ListItemButton selected={selected} onClick={() => { setActive(pageKey); onClick && onClick(); }}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
            </ListItemButton>
        </ListItem>
    );
};
