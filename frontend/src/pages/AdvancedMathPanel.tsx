// src/pages/AdvancedMathPanel.tsx
import React, { useState } from "react";
import {
    Card, CardHeader, CardContent, Container, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem, Stack, Button, Chip, CircularProgress
} from "@mui/material";
import FunctionsIcon from "@mui/icons-material/Functions";
import { formatNumber } from "../utils/formatNumber";
import {useServices} from "@/services/ServicesContext";

export const AdvancedMathPanel: React.FC = () => {
    const { services } = useServices();
    const [fn, setFn] = useState<string>("sqrt");
    const [args, setArgs] = useState<string>("9");
    const [res, setRes] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    async function run() {
        setLoading(true);
        try {
            const parsed = args.split(/[ ,;]+/).filter(Boolean).map(Number);
            const data = await services.advanced.run(fn, parsed);
            setRes(data.result);
            await services.history.add({ kind: "advanced", input: { fn, args: parsed }, result: data.result });
        } catch (e: any) {
            alert(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container maxWidth="md">
            <Card variant="outlined">
                <CardHeader title="Erweiterte Mathematik" subheader="Wurzeln, Potenzen, trigonometrische Funktionen …" />
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Funktion</InputLabel>
                                <Select label="Funktion" value={fn} onChange={e=>setFn(e.target.value)}>
                                    <MenuItem value="sqrt">sqrt(x)</MenuItem>
                                    <MenuItem value="pow">pow(x,y)</MenuItem>
                                    <MenuItem value="sin">sin(x)</MenuItem>
                                    <MenuItem value="cos">cos(x)</MenuItem>
                                    <MenuItem value="tan">tan(x)</MenuItem>
                                    <MenuItem value="log">ln(x)</MenuItem>
                                    <MenuItem value="exp">exp(x)</MenuItem>
                                    <MenuItem value="tau">tau()</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextField fullWidth label="Argumente (Leerzeichen/Komma getrennt)" value={args} onChange={e=>setArgs(e.target.value)} />
                        </Grid>
                        <Grid size={12}>
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" onClick={run} disabled={loading}
                                        startIcon={loading ? <CircularProgress size={18}/> : <FunctionsIcon/>}>
                                    Berechnen
                                </Button>
                                {res !== null && <Chip label={`Ergebnis: ${formatNumber(res)}`} color="primary" />}
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};
