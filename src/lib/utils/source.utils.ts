import type * as types from '../types.ts';
import type { AppTheme } from '../../theme/theme';

import config from '../configs/app.config.ts';

export const GOVERNMENT_DISCLAIMER =
    'Takya no es una aplicación oficial del Gobierno del Ecuador y no representa a una entidad gubernamental.';

const sourceNames: Record<types.ServiceId, string> = {
    sri: 'SRI',
    fiscalia: 'Fiscalía General del Estado',
};

export type OfficialSource = {
    id: types.ServiceId;
    name: string;
    url: string;
    host: string;
};

// Keep a trailing "?" when the removed parameter was the only one, so the cited
// Fiscalía page stays https://host/redirect.php?
export const withoutQueryParam = (value: string, name: string): string => {
    const hashIndex = value.indexOf('#');
    const hash = hashIndex === -1 ? '' : value.slice(hashIndex);
    const withoutHash = hashIndex === -1 ? value : value.slice(0, hashIndex);
    const question = withoutHash.indexOf('?');

    if (question === -1) {
        return value;
    }

    const base = withoutHash.slice(0, question);
    const params = withoutHash
        .slice(question + 1)
        .split('&')
        .filter((part) => {
            if (!part) {
                return false;
            }

            const key = part.split('=')[0] ?? '';

            try {
                return decodeURIComponent(key) !== name;
            } catch {
                return key !== name;
            }
        });

    return params.length > 0 ? `${base}?${params.join('&')}${hash}` : `${base}?${hash}`;
};

export const publicCitationUrl = (service: types.ServiceId): string => {
    if (service === 'sri') {
        return config.source.SRI.trim();
    }

    return withoutQueryParam(config.source.fiscaliaEntry.trim(), 'data');
};

export const officialSource = (service: types.ServiceId): OfficialSource | null => {
    const url = publicCitationUrl(service);

    try {
        const host = new URL(url).host;

        if (!host) {
            return null;
        }

        return {
            id: service,
            name: sourceNames[service],
            url,
            host,
        };
    } catch {
        return null;
    }
};

export const officialSources = (): OfficialSource[] =>
    (['sri', 'fiscalia'] as const).flatMap((service) => {
        const source = officialSource(service);

        return source ? [source] : [];
    });

export const sourcePresentation = (source?: types.SourceProgress): types.SourcePresentation => {
    if (!source) {
        return {
            tone: 'idle',
            label: 'Sin consultar',
            icon: 'clock',
            note: 'Ingresa una placa para consultar esta fuente.',
        };
    }

    switch (source.status) {
        case 'loading':
            return {
                tone: 'loading',
                label:
                    source.attempt > 1
                        ? `Reintentando · ${source.attempt - 1} de ${config.service.maxRetries}`
                        : 'Consultando…',
                icon: 'clock',
                note: 'Esperando una respuesta. Puedes revisar la otra fuente mientras tanto.',
            };
        case 'success':
            return {
                tone: 'success',
                label: 'Respuesta recibida',
                icon: 'check',
                note: null,
            };
        case 'error':
            return {
                tone: 'error',
                label: 'No disponible',
                icon: 'info',
                note: source.message,
            };
        default:
            return {
                tone: 'error',
                label: 'Estado desconocido',
                icon: 'info',
                note: 'Encontramos un estado desconocido.',
            };
    }
};

export const toneColors = (
    tone: types.SourceTone,
    theme: AppTheme,
): { color: string; background: string } => {
    switch (tone) {
        case 'success':
            return {
                color: theme.colors.success,
                background: theme.colors.successMuted,
            };
        case 'error':
            return {
                color: theme.colors.danger,
                background: theme.colors.dangerMuted,
            };
        default:
            return {
                color: theme.colors.primaryPressed,
                background: theme.colors.surfaceMuted,
            };
    }
};
