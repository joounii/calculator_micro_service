// src/services/services.ts
import { ApiClient } from "./ApiClient";

/* ----------------------------- Typdefinitionen ----------------------------- */
export type BasicOp = "add" | "subtract" | "multiply" | "divide" | "percent";

export interface BasicCalcBody { a: number; b: number; op: BasicOp; }
export interface BasicCalcResp { result: number; }

export interface AdvancedRunBody { fn: string; args: number[]; }
export interface AdvancedRunResp { result: number; }

export interface ConvertBody { value: number; from: string; to: string; }
export interface ConvertResp { result: number; }

export interface ExprEvalBody { expr: string; }
export interface ExprEvalResp { result: number; }

export interface HistoryItem {
    ts: number;
    kind: "basic" | "advanced" | "convert" | "expr" | "ai" | "manual" | string;
    input: unknown;
    result: unknown;
}
export interface HistoryListResp { items: HistoryItem[]; }
export interface HistoryAddBody { kind: HistoryItem["kind"]; input?: unknown; result?: unknown; }
export interface HistoryAddResp { ok: boolean; }

export interface AiSolveBody { prompt: string; constraints?: Record<string, unknown>; verify?: boolean; }
export interface AiSolveResp { summary?: string; steps?: string[]; result?: number; units?: string; notes?: string; [k: string]: unknown; }

export interface MeResp { user: string; preferences?: Record<string, unknown>; }
export interface UpdateMeBody { [k: string]: unknown; }
export interface UpdateMeResp { ok: boolean; saved?: unknown; }

/* ------------------------------ Auth: neu --------------------------------- */
export interface AuthLoginBody { email: string; password: string; }
export interface AuthRegisterBody { email: string; password: string; name?: string; }
export interface AuthLoginResp {
    token: string;
    user: { id: string; email: string; name?: string };
}

/* --------------------------------- Services -------------------------------- */
export class BasicOpsService { constructor(private client: ApiClient) {} calc(a: number, b: number, op: BasicOp) { const body: BasicCalcBody = { a: Number(a), b: Number(b), op }; return this.client.request<BasicCalcResp, BasicCalcBody>("/ops/basic", { method: "POST", body }); } }
export class AdvancedMathService { constructor(private client: ApiClient) {} run(fn: string, args: number[]) { const body: AdvancedRunBody = { fn, args }; return this.client.request<AdvancedRunResp, AdvancedRunBody>("/ops/advanced", { method: "POST", body }); } }
export class UnitsService { constructor(private client: ApiClient) {} convert(value: number, from: string, to: string) { const body: ConvertBody = { value: Number(value), from, to }; return this.client.request<ConvertResp, ConvertBody>("/units/convert", { method: "POST", body }); } }
export class ExpressionService { constructor(private client: ApiClient) {} eval(expr: string) { const body: ExprEvalBody = { expr }; return this.client.request<ExprEvalResp, ExprEvalBody>("/expr/eval", { method: "POST", body }); } }
export class HistoryService { constructor(private client: ApiClient) {} list(params?: Record<string, string | number | boolean>) { const qs = params ? `?${new URLSearchParams(Object.entries(params).map(([k,v]) => [k, String(v)]))}` : ""; return this.client.request<HistoryListResp>(`/history${qs}`); } add(entry: HistoryAddBody) { return this.client.request<HistoryAddResp, HistoryAddBody>("/history", { method: "POST", body: entry }); } }
export class AiService { constructor(private client: ApiClient) {} solve(prompt: string, constraints?: Record<string, unknown>, verify?: boolean) { const body: AiSolveBody = { prompt, constraints, verify }; return this.client.request<AiSolveResp, AiSolveBody>("/ai/solve", { method: "POST", body }); } }
export class UserService { constructor(private client: ApiClient) {} me() { return this.client.request<MeResp>("/me"); } updateSettings(payload: UpdateMeBody) { return this.client.request<UpdateMeResp, UpdateMeBody>("/me/settings", { method: "PATCH", body: payload }); } }

/* ------------------------------ Auth Service ------------------------------- */
export class AuthService {
    constructor(private client: ApiClient) {}
    login(email: string, password: string) {
        const body: AuthLoginBody = { email, password };
        return this.client.request<AuthLoginResp, AuthLoginBody>("/auth/login", { method: "POST", body });
    }
    register(email: string, password: string, name?: string) {
        const body: AuthRegisterBody = { email, password, name };
        return this.client.request<AuthLoginResp, AuthRegisterBody>("/auth/register", { method: "POST", body });
    }
}
