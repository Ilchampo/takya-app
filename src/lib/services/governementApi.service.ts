import type * as types from '../types.ts';

import { GovernmentApiError } from '../errors/service.errors.ts';
import { abortError, serviceWrapper } from '../utils/service.utils.ts';
import { normalizePlate } from '../utils/licensePlate.utils.ts';
import { sanitizeGovernmentData } from '../utils/privacy.utils.ts';

import config from '../configs/app.config.ts';

const isAbortError = (error: unknown): boolean =>
    error instanceof Error && error.name === 'AbortError';

const parseRetryAfterMs = (value: string | null, now = Date.now()): number | undefined => {
    if (!value) {
        return undefined;
    }

    const seconds = Number(value);

    if (Number.isFinite(seconds) && seconds >= 0) {
        return Math.ceil(seconds * 1_000);
    }

    const date = Date.parse(value);

    return Number.isFinite(date) ? Math.max(0, date - now) : undefined;
};

const configuredSourceUrl = (value: string, source: string): string => {
    const configuredValue = value.trim();

    try {
        const url = new URL(configuredValue);

        if (url.protocol !== 'https:' || !url.hostname) {
            throw new Error('Invalid source URL');
        }

        return configuredValue;
    } catch {
        throw new GovernmentApiError(
            `El servicio ${source} no está configurado correctamente.`,
            undefined,
            false,
        );
    }
};

const request = async (
    url: string,
    init: RequestInit,
    options: types.RequestOptions,
    stage: types.Diagnostics['stage'],
): Promise<types.RequestResult> =>
    serviceWrapper(
        async (signal) => {
            const startedAt = Date.now();
            let diagnostics: types.Diagnostics | undefined;

            try {
                const response = await (options.fetchImpl ?? fetch)(url, {
                    ...init,
                    signal,
                });

                diagnostics = {
                    stage,
                    status: response.status,
                    contentType: response.headers.get('content-type') ?? '',
                    elapsedMs: Date.now() - startedAt,
                    retryAfterMs:
                        response.status === 429
                            ? parseRetryAfterMs(response.headers.get('retry-after'))
                            : undefined,
                };

                if (!response.ok) {
                    throw new GovernmentApiError(
                        `La fuente respondió HTTP ${response.status}.`,
                        diagnostics,
                    );
                }

                if (
                    stage === 'lookup' &&
                    !diagnostics.contentType.toLowerCase().includes('application/json')
                ) {
                    throw new GovernmentApiError(
                        'La fuente no devolvió datos válidos.',
                        diagnostics,
                    );
                }

                const body = await response.text();

                if (signal.aborted) {
                    throw abortError();
                }

                if (stage === 'session') {
                    return { data: null, diagnostics };
                }

                try {
                    return {
                        data: JSON.parse(body) as unknown,
                        diagnostics: {
                            ...diagnostics,
                            elapsedMs: Date.now() - startedAt,
                        },
                    };
                } catch {
                    throw new GovernmentApiError(
                        'La fuente devolvió una respuesta que no se pudo interpretar.',
                        diagnostics,
                    );
                }
            } catch (error) {
                if (signal.aborted || isAbortError(error)) {
                    throw abortError();
                }

                if (error instanceof GovernmentApiError) {
                    throw error;
                }

                throw new GovernmentApiError('No pudimos conectar con esta fuente.', diagnostics);
            }
        },
        {
            signal: options.signal,
            timeout: options.timeoutMs,
            maxRetries: 0,
        },
    );

export const lookupVehicle = async (value: string, options: types.RequestOptions = {}) => {
    const plate = normalizePlate(value);
    const endpoint = configuredSourceUrl(config.source.SRI, 'SRI');

    const result = await request(
        `${endpoint}?numeroPlacaCampvCpn=${encodeURIComponent(plate)}`,
        { method: 'GET', headers: { Accept: 'application/json' } },
        options,
        'lookup',
    );

    return {
        plate,
        ...result,
        data: sanitizeGovernmentData(result.data),
    };
};

export const lookupFiscalia = async (value: string, options: types.FiscaliaOptions = {}) => {
    const plate = normalizePlate(value);
    const lookupEndpoint = configuredSourceUrl(config.source.fiscaliaLookup, 'Fiscalía');

    if (options.initializeSession) {
        const entryEndpoint = configuredSourceUrl(config.source.fiscaliaEntry, 'Fiscalía');

        await request(entryEndpoint, { credentials: 'include' }, options, 'session');
    }

    const result = await request(
        lookupEndpoint,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `tipo=buscar_general&criterio=5&valor=${encodeURIComponent(plate)}`,
        },
        options,
        'lookup',
    );

    return {
        plate,
        ...result,
        data: sanitizeGovernmentData(result.data),
    };
};
