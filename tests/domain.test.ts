/// <reference types="node" />
import assert from 'node:assert/strict';
import test from 'node:test';

import { incidentRecords, projectedIncidentRecords } from '../src/data/incidents.data.ts';
import { vehicleDetails, vehicleLookupNote } from '../src/data/vehicle.data.ts';
import {
    describeLookupAge,
    isWithinLookback,
    subtractMonths,
} from '../src/lib/utils/date.utils.ts';
import {
    displayPlate,
    formatPlateInput,
    isValidPlate,
    normalizePlate,
} from '../src/lib/utils/licensePlate.utils.ts';
import {
    projectFiscaliaData,
    projectVehicleData,
    sanitizeGovernmentData,
} from '../src/lib/utils/privacy.utils.ts';

test('plate input formatting is friendly but service normalization remains strict', () => {
    assert.equal(formatPlateInput(' abc-1234 '), 'ABC-1234');
    assert.equal(normalizePlate(' abc1234 '), 'ABC1234');
    assert.equal(isValidPlate('A123456'), false);
    assert.equal(isValidPlate('ABC123'), true);
    assert.throws(() => normalizePlate('ABC1234<script>'), /3 letras/);
    assert.throws(() => normalizePlate('ABC&x=1'), /3 letras/);
});

test('old and new plate spellings share the same canonical government/cache key', () => {
    for (const spelling of ['ABC-123', 'abc123', ' ABC-0123 ', 'ABC0123']) {
        assert.equal(normalizePlate(spelling), 'ABC0123');
    }
    assert.equal(normalizePlate('ICP-1234'), 'ICP1234');
    assert.equal(normalizePlate('ABC-000'), 'ABC0000');
    assert.equal(displayPlate('ABC0123'), 'ABC-0123');
    assert.equal(formatPlateInput('ABC123'), 'ABC-123');
});

test('incomplete input stays editable and invalid edits never change the plate', () => {
    for (const partial of ['', 'A', 'AB', 'ABC', 'ABC-1', 'ABC-12', 'ABC-123', 'ABC-1234']) {
        assert.equal(formatPlateInput(partial), partial);
    }
    for (const invalid of ['A1', 'AB12', 'ABCD123', 'ABC12345', 'ABC1A23', '1ABC123']) {
        assert.equal(formatPlateInput(invalid, 'ABC-123'), 'ABC-123');
        assert.equal(isValidPlate(invalid), false);
    }
    for (const invalid of ['ABC', 'ABC-12', 'ABC--123', 'AB-1234', 'A123456']) {
        assert.equal(isValidPlate(invalid), false);
    }
});

test('vehicle details are defensive and preserve unavailable values', () => {
    const details = vehicleDetails({
        numeroPlaca: 'PBC1234',
        descripcionMarca: 'KIA',
        descripcionModelo: 'RIO',
        anioAuto: 2020,
        colorVehiculo1: null,
    });
    assert.ok(details);
    assert.equal(details.find(({ key }) => key === 'descripcionMarca')?.value, 'KIA');
    assert.equal(details.find(({ key }) => key === 'colorVehiculo1')?.value, 'No disponible');
    assert.deepEqual(
        details.map((item) => item.label),
        ['Marca', 'Modelo', 'Placa', 'Color'],
    );
    assert.equal(vehicleDetails({ mensaje: 'sin datos' }), null);
    assert.equal(vehicleDetails([]), null);
    assert.equal(
        vehicleDetails({
            sriVehicleNotFound: true,
            mensaje: 'El vehículo no existe',
        }),
        null,
    );
    assert.equal(
        vehicleLookupNote({
            sriVehicleNotFound: true,
            mensaje: 'El vehículo no existe',
        }),
        'El vehículo no existe',
    );
});

test('SRI projection keeps vehicle sheets and explicit not-found replies', () => {
    assert.deepEqual(
        projectVehicleData({
            numeroPlaca: 'PBC1234',
            descripcionMarca: 'KIA',
            cedulaPropietario: '0123456789',
        }),
        {
            numeroPlaca: 'PBC1234',
            descripcionMarca: 'KIA',
        },
    );
    assert.deepEqual(
        projectVehicleData({
            data: [],
            objeto: null,
            mensajeServidor: { texto: 'El vehículo no existe' },
        }),
        {
            sriVehicleNotFound: true,
            mensaje: 'El vehículo no existe',
        },
    );
    assert.equal(projectVehicleData({ mensajeServidor: { texto: 'error interno' } }), null);
});

