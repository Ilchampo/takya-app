/// <reference types="node" />
import assert from 'node:assert/strict';
import test from 'node:test';

import { projectFiscaliaData } from '../src/lib/utils/privacy.utils.ts';
import { maskPersonName, PROTECTED_IDENTITY_LABEL } from '../src/lib/utils/personName.utils.ts';

test('maskPersonName keeps the first token and initials of the rest', () => {
    assert.equal(maskPersonName('Juan Pablo Beltrán Flores'), 'Juan P. B. F.');
    assert.equal(maskPersonName('María José Pérez'), 'María J. P.');
    assert.equal(maskPersonName('Pedro Andrade'), 'Pedro A.');
    assert.equal(maskPersonName('Carlos'), 'C.');
    assert.equal(maskPersonName('  Juan   Pablo   Pérez  '), 'Juan P. P.');
    assert.equal(maskPersonName('Ana María De la Torre'), 'Ana M. D. L. T.');
});

test('maskPersonName never returns the raw value for unusable names', () => {
    assert.equal(maskPersonName(null), PROTECTED_IDENTITY_LABEL);
    assert.equal(maskPersonName(undefined), PROTECTED_IDENTITY_LABEL);
    assert.equal(maskPersonName(''), PROTECTED_IDENTITY_LABEL);
    assert.equal(maskPersonName('   '), PROTECTED_IDENTITY_LABEL);
    assert.equal(maskPersonName(PROTECTED_IDENTITY_LABEL), PROTECTED_IDENTITY_LABEL);
});

test('maskPersonName is idempotent for already masked names', () => {
    assert.equal(maskPersonName('Juan P. B. F.'), 'Juan P. B. F.');
    assert.equal(maskPersonName('C.'), 'C.');
    assert.equal(maskPersonName('CRESPO G. J. M.'), 'CRESPO G. J. M.');
});

test('Fiscalía projection stores masked names and not the source full name', () => {
    const requestDate = Date.parse('2026-09-16T12:00:00');
    const sourceName = 'Juan Pablo Beltrán Flores';
    const projected = projectFiscaliaData(
        {
            cabecera: [
                {
                    fecha: '2026-09-14',
                    hora: '11:01:05',
                    gen_delito_tipopenal: 'Registro de prueba',
                    ciudad: 'Quito',
                    sujetos: [{ persona: sourceName, tipo: 'SOSPECHOSO' }],
                },
            ],
        },
        requestDate,
    );

    assert.deepEqual(projected?.cabecera, [
        {
            ciudad: 'Quito',
            fecha: '2026-09-14',
            hora: '11:01:05',
            gen_delito_tipopenal: 'Registro de prueba',
            sujetos: [{ persona: 'Juan P. B. F.', tipo: 'SOSPECHOSO' }],
        },
    ]);
    assert.equal(JSON.stringify(projected).includes(sourceName), false);
});
