/// <reference types="node" />
import assert from 'node:assert/strict';
import test from 'node:test';

import config from '../src/lib/configs/app.config.ts';
import { sourcePresentation } from '../src/lib/utils/source.utils.ts';

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
