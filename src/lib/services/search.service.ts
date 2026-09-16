import type * as types from '../types.ts';

import { GovernmentApiError } from '../errors/service.errors.ts';
import { abortError, serviceWrapper } from '../utils/service.utils.ts';
import { normalizePlate } from '../utils/licensePlate.utils.ts';
import config from '../configs/app.config.ts';

import { lookupFiscalia, lookupVehicle } from './governementApi.service.ts';

const retryableHttpStatuses = new Set([408, 425]);

const describeWait = (milliseconds: number): string => {
    const seconds = Math.max(1, Math.ceil(milliseconds / 1_000));

    return seconds < 60 ? `${seconds} s` : `${Math.ceil(seconds / 60)} min`;
};

const retryAfterForError = (error: unknown): number | undefined => {
    if (!(error instanceof GovernmentApiError) || error.diagnostics?.status !== 429) {
        return undefined;
    }

    return error.diagnostics.retryAfterMs ?? config.service.rateLimit.defaultCooldown;
};

const sourceErrorMessage = (error: unknown, retryAfterMs?: number): string => {
    if (retryAfterMs !== undefined) {
        return `Esta fuente solicitó una pausa. Intenta nuevamente en ${describeWait(retryAfterMs)}.`;
    }

    if (error instanceof GovernmentApiError && !error.retryable) {
        return error.message;
    }

    return 'Servicio no disponible por el momento. Intenta más tarde.';
};

const isRetryableSourceError = (error: unknown): boolean => {
    if (!(error instanceof GovernmentApiError)) {
        return true;
    }

    if (!error.retryable) {
        return false;
    }

    const status = error.diagnostics?.status;

    return status === undefined || status >= 500 || retryableHttpStatuses.has(status);
};

