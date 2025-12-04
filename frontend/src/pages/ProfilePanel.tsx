import React, { useState } from "react";
import { Card, CardHeader, CardContent, Container, Paper, Stack, Button } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useServices } from "@/services/ServicesContext";

export const ProfilePanel: React.FC = () => {
    const { cfg } = useServices();

    // Decode token simply for display (in real app, use a library or /me endpoint)
    const userEmail = cfg.token ? "Eingeloggt" : "Nicht eingeloggt";

    return (
        <Container maxWidth="sm">
            <Card variant="outlined">
                <CardHeader title="Profil" />
                <CardContent>
                    <Stack spacing={2}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            {cfg.user ? (
                                <>
                                    <div><strong>Name:</strong> {cfg.user.name || "—"}</div>
                                    <div><strong>E-Mail:</strong> {cfg.user.email}</div>
                                </>
                            ) : (
                                <div>Bitte einloggen.</div>
                            )}
                        </Paper>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
};
