import type * as types from '../types.ts';

export class ServiceTimeoutError extends Error {
    constructor(message = 'La consulta tardó demasiado. Intenta otra vez.') {
        super(message);
        this.name = 'ServiceTimeoutError';
    }
}

export class GovernmentApiError extends Error {
    diagnostics?: types.Diagnostics;

    constructor(message: string, diagnostics?: types.Diagnostics) {
        super(message);
        this.name = 'GovernmentApiError';
        this.diagnostics = diagnostics;
    }
}
