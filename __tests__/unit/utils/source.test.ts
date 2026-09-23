import assert from 'node:assert/strict';
import { test } from '@jest/globals';

import {
    officialSource,
    publicCitationUrl,
    sourcePresentation,
    toneColors,
    withoutQueryParam,
} from '../../../src/lib/utils/source.utils.ts';
import { createTheme } from '../../../src/theme/theme.ts';

import config from '../../../src/lib/configs/app.config.ts';

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

test('public citations keep the SRI endpoint and drop the Fiscalía data parameter', () => {
    assert.equal(
        withoutQueryParam(
            'https://www.gestiondefiscalias.gob.ec/siaf/sitio/consulta_ndd_ext/redirect.php?data=L3Zhci93d3c%3D',
            'data',
        ),
        'https://www.gestiondefiscalias.gob.ec/siaf/sitio/consulta_ndd_ext/redirect.php?',
    );
    assert.equal(
        withoutQueryParam('https://example.com/a.php?foo=1&data=secret&bar=2', 'data'),
        'https://example.com/a.php?foo=1&bar=2',
    );
    assert.equal(
        withoutQueryParam('https://example.com/a.php', 'data'),
        'https://example.com/a.php',
    );

    assert.equal(publicCitationUrl('sri'), config.source.SRI);
    assert.equal(
        publicCitationUrl('fiscalia'),
        withoutQueryParam(config.source.fiscaliaEntry, 'data'),
    );
    assert.doesNotMatch(publicCitationUrl('fiscalia'), /(?:^|[?&])data=/);
    assert.match(publicCitationUrl('fiscalia'), /redirect\.php\?$/);

    assert.equal(officialSource('sri')?.host, 'srienlinea.sri.gob.ec');
    assert.equal(officialSource('sri')?.url, config.source.SRI);
    assert.equal(officialSource('fiscalia')?.host, 'www.gestiondefiscalias.gob.ec');
    assert.equal(officialSource('fiscalia')?.name, 'Fiscalía General del Estado');
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
