
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface ApiClientOptions {
    baseUrl?: string;
    token?: string;
    mock?: boolean;
}

export interface RequestOptions<TBody = unknown> {
    method?: HttpMethod;
    body?: TBody;
}

export class ApiClient {
    private baseUrl: string;
    private token: string;
    private mock: boolean;

    constructor({ baseUrl = "", token = "", mock = true }: ApiClientOptions = {}) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.mock = mock;
    }

    setBaseUrl(url: string) { this.baseUrl = url; }
    setToken(tok: string) { this.token = tok; }
    setMock(flag: boolean) { this.mock = !!flag; }

    async request<TResp = unknown, TBody = unknown>(
        path: string,
        { method = "GET", body }: RequestOptions<TBody> = {}
    ): Promise<TResp> {
        if (this.mock) {
            return MockBackend.handle<TResp, TBody>(path, { method, body });
        }
        const url = new URL(path, this.baseUrl || window.location.origin);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (this.token) headers["Authorization"] = `Bearer ${this.token}`;

        const res = await fetch(url.toString(), {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        if (res.status === 204) return null as unknown as TResp;
        return res.json() as Promise<TResp>;
    }
}

/* --------------------------- Mock Backend --------------------------- */

class MockBackend {
    private static HKEY = "tr.mock.history";

    private static async delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }
    private static loadH() { try { return JSON.parse(localStorage.getItem(this.HKEY) || "[]"); } catch { return []; } }
    private static saveH(arr: any[]) { try { localStorage.setItem(this.HKEY, JSON.stringify(arr)); } catch {} }

    static async handle<TResp = unknown, TBody = unknown>(
        path: string,
        { method = "GET", body }: RequestOptions<TBody> = {}
    ): Promise<TResp> {
        await this.delay(200);

        if (path === "/ops/basic" && method === "POST") {
            const b = body as any;
            const result = safeOp(b.a, b.b, b.op);
            const hist = this.loadH(); hist.unshift({ ts: Date.now(), kind: "basic", input: b, result }); this.saveH(hist);
            return { result } as TResp;
        }

        if (path === "/ops/advanced" && method === "POST") {
            const b = body as any;
            const map: Record<string, (args: number[]) => number> = {
                sqrt: ([x]) => Math.sqrt(+x),
                pow: ([x, y]) => Math.pow(+x, +y),
                sin: ([x]) => Math.sin(+x),
                cos: ([x]) => Math.cos(+x),
                tan: ([x]) => Math.tan(+x),
                log: ([x]) => Math.log(+x),
                exp: ([x]) => Math.exp(+x),
                tau: () => 2 * Math.PI,
            };
            if (!map[b.fn]) throw new Error(`Unbekannte Funktion: ${b.fn}`);
            const result = map[b.fn](b.args || []);
            const hist = this.loadH(); hist.unshift({ ts: Date.now(), kind: "advanced", input: b, result }); this.saveH(hist);
            return { result } as TResp;
        }

        if (path === "/units/convert" && method === "POST") {
            const b = body as any;
            const result = unitConvert(b.value, b.from, b.to);
            const hist = this.loadH(); hist.unshift({ ts: Date.now(), kind: "convert", input: b, result }); this.saveH(hist);
            return { result } as TResp;
        }

        if (path === "/expr/eval" && method === "POST") {
            const b = body as any;
            const result = evalExpression(String(b.expr || ""));
            const hist = this.loadH(); hist.unshift({ ts: Date.now(), kind: "expr", input: b, result }); this.saveH(hist);
            return { result } as TResp;
        }

        if (path.startsWith("/history") && method !== "POST") {
            const hist = this.loadH();
            return { items: hist.slice(0, 200) } as TResp;
        }

        if (path === "/history" && method === "POST") {
            const b = body as any;
            const hist = this.loadH();
            hist.unshift({ ts: Date.now(), kind: b.kind || "manual", input: b.input || null, result: b.result || null });
            this.saveH(hist);
            return { ok: true } as TResp;
        }

        if (path === "/ai/solve" && method === "POST") {
            const resp = {
                summary: "Analyse im Mathe-Detektiv-Modus (Mock)",
                steps: [
                    "Problem verstehen und Einheiten prüfen",
                    "Variable definieren und Gleichung aufstellen",
                    "Lösen, Zwischenergebnisse verifizieren",
                    "Ergebnis mit Einheiten zurückgeben",
                ],
                result: Math.random() * 100,
                units: "(Mock-Einheit)",
                notes: "Für echte Ergebnisse Live-API aktivieren.",
            };
            const b = body as any;
            const hist = this.loadH(); hist.unshift({ ts: Date.now(), kind: "ai", input: b, result: resp.result }); this.saveH(hist);
            return resp as TResp;
        }

        if (path === "/me") {
            return { user: "demo", preferences: { locale: "de-CH", decimalSeparator: "," } } as TResp;
        }

        if (path === "/me/settings" && method === "PATCH") {
            return { ok: true, saved: body } as TResp;
        }

        throw new Error(`Mock: Unbekannte Route ${method} ${path}`);
    }
}

