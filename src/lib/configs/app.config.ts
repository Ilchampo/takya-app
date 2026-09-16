import type { Config } from '../interfaces/config.interface';

import { daysToMilliSeconds, secondsTomilliSeconds } from '../utils/date.utils';
import { parsePositiveEnvInt, parseNonNegativeEnvInt } from '../utils/misc.utils';

const TTL_DAYS = 3 as const;
const TIMEOUT = 10 as const;
const HISTORY_LIMIT = 5 as const;
const MAX_RETRIES = 3 as const;
const MAX_RESPONSE_KB = 1_024 as const;
const RATE_LIMIT_MAX_REQUESTS = 5 as const;
const RATE_LIMIT_WINDOW_SECONDS = 60 as const;
const RATE_LIMIT_DEFAULT_COOLDOWN_SECONDS = 60 as const;
const INCIDENT_MONTHS = 24 as const;

const ttlDays = parsePositiveEnvInt(process.env.EXPO_PUBLIC_APP_TTL_DAYS, TTL_DAYS);
const historyLimit = parsePositiveEnvInt(process.env.EXPO_PUBLIC_APP_HISTORY_LIMIT, HISTORY_LIMIT);
const timeoutSeconds = parsePositiveEnvInt(process.env.EXPO_PUBLIC_APP_TIMEOUT_SEC, TIMEOUT);
const maxRetries = parseNonNegativeEnvInt(process.env.EXPO_PUBLIC_APP_MAX_RETRIES, MAX_RETRIES);
const maxResponseKb = parsePositiveEnvInt(
    process.env.EXPO_PUBLIC_APP_MAX_RESPONSE_KB,
    MAX_RESPONSE_KB,
);
const rateLimitMaxRequests = parsePositiveEnvInt(
    process.env.EXPO_PUBLIC_APP_RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_MAX_REQUESTS,
);
const rateLimitWindowSeconds = parsePositiveEnvInt(
    process.env.EXPO_PUBLIC_APP_RATE_LIMIT_WINDOW_SEC,
    RATE_LIMIT_WINDOW_SECONDS,
);
const rateLimitDefaultCooldownSeconds = parsePositiveEnvInt(
    process.env.EXPO_PUBLIC_APP_RATE_LIMIT_DEFAULT_COOLDOWN_SEC,
    RATE_LIMIT_DEFAULT_COOLDOWN_SECONDS,
);
const incidentMonths = parsePositiveEnvInt(
    process.env.EXPO_PUBLIC_APP_INCIDENT_MONTHS,
    INCIDENT_MONTHS,
);

const config: Config = {
    branding: {
        primary: `#${process.env.EXPO_PUBLIC_BRANDING_PRIMARY ?? 'FD7F3B'}`,
        secondary: `#${process.env.EXPO_PUBLIC_BRANDING_SECONDARY ?? 'FCF5E6'}`,
    },
    source: {
        SRI: process.env.EXPO_PUBLIC_SRI_URL ?? '',
        fiscaliaLookup: process.env.EXPO_PUBLIC_FISCALIA_LOOKUP_URL ?? '',
        fiscaliaEntry: process.env.EXPO_PUBLIC_FISCALIA_ENTRY_URL ?? '',
    },
    service: {
        ttlDays,
        TTL: daysToMilliSeconds(ttlDays),
        historyLimit,
        timeout: secondsTomilliSeconds(timeoutSeconds),
        maxRetries,
        maxResponseBytes: maxResponseKb * 1_024,
        rateLimit: {
            maxRequests: rateLimitMaxRequests,
            window: secondsTomilliSeconds(rateLimitWindowSeconds),
            defaultCooldown: secondsTomilliSeconds(rateLimitDefaultCooldownSeconds),
        },
        incidentMonths,
    },
} as const;

export default config;