test('Fiscalía projection allowlists UI fields and is idempotent', () => {
    const requestDate = Date.parse('2026-09-16T12:00:00');
    const raw = {
        mensaje: 'ruido',
        cabecera: [
            {
                ndd: 'REF-1',
                fecha: '2026-09-14',
                hora: '11:01:05',
                gen_delito_tipopenal: 'Registro de prueba',
                ciudad: 'Quito',
                pro_descripcion: 'Pichincha',
                vehiculos: [{ placa: 'PBC1234' }],
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
    };
    const projected = projectFiscaliaData(raw, requestDate);

    assert.deepEqual(projected, {
        cabecera: [
            {
                ciudad: 'Quito',
                fecha: '2026-09-14',
                hora: '11:01:05',
                gen_delito_tipopenal: 'Registro de prueba',
                sujetos: [
                    {
                        persona: 'CRESPO GARCIA JONNY MANOLO',
                        tipo: 'SOSPECHOSO',
                    },
                ],
            },
        ],
    });
    assert.deepEqual(projectFiscaliaData(projected, requestDate), projected);
    assert.equal(raw.cabecera[0]?.sujetos[0]?.cedula, '0123456789');
});

test('incident parser keeps only general Fiscalía fields and ignores the rest', () => {
    const requestDate = Date.parse('2026-09-16T12:00:00');

    assert.deepEqual(incidentRecords({ cabecera: [] }, requestDate), []);
    assert.equal(incidentRecords({ mensaje: 'formato distinto' }, requestDate), null);
    assert.deepEqual(
        incidentRecords(
            {
                cabecera: [
                    {
                        ndd: 'REF-1',
                        fecha: '2026-09-14',
                        hora: '11:01:05',
                        gen_delito_tipopenal: 'Registro de prueba',
                        ciudad: 'Quito',
                        pro_descripcion: 'Pichincha',
                        unidad: 'Unidad 1',
                        vehiculos: [{ placa: 'PBC1234' }],
                        sujetos: [{ persona: 'Alguien', tipo: 'VICTIMA' }],
                    },
                ],
            },
            requestDate,
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
                    {
                        fecha: '2026-09-14',
                        hora: '11:01:05',
                        gen_delito_tipopenal: 'Registro de prueba',
                        ciudad: 'Quito',
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
                    },
                ],
            },
            Date.parse('2026-09-16T12:00:00'),
        ),
        [
            {
                ciudad: 'Quito',
                fecha: '2026-09-14',
                hora: '11:01:05',
                gen_delito_tipopenal: 'Registro de prueba',
                personasSenaladas: [
                    {
                        nombreCompleto: 'CRESPO GARCIA JONNY MANOLO',
                        primerApellido: 'CRESPO',
                        estado: 'SOSPECHOSO',
                    },
                    {
                        nombreCompleto: 'VELEZ MARCO',
                        primerApellido: 'VELEZ',
                        estado: 'SOSPECHOSO',
                    },
                ],
            },
        ],
    );
});

test('government data sanitizer removes identity documents and Fiscalía positional aliases', () => {
    const response = {
        0: 'response metadata',
        cedulaPropietario: '9999999999',
        cabecera: [
            {
                0: 'incident identifier',
                sujetos: [
                    {
                        0: '0123456789',
                        1: 'CRESPO GARCIA JONNY MANOLO',
                        2: 'SOSPECHOSO',
                        cedula: '0123456789',
                        persona: 'CRESPO GARCIA JONNY MANOLO',
                        tipo: 'SOSPECHOSO',
                    },
                ],
                vehiculos: [{ 0: 'CHEVROLET', placa: 'PBC1234' }],
            },
        ],
        propietario: {
            CÉDULA: '9999999999',
            nombre: 'NOMBRE CONSERVADO',
        },
    };

    assert.deepEqual(sanitizeGovernmentData(response), {
        0: 'response metadata',
        cabecera: [
            {
                0: 'incident identifier',
                sujetos: [
                    {
                        1: 'CRESPO GARCIA JONNY MANOLO',
                        2: 'SOSPECHOSO',
                        persona: 'CRESPO GARCIA JONNY MANOLO',
                        tipo: 'SOSPECHOSO',
                    },
                ],
                vehiculos: [{ 0: 'CHEVROLET', placa: 'PBC1234' }],
            },
        ],
        propietario: {
            nombre: 'NOMBRE CONSERVADO',
        },
    });
    assert.equal(response.cabecera[0]?.sujetos[0]?.cedula, '0123456789');
    assert.equal(response.cedulaPropietario, '9999999999');
});

test('incident parser accepts real Fiscalía mock payloads', async () => {
    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(new URL('../__mocks__/GMJ-0622.json', import.meta.url), 'utf8');
    const incidents = incidentRecords(JSON.parse(raw), Date.parse('2012-11-09T12:00:00'));

    assert.deepEqual(incidents, [
        {
            ciudad: 'GUAYAQUIL',
            fecha: '2011-11-09',
            hora: '11:01:05',
            gen_delito_tipopenal: 'ACCIDENTE DE TRANSITO CON SOLO DANOS MATERIALES INDETERMINADOS.',
            personasSenaladas: [],
        },
    ]);
});

test('incident parser keeps only records inside the lookback window', () => {
    const requestDate = Date.parse('2026-09-16T12:00:00');
    const sample = (fecha: string, hora: string) => ({
        fecha,
        hora,
        gen_delito_tipopenal: 'Registro de prueba',
        ciudad: 'Quito',
        sujetos: [],
    });

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
            requestDate,
        )?.map((incident) => incident.fecha),
        ['2026-09-16', '2025-01-02', '2024-09-16'],
    );
    assert.deepEqual(
        incidentRecords({ cabecera: [sample('2011-11-09', '08:00:00')] }, requestDate),
        [],
    );
    assert.deepEqual(
        projectedIncidentRecords({
            cabecera: [sample('2011-11-09', '08:00:00')],
        })?.map((incident) => incident.fecha),
        ['2011-11-09'],
    );
    assert.equal(isWithinLookback('16/09/2024', requestDate, 24), true);
    assert.equal(isWithinLookback('15/09/2024', requestDate, 24), false);
    assert.equal(
        subtractMonths(requestDate, 24).toDateString(),
        new Date(2024, 8, 16).toDateString(),
    );
});

test('lookup age has compact Spanish labels', () => {
    const now = Date.UTC(2026, 8, 14, 12, 0, 0);
    assert.equal(describeLookupAge(now, now), 'Ahora');
    assert.equal(describeLookupAge(now - 12 * 60_000, now), 'Hace 12 min');
    assert.equal(describeLookupAge(now - 2 * 60 * 60_000, now), 'Hace 2 h');
    assert.equal(describeLookupAge(now - 2 * 24 * 60 * 60_000, now), 'Hace 2 días');
});
