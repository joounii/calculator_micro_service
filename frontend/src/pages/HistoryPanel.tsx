// src/pages/HistoryPanel.tsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Container, Box, Button, CircularProgress, Chip, Alert } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import type { HistoryItem, HistoryListResp } from "../services/services";
import {useServices} from "@/services/ServicesContext";

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 };
const td: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: 8 };

export const HistoryPanel: React.FC = () => {
    const { services } = useServices();
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    async function load() {
        setLoading(true);
        setError("");
        try {
            const d: HistoryListResp = await services.history.list();
            setItems(d.items ?? []);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { void load(); }, []);

    function dlCSV() {
        const header = ["ts", "kind", "input", "result"];
        const rows = items.map(x => [ new Date(x.ts).toISOString(), x.kind, JSON.stringify(x.input), String(x.result) ]);
        const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replaceAll('"','""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `history-${Date.now()}.csv`; a.click();
    }

    return (
        <Container maxWidth="lg">
            <Card variant="outlined">
                <CardHeader
                    title="Verlauf & Audit"
                    subheader="Letzte Berechnungen (max. 200)"
                    action={<Button size="small" startIcon={<DownloadIcon/>} onClick={dlCSV}>CSV</Button>}
                />
                <CardContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {loading ? <CircularProgress/> : (
                        <Box sx={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr>
                                    <th style={th}>Zeit</th>
                                    <th style={th}>Typ</th>
                                    <th style={th}>Eingabe</th>
                                    <th style={th}>Ergebnis</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((it, idx) => (
                                    <tr key={idx}>
                                        <td style={td}>{new Date(it.ts).toLocaleString()}</td>
                                        <td style={td}><Chip size="small" label={it.kind} /></td>
                                        <td style={{ ...td, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{JSON.stringify(it.input)}</td>
                                        <td style={td}>{String(it.result)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};
