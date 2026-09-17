import assert from 'node:assert/strict';
import { test } from '@jest/globals';
import { createPlateSearch } from '../../../src/lib/services/search.service.ts';
import { abortError } from '../../../src/lib/utils/service.utils.ts';
import { GovernmentApiError } from '../../../src/lib/errors/service.errors.ts';
import config from '../../../src/lib/configs/app.config.ts';
import type * as types from '../../../src/lib/types.ts';

const reply = (plate: string) => ({
    plate,
    data: { numeroPlaca: plate },
    diagnostics: {
        stage: 'lookup' as const,
        status: 200,
        contentType: 'application/json',
        elapsedMs: 1,
    },
});

test('one source becomes readable while its sibling is still pending', async () => {
    let release!: () => void;
    let received!: () => void;
    const firstReady = new Promise<void>((resolve) => {
        received = resolve;
    });
    const pending = new Promise<void>((resolve) => {
        release = resolve;
    });
    const updates: types.LookupProgress[] = [];
    const saved: types.LookupResult[] = [];
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async (result) => {
            saved.push(result);
        },
        vehicle: async (plate) => reply(plate),
        fiscalia: async (plate) => {
            await pending;
            return reply(plate);
        },
    });
    const running = search('PBC1234', {
        onUpdate: (state) => {
            updates.push(state);
            if (state.sri.status === 'success') received();
        },
    });
    await firstReady;
    assert.equal(updates.at(-1)?.sri.status, 'success');
    assert.equal(updates.at(-1)?.fiscalia.status, 'loading');
    assert.equal(saved.length, 0);
    release();
    await running;
    assert.equal(saved.length, 1);
    assert.equal(saved[0]?.fiscalia.status, 'success');
});

test('exhausts configured retries only for the failing source, then caches the usable response', async () => {
    let sriCalls = 0;
    let fiscaliaCalls = 0;
    const attempts: number[] = [];
    const waits: number[] = [];
    const saved: types.LookupResult[] = [];
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async (result) => {
            saved.push(result);
        },
        vehicle: async (plate) => {
            sriCalls++;
            return reply(plate);
        },
        fiscalia: async () => {
            fiscaliaCalls++;
            throw new Error('unavailable');
        },
        wait: async (ms) => {
            waits.push(ms);
        },
    });
    const result = await search('PBC1234', {
        onUpdate: (state) => {
            if (state.fiscalia.status === 'loading' && !attempts.includes(state.fiscalia.attempt)) {
                attempts.push(state.fiscalia.attempt);
            }
            if (state.fiscalia.status === 'error')
                assert.equal(fiscaliaCalls, config.service.maxRetries + 1);
        },
    });
    assert.equal(sriCalls, 1);
    assert.equal(fiscaliaCalls, config.service.maxRetries + 1);
    assert.deepEqual(
        attempts,
        Array.from({ length: config.service.maxRetries + 1 }, (_, index) => index + 1),
    );
    assert.deepEqual(
        waits,
        Array.from({ length: config.service.maxRetries }, (_, index) => 500 * 2 ** index),
    );
    assert.equal(result.sri.status, 'success');
    assert.equal(result.fiscalia.status, 'error');
    assert.equal(saved.length, 1);
    assert.equal(saved[0]?.sri.status, 'success');
    assert.equal(saved[0]?.fiscalia.status, 'error');
});

test('caches a Fiscalía response when SRI only reports that the vehicle does not exist', async () => {
    const saved: types.LookupResult[] = [];
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async (result) => {
            saved.push(result);
        },
        vehicle: async () => ({
            plate: 'PBC1234',
            data: {
                sriVehicleNotFound: true,
                mensaje: 'El vehículo no existe',
            },
            diagnostics: {
                stage: 'lookup' as const,
                status: 200,
                contentType: 'application/json',
                elapsedMs: 1,
            },
        }),
        fiscalia: async () => ({
            plate: 'PBC1234',
            data: { cabecera: [] },
            diagnostics: {
                stage: 'lookup' as const,
                status: 200,
                contentType: 'application/json',
                elapsedMs: 1,
            },
        }),
    });
    const result = await search('PBC1234', { onUpdate: () => {} });
    assert.equal(result.sri.status, 'success');
    assert.equal(result.fiscalia.status, 'success');
    assert.equal(saved.length, 1);
});

test('stops retries immediately after recovery', async () => {
    let calls = 0;
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async () => {},
        vehicle: async (plate) => reply(plate),
        fiscalia: async (plate) => {
            if (++calls < 3) throw new Error('offline');
            return reply(plate);
        },
        wait: async () => {},
    });
    const result = await search('PBC1234', { onUpdate: () => {} });
    assert.equal(calls, 3);
    assert.equal(result.fiscalia.status, 'success');
});

