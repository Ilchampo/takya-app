import type { LegalDocument } from '../lib/interfaces/legal.interface.ts';

import { parseLegalMarkdown } from '../lib/utils/legalMarkdown.utils.ts';

import { privacyPolicyMarkdown } from './privacyPolicy.data.ts';
import { termsOfServiceMarkdown } from './termsOfService.data.ts';

export const privacyPolicy: LegalDocument = {
    id: 'privacy',
    shortTitle: 'Política de privacidad',
    icon: 'shield',
    ...parseLegalMarkdown(privacyPolicyMarkdown),
};

export const termsOfService: LegalDocument = {
    id: 'terms',
    shortTitle: 'Términos y condiciones',
    icon: 'file',
    ...parseLegalMarkdown(termsOfServiceMarkdown),
};

export const legalDocuments = {
    privacy: privacyPolicy,
    terms: termsOfService,
} as const;
