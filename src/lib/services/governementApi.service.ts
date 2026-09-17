import type * as types from '../types.ts';

import { debugFiscaliaPayload, debugVehiclePayload } from '../../data/debugLookups.data.ts';
import { GovernmentApiError } from '../errors/service.errors.ts';
import { abortError, delay, serviceWrapper } from '../utils/service.utils.ts';
import { normalizePlate, tryNormalizePlate } from '../utils/licensePlate.utils.ts';
import { asRecord } from '../utils/misc.utils.ts';
import {
    isVehicleNotFoundProjection,
    projectFiscaliaData,
    projectVehicleData,
} from '../utils/privacy.utils.ts';

import config from '../configs/app.config.ts';

const DEBUG_SRI_DELAY_MS = 420;
const DEBUG_FISCALIA_DELAY_MS = 780;

const allowedSourceHosts = {
    SRI: 'srienlinea.sri.gob.ec',
    Fiscalía: 'www.gestiondefiscalias.gob.ec',
} as const;

type SourceName = keyof typeof allowedSourceHosts;

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

const utf8ByteLength = (value: string): number => {
    let bytes = 0;

    for (let index = 0; index < value.length; index++) {
        const code = value.charCodeAt(index);

        if (code <= 0x7f) {
            bytes += 1;
        } else if (code <= 0x7ff) {
            bytes += 2;
        } else if (
            code >= 0xd800 &&
            code <= 0xdbff &&
            index + 1 < value.length &&
            value.charCodeAt(index + 1) >= 0xdc00 &&
            value.charCodeAt(index + 1) <= 0xdfff
        ) {
            bytes += 4;
            index += 1;
        } else {
            bytes += 3;
        }
    }

    return bytes;
};

const configuredSourceUrl = (value: string, source: SourceName): string => {
    const configuredValue = value.trim();

    try {
        const url = new URL(configuredValue);
        const allowedHost = allowedSourceHosts[source];

        if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== allowedHost) {
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

export const validateGovernmentApiConfig = (): string | null => {
    if (config.debug) {
        return null;
    }

    try {
        configuredSourceUrl(config.source.SRI, 'SRI');
        configuredSourceUrl(config.source.fiscaliaEntry, 'Fiscalía');
        configuredSourceUrl(config.source.fiscaliaLookup, 'Fiscalía');

        return null;
    } catch (error) {
        return error instanceof Error
            ? error.message
            : 'Los servicios públicos no están configurados correctamente.';
    }
};

const usesMockLookups = (options: types.RequestOptions): boolean =>
    config.debug && options.fetchImpl === undefined;

const mockLookup = async (
    plate: string,
    data: Record<string, unknown>,
    delayMs: number,
    options: types.RequestOptions,
): Promise<{ plate: string; data: Record<string, unknown>; diagnostics: types.Diagnostics }> => {
    const startedAt = Date.now();

    await delay(delayMs, options.signal);

    return {
        plate,
        data,
        diagnostics: {
            stage: 'lookup',
            status: 200,
            contentType: 'application/json',
            elapsedMs: Date.now() - startedAt,
        },
    };
};

type LookupProjector = (data: unknown) => unknown;

function request(
    url: string,
    init: RequestInit,
    options: types.RequestOptions,
    stage: 'session',
): Promise<types.RequestResult>;
function request(
    url: string,
    init: RequestInit,
    options: types.RequestOptions,
    stage: 'lookup',
    project: LookupProjector,
): Promise<types.RequestResult>;
function request(
    url: string,
    init: RequestInit,
    options: types.RequestOptions,
    stage: types.Diagnostics['stage'],
    project?: LookupProjector,
): Promise<types.RequestResult> {
    return serviceWrapper(
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

                const contentLength = Number(response.headers.get('content-length'));

                if (
                    Number.isFinite(contentLength) &&
                    contentLength > config.service.maxResponseBytes
                ) {
                    throw new GovernmentApiError(
                        'La fuente devolvió una respuesta demasiado grande.',
                        diagnostics,
                        false,
                    );
                }

                const body = await response.text();

                if (signal.aborted) {
                    throw abortError();
                }

                if (utf8ByteLength(body) > config.service.maxResponseBytes) {
                    throw new GovernmentApiError(
                        'La fuente devolvió una respuesta demasiado grande.',
                        diagnostics,
                        false,
                    );
                }

                if (stage === 'session' || !project) {
                    return { data: null, diagnostics };
                }

                let parsed: unknown;

                try {
                    parsed = JSON.parse(body) as unknown;
                } catch {
                    throw new GovernmentApiError(
                        'La fuente devolvió una respuesta que no se pudo interpretar.',
                        diagnostics,
                    );
                }

                return {
                    data: project(parsed),
                    diagnostics: {
                        ...diagnostics,
                        elapsedMs: Date.now() - startedAt,
                    },
                };
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
}

export const lookupVehicle = async (value: string, options: types.RequestOptions = {}) => {
    const plate = normalizePlate(value);

    if (usesMockLookups(options)) {
        return mockLookup(plate, debugVehiclePayload(plate), DEBUG_SRI_DELAY_MS, options);
    }

    const endpoint = configuredSourceUrl(config.source.SRI, 'SRI');

    const { data, diagnostics } = await request(
        `${endpoint}?numeroPlacaCampvCpn=${encodeURIComponent(plate)}`,
        { method: 'GET', headers: { Accept: 'application/json' } },
        options,
        'lookup',
        projectVehicleData,
    );

    const projected = asRecord(data);

    if (
        !projected ||
        (!isVehicleNotFoundProjection(projected) &&
            tryNormalizePlate(String(projected.numeroPlaca)) !== plate)
    ) {
        throw new GovernmentApiError(
            'La fuente no devolvió una ficha vehicular válida para esta placa.',
            diagnostics,
            false,
        );
    }

    return {
        plate,
        data: projected,
        diagnostics,
    };
};

export const lookupFiscalia = async (value: string, options: types.FiscaliaOptions = {}) => {
    const plate = normalizePlate(value);

    if (usesMockLookups(options)) {
        if (options.initializeSession) {
            options.onSessionInitialized?.();
        }

        const projected = projectFiscaliaData(
            debugFiscaliaPayload(plate),
            Date.now(),
            config.service.incidentMonths,
        ) ?? { cabecera: [] };

        return mockLookup(plate, projected, DEBUG_FISCALIA_DELAY_MS, options);
    }

    const lookupEndpoint = configuredSourceUrl(config.source.fiscaliaLookup, 'Fiscalía');

    if (options.initializeSession) {
        const entryEndpoint = configuredSourceUrl(config.source.fiscaliaEntry, 'Fiscalía');

        await request(entryEndpoint, { credentials: 'include' }, options, 'session');
        options.onSessionInitialized?.();
    }

    const { data, diagnostics } = await request(
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
        (raw) => projectFiscaliaData(raw, Date.now(), config.service.incidentMonths),
    );
    const projected = asRecord(data);

    if (!projected) {
        throw new GovernmentApiError(
            'La fuente no devolvió registros de Fiscalía válidos.',
            diagnostics,
            false,
        );
    }

    return {
        plate,
        data: projected,
        diagnostics,
    };
};