test('partial cache keeps the successful source and only fetches the missing one', async () => {
    let fiscaliaCalls = 0;
    const saved: types.LookupResult[] = [];
    const search = createPlateSearch({
        getCachedLookup: async () => ({
            plate: 'PBC1234',
            fromCache: true,
            fetchedAt: 123,
            sri: { status: 'success', data: { numeroPlaca: 'PBC1234' } },
            fiscalia: {
                status: 'error',
                message: 'Sin respuesta guardada para esta fuente.',
            },
        }),
        saveLookup: async (result) => {
            saved.push(result);
        },
        consumeLookupRateLimit: async () => assert.fail('partial refetch must not consume quota'),
        vehicle: async () => assert.fail('must not refetch a cached SRI result'),
        fiscalia: async (plate) => {
            fiscaliaCalls++;
            return { plate, data: { cabecera: [] }, diagnostics: reply(plate).diagnostics };
        },
    });
    const updates: types.LookupProgress[] = [];
    const result = await search('PBC1234', { onUpdate: (state) => updates.push(state) });
    assert.equal(fiscaliaCalls, 1);
    assert.equal(updates[0]?.sri.status, 'success');
    assert.equal(updates[0]?.fiscalia.status, 'loading');
    assert.equal(result.sri.status, 'success');
    assert.equal(result.fiscalia.status, 'success');
    assert.equal(saved.length, 1);
});

test('refresh ignores a complete cache and queries both sources again', async () => {
    let sriCalls = 0;
    let fiscaliaCalls = 0;
    let limiterCalls = 0;
    const search = createPlateSearch({
        getCachedLookup: async () => ({
            plate: 'PBC1234',
            fromCache: true,
            fetchedAt: 123,
            sri: { status: 'success', data: { numeroPlaca: 'PBC1234' } },
            fiscalia: { status: 'success', data: { cabecera: [] } },
        }),
        saveLookup: async () => {},
        consumeLookupRateLimit: async () => {
            limiterCalls++;
            return { allowed: true };
        },
        vehicle: async (plate) => {
            sriCalls++;
            return reply(plate);
        },
        fiscalia: async (plate) => {
            fiscaliaCalls++;
            return { plate, data: { cabecera: [] }, diagnostics: reply(plate).diagnostics };
        },
    });
    const result = await search('PBC1234', { refresh: true, onUpdate: () => {} });
    assert.equal(sriCalls, 1);
    assert.equal(fiscaliaCalls, 1);
    assert.equal(limiterCalls, 1);
    assert.equal(result.fromCache, false);
});

test('cache hits publish both sources without making requests', async () => {
    const cached: types.LookupResult = {
        plate: 'PBC1234',
        fromCache: true,
        fetchedAt: 123,
        sri: { status: 'success', data: {} },
        fiscalia: { status: 'success', data: {} },
    };
    const search = createPlateSearch({
        getCachedLookup: async (plate) => {
            assert.equal(plate, 'PBC1234');
            return cached;
        },
        saveLookup: async () => assert.fail('do not rewrite the cache or its age'),
        vehicle: async () => assert.fail('must not fetch'),
        fiscalia: async () => assert.fail('must not fetch'),
    });
    const updates: types.LookupProgress[] = [];
    assert.equal(await search(' pbc1234 ', { onUpdate: (state) => updates.push(state) }), cached);
    assert.equal(updates.at(-1), cached);
});

test('legacy spelling uses the padded cache key before either service is called', async () => {
    const search = createPlateSearch({
        getCachedLookup: async (plate) => {
            assert.equal(plate, 'ABC0123');
            return {
                plate,
                fromCache: true,
                fetchedAt: 123,
                sri: { status: 'success', data: {} },
                fiscalia: { status: 'success', data: {} },
            };
        },
        saveLookup: async () => assert.fail('must not change cached timestamp'),
        vehicle: async () => assert.fail('must not fetch'),
        fiscalia: async () => assert.fail('must not fetch'),
    });
    const result = await search('ABC-123', { onUpdate: () => {} });
    assert.equal(result.plate, 'ABC0123');
});

test('cancellation during retry backoff does not publish stale data or start another request', async () => {
    const controller = new AbortController();
    let calls = 0;
    let updateCount = 0;
    let countAtCancel = 0;
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async () => assert.fail('must not save after cancellation'),
        vehicle: async (plate) => reply(plate),
        fiscalia: async () => {
            calls++;
            throw new Error('offline');
        },
        wait: async () => {
            countAtCancel = updateCount;
            controller.abort();
            throw abortError();
        },
    });
    await assert.rejects(
        search('PBC1234', {
            signal: controller.signal,
            onUpdate: () => {
                updateCount++;
            },
        }),
        { name: 'AbortError' },
    );
    assert.equal(calls, 1);
    assert.equal(updateCount, countAtCancel);
});

