/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import {
    displayPlate,
    formatPlateInput,
    isValidPlate,
    normalizePlate,
    tryNormalizePlate,
} from '../../../src/lib/utils/licensePlate.utils.ts';

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

test('tryNormalizePlate returns the canonical key or null', () => {
    assert.equal(tryNormalizePlate('ABC-123'), 'ABC0123');
    assert.equal(tryNormalizePlate(' pbc1234 '), 'PBC1234');
    assert.equal(tryNormalizePlate('ABC'), null);
    assert.equal(tryNormalizePlate('not-a-plate'), null);
});
