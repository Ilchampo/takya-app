import type { FC } from 'react';
import type { AppTheme } from '../theme/theme';

import { toneColors } from './utils/source.utils.ts';
import { lookupVehicle, lookupFiscalia } from './services/governementApi.service.ts';

export type Diagnostics = {
    stage: 'session' | 'lookup';
    status: number;
    contentType: string;
    elapsedMs: number;
    retryAfterMs?: number;
};

export type SuccessfulSource = {
    status: 'success';
    data: unknown;
    diagnostics?: Diagnostics;
};

export type FailedSource = {
    status: 'error';
    message: string;
    diagnostics?: Diagnostics;
};

export type SourceResult = SuccessfulSource | FailedSource;

export type SourceProgress = SourceResult | { status: 'loading'; attempt: number };
export type LookupProgress = Omit<LookupResult, 'sri' | 'fiscalia'> & {
    sri: SourceProgress;
    fiscalia: SourceProgress;
};

export type LookupResult = {
    plate: string;
    sri: SourceResult;
    fiscalia: SourceResult;
    fetchedAt: number;
    fromCache: boolean;
};

export type LookupHistoryItem = {
    plate: string;
    fetchedAt: number;
};

export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterMs: number };

export type VehicleDetail = {
    key: string;
    label: string;
    value: string;
};

export type ThemeMode = 'light' | 'dark';

export type ServiceRequest<T> = (signal: AbortSignal) => Promise<T>;

export type ServiceWrapperOptions = {
    timeout?: number | false;
    maxRetries?: number;
    signal?: AbortSignal;
    onAttempt?: (attempt: number) => void | Promise<void>;
    wait?: (ms: number, signal?: AbortSignal) => Promise<void>;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
    retryDelay?: (error: unknown, nextAttempt: number) => number | undefined;
    onRetry?: (error: unknown, delayMs: number) => void | Promise<void>;
    random?: () => number;
};

export type SourceTone = 'idle' | 'loading' | 'success' | 'error';

export type IconName =
    | 'check'
    | 'arrow'
    | 'back'
    | 'car'
    | 'chevron'
    | 'clock'
    | 'database'
    | 'file'
    | 'info'
    | 'moon'
    | 'search'
    | 'shield'
    | 'sun'
    | 'warning';

export type SourcePresentation = {
    tone: SourceTone;
    label: string;
    icon: IconName;
    note: string | null;
};

export type ToneColors = ReturnType<typeof toneColors>;

export type ServiceId = 'sri' | 'fiscalia';

export type SuccessBodyProps = {
    data: unknown;
    theme: AppTheme;
    fetchedAt: number;
};

export type ServiceConfig = {
    title: string;
    subtitle: string;
    icon: IconName;
    Success: FC<SuccessBodyProps>;
};

export type LookupRow = {
    plate: string;
    sri_json: string;
    fiscalia_json: string;
    fetched_at: number;
};

export type UseAppThemeOptions = {
    onStorageError: VoidFunction;
};

export type UsePlateSearchOptions = {
    onHistoryChange: (history: LookupHistoryItem[]) => void;
    onStorageError: VoidFunction;
};

export type UseSavedLookupOptions = {
    onHistoryChange: (history: LookupHistoryItem[]) => void;
};

export type ButtonType = 'primary' | 'secondary' | 'ghost';

export type Dependencies = {
    getCachedLookup: (plate: string) => Promise<LookupResult | null>;
    saveLookup: (result: LookupResult) => Promise<void>;
    vehicle?: typeof lookupVehicle;
    fiscalia?: typeof lookupFiscalia;
    wait?: (ms: number, signal?: AbortSignal) => Promise<void>;
    consumeLookupRateLimit?: (now?: number) => Promise<RateLimitDecision>;
    getSourceCooldown?: (service: ServiceId, now?: number) => Promise<number>;
    setSourceCooldown?: (service: ServiceId, cooldownUntil: number) => Promise<void>;
};

export type SearchOptions = {
    signal?: AbortSignal;
    onUpdate: (result: LookupProgress) => void;
};

export type RequestOptions = {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
    signal?: AbortSignal;
};

export type FiscaliaOptions = RequestOptions & {
    initializeSession?: boolean;
    onSessionInitialized?: VoidFunction;
};

export type RequestResult = {
    data: unknown;
    diagnostics: Diagnostics;
};

export type ParsedCacheJson = { valid: true; data: Record<string, unknown> } | { valid: false };
