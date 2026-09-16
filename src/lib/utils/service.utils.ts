import type * as types from '../types.ts';

import { ServiceTimeoutError } from '../errors/service.errors.ts';

import config from '../configs/app.config.ts';

export { ServiceTimeoutError };

export const abortError = (): Error => {
    const error = new Error('Consulta cancelada.');
    error.name = 'AbortError';

    return error;
};

export const delay = (ms: number, signal?: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(abortError());
            return;
        }

        const cancel = () => {
            clearTimeout(timer);
            reject(abortError());
        };

        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', cancel);
            resolve();
        }, ms);

        signal?.addEventListener('abort', cancel, { once: true });
    });

export const retryBackoffMs = (attempt: number): number => 500 * 2 ** (attempt - 2);

export const retryBackoffWithJitterMs = (
    attempt: number,
    random: () => number = Math.random,
): number => {
    const jitter = Math.min(1, Math.max(0, random()));

    return Math.round(retryBackoffMs(attempt) * (0.5 + jitter * 0.5));
};

const throwIfAborted = (signal?: AbortSignal): void => {
    if (signal?.aborted) {
        throw abortError();
    }
};

const isAbortError = (error: unknown): boolean =>
    error instanceof Error && error.name === 'AbortError';

const runWithTimeout = async <T>(
    execute: types.ServiceRequest<T>,
    timeoutMs: number,
    parentSignal?: AbortSignal,
): Promise<T> => {
    throwIfAborted(parentSignal);

    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => controller.abort();

    parentSignal?.addEventListener('abort', cancel, { once: true });

    const timer = setTimeout(() => {
        timedOut = true;
        cancel();
    }, timeoutMs);

    try {
        return await new Promise<T>((resolve, reject) => {
            let settled = false;

            const settle = (action: () => void) => {
                if (settled) {
                    return;
                }

                settled = true;
                action();
            };

            const fail = () => {
                settle(() => {
                    reject(parentSignal?.aborted ? abortError() : new ServiceTimeoutError());
                });
            };

            if (controller.signal.aborted) {
                fail();
                return;
            }

            controller.signal.addEventListener('abort', fail, { once: true });

            execute(controller.signal).then(
                (value) => settle(() => resolve(value)),
                (error: unknown) => {
                    if (parentSignal?.aborted || timedOut) {
                        fail();
                        return;
                    }

                    settle(() => reject(error));
                },
            );
        });
    } finally {
        clearTimeout(timer);
        parentSignal?.removeEventListener('abort', cancel);
    }
};

export const serviceWrapper = async <T>(
    execute: types.ServiceRequest<T>,
    options: types.ServiceWrapperOptions = {},
): Promise<T> => {
    const timeout = options.timeout === false ? false : (options.timeout ?? config.service.timeout);
    const configuredRetries = options.maxRetries ?? config.service.maxRetries;

    const maxRetries =
        Number.isInteger(configuredRetries) && configuredRetries >= 0 ? configuredRetries : 0;

    const wait = options.wait ?? delay;
    const random = options.random ?? (options.wait ? () => 1 : Math.random);

    const { signal, onAttempt, shouldRetry, retryDelay, onRetry } = options;

    let lastError: unknown;
    let nextRetryDelay = 0;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        throwIfAborted(signal);

        if (attempt > 1) {
            if (onAttempt) {
                await onAttempt(attempt);
            }

            await wait(nextRetryDelay, signal);

            throwIfAborted(signal);
        } else if (onAttempt) {
            await onAttempt(attempt);
        }

        try {
            if (timeout === false) {
                return await execute(signal ?? new AbortController().signal);
            }

            return await runWithTimeout(execute, timeout, signal);
        } catch (error) {
            if (signal?.aborted || isAbortError(error)) {
                throw abortError();
            }

            lastError = error;

            if (attempt > maxRetries || (shouldRetry && !shouldRetry(error, attempt))) {
                throw error;
            }

            const configuredDelay = retryDelay?.(error, attempt + 1);

            nextRetryDelay =
                configuredDelay !== undefined &&
                Number.isFinite(configuredDelay) &&
                configuredDelay >= 0
                    ? configuredDelay
                    : retryBackoffWithJitterMs(attempt + 1, random);

            if (onRetry) {
                await onRetry(error, nextRetryDelay);
            }
        }
    }

    throw lastError;
};
