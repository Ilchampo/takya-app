import type * as types from '../types.ts';
import type { AppTheme } from '../../theme/theme';

import config from '../configs/app.config.ts';

export const sourcePresentation = (source?: types.SourceProgress): types.SourcePresentation => {
    if (!source) {
        return {
            tone: 'idle',
            label: 'Sin consultar',
            icon: 'clock',
            note: 'Ingresa una placa para consultar esta fuente.',
        };
    }

    switch (source.status) {
        case 'loading':
            return {
                tone: 'loading',
                label:
                    source.attempt > 1
                        ? `Reintentando · ${source.attempt - 1} de ${config.service.maxRetries}`
                        : 'Consultando…',
                icon: 'clock',
                note: 'Esperando una respuesta. Puedes revisar la otra fuente mientras tanto.',
            };
        case 'success':
            return {
                tone: 'success',
                label: 'Respuesta recibida',
                icon: 'check',
                note: null,
            };
        case 'error':
            return {
                tone: 'error',
                label: 'No disponible',
                icon: 'info',
                note: source.message,
            };
        default:
            return {
                tone: 'error',
                label: 'Estado desconocido',
                icon: 'info',
                note: 'Encontramos un estado desconocido.',
            };
    }
};

export const toneColors = (
    tone: types.SourceTone,
    theme: AppTheme,
): { color: string; background: string } => {
    switch (tone) {
        case 'success':
            return {
                color: theme.colors.success,
                background: theme.colors.successMuted,
            };
        case 'error':
            return {
                color: theme.colors.danger,
                background: theme.colors.dangerMuted,
            };
        default:
            return {
                color: theme.colors.primaryPressed,
                background: theme.colors.surfaceMuted,
            };
    }
};
