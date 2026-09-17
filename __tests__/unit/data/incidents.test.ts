import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from '@jest/globals';

import { incidentRecords, projectedIncidentRecords } from '../../../src/data/incidents.data.ts';
import { isWithinLookback, subtractMonths } from '../../../src/lib/utils/date.utils.ts';

const REQUEST_DATE = Date.parse('2026-09-16T12:00:00');
const FIXTURE_DATE = Date.parse('2012-11-09T12:00:00');
const fiscaliaFixture = join(__dirname, '../../fixtures/GMJ-0622.json');

const sampleRecord = (overrides: Record<string, unknown> = {}) => ({
    fecha: '2026-09-14',
    hora: '11:01:05',
    gen_delito_tipopenal: 'Registro de prueba',
    ciudad: 'Quito',
    ...overrides,
});

test('incident parser keeps only general Fiscalía fields and ignores the rest', () => {
    assert.deepEqual(incidentRecords({ cabecera: [] }, REQUEST_DATE), []);
    assert.equal(incidentRecords({ mensaje: 'formato distinto' }, REQUEST_DATE), null);
    assert.deepEqual(
        incidentRecords(
            {
                cabecera: [
                    sampleRecord({
                        ndd: 'REF-1',
                        pro_descripcion: 'Pichincha',
                        unidad: 'Unidad 1',
                        vehiculos: [{ placa: 'PBC1234' }],
                        sujetos: [{ persona: 'Alguien', tipo: 'VICTIMA' }],
                    }),
                ],
            },
            REQUEST_DATE,
        ),
        [
            {
                ciudad: 'Quito',
                fecha: '2026-09-14',
                hora: '11:01:05',
                gen_delito_tipopenal: 'Registro de prueba',
                personasSenaladas: [],
            },
        ],
    );
});

test('incident parser keeps flagged people without exposing identity documents', () => {
    assert.deepEqual(
        incidentRecords(
            {
                cabecera: [
                    sampleRecord({
                        sujetos: [
                            {
                                cedula: '0123456789',
                                persona: '  CRESPO GARCIA JONNY MANOLO ; VELEZ MARCO  ',
                                tipo: ' sospechoso ',
                            },
                            {
                                cedula: '0000000000',
                                persona: 'DESCONOCIDO',
                                tipo: 'SOSPECHOSO NO RECONOCIDO',
                            },
                            {
                                cedula: '1111111111',
                                persona: 'CRESPO GARCIA JONNY MANOLO',
                                tipo: 'VICTIMA',
                            },
                        ],
                    }),
                ],
            },
            REQUEST_DATE,
        ),
        [
            {
                ciudad: 'Quito',
                fecha: '2026-09-14',
                hora: '11:01:05',
                gen_delito_tipopenal: 'Registro de prueba',
                personasSenaladas: [
                    {
                        nombreCompleto: 'CRESPO G. J. M.',
                        primerApellido: 'CRESPO',
                        estado: 'SOSPECHOSO',
                    },
                    {
                        nombreCompleto: 'VELEZ M.',
                        primerApellido: 'VELEZ',
                        estado: 'SOSPECHOSO',
                    },
                ],
            },
        ],
    );
});

(existsSync(fiscaliaFixture) ? test : test.skip)(
    'incident parser accepts real Fiscalía mock payloads',
    async () => {
        const raw = await readFile(fiscaliaFixture, 'utf8');
        const incidents = incidentRecords(JSON.parse(raw), FIXTURE_DATE);

        assert.deepEqual(incidents, [
            {
                ciudad: 'GUAYAQUIL',
                fecha: '2011-11-09',
                hora: '11:01:05',
                gen_delito_tipopenal:
                    'ACCIDENTE DE TRANSITO CON SOLO DANOS MATERIALES INDETERMINADOS.',
                personasSenaladas: [],
            },
        ]);
    },
);

test('incident parser keeps only records inside the lookback window', () => {
    const sample = (fecha: string, hora: string) => sampleRecord({ fecha, hora, sujetos: [] });

    assert.deepEqual(
        incidentRecords(
            {
                cabecera: [
                    sample('2011-11-09', '08:00:00'),
                    sample('2024-09-16', '10:00:00'),
                    sample('2025-01-02', '09:00:00'),
                    sample('2026-09-16', '11:01:05'),
                    sample('2026-10-01', '12:00:00'),
                ],
            },
            REQUEST_DATE,
        )?.map((incident) => incident.fecha),
        ['2026-09-16', '2025-01-02', '2024-09-16'],
    );
    assert.deepEqual(
        incidentRecords({ cabecera: [sample('2011-11-09', '08:00:00')] }, REQUEST_DATE),
        [],
    );
    assert.deepEqual(
        projectedIncidentRecords({
            cabecera: [sample('2011-11-09', '08:00:00')],
        })?.map((incident) => incident.fecha),
        ['2011-11-09'],
    );

    assert.equal(isWithinLookback('16/09/2024', REQUEST_DATE, 24), true);
    assert.equal(isWithinLookback('15/09/2024', REQUEST_DATE, 24), false);
    assert.equal(
        subtractMonths(REQUEST_DATE, 24).toDateString(),
        new Date(2024, 8, 16).toDateString(),
    );
});
