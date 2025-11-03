// src/pages/BasicOpsPanel.tsx
import React, { useState } from "react";
import {
    Card, CardHeader, CardContent, Container, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem, Stack, Button, Chip,
    Snackbar, Alert, CircularProgress
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import { formatNumber } from "../utils/formatNumber";
import {useServices} from "@/services/ServicesContext";

export const BasicOpsPanel: React.FC = () => {
    const { services } = useServices();
    const [a, setA] = useState<string>("21");
    const [b, setB] = useState<string>("2");
    const [op, setOp] = useState<"add"|"subtract"|"multiply"|"divide"|"percent">("divide");
    const [res, setRes] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState<string>("");

    async function calc() {
        setLoading(true);
        try {
            const data = await services.basic.calc(Number(a), Number(b), op);
            setRes(data.result);
            await services.history.add({ kind: "basic", input: { a, b, op }, result: data.result });
        } catch (e: any) {
            setSnack(String(e.message || e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container maxWidth="md">
            <Card variant="outlined">
                <CardHeader title="Grundrechenarten" subheader="Addieren, Subtrahieren, Multiplizieren, Dividieren & Prozent" />
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="a" value={a} onChange={e=>setA(e.target.value)} type="number" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="b" value={b} onChange={e=>setB(e.target.value)} type="number" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Operation</InputLabel>
                                <Select label="Operation" value={op} onChange={(e)=>setOp(e.target.value as any)}>
                                    <MenuItem value="add">a + b</MenuItem>
                                    <MenuItem value="subtract">a − b</MenuItem>
                                    <MenuItem value="multiply">a × b</MenuItem>
                                    <MenuItem value="divide">a ÷ b</MenuItem>
                                    <MenuItem value="percent">a · (b%)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <Stack direction="row" spacing={2}>
                                <Button variant="contained" onClick={calc} disabled={loading}
                                        startIcon={loading ? <CircularProgress size={18}/> : <CalculateIcon/>}>
                                    Berechnen
                                </Button>
                                {res !== null && <Chip label={`Ergebnis: ${formatNumber(res)}`} color="primary" />}
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Snackbar open={!!snack} onClose={() => setSnack("")} autoHideDuration={4000}>
                <Alert severity="error">{snack}</Alert>
            </Snackbar>
        </Container>
    );
};
