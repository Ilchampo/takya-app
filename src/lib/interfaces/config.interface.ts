interface Branding {
    primary: string;
    secondary: string;
}

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
    rateLimit: RateLimit;
}

export interface Config {
    branding: Branding;
    source: Source;
    service: Service;
}
