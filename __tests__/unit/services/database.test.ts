import type * as types from '../../../src/lib/types.ts';

import assert from 'node:assert/strict';
import { beforeEach, jest, test } from '@jest/globals';

import { getFakeDatabase, resetFakeDatabase } from '../helpers/fakeSqlite.ts';
import * as db from '../../../src/lib/services/database.service.ts';

import config from '../../../src/lib/configs/app.config.ts';

jest.mock('expo-sqlite', () => {
    const { getFakeDatabase: current } = require('../helpers/fakeSqlite');

    return {
        openDatabaseAsync: async () => current(),
        deleteDatabaseAsync: async () => undefined,
    };
});

jest.mock('expo-file-system', () => ({
    Paths: { cache: { uri: 'file:///cache' } },
}));

const now = Date.parse('2026-09-16T12:00:00');

const successSri = (plate: string, extra: Record<string, unknown> = {}): types.SourceResult => ({
    status: 'success',
    data: { numeroPlaca: plate, descripcionMarca: 'KIA', ...extra },
});

const successFiscalia = (persona = 'CRESPO GARCIA JONNY MANOLO'): types.SourceResult => ({
    status: 'success',
    data: {
        cabecera: [
            {
                fecha: '2026-09-14',
                hora: '11:01:05',
                gen_delito_tipopenal: 'Registro de prueba',
                ciudad: 'Quito',
                sujetos: [{ cedula: '0123456789', persona, tipo: 'SOSPECHOSO' }],
            },
        ],
    },
});

const failed = (message = 'Sin servicio'): types.SourceResult => ({
    status: 'error',
    message,
});

const lookup = (
    plate: string,
    sri: types.SourceResult,
    fiscalia: types.SourceResult,
    fetchedAt = now,
): types.LookupResult => ({
    plate,
    sri,
    fiscalia,
    fetchedAt,
    fromCache: false,
});

beforeEach(async () => {
    resetFakeDatabase();
    await db.initializeDatabase(now);
});

test('saveLookup stores projected payloads and never keeps identity documents or full names', async () => {
    await db.saveLookup(
        lookup(
            'PBC1234',
            successSri('PBC1234', { cedulaPropietario: '9999999999' }),
            successFiscalia(),
        ),
    );

    const cached = await db.getCachedLookup('PBC1234', now);

    assert.equal(cached?.sri.status, 'success');
    assert.equal(cached?.fiscalia.status, 'success');
    assert.equal(JSON.stringify(cached).includes('9999999999'), false);
    assert.equal(JSON.stringify(cached).includes('0123456789'), false);
    assert.equal(JSON.stringify(cached).includes('CRESPO GARCIA JONNY MANOLO'), false);

    if (cached?.fiscalia.status === 'success') {
        assert.equal(JSON.stringify(cached.fiscalia.data).includes('CRESPO G. J. M.'), true);
    }
});

test('saveLookup does not write a row when both sources failed', async () => {
    await db.saveLookup(lookup('PBC1234', failed(), failed()));

    assert.equal(await db.getCachedLookup('PBC1234', now), null);
    assert.equal(getFakeDatabase().lookups.size, 0);
});

test('partial success is stored and the missing source reads as unavailable', async () => {
    await db.saveLookup(lookup('PBC1234', successSri('PBC1234'), failed()));

    const cached = await db.getCachedLookup('PBC1234', now);

    assert.equal(cached?.sri.status, 'success');
    assert.equal(cached?.fiscalia.status, 'error');
    assert.equal(
        cached?.fiscalia.status === 'error' ? cached.fiscalia.message : '',
        'Sin respuesta guardada para esta fuente.',
    );
});

test('a later success merges into an existing partial lookup', async () => {
    await db.saveLookup(lookup('PBC1234', successSri('PBC1234'), failed(), now - 1_000));
    await db.saveLookup(lookup('PBC1234', failed(), successFiscalia(), now));

    const cached = await db.getCachedLookup('PBC1234', now);

    assert.equal(cached?.sri.status, 'success');
    assert.equal(cached?.fiscalia.status, 'success');
});

