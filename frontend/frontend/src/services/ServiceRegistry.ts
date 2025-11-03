// src/services/ServiceRegistry.ts
import { ApiClient, ApiClientOptions } from "./ApiClient";
import {
    BasicOpsService,
    AdvancedMathService,
    UnitsService,
    ExpressionService,
    HistoryService,
    AiService,
    UserService,
} from "./services";

export interface RegistryConfig extends ApiClientOptions {}

export class ServiceRegistry {
    readonly client: ApiClient;

    readonly basic: BasicOpsService;
    readonly advanced: AdvancedMathService;
    readonly units: UnitsService;
    readonly expr: ExpressionService;
    readonly history: HistoryService;
    readonly ai: AiService;
    readonly user: UserService;

    constructor(cfg: RegistryConfig = {}) {
        this.client = new ApiClient(cfg);

        this.basic = new BasicOpsService(this.client);
        this.advanced = new AdvancedMathService(this.client);
        this.units = new UnitsService(this.client);
        this.expr = new ExpressionService(this.client);
        this.history = new HistoryService(this.client);
        this.ai = new AiService(this.client);
        this.user = new UserService(this.client);
    }

    applyConfig({ baseUrl, token, mock }: Partial<RegistryConfig>) {
        if (typeof baseUrl !== "undefined") this.client.setBaseUrl(baseUrl);
        if (typeof token !== "undefined") this.client.setToken(token);
        if (typeof mock !== "undefined") this.client.setMock(mock);
    }
}
