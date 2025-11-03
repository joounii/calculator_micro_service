// src/pages/SettingsPanel.tsx
import React from "react";
import {
    Card, CardHeader, CardContent, Container, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, Alert
} from "@mui/material";
import {useServices} from "@/services/ServicesContext";

export const SettingsPanel: React.FC = () => {
    const {cfg} = useServices();
    const {baseUrl, setBaseUrl, token, setToken, mock, setMock, locale, setLocale, tips, setTips} = cfg;

    return (
        <Container maxWidth="md">
            <Card variant="outlined">
                <CardHeader title="Settings" subheader="API-Zugriff, Mock-Modus, UI-Präferenzen"/>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Alert severity="info">Trenne Test- und Live-Umgebung per Basis-URL. Token
                                wird als Bearer mitgesendet.</Alert></Grid>
                        <Grid size={12}>
                            <TextField fullWidth label="API-Basis-URL" value={baseUrl}
                                       onChange={e => setBaseUrl(e.target.value)}
                                       placeholder="https://gateway.example.com/api/"/></Grid>
                        <Grid size={12}>
                            <TextField fullWidth label="Auth Token (Bearer)" value={token}
                                       onChange={e => setToken(e.target.value)} type="password"/></Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <FormControl fullWidth>
                                <InputLabel>Locale</InputLabel>
                                <Select label="Locale" value={locale} onChange={e => setLocale(e.target.value)}>
                                    <MenuItem value="de-CH">de-CH</MenuItem>
                                    <MenuItem value="de-DE">de-DE</MenuItem>
                                    <MenuItem value="en-US">en-US</MenuItem>
                                    <MenuItem value="fr-CH">fr-CH</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <FormControlLabel
                                control={<Switch checked={mock} onChange={e => setMock(e.target.checked)}/>}
                                label="Mock-Modus"/></Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <FormControlLabel
                                control={<Switch checked={tips} onChange={e => setTips(e.target.checked)}/>}
                                label="Kurze Tipps anzeigen"/></Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};
