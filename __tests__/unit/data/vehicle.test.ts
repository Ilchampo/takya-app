/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import { vehicleDetails, vehicleLookupNote } from '../../../src/data/vehicle.data.ts';

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
