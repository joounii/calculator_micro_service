import React, { useState } from "react";
import {
    Card, CardHeader, CardContent, Container, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem, Stack, Button, Chip
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useServices } from "@/services/ServicesContext";
import { formatNumber } from "../utils/formatNumber";
import type { ConvertResp } from "@/services/services";

const OPTIONS = ["km","m","cm","h","min","s","kg","g","m/s","km/h","const:pi","const:e"] as const;

type ConvertPayload = { value: number; from: string; to: string };

export const UnitsPanel: React.FC = () => {
    const { services } = useServices();
    const [value, setValue] = useState<string>("1");
    const [from, setFrom] = useState<string>("km");
    const [to, setTo] = useState<string>("m");
    const [res, setRes] = useState<number | null>(null);

    async function convert() {
        try {
            const special = from.startsWith("const:") || to.startsWith("const:");
            const payload: ConvertPayload = special
                ? {
                    value: Number(value),
                    from: "const",
                    to: (from.startsWith("const:") ? from.split(":")[1] : to.split(":")[1]) ?? ""
                }
                : { value: Number(value), from, to };

            const data: ConvertResp = await services.units.convert(payload.value, payload.from, payload.to);
            setRes(data.result);
            await services.history.add({ kind: "convert", input: payload, result: data.result });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            alert(msg);
        }
    }

    return (
        <Container maxWidth="md">
            <Card variant="outlined">
                <CardHeader title="Einheiten & Konstanten" subheader="Konvertiere gängige Einheiten oder skaliere Konstanten" />
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                label="Wert"
                                value={value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                                type="number"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Von</InputLabel>
                                <Select
                                    label="Von"
                                    value={from}
                                    onChange={(e: SelectChangeEvent<string>) => setFrom(e.target.value)}
                                >
                                    {OPTIONS.map(o => (<MenuItem key={o} value={o}>{o}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Nach</InputLabel>
                                <Select
                                    label="Nach"
                                    value={to}
                                    onChange={(e: SelectChangeEvent<string>) => setTo(e.target.value)}
                                >
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