export const createPlateSearch = (dependencies: types.Dependencies) => {
    const vehicle = dependencies.vehicle ?? lookupVehicle;
    const fiscalia = dependencies.fiscalia ?? lookupFiscalia;
    let memoryRateEvents: number[] = [];
    const memoryCooldowns: Partial<Record<types.ServiceId, number>> = {};

    const consumeMemoryRateLimit = (now = Date.now()): types.RateLimitDecision => {
        const windowStartedAt = now - config.service.rateLimit.window;

        memoryRateEvents = memoryRateEvents.filter(
            (requestedAt) => requestedAt > windowStartedAt && requestedAt <= now,
        );

        if (memoryRateEvents.length >= config.service.rateLimit.maxRequests) {
            const oldestRequest = memoryRateEvents[0] ?? now;

            return {
                allowed: false,
                retryAfterMs: Math.max(
                    1_000,
                    oldestRequest + config.service.rateLimit.window - now,
                ),
            };
        }

        memoryRateEvents.push(now);
        return { allowed: true };
    };

    return async (
        value: string,
        { signal, onUpdate }: types.SearchOptions,
    ): Promise<types.LookupResult> => {
        const plate = normalizePlate(value);

        const checkCancelled = (): void => {
            if (signal?.aborted) {
                throw abortError();
            }
        };

        checkCancelled();

        let snapshot: types.LookupProgress = {
            plate,
            fetchedAt: Date.now(),
            fromCache: false,
            sri: { status: 'loading', attempt: 1 },
            fiscalia: { status: 'loading', attempt: 1 },
        };
        let fiscaliaSessionInitialized = false;

        let cached: types.LookupResult | null = null;

        try {
            cached = await dependencies.getCachedLookup(plate);
        } catch {
            console.info('Continue without storage');
        }

        checkCancelled();

        if (cached) {
            onUpdate(cached);

            return cached;
        }

        const memoryDecision = consumeMemoryRateLimit();

        if (!memoryDecision.allowed) {
            throw new Error(
                `Has alcanzado el límite de consultas. Intenta nuevamente en ${describeWait(memoryDecision.retryAfterMs)}.`,
            );
        }

        if (dependencies.consumeLookupRateLimit) {
            let decision: types.RateLimitDecision | null = null;

            try {
                decision = await dependencies.consumeLookupRateLimit();
            } catch {
                console.info('Continue without persisted rate limit');
            }

            checkCancelled();

            if (decision && !decision.allowed) {
                throw new Error(
                    `Has alcanzado el límite de consultas. Intenta nuevamente en ${describeWait(decision.retryAfterMs)}.`,
                );
            }
        }

        onUpdate(snapshot);

        const publish = (service: types.ServiceId, state: types.SourceProgress): void => {
            checkCancelled();

            snapshot = { ...snapshot, [service]: state };

            onUpdate(snapshot);
        };

        const query = async (service: types.ServiceId): Promise<types.SourceResult> => {
            const now = Date.now();
            let cooldownMs = Math.max(0, (memoryCooldowns[service] ?? 0) - now);

            if (dependencies.getSourceCooldown) {
                try {
                    cooldownMs = Math.max(
                        cooldownMs,
                        await dependencies.getSourceCooldown(service, now),
                    );
                } catch {
                    console.info('Continue without persisted source cooldown');
                }
            }

            checkCancelled();

            if (cooldownMs > 0) {
                const source: types.SourceResult = {
                    status: 'error',
                    message: `Esta fuente solicitó una pausa. Intenta nuevamente en ${describeWait(cooldownMs)}.`,
                };

                publish(service, source);
                return source;
            }

            const persistCooldown = async (error: unknown, delayMs: number): Promise<void> => {
                if (retryAfterForError(error) === undefined) {
                    return;
                }

                const cooldownUntil = Date.now() + delayMs;
                memoryCooldowns[service] = cooldownUntil;

                if (!dependencies.setSourceCooldown) {
                    return;
                }

                try {
                    await dependencies.setSourceCooldown(service, cooldownUntil);
                } catch {
                    console.info('Continue without saving source cooldown');
                }
            };

            try {
                const response = await serviceWrapper(
                    (attemptSignal) =>
                        service === 'sri'
                            ? vehicle(plate, { signal: attemptSignal })
                            : fiscalia(plate, {
                                  signal: attemptSignal,
                                  initializeSession: !fiscaliaSessionInitialized,
                                  onSessionInitialized: () => {
                                      fiscaliaSessionInitialized = true;
                                  },
                              }),
                    {
                        signal,
                        timeout: false,
                        wait: dependencies.wait,
                        shouldRetry: isRetryableSourceError,
                        onAttempt: (attempt) => {
                            if (attempt > 1) {
                                publish(service, { status: 'loading', attempt });
                            }
                        },
                    },
                );

                checkCancelled();

                const source: types.SourceResult = {
                    status: 'success',
                    data: response.data,
                    diagnostics: response.diagnostics,
                };

                publish(service, source);

                return source;
            } catch (reason) {
                const retryAfterMs = retryAfterForError(reason);

                if (retryAfterMs !== undefined) {
                    await persistCooldown(reason, retryAfterMs);
                }

                checkCancelled();

                const source: types.SourceResult = {
                    status: 'error',
                    message: sourceErrorMessage(reason, retryAfterMs),
                    diagnostics:
                        reason instanceof GovernmentApiError ? reason.diagnostics : undefined,
                };

                publish(service, source);

                return source;
            }
        };

        const [sri, fiscaliaResult] = await Promise.all([query('sri'), query('fiscalia')]);

        checkCancelled();

        const result: types.LookupResult = {
            ...snapshot,
            sri,
            fiscalia: fiscaliaResult,
            fetchedAt: Date.now(),
        };

        if (sri.status === 'success' && fiscaliaResult.status === 'success') {
            try {
                await dependencies.saveLookup(result);
            } catch {
                console.info('Visible result remains usable');
            }
        }

        return result;
    };
};
