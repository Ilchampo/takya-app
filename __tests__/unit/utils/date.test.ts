/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import {
    daysToMilliSeconds,
    describeLookupAge,
    formatLookupDate,
    isWithinLookback,
    parseCalendarDate,
    secondsTomilliSeconds,
    startOfLocalDay,
    subtractMonths,
} from '../../../src/lib/utils/date.utils.ts';

test('lookup age has compact Spanish labels', () => {
    const now = Date.UTC(2026, 8, 14, 12, 0, 0);
    assert.equal(describeLookupAge(now, now), 'Ahora');
    assert.equal(describeLookupAge(now - 12 * 60_000, now), 'Hace 12 min');
    assert.equal(describeLookupAge(now - 2 * 60 * 60_000, now), 'Hace 2 h');
    assert.equal(describeLookupAge(now - 2 * 24 * 60 * 60_000, now), 'Hace 2 días');
    assert.equal(describeLookupAge(now - 24 * 60 * 60_000, now), 'Hace 1 día');
});

test('parseCalendarDate accepts ISO and day-first values and rejects invalid dates', () => {
    assert.deepEqual(parseCalendarDate('2026-09-16'), new Date(2026, 8, 16));
    assert.deepEqual(parseCalendarDate('16/09/2026'), new Date(2026, 8, 16));
    assert.deepEqual(parseCalendarDate('2026-09-16T12:00:00'), new Date(2026, 8, 16));
    assert.equal(parseCalendarDate('2026-02-30'), null);
    assert.equal(parseCalendarDate('not-a-date'), null);
    assert.equal(parseCalendarDate(''), null);
});

test('subtractMonths clamps to the last day of the target month', () => {
    const endOfJanuary = Date.parse('2026-01-31T12:00:00');
    assert.equal(
        subtractMonths(endOfJanuary, 1).toDateString(),
        new Date(2025, 11, 31).toDateString(),
    );
    assert.equal(
        subtractMonths(Date.parse('2026-09-16T12:00:00'), 24).toDateString(),
        new Date(2024, 8, 16).toDateString(),
    );
});

test('lookback window is inclusive of the start day and excludes future dates', () => {
    const requestDate = Date.parse('2026-09-16T12:00:00');
    assert.equal(isWithinLookback('16/09/2024', requestDate, 24), true);
    assert.equal(isWithinLookback('15/09/2024', requestDate, 24), false);
    assert.equal(isWithinLookback('2026-09-16', requestDate, 24), true);
    assert.equal(isWithinLookback('2026-09-17', requestDate, 24), false);
});

test('duration helpers and start of day are local calendar values', () => {
    assert.equal(daysToMilliSeconds(3), 3 * 24 * 60 * 60 * 1_000);
    assert.equal(secondsTomilliSeconds(10), 10_000);
    const noon = Date.parse('2026-09-16T12:34:56');
    assert.equal(startOfLocalDay(noon).getHours(), 0);
    assert.equal(startOfLocalDay(noon).getDate(), 16);
    assert.match(formatLookupDate(noon), /\d+/);
});
