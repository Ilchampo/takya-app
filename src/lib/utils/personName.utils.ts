export const PROTECTED_IDENTITY_LABEL = 'Identidad protegida';
export const MASKED_NAME_PRIVACY_LABEL = 'Identidad protegida · Nombre parcialmente oculto';
export const PEOPLE_NAME_PRIVACY_NOTE =
    'Takya limita deliberadamente la visualización de nombres para reducir la exposición de datos personales.';

const LEADING_LETTER = /^\p{L}/u;

const tokenInitial = (token: string): string | null => {
    const firstCharacter = Array.from(token)[0];

    if (!firstCharacter || !LEADING_LETTER.test(firstCharacter)) {
        return null;
    }

    return `${firstCharacter.toLocaleUpperCase('es-EC')}.`;
};

const canMaskTokens = (tokens: string[]): boolean =>
    tokens.length > 0 && tokens.every((token) => tokenInitial(token) !== null);

export const maskPersonName = (fullName: unknown): string => {
    try {
        if (typeof fullName !== 'string') {
            return PROTECTED_IDENTITY_LABEL;
        }

        const normalized = fullName.trim().replace(/\s+/g, ' ');

        if (!normalized || normalized === PROTECTED_IDENTITY_LABEL) {
            return PROTECTED_IDENTITY_LABEL;
        }

        const tokens = normalized.split(' ');

        if (!canMaskTokens(tokens)) {
            return PROTECTED_IDENTITY_LABEL;
        }

        const [firstToken, ...otherTokens] = tokens;

        if (!firstToken) {
            return PROTECTED_IDENTITY_LABEL;
        }

        if (otherTokens.length === 0) {
            return tokenInitial(firstToken) ?? PROTECTED_IDENTITY_LABEL;
        }

        const maskedTokens = otherTokens.map((token) => tokenInitial(token));

        if (maskedTokens.some((token) => token === null)) {
            return PROTECTED_IDENTITY_LABEL;
        }

        return `${firstToken} ${maskedTokens.join(' ')}`;
    } catch {
        return PROTECTED_IDENTITY_LABEL;
    }
};
