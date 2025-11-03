// src/pages/AISolverPanel.tsx
import React, { Fragment, useState } from "react";
import {
    Card, CardHeader, CardContent, Container, Grid, TextField, FormControlLabel,
    Switch, FormControl, InputLabel, Select, MenuItem, Button, Chip, Stack, Paper, Typography, Box, CircularProgress
} from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { formatNumber } from "../utils/formatNumber";
import {useServices} from "@/services/ServicesContext";

export const AISolverPanel: React.FC = () => {
    const { services } = useServices();
    const [prompt, setPrompt] = useState<string>("Ein Auto beschleunigt von 0 auf 100 km/h in 8 s. Wie gross ist die mittlere Beschleunigung?");
    const [verify, setVerify] = useState<boolean>(true);
    const [units, setUnits] = useState<string>("SI");
    const [resp, setResp] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function solve() {
        setLoading(true);
        try {
            const data = await services.ai.solve(prompt, { units }, verify);
            setResp(data);
            await services.history.add({ kind: "ai", input: { prompt }, result: (data as any).result });
        } catch (e: any) {
            alert(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container maxWidth="md">
            <Card variant="outlined">
                <CardHeader title="AI-Solver" subheader="Lösungen in natürlicher Sprache + verifizierte Rechenschritte" />
                <CardContent>
                    <TextField fullWidth multiline minRows={3} maxRows={8}
                               label="Problemstellung" value={prompt} onChange={e=>setPrompt(e.target.value)} sx={{ mb: 2 }} />
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Einheiten</InputLabel>
                                <Select label="Einheiten" value={units} onChange={e=>setUnits(e.target.value)}>
                                    <MenuItem value="SI">SI</MenuItem>
                                    <MenuItem value="metric">Metrisch</MenuItem>
                                    <MenuItem value="imperial">Imperial</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <FormControlLabel control={<Switch checked={verify} onChange={e=>setVerify(e.target.checked)} />} label="Verifikation aktiv" />
                        </Grid>
                        <Grid size={12}>
                            <Button variant="contained" onClick={solve} disabled={loading}
                                    startIcon={loading ? <CircularProgress size={18}/> : <PsychologyIcon/>}>
                                Lösen
                            </Button>
                        </Grid>
                    </Grid>

                    {resp && (
                        <Box mt={3}>
                            <Typography variant="subtitle1">Zusammenfassung</Typography>
                            <Paper variant="outlined" sx={{ p:2, mb:2 }}>
                                <Typography>{resp.summary || "—"}</Typography>
                            </Paper>
                            {Array.isArray(resp.steps) && resp.steps.length > 0 && (
                                <Fragment>
                                    <Typography variant="subtitle1">Schritte</Typography>
                                    <ol>{resp.steps.map((s: string, i: number) => (<li key={i}><Typography>{s}</Typography></li>))}</ol>
                                </Fragment>
                            )}
                            <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                                {"result" in resp && <Chip label={`Ergebnis: ${formatNumber(resp.result)}`} color="primary" />}
                                {resp.units && <Chip label={`Einheit: ${resp.units}`} variant="outlined" />}
                            </Stack>
                            {resp.notes && <Typography variant="caption" color="text.secondary" display="block" mt={1}>{resp.notes}</Typography>}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};
