/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import { debugFiscaliaPayload, debugVehiclePayload } from '../src/data/debugLookups.data.ts';
import { incidentRecords } from '../src/data/incidents.data.ts';
import { vehicleDetails, vehicleLookupNote } from '../src/data/vehicle.data.ts';
import { parseEnvBoolean } from '../src/lib/utils/misc.utils.ts';

test('debug env flag only turns on for explicit true-like values', () => {
    assert.equal(parseEnvBoolean(undefined), false);
    assert.equal(parseEnvBoolean('true'), true);
    assert.equal(parseEnvBoolean('TRUE'), true);
    assert.equal(parseEnvBoolean('1'), true);
    assert.equal(parseEnvBoolean('yes'), true);
    assert.equal(parseEnvBoolean('on'), true);
    assert.equal(parseEnvBoolean('false'), false);
    assert.equal(parseEnvBoolean('0'), false);
    assert.equal(parseEnvBoolean('no'), false);
    assert.equal(parseEnvBoolean('maybe', false), false);
    assert.equal(parseEnvBoolean('maybe', true), true);
});

test('ABC-1111 is a clean vehicle with no Fiscalía records', () => {
    const details = vehicleDetails(debugVehiclePayload('ABC1111'));
    const incidents = incidentRecords(debugFiscaliaPayload('ABC1111'));

    assert.ok(details);
    assert.equal(details.find(({ key }) => key === 'descripcionMarca')?.value, 'CHEVROLET');
    assert.deepEqual(incidents, []);
});

test('ABC-2222 and ABC-3333 include recent incidents with flagged people', () => {
    const one = incidentRecords(debugFiscaliaPayload('ABC2222'));
    const many = incidentRecords(debugFiscaliaPayload('ABC3333'));

    assert.equal(one?.length, 1);
    assert.equal(one?.[0]?.personasSenaladas[0]?.estado, 'SOSPECHOSO');
    assert.equal(many?.length, 2);
    assert.ok((many?.[0]?.personasSenaladas.length ?? 0) >= 1);
});

test('ABC-4444 reports that the vehicle does not exist', () => {
    const payload = debugVehiclePayload('ABC4444');

    assert.equal(vehicleDetails(payload), null);
    assert.equal(vehicleLookupNote(payload), 'El vehículo no existe');
    assert.deepEqual(incidentRecords(debugFiscaliaPayload('ABC4444')), []);
});

test('ABC-5555 has a vehicle record and an incident without flagged people', () => {
    const details = vehicleDetails(debugVehiclePayload('ABC5555'));
    const incidents = incidentRecords(debugFiscaliaPayload('ABC5555'));

    assert.equal(details?.find(({ key }) => key === 'descripcionMarca')?.value, 'TOYOTA');
    assert.equal(incidents?.length, 1);
    assert.deepEqual(incidents?.[0]?.personasSenaladas, []);
});

test('unknown plates stay mocked as not found', () => {
    const payload = debugVehiclePayload('PBC1234');

    assert.equal(vehicleLookupNote(payload), 'El vehículo no existe');
    assert.deepEqual(incidentRecords(debugFiscaliaPayload('PBC1234')), []);
});
