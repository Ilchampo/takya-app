/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { privacyPolicy, termsOfService } from '../src/data/legal.data.ts';
import { privacyPolicyMarkdown } from '../src/data/privacyPolicy.data.ts';
import { termsOfServiceMarkdown } from '../src/data/termsOfService.data.ts';
import {
    flattenLegalText,
    legalHeadingText,
    parseLegalInline,
    parseLegalMarkdown,
    unwrapMarkdownFence,
} from '../src/lib/utils/legalMarkdown.utils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const headingTexts = (document: { blocks: { type: string; text?: string }[] }): string[] =>
    document.blocks
        .map((block) => (block.type === 'heading' && block.text ? block.text : null))
        .filter((text): text is string => Boolean(text));

test('legal page sources stay aligned with the published markdown', () => {
    const privacy = unwrapMarkdownFence(
        readFileSync(join(root, '.github/PRIVACY_POLICY.md'), 'utf8'),
    );
    const terms = unwrapMarkdownFence(
        readFileSync(join(root, '.github/TERMS_OF_SERVICE.md'), 'utf8'),
    );

    assert.equal(privacyPolicyMarkdown, privacy);
    assert.equal(termsOfServiceMarkdown, terms);
});

test('privacy policy document preserves title, date and numbered sections', () => {
    const headings = headingTexts(privacyPolicy);

    assert.equal(privacyPolicy.title, 'Política de Privacidad de Takya');
    assert.equal(privacyPolicy.effectiveDate, '16 de septiembre de 2026');
    assert.equal(headings.length, 25);
    assert.equal(headings[0], '1. Introducción');
    assert.equal(headings[24], '25. Autoridad de protección de datos');
});

test('terms of service document preserves title, date and numbered sections', () => {
    const headings = headingTexts(termsOfService);

    assert.equal(termsOfService.title, 'Términos y Condiciones de Takya');
    assert.equal(termsOfService.effectiveDate, '16 de septiembre de 2026');
    assert.equal(headings.length, 31);
    assert.equal(headings[0], '1. Sobre Takya');
    assert.equal(headings[30], '31. Contacto');
});

test('legal markdown parser keeps names, contacts and the official warning', () => {
    const privacyCode = privacyPolicy.blocks.filter(
        (block) =>
            block.type === 'paragraph' &&
            block.lines.length === 1 &&
            block.lines[0]?.[0]?.type === 'code',
    );
    const termsQuote = termsOfService.blocks.find((block) => block.type === 'quote');
    const privacyEmail = privacyPolicy.blocks.some(
        (block) =>
            block.type === 'paragraph' &&
            block.lines.some((line) =>
                line.some(
                    (span) => span.type === 'link' && span.href === 'mailto:pablo@goastrobit.com',
                ),
            ),
    );
    const privacySite = privacyPolicy.blocks.some(
        (block) =>
            block.type === 'paragraph' &&
            block.lines.some((line) =>
                line.some(
                    (span) => span.type === 'link' && span.href === 'https://www.goastrobit.com',
                ),
            ),
    );

    assert.equal(privacyCode.length, 2);
    assert.equal(
        privacyCode[0]?.type === 'paragraph' ? privacyCode[0].lines[0]?.[0]?.value : undefined,
        'Juan Pepito Batalla Floreros',
    );
    assert.equal(
        privacyCode[1]?.type === 'paragraph' ? privacyCode[1].lines[0]?.[0]?.value : undefined,
        'Juan P. B. F.',
    );
    assert.equal(termsQuote?.type, 'quote');
    assert.match(
        flattenLegalText(termsQuote?.type === 'quote' ? termsQuote.lines.flat() : []),
        /SIAF/,
    );
    assert.equal(privacyEmail, true);
    assert.equal(privacySite, true);
});

test('inline legal markup recognizes emphasis, code, mail and privacy references', () => {
    const spans = parseLegalInline(
        'Consulta la Política de Privacidad de Takya o escribe a pablo@goastrobit.com.',
    );
    const parsed = parseLegalMarkdown(
        '# Título\n\n**Fecha de entrada en vigor: 1 de enero de 2026**',
    );

    assert.deepEqual(
        spans.filter((span) => span.type === 'bold' || span.type === 'link'),
        [
            { type: 'bold', value: 'Política de Privacidad de Takya' },
            { type: 'link', value: 'pablo@goastrobit.com', href: 'mailto:pablo@goastrobit.com' },
        ],
    );
    assert.deepEqual(parseLegalInline('`Juan P. B. F.`'), [
        { type: 'code', value: 'Juan P. B. F.' },
    ]);
    assert.equal(parsed.title, 'Título');
    assert.equal(parsed.effectiveDate, '1 de enero de 2026');
    assert.equal(legalHeadingText(parsed.blocks[0] ?? { type: 'rule' }), null);
});
