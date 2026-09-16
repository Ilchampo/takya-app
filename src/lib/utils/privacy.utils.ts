const normalizedKey = (key: string): string =>
    key
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

const isCedulaKey = (key: string): boolean => normalizedKey(key).includes('cedula');

const sanitizeValue = (value: unknown, insideSubjects = false): unknown => {
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item, insideSubjects));
    }

    if (!value || typeof value !== 'object') {
        return value;
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
        if (isCedulaKey(key) || (insideSubjects && key === '0')) {
            continue;
        }

        const isSubjectsField = normalizedKey(key) === 'sujetos';

        sanitized[key] = sanitizeValue(item, insideSubjects || isSubjectsField);
    }

    return sanitized;
};

export const sanitizeGovernmentData = (data: unknown): unknown => sanitizeValue(data);
