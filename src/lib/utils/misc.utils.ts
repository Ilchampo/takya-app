export const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;

export const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
