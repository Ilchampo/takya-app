import type { Config } from '../interfaces/config.interface';

import { daysToMilliSeconds, secondsTomilliSeconds } from '../utils/date.utils';

const TTL_DAYS = 3 as const;
const TIMEOUT = 10 as const;
const HISTORY_LIMIT = 5 as const;
const MAX_RETRIES = 3 as const;

const config: Config = {
    branding: {
        primary: `#${process.env.EXPO_BRANDING_PRIMARY ?? 'FD7F3B'}`,
        secondary: `#${process.env.EXPO_BRANDING_SECONDARY ?? 'FCF5E6'}`,
    },
    source: {
        SRI: process.env.EXPO_SRI_URL,
        fiscaliaLookup: process.env.EXPO_FISCALIA_LOOKUP_URL,
        fiscaliaEntry: process.env.EXPO_FISCALIA_ENTRY_URL,
    },
    service: {
        TTL: daysToMilliSeconds(parseInt(process.env.EXPO_APP_TTL_DAYS) ?? TTL_DAYS),
        historyLimit: parseInt(process.env.EXPO_APP_HISTORY_LIMIT) ?? HISTORY_LIMIT,
        timeout: secondsTomilliSeconds(process.env.EXPO_APP_TIMEOUT_SEC ?? TIMEOUT),
        maxRetries: parseInt(process.env.EXPO_APP_MAX_RETRIES) ?? MAX_RETRIES,
    },
} as const;

export default config;
