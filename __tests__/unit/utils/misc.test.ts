/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import {
    asRecord,
    asText,
    parseEnvBoolean,
    parseNonNegativeEnvInt,
    parsePositiveEnvInt,
    parseJson,
    stringifyJson,
} from '../../../src/lib/utils/misc.utils.ts';

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

test('integer env parsers keep only finite values in range', () => {
    assert.equal(parsePositiveEnvInt('5', 3), 5);
    assert.equal(parsePositiveEnvInt('0', 3), 3);
    assert.equal(parsePositiveEnvInt('-1', 3), 3);
    assert.equal(parsePositiveEnvInt(undefined, 3), 3);
    assert.equal(parseNonNegativeEnvInt('0', 3), 0);
    assert.equal(parseNonNegativeEnvInt('-1', 3), 3);
    assert.equal(parseNonNegativeEnvInt('2', 3), 2);
});

test('record and text helpers ignore empty or non-object values', () => {
    assert.deepEqual(asRecord({ a: 1 }), { a: 1 });
    assert.equal(asRecord(null), null);
    assert.equal(asRecord([]), null);
    assert.equal(asText('  hola  '), 'hola');
    assert.equal(asText(12), '');
});

test('JSON helpers accept objects only and stringify safely', () => {
    assert.deepEqual(parseJson('{"plate":"ABC0123"}'), {
        valid: true,
        data: { plate: 'ABC0123' },
    });
    assert.deepEqual(parseJson('[]'), { valid: false });
    assert.deepEqual(parseJson('{broken'), { valid: false });
    assert.equal(stringifyJson({ plate: 'ABC0123' }), '{"plate":"ABC0123"}');
    assert.equal(stringifyJson(undefined), 'null');
});
