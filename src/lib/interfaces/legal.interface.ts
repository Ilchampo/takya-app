import type { IconName, LegalPage } from '../types';

export type LegalSpan =
    | { type: 'text'; value: string }
    | { type: 'bold'; value: string }
    | { type: 'code'; value: string }
    | { type: 'link'; value: string; href: string };

export type LegalBlock =
    | { type: 'title'; text: string }
    | { type: 'heading'; text: string }
    | { type: 'paragraph'; lines: LegalSpan[][] }
    | { type: 'list'; items: LegalSpan[][] }
    | { type: 'quote'; lines: LegalSpan[][] }
    | { type: 'rule' };

export type ParsedLegalMarkdown = {
    title: string;
    effectiveDate: string | null;
    blocks: LegalBlock[];
};

export type LegalDocument = ParsedLegalMarkdown & {
    id: Exclude<LegalPage, 'hub'>;
    shortTitle: string;
    icon: IconName;
};
