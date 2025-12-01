// src/services/services.ts
import {ApiClient} from "./ApiClient";

/* ---- Types ---- */
export type BasicOp = "add" | "subtract" | "multiply" | "divide" | "percent";

export interface BasicCalcBody {
    a: number;
    b: number;
    op: BasicOp;
}

export interface BasicCalcResp {
    result: number;
}

export interface AdvancedRunBody {
    fn: string;
    args: number[];
}

export interface AdvancedRunResp {
    result: number;
}

export interface ConvertBody {
    value: number;
    from: string;
    to: string;
}

export interface ConvertResp {
    result: number;
}

export interface ExprEvalBody {
    expr: string;
}

export interface ExprEvalResp {
    result: number;
}

export interface HistoryItem {
    ts: number;
    kind: "basic" | "advanced" | "convert" | "expr" | "ai" | "manual" | string;
    input: unknown;
    result: unknown;
}

export interface HistoryListResp {
    items: HistoryItem[];
}

export interface HistoryAddBody {
    kind: HistoryItem["kind"];
    input?: unknown;
    result?: unknown;
}

export interface HistoryAddResp {
    ok: boolean;
}

export interface AiSolveBody {
    prompt: string;
    constraints?: Record<string, unknown>;
    verify?: boolean;
}

export interface AiSolveResp {
    summary?: string;
    steps?: string[];
    result?: number;
    units?: string;
    notes?: string;

    [k: string]: unknown;
}

export interface MeResp {
    user: string;
    preferences?: Record<string, unknown>;
}

export interface UpdateMeBody {
    [k: string]: unknown;
}

export interface UpdateMeResp {
    ok: boolean;
    saved?: unknown;
}

export interface AuthLoginBody {
    email: string;
    password: string;
}

export interface AuthRegisterBody {
    email: string;
    password: string;
    name?: string;
}

export interface AuthLoginResp {
    token: string;
    user: { id: string; email: string; name?: string };
}

/* ---- Calculator Gateway Payload ---- */
type CalcPayload = { num1: number; num2: number };
type CalcResponse = { result: number; operation: string; operands: number[] };

/* ---- Services ---- */
export class BasicOpsService {
    constructor(private client: ApiClient) {
    }

    async calc(a: number, b: number, op: BasicOp): Promise<BasicCalcResp> {
        // Prozent ist nicht im Backend: lokal berechnen
        if (op === "percent") {
            return {result: (Number(a) * Number(b)) / 100};
        }
        // echte Endpoints am Gateway
        const path = `/calculate/${op}`; // add|subtract|multiply|divide
        const body: CalcPayload = {num1: Number(a), num2: Number(b)};
        const resp = await this.client.request<CalcResponse, CalcPayload>(path, {method: "POST", body});
        return {result: resp.result};
    }
}

export class AdvancedMathService {
    constructor(private client: ApiClient) {
    }

    async run(fn: string, args: number[]): Promise<AdvancedRunResp> {
        const [x, y] = args;

        // sqrt(x) → /calculate/root { num1: x, num2: 2 }
        if (fn === "sqrt") {
            const body: CalcPayload = {num1: Number(x), num2: 2};
            const resp = await this.client.request<CalcResponse, CalcPayload>("/calculate/root", {
                method: "POST",
                body
            });
            return {result: resp.result};
        }

        // divide/multiply/add/subtract (wenn Nutzer sie hier nutzt) → Calculator
        if (fn === "add" || fn === "subtract" || fn === "multiply" || fn === "divide") {
            const body: CalcPayload = {num1: Number(x), num2: Number(y)};
            const resp = await this.client.request<CalcResponse, CalcPayload>(`/calculate/${fn}`, {
                method: "POST",
                body
            });
            return {result: resp.result};
        }

        // pow/log/sin/cos/tan/exp → lokal, bis Backend dafür existiert
        const local: Record<string, (...a: number[]) => number> = {
            pow: (a, b) => Math.pow(a, b),
            log: (a) => Math.log(a),
            exp: (a) => Math.exp(a),
            sin: (a) => Math.sin(a),
            cos: (a) => Math.cos(a),
            tan: (a) => Math.tan(a),
            tau: () => 2 * Math.PI
        };
        if (local[fn]) return {result: local[fn](...(args as [number, number]))};

        throw new Error(`Funktion ${fn} wird aktuell nicht unterstützt.`);
    }
}

export class UnitsService {
    constructor(private client: ApiClient) {
    }

    convert(value: number, from: string, to: string) {
        const body: ConvertBody = {value: Number(value), from, to};
        return this.client.request<ConvertResp, ConvertBody>("/units/convert", {method: "POST", body});
    }
}

export class ExpressionService {
    constructor(private client: ApiClient) {
    }

    eval(expr: string) {
        const body: ExprEvalBody = {expr};
        return this.client.request<ExprEvalResp, ExprEvalBody>("/expr/eval", {method: "POST", body});
    }
}

export class HistoryService {
    constructor(private client: ApiClient) {}

    async list(params?: Record<string, string | number | boolean>): Promise<HistoryListResp> {
        const qs = params ? `?${new URLSearchParams(Object.entries(params).map(([k,v]) => [k, String(v)]))}` : "";
        try {
            return await this.client.request<HistoryListResp>(`/history${qs}`);
        } catch {
            // Fallback auf LocalStorage
            const items = HistoryFallback.load();
            return { items };
        }
    }

    async add(entry: HistoryAddBody): Promise<HistoryAddResp> {
        try {
            return await this.client.request<HistoryAddResp, HistoryAddBody>("/history", { method: "POST", body: entry });
        } catch {
            // Fallback: lokal persistieren, aber UI nicht stören
            HistoryFallback.add(entry);
            return { ok: true };
        }
    }
}

// --- sehr kleine LocalStorage-Helfer ---
const HKEY = "tr.history.fallback";
const HistoryFallback = {
    load(): HistoryItem[] {
        try { return JSON.parse(localStorage.getItem(HKEY) || "[]") as HistoryItem[]; } catch { return []; }
    },
    save(items: HistoryItem[]) {
        try { localStorage.setItem(HKEY, JSON.stringify(items)); } catch {}
    },
    add(entry: HistoryAddBody) {
        const items = this.load();
        items.unshift({
            ts: Date.now(),
            kind: entry.kind,
            input: entry.input ?? null,
            result: entry.result ?? null,
        } as HistoryItem);
        this.save(items);
    },
};

export class AiService {
    constructor(private client: ApiClient) {
    }

    solve(prompt: string, constraints?: Record<string, unknown>, verify?: boolean) {
        const body: AiSolveBody = {prompt, constraints, verify};
        return this.client.request<AiSolveResp, AiSolveBody>("/ai/solve", {method: "POST", body});
    }
}

export class UserService {
    constructor(private client: ApiClient) {
    }

    me() {
        return this.client.request<MeResp>("/me");
    }

    updateSettings(payload: UpdateMeBody) {
        return this.client.request<UpdateMeResp, UpdateMeBody>("/me/settings", {method: "PATCH", body: payload});
    }
}

export class AuthService {
    constructor(private client: ApiClient) {
    }

    login(email: string, password: string) {
        const body: AuthLoginBody = {email, password};
        return this.client.request<AuthLoginResp, AuthLoginBody>("/login/verify", {method: "POST", body}); /* an Gateway /login/... */
    }

    register(email: string, password: string, name?: string) {
        const body: AuthRegisterBody = {email, password, name};
        return this.client.request<AuthLoginResp, AuthRegisterBody>("/login/register", {method: "POST", body});
    }
}
