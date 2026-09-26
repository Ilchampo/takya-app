import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import { plateCellLayout } from '../../../src/components/PlateInput/PlateInput.tsx';

const fits = (rowWidth: number): void => {
    const layout = plateCellLayout(rowWidth);
    const used = layout.cellWidth * 7 + layout.dashWidth + 4 * 7;

    assert.ok(used <= rowWidth + 0.01);
    assert.ok(layout.fontSize >= 13);
    assert.ok(layout.fontSize <= 24);
};

test('plate cells stay inside a Samsung S25 content row', () => {
    const screenWidth = 360;
    const rowWidth = screenWidth - 48 - 16 - 24;

    fits(rowWidth);
    assert.ok(plateCellLayout(rowWidth).cellWidth < 36);
});

test('plate cells use the full glyph size when the row is wide', () => {
    assert.equal(plateCellLayout(420).fontSize, 24);
});

test('plate cells keep shrinking on a zoomed display', () => {
    const rowWidth = 320 - 48 - 16 - 24;

    fits(rowWidth);
    assert.ok(plateCellLayout(rowWidth).fontSize < plateCellLayout(360 - 48 - 16 - 24).fontSize);
});
