// src/pages/AuthPanel.tsx
import React from "react";
import {
    Card, CardHeader, CardContent, Container, Tabs, Tab, Box, TextField, Stack, Button, Alert
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import type { AuthLoginResp } from "../services/services";
import {useServices} from "@/services/ServicesContext";

export const AuthPanel: React.FC = () => {
    const { services, cfg } = useServices();
    const [tab, setTab] = React.useState<number>(0);

    // Login
    const [lemail, setLEmail] = React.useState<string>("");
    const [lpass, setLPass] = React.useState<string>("");

    // Register
    const [rname, setRName] = React.useState<string>("");
    const [remail, setREmail] = React.useState<string>("");
    const [rpass, setRPass] = React.useState<string>("");
    const [rpass2, setRPass2] = React.useState<string>("");

    const [error, setError] = React.useState<string>("");
    const [info, setInfo] = React.useState<string>("");

    async function doLogin() {
        setError(""); setInfo("");
        try {
            const resp: AuthLoginResp = await services.auth.login(lemail, lpass);
            cfg.setToken(resp.token);
            setInfo("Login erfolgreich. Token gesetzt.");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        }
    }

    async function doRegister() {
        setError(""); setInfo("");
        if (rpass !== rpass2) { setError("Passwörter stimmen nicht überein."); return; }
        try {
            const resp: AuthLoginResp = await services.auth.register(remail, rpass, rname || undefined);
            cfg.setToken(resp.token);
            setInfo("Registrierung erfolgreich. Token gesetzt.");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        }
    }

    return (
        <Container maxWidth="sm">
            <Card variant="outlined">
                <CardHeader title="Login / Registrieren" subheader="Token wird in den Settings hinterlegt" />
                <CardContent>
                    <Tabs value={tab} onChange={(_, v)=>setTab(v)} sx={{ mb: 2 }}>
                        <Tab label="Login" />
                        <Tab label="Registrieren" />
                    </Tabs>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {info &&  <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert>}

                    {tab === 0 && (
                        <Box>
                            <Stack spacing={2}>
                                <TextField label="E-Mail" type="email" value={lemail} onChange={e=>setLEmail(e.target.value)} />
                                <TextField label="Passwort" type="password" value={lpass} onChange={e=>setLPass(e.target.value)} />
                                <Button variant="contained" onClick={doLogin} startIcon={<LockOpenIcon/>}>Login</Button>
                            </Stack>
                        </Box>
                    )}

                    {tab === 1 && (
                        <Box>
                            <Stack spacing={2}>
                                <TextField label="Name (optional)" value={rname} onChange={e=>setRName(e.target.value)} />
                                <TextField label="E-Mail" type="email" value={remail} onChange={e=>setREmail(e.target.value)} />
                                <TextField label="Passwort" type="password" value={rpass} onChange={e=>setRPass(e.target.value)} />
                                <TextField label="Passwort bestätigen" type="password" value={rpass2} onChange={e=>setRPass2(e.target.value)} />
                                <Button variant="contained" onClick={doRegister} startIcon={<LockOpenIcon/>}>Registrieren</Button>
                            </Stack>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};