test('late source responses after cancellation are ignored', async () => {
    const controller = new AbortController();
    let release!: () => void;
    let started!: () => void;
    const inFlight = new Promise<void>((resolve) => {
        started = resolve;
    });
    const pending = new Promise<void>((resolve) => {
        release = resolve;
    });
    const updates: types.LookupProgress[] = [];
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async () => assert.fail('must not save'),
        vehicle: async (plate) => {
            started();
            await pending;
            return reply(plate);
        },
        fiscalia: async (plate) => {
            await pending;
            return reply(plate);
        },
    });
    const running = search('PBC1234', {
        signal: controller.signal,
        onUpdate: (state) => updates.push(state),
    });
    await inFlight;
    const count = updates.length;
    controller.abort();
    release();
    await assert.rejects(running, { name: 'AbortError' });
    assert.equal(updates.length, count);
});

test('in-memory rate limit blocks extra full lookups', async () => {
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async () => {},
        vehicle: async (plate) => reply(plate),
        fiscalia: async (plate) => reply(plate),
        wait: async () => {},
    });

    for (let index = 0; index < config.service.rateLimit.maxRequests; index++) {
        await search(`ABC${String(index).padStart(4, '0')}`, { onUpdate: () => {} });
    }

    await assert.rejects(search('PBC1234', { onUpdate: () => {} }), /límite de consultas/);
});

test('a persisted rate-limit denial stops the lookup', async () => {
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async () => {},
        consumeLookupRateLimit: async () => ({ allowed: false, retryAfterMs: 15_000 }),
        vehicle: async () => assert.fail('must not fetch'),
        fiscalia: async () => assert.fail('must not fetch'),
    });

    await assert.rejects(search('PBC1234', { onUpdate: () => {} }), /15 s/);
});

test('persisted rate-limit storage failures do not block the lookup', async () => {
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async () => {},
        consumeLookupRateLimit: async () => {
            throw new Error('storage down');
        },
        vehicle: async (plate) => reply(plate),
        fiscalia: async (plate) => reply(plate),
    });

    const result = await search('PBC1234', { onUpdate: () => {} });
    assert.equal(result.sri.status, 'success');
});

test('HTTP 429 is not retried and persists a source cooldown', async () => {
    const cooldowns: number[] = [];
    let fiscaliaCalls = 0;
    const search = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async () => {},
        vehicle: async (plate) => reply(plate),
        fiscalia: async () => {
            fiscaliaCalls++;
            throw new GovernmentApiError(
                'paused',
                {
                    stage: 'lookup',
                    status: 429,
                    contentType: 'application/json',
                    elapsedMs: 1,
                    retryAfterMs: 2_000,
                },
                true,
            );
        },
        setSourceCooldown: async (_source, until) => {
            cooldowns.push(until);
        },
        wait: async () => assert.fail('must not retry a 429'),
    });

    const result = await search('PBC1234', { onUpdate: () => {} });
    assert.equal(fiscaliaCalls, 1);
    assert.equal(result.fiscalia.status, 'error');
    if (result.fiscalia.status === 'error') {
        assert.match(result.fiscalia.message, /2 s/);
    }
    assert.equal(cooldowns.length, 1);
});

test('client errors are not retried while server errors are', async () => {
    let notFoundCalls = 0;
    const notFound = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async () => {},
        vehicle: async (plate) => reply(plate),
        fiscalia: async () => {
            notFoundCalls++;
            throw new GovernmentApiError('missing', {
                stage: 'lookup',
                status: 404,
                contentType: 'application/json',
                elapsedMs: 1,
            });
        },
        wait: async () => assert.fail('must not retry HTTP 404'),
    });
    await notFound('PBC1234', { onUpdate: () => {} });
    assert.equal(notFoundCalls, 1);

    let serverCalls = 0;
    const recovering = createPlateSearch({
        getCachedLookup: async () => null,
        saveLookup: async () => {},
        vehicle: async (plate) => reply(plate),
        fiscalia: async (plate) => {
            serverCalls++;
            if (serverCalls < 2) {
                throw new GovernmentApiError('offline', {
                    stage: 'lookup',
                    status: 503,
                    contentType: 'application/json',
                    elapsedMs: 1,
                });
            }
            return reply(plate);
        },
        wait: async () => {},
    });
    const recovered = await recovering('PBC1234', { onUpdate: () => {} });
    assert.equal(serverCalls, 2);
    assert.equal(recovered.fiscalia.status, 'success');
});

test('storage failures keep the visible lookup result', async () => {
    const search = createPlateSearch({
        getCachedLookup: async () => {
            throw new Error('cache unreadable');
        },
        saveLookup: async () => {
            throw new Error('cannot write');
        },
        vehicle: async (plate) => reply(plate),
        fiscalia: async (plate) => reply(plate),
    });

    const result = await search('PBC1234', { onUpdate: () => {} });
    assert.equal(result.sri.status, 'success');
    assert.equal(result.fiscalia.status, 'success');
});
