/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import config from '../../../src/lib/configs/app.config.ts';
import { createTheme } from '../../../src/theme/theme.ts';
import { sourcePresentation, toneColors } from '../../../src/lib/utils/source.utils.ts';

test('source presentation maps idle, loading, retry, success, and error states', () => {
    assert.deepEqual(sourcePresentation(), {
        tone: 'idle',
        label: 'Sin consultar',
        icon: 'clock',
        note: 'Ingresa una placa para consultar esta fuente.',
    });

    assert.equal(sourcePresentation({ status: 'loading', attempt: 1 }).label, 'Consultando…');
    assert.equal(
        sourcePresentation({ status: 'loading', attempt: 2 }).label,
        `Reintentando · 1 de ${config.service.maxRetries}`,
    );
    assert.equal(sourcePresentation({ status: 'success', data: {} }).tone, 'success');
    assert.equal(sourcePresentation({ status: 'success', data: {} }).note, null);

    const error = sourcePresentation({ status: 'error', message: 'Fuera de servicio' });
    assert.equal(error.tone, 'error');
    assert.equal(error.label, 'No disponible');
    assert.equal(error.note, 'Fuera de servicio');
});

test('tone colors follow the active theme', () => {
    const theme = createTheme('light');
    assert.deepEqual(toneColors('success', theme), {
        color: theme.colors.success,
        background: theme.colors.successMuted,
    });
    assert.deepEqual(toneColors('error', theme), {
        color: theme.colors.danger,
        background: theme.colors.dangerMuted,
    });
    assert.deepEqual(toneColors('idle', theme), {
        color: theme.colors.primaryPressed,
        background: theme.colors.surfaceMuted,
    });
});
