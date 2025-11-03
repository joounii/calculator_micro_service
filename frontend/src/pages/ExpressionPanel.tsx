import React, { Fragment, useState } from "react";
import {
    Card, CardHeader, CardContent, Container, Box, Tabs, Tab,
    TextField, Stack, Button, Chip
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import {useServices} from "@/services/ServicesContext";
import { formatNumber } from "../utils/formatNumber";

export const ExpressionPanel: React.FC = () => {
    const { services } = useServices();
    const [expr, setExpr] = useState<string>("(2+3)*4");
    const [res, setRes] = useState<number | null>(null);
    const [tab, setTab] = useState<number>(0);

    async function runEval() {
        try {
            const data = await services.expr.eval(expr);
            setRes(data.result);
            await services.history.add({ kind: "expr", input: { expr }, result: data.result });
        } catch (e: any) {
            alert(e.message || String(e));
        }
    }

    return (
        <Container maxWidth="md">
            <Card variant="outlined">
                <CardHeader title="Ausdruck auswerten" subheader="Parser & sichere Auswertung" />
                <CardContent>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                        <Tab label="Ausdruck" />
                        <Tab label="Beispiele" />
                    </Tabs>
                    {tab === 0 && (
                        <Box>
                            <TextField
                                fullWidth multiline minRows={2} maxRows={6}
                                label="Ausdruck" value={expr} onChange={e=>setExpr(e.target.value)}
                                helperText="Unterstützt + − × ÷ ^ und Klammern. Tipp: Shift+Enter für neue Zeile."
                            />
                            <Stack direction="row" spacing={2} mt={2}>
                                <Button variant="contained" onClick={runEval} startIcon={<CodeIcon/>}>Auswerten</Button>
                                {res !== null && <Chip label={`Ergebnis: ${formatNumber(res)}`} color="primary" />}
                            </Stack>
                        </Box>
                    )}
                    {tab === 1 && (
                        <Stack spacing={1}>
                            {["3+4*2/(1-5)^2^3","(7-3)*(4+6)/2","(2+3)*4","(1+2+3+4+5)/5"].map(s => (
                                <Chip key={s} onClick={() => setExpr(s)} label={s} variant="outlined" clickable />
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};
