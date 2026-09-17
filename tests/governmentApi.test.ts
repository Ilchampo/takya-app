/// <reference types="node" />
import assert from 'node:assert/strict';
import test from 'node:test';

import config from '../src/lib/configs/app.config.ts';
import { GovernmentApiError } from '../src/lib/errors/service.errors.ts';
import { lookupFiscalia, lookupVehicle } from '../src/lib/services/governementApi.service.ts';

test('SRI lookup uses a normalized encoded plate and a GET request', async () => {
    let calls = 0;
    const result = await lookupVehicle(' pbc1234 ', {
        fetchImpl: async (url, init) => {
            calls++;
            assert.equal(url, `${config.source.SRI}?numeroPlacaCampvCpn=PBC1234`);
            assert.equal(init?.method, 'GET');
            assert.equal(init?.body, undefined);
            assert.deepEqual(init?.headers, { Accept: 'application/json' });
            return Response.json({
                numeroPlaca: 'PBC1234',
                cedulaPropietario: '0123456789',
            });
        },
    });
    assert.equal(calls, 1);
    assert.deepEqual(result.data, { numeroPlaca: 'PBC1234' });
    assert.equal(result.diagnostics.status, 200);
});

test('Fiscalía lookup initializes its session and sends the captured form contract', async () => {
    const urls: unknown[] = [];
    const now = new Date();
    const fecha = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('-');
    const result = await lookupFiscalia('ABC-123', {
        initializeSession: true,
        fetchImpl: async (url, init) => {
            urls.push(url);
            if (url === config.source.fiscaliaEntry) {
                assert.equal(init?.credentials, 'include');
                return new Response('<html>Sesión</html>');
            }
            assert.equal(url, config.source.fiscaliaLookup);
            assert.equal(init?.method, 'POST');
            assert.equal(init?.credentials, 'include');
            assert.equal(init?.body, 'tipo=buscar_general&criterio=5&valor=ABC0123');
            assert.equal(
                (init?.headers as Record<string, string>)['Content-Type'],
                'application/x-www-form-urlencoded',
            );

            return Response.json({
                cabecera: [
                    {
                        ndd: 'REF-1',
                        fecha,
                        hora: '11:01:05',
                        gen_delito_tipopenal: 'Registro de prueba',
                        ciudad: 'Quito',
                        sujetos: [
                            {
                                0: '0123456789',
                                cedula: '0123456789',
                                persona: 'CRESPO GARCIA JONNY MANOLO',
                                tipo: 'SOSPECHOSO',
                            },
                        ],
                    },
                ],
            });
        },
    });
    assert.deepEqual(urls, [config.source.fiscaliaEntry, config.source.fiscaliaLookup]);
    assert.deepEqual(result.data, {
        cabecera: [
            {
                ciudad: 'Quito',
                fecha,
                hora: '11:01:05',
                gen_delito_tipopenal: 'Registro de prueba',
                sujetos: [
                    {
                        persona: 'CRESPO G. J. M.',
                        tipo: 'SOSPECHOSO',
                    },
                ],
            },
        ],
    });
    assert.equal(JSON.stringify(result).includes('CRESPO GARCIA JONNY MANOLO'), false);
});

test('SRI treats an explicit vehicle-not-found payload as a usable response', async () => {
    const result = await lookupVehicle('PBC1234', {
        fetchImpl: async () =>
            Response.json({
                data: [],
                objeto: null,
                mensajeServidor: { texto: 'El vehículo no existe' },
            }),
    });

    assert.deepEqual(result.data, {
        sriVehicleNotFound: true,
        mensaje: 'El vehículo no existe',
    });
});

test('SRI pads an old plate and omits its display dash in the request', async () => {
    await lookupVehicle('ICP-327', {
        fetchImpl: async (url) => {
            assert.equal(url, `${config.source.SRI}?numeroPlacaCampvCpn=ICP0327`);
            return Response.json({ numeroPlaca: 'ICP0327' });
        },
    });
});

test('HTML, HTTP, malformed JSON, and network errors are not treated as data', async () => {
    await assert.rejects(
        lookupVehicle('PBC1234', {
            fetchImpl: async () =>
                new Response('<html>challenge</html>', {
                    headers: { 'content-type': 'text/html' },
                }),
        }),
        (error: unknown) =>
            error instanceof GovernmentApiError && error.diagnostics?.status === 200,
    );
    await assert.rejects(
        lookupVehicle('PBC1234', { fetchImpl: async () => new Response('', { status: 503 }) }),
        /HTTP 503/,
    );
    await assert.rejects(
        lookupVehicle('PBC1234', {
            fetchImpl: async () =>
                new Response('{broken', { headers: { 'content-type': 'application/json' } }),
        }),
        /no se pudo interpretar/,
    );
    await assert.rejects(
        lookupVehicle('PBC1234', {
            fetchImpl: async () => {
                throw new TypeError('offline');
            },
        }),
        /No pudimos conectar/,
    );
});

test('requests are aborted after their deadline', async () => {
    await assert.rejects(
        lookupVehicle('PBC1234', {
            timeoutMs: 5,
            fetchImpl: async (_url, init) =>
                new Promise((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), {
                        once: true,
                    });
                }),
        }),
        /tardó demasiado/,
    );
});

test('the production request deadline is ten seconds', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let signal: AbortSignal | null | undefined;
    const request = lookupVehicle('PBC1234', {
        fetchImpl: async (_url, init) => {
            signal = init?.signal;
            return new Promise(() => {});
        },
    });
    const rejection = assert.rejects(request, /tardó demasiado/);
    t.mock.timers.tick(9_999);
    assert.equal(signal?.aborted, false);
    t.mock.timers.tick(1);
    assert.equal(signal?.aborted, true);
    await rejection;
});

test('timeout covers a stalled body and does not rely on fetch honoring abort', async () => {
    await assert.rejects(
        lookupVehicle('PBC1234', {
            timeoutMs: 5,
            fetchImpl: async () =>
                new Response(new ReadableStream({ start() {} }), {
                    headers: { 'content-type': 'application/json' },
                }),
        }),
        /tardó demasiado/,
    );
});

test('caller cancellation aborts the HTTP request without waiting for its timeout', async () => {
    const controller = new AbortController();
    const running = lookupVehicle('PBC1234', {
        signal: controller.signal,
        fetchImpl: async () => new Promise(() => {}),
    });
    controller.abort();
    await assert.rejects(running, { name: 'AbortError' });
});

test('Fiscalía session and lookup receive separate timeout signals', async () => {
    const signals: (AbortSignal | null | undefined)[] = [];
    await lookupFiscalia('PBC1234', {
        initializeSession: true,
        fetchImpl: async (url, init) => {
            signals.push(init?.signal);
            return url === config.source.fiscaliaEntry
                ? new Response('session')
                : Response.json({ cabecera: [] });
        },
    });
    assert.equal(signals.length, 2);
    assert.notEqual(signals[0], signals[1]);
});