test('expired lookups are not returned and are deleted on initialize', async () => {
    await db.saveLookup(
        lookup('PBC1234', successSri('PBC1234'), successFiscalia(), now - config.service.TTL - 1),
    );

    assert.equal(await db.getCachedLookup('PBC1234', now), null);

    await db.initializeDatabase(now);

    assert.equal(getFakeDatabase().lookups.size, 0);
});

test('history is capped to the configured limit', async () => {
    for (let index = 0; index < config.service.historyLimit + 2; index++) {
        const plate = `ABC${String(index).padStart(4, '0')}`;

        await db.saveLookup(lookup(plate, successSri(plate), failed(), now + index));
    }

    const history = await db.listLookupHistory(now + 100);

    assert.equal(history.length, config.service.historyLimit);
    assert.equal(
        history[0]?.plate,
        `ABC${String(config.service.historyLimit + 1).padStart(4, '0')}`,
    );
    assert.equal(getFakeDatabase().lookups.size, config.service.historyLimit);
});

test('clearLookupHistory removes every stored plate', async () => {
    await db.saveLookup(lookup('PBC1234', successSri('PBC1234'), failed()));
    await db.clearLookupHistory();

    assert.deepEqual(await db.listLookupHistory(now), []);
});

test('unreadable cache rows are deleted instead of shown', async () => {
    getFakeDatabase().lookups.set('PBC1234', {
        plate: 'PBC1234',
        sri_json: '{broken',
        fiscalia_json: '{broken',
        fetched_at: now,
    });

    assert.equal(await db.getCachedLookup('PBC1234', now), null);
    assert.equal(getFakeDatabase().lookups.has('PBC1234'), false);
});

test('initializeDatabase scrubs sensitive fields left in older rows', async () => {
    getFakeDatabase().lookups.set('PBC1234', {
        plate: 'PBC1234',
        sri_json: JSON.stringify({
            numeroPlaca: 'PBC1234',
            cedulaPropietario: '9999999999',
        }),
        fiscalia_json: JSON.stringify({
            cabecera: [
                {
                    fecha: '2026-09-14',
                    hora: '11:01:05',
                    gen_delito_tipopenal: 'Registro de prueba',
                    ciudad: 'Quito',
                    sujetos: [
                        {
                            cedula: '0123456789',
                            persona: 'CRESPO GARCIA JONNY MANOLO',
                            tipo: 'SOSPECHOSO',
                        },
                    ],
                },
            ],
        }),
        fetched_at: now,
    });

    await db.initializeDatabase(now);

    const cached = await db.getCachedLookup('PBC1234', now);

    assert.equal(JSON.stringify(cached).includes('9999999999'), false);
    assert.equal(JSON.stringify(cached).includes('0123456789'), false);
    assert.equal(JSON.stringify(cached).includes('CRESPO GARCIA JONNY MANOLO'), false);
});

test('rate limit allows the configured number of requests and then asks for a wait', async () => {
    for (let index = 0; index < config.service.rateLimit.maxRequests; index++) {
        assert.deepEqual(await db.consumeLookupRateLimit(now + index), { allowed: true });
    }

    const denied = await db.consumeLookupRateLimit(now + config.service.rateLimit.maxRequests);

    assert.equal(denied.allowed, false);

    if (!denied.allowed) {
        assert.equal(denied.retryAfterMs > 0, true);
    }
});

test('source cooldown is stored, read, and expires', async () => {
    const current = Date.now();

    await db.setSourceCooldown('fiscalia', current - 1);
    assert.equal(await db.getSourceCooldown('fiscalia', current), 0);

    await db.setSourceCooldown('fiscalia', current + 5_000);

    const remaining = await db.getSourceCooldown('fiscalia', current);

    assert.equal(remaining >= 4_000 && remaining <= 5_000, true);
    assert.equal(await db.getSourceCooldown('fiscalia', current + 5_000), 0);
});

test('theme mode persists only light or dark values', async () => {
    await db.setThemeMode('dark');
    assert.equal(await db.getThemeMode(), 'dark');

    getFakeDatabase().settings.set('theme', 'system');
    assert.equal(await db.getThemeMode(), null);
});
