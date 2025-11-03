// src/pages/UnitsPanel.tsx
import React, { useState } from "react";
import {
    Card, CardHeader, CardContent, Container, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem, Stack, Button, Chip
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {useServices} from "@/services/ServicesContext";
import { formatNumber } from "../utils/formatNumber";

const OPTIONS = ["km","m","cm","h","min","s","kg","g","m/s","km/h","const:pi","const:e"];

export const UnitsPanel: React.FC = () => {
    const { services } = useServices();
    const [value, setValue] = useState<string>("1");
    const [from, setFrom] = useState<string>("km");
    const [to, setTo] = useState<string>("m");
    const [res, setRes] = useState<number | null>(null);

    async function convert() {
        try {
            const special = from.startsWith("const:") || to.startsWith("const:");
            const payload = special
                ? { value: Number(value), from: "const", to: (from.startsWith("const:") ? from.split(":")[1] : to.split(":")[1]) }
                : { value: Number(value), from, to };
            const data = await services.units.convert(payload.value, payload.from, payload.to);
            setRes(data.result);
            await services.history.add({ kind: "convert", input: payload, result: data.result });
        } catch (e: any) {
            alert(e.message || String(e));
        }
    }

    return (
        <Container maxWidth="md">
            <Card variant="outlined">
                <CardHeader title="Einheiten & Konstanten" subheader="Konvertiere gängige Einheiten oder skaliere Konstanten" />
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Wert" value={value} onChange={e=>setValue(e.target.value)} type="number" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Von</InputLabel>
                                <Select label="Von" value={from} onChange={e=>setFrom(e.target.value)}>
                                    {OPTIONS.map(o => (<MenuItem key={o} value={o}>{o}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Nach</InputLabel>
                                <Select label="Nach" value={to} onChange={e=>setTo(e.target.value)}>
                                    {OPTIONS.map(o => (<MenuItem key={o} value={o}>{o}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" onClick={convert} startIcon={<SwapHorizIcon/>}>Konvertieren</Button>
                                {res !== null && <Chip label={`Ergebnis: ${formatNumber(res)}`} color="primary" />}
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};
