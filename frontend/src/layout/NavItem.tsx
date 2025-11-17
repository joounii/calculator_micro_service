import React from "react";
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useNav } from "../context/NavContext";

export interface NavItemProps {
    pageKey: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ pageKey, icon, label, onClick }) => {
    const { active, setActive } = useNav();
    const selected = active === pageKey;

    const handleClick = () => {
        setActive(pageKey);     // Navigation-Zustand zentral setzen
        onClick?.();            // Drawer auf Mobile schliessen etc.
    };

    return (
        <ListItem disablePadding>
            <ListItemButton selected={selected} onClick={handleClick}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
            </ListItemButton>
        </ListItem>
    );
};
