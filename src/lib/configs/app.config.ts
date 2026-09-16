import type { Config } from '../interfaces/config.interface';

import { daysToMilliSeconds, secondsTomilliSeconds } from '../utils/date.utils';

const TTL_DAYS = 3 as const;
const TIMEOUT = 10 as const;
const HISTORY_LIMIT = 5 as const;
const MAX_RETRIES = 3 as const;

const parseEnvInt = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

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
        TTL: daysToMilliSeconds(parseEnvInt(process.env.EXPO_PUBLIC_APP_TTL_DAYS, TTL_DAYS)),
        historyLimit: parseEnvInt(process.env.EXPO_PUBLIC_APP_HISTORY_LIMIT, HISTORY_LIMIT),
        timeout: secondsTomilliSeconds(
            parseEnvInt(process.env.EXPO_PUBLIC_APP_TIMEOUT_SEC, TIMEOUT),
        ),
        maxRetries: parseEnvInt(process.env.EXPO_PUBLIC_APP_MAX_RETRIES, MAX_RETRIES),
    },
} as const;

export default config;
