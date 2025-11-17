import { createTheme, Theme } from "@mui/material/styles";

export const basePalette = {
    primary: { main: "#1a73e8" },
    secondary: { main: "#7c4dff" },
};

export const baseShape = { borderRadius: 14 };

export function makeTheme(dark = false): Theme {
    return createTheme({
        palette: {
            mode: dark ? "dark" : "light",
            ...basePalette,
            background: dark
                ? { default: "#0f1115", paper: "#151821" }
                : { default: "#fafafa", paper: "#ffffff" },
        },
        shape: baseShape,
        typography: {
            fontFamily:
                'Inter, "Helvetica Neue", Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple Color Emoji", "Segoe UI Emoji"',
            h6: { fontWeight: 600 },
            button: { textTransform: "none", fontWeight: 600 },
        },
        components: {
            MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
            MuiPaper: { styleOverrides: { root: { borderRadius: 14 } } },
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: { root: { borderRadius: 12, paddingInline: 16 } },
            },
            MuiTextField: {
                defaultProps: { size: "small" },
            },
            MuiSelect: { defaultProps: { size: "small" } },
            MuiFormControl: { defaultProps: { size: "small" } },
            MuiChip: { styleOverrides: { root: { borderRadius: 10 } } },
        },
    });
}
