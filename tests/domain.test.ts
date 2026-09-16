/// <reference types="node" />
import assert from 'node:assert/strict';
import test from 'node:test';

import { incidentRecords } from '../src/data/incidents.data.ts';
import { vehicleDetails } from '../src/data/vehicle.data.ts';
import { describeLookupAge } from '../src/lib/utils/date.utils.ts';
import { displayPlate, formatPlateInput, isValidPlate, normalizePlate } from '../src/lib/utils/licensePlate.utils.ts';

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
  assert.deepEqual(details.map(item => item.label), ['Marca', 'Modelo', 'Placa', 'Color']);
  assert.equal(vehicleDetails({ mensaje: 'sin datos' }), null);
  assert.equal(vehicleDetails([]), null);
});

test('incident parser distinguishes empty results from unknown response shapes', () => {
  assert.deepEqual(incidentRecords({ cabecera: [] }, 'PBC1234'), []);
  assert.equal(incidentRecords({ mensaje: 'formato distinto' }, 'PBC1234'), null);
  assert.deepEqual(incidentRecords({
    cabecera: [{
      ndd: 'REF-1',
      fecha: '2026-09-14',
      gen_delito_tipopenal: 'Registro de prueba',
      ciudad: 'Quito',
      pro_descripcion: 'Pichincha',
      unidad: 'Unidad 1',
      vehiculos: [{ placa: 'PBC1234' }],
    }],
  }, 'pbc1234'), [{
    id: 'REF-1',
    date: '2026-09-14',
    title: 'Registro de prueba',
    city: 'Quito',
    province: 'Pichincha',
    unit: 'Unidad 1',
    plates: ['PBC1234'],
    matchesPlate: true,
  }]);
});

test('lookup age has compact Spanish labels', () => {
  const now = Date.UTC(2026, 8, 14, 12, 0, 0);
  assert.equal(describeLookupAge(now, now), 'Ahora');
  assert.equal(describeLookupAge(now - 12 * 60_000, now), 'Hace 12 min');
  assert.equal(describeLookupAge(now - 2 * 60 * 60_000, now), 'Hace 2 h');
  assert.equal(describeLookupAge(now - 2 * 24 * 60 * 60_000, now), 'Hace 2 días');
});
