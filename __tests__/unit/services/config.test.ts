import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import config from '../../../src/lib/configs/app.config.ts';

test('service config uses the documented application defaults', () => {
    assert.equal(config.debug, false);
    assert.equal(config.service.timeout, 10_000);
    assert.equal(config.service.maxRetries, 3);
    assert.equal(config.service.historyLimit, 5);
    assert.equal(config.service.ttlDays, 3);
    assert.equal(config.service.TTL, 3 * 24 * 60 * 60 * 1_000);
    assert.equal(config.service.rateLimit.maxRequests, 5);
    assert.equal(config.service.incidentMonths, 24);

    assert.match(config.source.SRI, /^https:\/\/srienlinea\.sri\.gob\.ec\//);
    assert.match(config.source.fiscaliaLookup, /^https:\/\/www\.gestiondefiscalias\.gob\.ec\//);
});
