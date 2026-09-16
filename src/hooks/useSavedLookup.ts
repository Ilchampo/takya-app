import type { UseSavedLookupOptions } from '../lib/types';
import type * as types from '../lib/types';

import { useCallback, useEffect, useRef, useState } from 'react';

import * as dbService from '../lib/services/database.service';

export const useSavedLookup = ({ onHistoryChange }: UseSavedLookupOptions) => {
    const [savedPlate, setSavedPlate] = useState<string | null>(null);
    const [savedResult, setSavedResult] = useState<types.LookupResult | null>(null);
    const [savedLoading, setSavedLoading] = useState(false);
    const [savedError, setSavedError] = useState<string | null>(null);
    const historyRequest = useRef(0);

    useEffect(() => {
        return () => {
            historyRequest.current++;
        };
    }, []);

    const closeHistory = useCallback((): void => {
        historyRequest.current++;

        setSavedPlate(null);
        setSavedResult(null);
    }, []);

    const openHistory = useCallback(
        async (key: string): Promise<void> => {
            const requestId = ++historyRequest.current;

            setSavedPlate(key);
            setSavedResult(null);
            setSavedError(null);
            setSavedLoading(true);

            try {
                const cached = await dbService.getCachedLookup(key);

                if (requestId !== historyRequest.current) {
                    return;
                }

                setSavedResult(cached);

                if (!cached) {
                    setSavedError(
                        'Esta consulta ya no está guardada. Vuelve al inicio para realizar una nueva.',
                    );

                    const recent = await dbService.listLookupHistory();

                    if (requestId === historyRequest.current) {
                        onHistoryChange(recent);
                    }
                }
            } catch {
                if (requestId === historyRequest.current) {
                    setSavedError('No se pudo abrir la consulta guardada.');
                }
            } finally {
                if (requestId === historyRequest.current) {
                    setSavedLoading(false);
                }
            }
        },
        [onHistoryChange],
    );

    return {
        savedPlate,
        savedResult,
        savedLoading,
        savedError,
        openHistory,
        closeHistory,
    };
};