/* --------------------------- Lokale Helfer --------------------------- */

function opName(symbol: string) {
    return ({ "+": "add", "-": "subtract", "*": "multiply", "/": "divide", "^": "pow" } as Record<string, string>)[symbol] || symbol;
}

function safeOp(a: number, b: number, op: string): number {
    const A = Number(a), B = Number(b);
    if (!Number.isFinite(A) || !Number.isFinite(B)) throw new Error("Ungültige Zahlen");
    switch (op) {
        case "add": return A + B;
        case "subtract": return A - B;
        case "multiply": return A * B;
        case "divide": if (B === 0) throw new Error("Division durch 0"); return A / B;
        case "percent": return (A * B) / 100.0;
        case "pow": return Math.pow(A, B);
        default: throw new Error("Unbekannte Operation");
    }
}

function tokenize(s: string) {
    const out: Array<{ type: string; val?: string }> = []; let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (/\s/.test(c)) { i++; continue; }
        if (/[0-9.]/.test(c)) {
            let j = i + 1; while (j < s.length && /[0-9.]/.test(s[j])) j++;
            out.push({ type: "num", val: s.slice(i, j) }); i = j; continue;
        }
        if ("+-*/^".includes(c)) { out.push({ type: "op", val: c }); i++; continue; }
        if (c === "(") { out.push({ type: "lp" }); i++; continue; }
        if (c === ")") { out.push({ type: "rp" }); i++; continue; }
        throw new Error(`Ungültiges Zeichen: ${c}`);
    }
    return out;
}

function evalExpression(expr: string): number {
    const tokens = tokenize(expr);
    const output: any[] = [], ops: any[] = [];
    const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
    const rightAssoc: Record<string, boolean> = { "^": true };

    for (const t of tokens) {
        if (t.type === "num") output.push(t);
        else if (t.type === "op") {
            while (ops.length) {
                const top = ops[ops.length - 1];
                if (top.type !== "op") break;
                if ((prec[top.val] > prec[t.val!]) || (prec[top.val] === prec[t.val!] && !rightAssoc[t.val!])) {
                    output.push(ops.pop());
                } else break;
            }
            ops.push(t);
        } else if (t.type === "lp") ops.push(t);
        else if (t.type === "rp") {
            while (ops.length && ops[ops.length - 1].type !== "lp") output.push(ops.pop());
            if (!ops.length) throw new Error("Klammerfehler");
            ops.pop();
        }
    }
    while (ops.length) {
        const x = ops.pop();
        if (x.type === "lp") throw new Error("Klammerfehler");
        output.push(x);
    }
    const st: number[] = [];
    for (const t of output) {
        if (t.type === "num") st.push(Number(t.val));
        else if (t.type === "op") {
            const b = st.pop()!, a = st.pop()!;
            st.push(safeOp(a, b, opName(t.val)));
        }
    }
    if (st.length !== 1 || !Number.isFinite(st[0])) throw new Error("Syntax-/Rechenfehler");
    return st[0];
}

function unitConvert(value: number, from: string, to: string): number {
    const v = Number(value);
    if (!Number.isFinite(v)) throw new Error("Ungültiger Wert");
    if (from === to) return v;

    const map: Record<string, number> = {
        m: 1, km: 1000, cm: 0.01,
        s: 1, min: 60, h: 3600,
        kg: 1, g: 0.001,
        "m/s": 1, "km/h": 1000 / 3600,
    };

    if (map[from] && map[to]) {
        const base = v * map[from];
        return base / map[to];
    }

    const consts: Record<string, number> = { pi: Math.PI, e: Math.E };
    if (from === "const" && (to in consts)) return consts[to] * v;

    throw new Error(`Konvertierung nicht unterstützt (${from} → ${to})`);
}
