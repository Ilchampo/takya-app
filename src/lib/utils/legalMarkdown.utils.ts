import type { LegalBlock, LegalSpan, ParsedLegalMarkdown } from '../interfaces/legal.interface.ts';

export const unwrapMarkdownFence = (value: string): string => {
    const trimmed = value.trim();
    const match = trimmed.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i);

    return `${(match?.[1] ?? trimmed).trim()}\n`;
};

const INLINE_PATTERN =
    /\*\*(.+?)\*\*|`([^`]+)`|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
const PRIVACY_POLICY_LABEL = 'Política de Privacidad de Takya';

export const isPrivacyPolicyLabel = (value: string): boolean => value === PRIVACY_POLICY_LABEL;

const trimTrailingLinkPunctuation = (value: string): { hrefValue: string; trailing: string } => {
    const match = value.match(/^(.*?)([.,;:)]+)$/);

    if (!match) {
        return { hrefValue: value, trailing: '' };
    }

    return { hrefValue: match[1] ?? value, trailing: match[2] ?? '' };
};

export const parseLegalInline = (text: string): LegalSpan[] => {
    const spans: LegalSpan[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(INLINE_PATTERN)) {
        const index = match.index ?? 0;

        if (index > lastIndex) {
            spans.push({ type: 'text', value: text.slice(lastIndex, index) });
        }

        if (match[1] !== undefined) {
            const bold = match[1];

            if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(bold)) {
                spans.push({ type: 'link', value: bold, href: `mailto:${bold}` });
            } else {
                spans.push({ type: 'bold', value: bold });
            }
        } else if (match[2] !== undefined) {
            spans.push({ type: 'code', value: match[2] });
        } else if (match[3] !== undefined) {
            spans.push({ type: 'link', value: match[3], href: `mailto:${match[3]}` });
        } else if (match[4] !== undefined) {
            const { hrefValue, trailing } = trimTrailingLinkPunctuation(match[4]);
            spans.push({ type: 'link', value: hrefValue, href: hrefValue });

            if (trailing) {
                spans.push({ type: 'text', value: trailing });
            }
        } else if (match[5] !== undefined) {
            const { hrefValue, trailing } = trimTrailingLinkPunctuation(match[5]);
            spans.push({ type: 'link', value: hrefValue, href: `https://${hrefValue}` });

            if (trailing) {
                spans.push({ type: 'text', value: trailing });
            }
        }

        lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
        spans.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return linkPrivacyPolicyMentions(spans.length > 0 ? spans : [{ type: 'text', value: text }]);
};

const linkPrivacyPolicyMentions = (spans: LegalSpan[]): LegalSpan[] => {
    const result: LegalSpan[] = [];

    for (const span of spans) {
        if (span.type !== 'text' || !span.value.includes(PRIVACY_POLICY_LABEL)) {
            result.push(span);
            continue;
        }

        const parts = span.value.split(PRIVACY_POLICY_LABEL);

        parts.forEach((part, index) => {
            if (part) {
                result.push({ type: 'text', value: part });
            }

            if (index < parts.length - 1) {
                result.push({ type: 'bold', value: PRIVACY_POLICY_LABEL });
            }
        });
    }

    return result;
};

const parseLines = (block: string): LegalSpan[][] =>
    block
        .split('\n')
        .map((line) => parseLegalInline(line.replace(/[ \t]+$/g, '')))
        .filter((line) => line.some((span) => span.value.length > 0));

const isListBlock = (block: string): boolean =>
    block.split('\n').every((line) => line.startsWith('- '));

const isQuotedBlock = (block: string): boolean => {
    const trimmed = block.trim();
    return trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1;
};

const mergeQuotedBlocks = (blocks: string[]): string[] => {
    const merged: string[] = [];
    let quote: string[] | null = null;

    for (const block of blocks) {
        if (quote) {
            quote.push(block);

            if (block.trim().endsWith('"')) {
                merged.push(quote.join('\n\n'));
                quote = null;
            }

            continue;
        }

        if (block.trim().startsWith('"') && !block.trim().endsWith('"')) {
            quote = [block];
            continue;
        }

        merged.push(block);
    }

    if (quote) {
        merged.push(quote.join('\n\n'));
    }

    return merged;
};

const parseBlock = (block: string): LegalBlock | null => {
    if (block === '---') {
        return { type: 'rule' };
    }

    if (block.startsWith('# ')) {
        return { type: 'title', text: block.slice(2).trim() };
    }

    if (block.startsWith('## ')) {
        return { type: 'heading', text: block.slice(3).trim() };
    }

    if (isListBlock(block)) {
        return {
            type: 'list',
            items: block.split('\n').map((line) => parseLegalInline(line.slice(2).trim())),
        };
    }

    const lines = parseLines(block);

    if (lines.length === 0) {
        return null;
    }

    if (isQuotedBlock(block)) {
        return { type: 'quote', lines };
    }

    return { type: 'paragraph', lines };
};

export const parseLegalMarkdown = (markdown: string): ParsedLegalMarkdown => {
    const blocks = mergeQuotedBlocks(
        markdown
            .replace(/\r\n/g, '\n')
            .trim()
            .split(/\n{2,}/)
            .map((block) => block.trim())
            .filter(Boolean),
    )
        .map(parseBlock)
        .filter((block): block is LegalBlock => block !== null);

    const titleBlock = blocks.find((block) => block.type === 'title');
    const dateBlock = blocks.find((block) => {
        if (block.type !== 'paragraph' || block.lines.length !== 1) {
            return false;
        }

        const [line] = block.lines;
        return line?.[0]?.type === 'bold' && line[0].value.startsWith('Fecha de entrada en vigor:');
    });

    const dateMatch =
        dateBlock?.type === 'paragraph'
            ? dateBlock.lines[0]?.[0]?.value.match(/^Fecha de entrada en vigor:\s*(.+)$/)
            : null;

    return {
        title: titleBlock?.type === 'title' ? titleBlock.text : '',
        effectiveDate: dateMatch?.[1]?.trim() ?? null,
        blocks,
    };
};

export const legalHeadingText = (block: LegalBlock): string | null =>
    block.type === 'heading' ? block.text : null;

export const flattenLegalText = (spans: LegalSpan[]): string =>
    spans.map((span) => span.value).join('');
