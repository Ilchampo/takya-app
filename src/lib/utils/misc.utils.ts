import type { ParsedCacheJson } from '../types';

export const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;

export const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export const parsePositiveEnvInt = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const parseNonNegativeEnvInt = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);

    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const parseEnvBoolean = (value: string | undefined, fallback = false): boolean => {
    if (value === undefined) {
        return fallback;
    }

    const normalized = value.trim().toLowerCase();

    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
    }

    if (['0', 'false', 'no', 'off', ''].includes(normalized)) {
        return false;
    }

    return fallback;
};

export const parseJson = (value: string): ParsedCacheJson => {
    try {
        const parsed = JSON.parse(value) as unknown;

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return { valid: false };
        }

        return {
            valid: true,
            data: parsed as Record<string, unknown>,
        };
    } catch {
        return { valid: false };
    }
};

export const stringifyJson = (value: unknown): string => JSON.stringify(value) ?? 'null';
