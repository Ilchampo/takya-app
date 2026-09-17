/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import {
    isVehicleNotFoundProjection,
    projectFiscaliaData,
    projectVehicleData,
    sanitizeGovernmentData,
} from '../../../src/lib/utils/privacy.utils.ts';

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
    assert.equal(
        isVehicleNotFoundProjection({ sriVehicleNotFound: true, mensaje: 'El vehículo no existe' }),
        true,
    );
    assert.equal(isVehicleNotFoundProjection({ numeroPlaca: 'PBC1234' }), false);
});

test('SRI projection clips oversized vehicle fields', () => {
    const oversized = 'K'.repeat(200);
    const projected = projectVehicleData({
        numeroPlaca: 'PBC1234',
        descripcionMarca: oversized,
    });

    assert.equal(typeof projected?.descripcionMarca, 'string');
    assert.equal(String(projected?.descripcionMarca).length, 120);
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
                        persona: 'CRESPO G. J. M.',
                        tipo: 'SOSPECHOSO',
                    },
                ],
            },
        ],
    });
    assert.deepEqual(projectFiscaliaData(projected, requestDate), projected);
    assert.equal(raw.cabecera[0]?.sujetos[0]?.cedula, '0123456789');
    assert.equal(JSON.stringify(projected).includes('CRESPO GARCIA JONNY MANOLO'), false);
});

test('Fiscalía projection caps incidents and people', () => {
    const requestDate = Date.parse('2026-09-16T12:00:00');
    const sample = (index: number) => ({
        fecha: '2026-09-14',
        hora: '11:01:05',
        gen_delito_tipopenal: 'Registro de prueba',
        ciudad: 'Quito',
        sujetos: [{ persona: `PERSONA EJEMPLO ${index}`, tipo: 'SOSPECHOSO' }],
    });
    const projected = projectFiscaliaData(
        { cabecera: Array.from({ length: 120 }, (_, index) => sample(index)) },
        requestDate,
    );

    assert.ok(projected && Array.isArray(projected.cabecera));
    assert.equal(projected.cabecera.length, 100);
    const people = projected.cabecera.flatMap((incident) => {
        const sujetos =
            incident && typeof incident === 'object' && 'sujetos' in incident
                ? incident.sujetos
                : [];
        return Array.isArray(sujetos) ? sujetos : [];
    });
    assert.equal(people.length, 100);
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
