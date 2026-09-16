interface Branding {
    primary: string;
    secondary: string;
}

interface Source {
    SRI: string;
    fiscaliaLookup: string;
    fiscaliaEntry: string;
}

interface Service {
    ttlDays: number;
    TTL: number;
    historyLimit: number;
    timeout: number;
    maxRetries: number;
}

export interface Config {
    branding: Branding;
    source: Source;
    service: Service;
}
