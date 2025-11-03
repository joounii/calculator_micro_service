// src/pages/HistoryPanel.tsx
import React, { useEffect, useState } from "react";
import {
    Card, CardHeader, CardContent, Container, Box, Button, CircularProgress, Chip
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {useServices} from "@/services/ServicesContext";

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 };
const td: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: 8 };

export const HistoryPanel: React.FC = () => {
    const { services } = useServices();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function load() {
        setLoading(true);
        try { const d = await services.history.list(); setItems(d.items || []); }
        finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    function dlCSV() {
        const header = ["ts","kind","input","result"];
        const rows = items.map(x => [ new Date(x.ts).toISOString(), x.kind, JSON.stringify(x.input), String(x.result) ]);
        const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replaceAll('"','""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `history-${Date.now()}.csv`; a.click();
    }

    return (
        <Container maxWidth="lg">
            <Card variant="outlined">
                <CardHeader title="Verlauf & Audit" subheader="Letzte Berechnungen (max. 200)" action={<Button size="small" startIcon={<DownloadIcon/>} onClick={dlCSV}>CSV</Button>} />
                <CardContent>
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
                                        <td style={{...td, fontFamily: "monospace"}}>{JSON.stringify(it.input)}</td>
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
