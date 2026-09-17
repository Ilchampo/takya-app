interface Source {
    SRI: string;
    fiscaliaLookup: string;
    fiscaliaEntry: string;
}

interface RateLimit {
    maxRequests: number;
    window: number;
    defaultCooldown: number;
}

interface Service {
    ttlDays: number;
    TTL: number;
    historyLimit: number;
    timeout: number;
    maxRetries: number;
    maxResponseBytes: number;
    rateLimit: RateLimit;
    incidentMonths: number;
}

export interface Config {
    debug: boolean;
    source: Source;
    service: Service;
}
