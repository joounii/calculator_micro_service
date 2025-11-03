// src/pages/ProfilePanel.tsx
import React, { useState } from "react";
import { Card, CardHeader, CardContent, Container, Paper, Stack, Button } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {useServices} from "@/services/ServicesContext";

export const ProfilePanel: React.FC = () => {
    const { services } = useServices();
    const [data, setData] = useState<any>(null);

    async function load() {
        try { const d = await services.user.me(); setData(d); }
        catch (e) { alert(String(e)); }
    }

    return (
        <Container maxWidth="sm">
            <Card variant="outlined">
                <CardHeader title="Profil" subheader="Abruf über /me und /me/settings" />
                <CardContent>
                    <Stack spacing={2}>
                        <Button variant="contained" onClick={load} startIcon={<AccountCircleIcon/>}>Profil laden</Button>
                        <Paper variant="outlined" sx={{ p: 2, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                            {JSON.stringify(data, null, 2) || "—"}
                        </Paper>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
};
