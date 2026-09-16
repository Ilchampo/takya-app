import type * as types from '../lib/types';

import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizePlate, tryNormalizePlate } from '../lib/utils/licensePlate.utils';

import * as dbService from '../lib/services/database.service';
import * as searchService from '../lib/services/search.service';

const searchPlate = searchService.createPlateSearch({
    getCachedLookup: dbService.getCachedLookup,
    saveLookup: dbService.saveLookup,
});

const cancelledSource = {
    status: 'error' as const,
    message: 'Consulta cancelada.',
};

export const usePlateSearch = ({
    onHistoryChange,
    onStorageError,
}: types.UsePlateSearchOptions) => {
    const [plate, setPlate] = useState('');
    const [result, setResult] = useState<types.LookupProgress | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeSearch = useRef<{
        controller: AbortController;
        plate: string;
    } | null>(null);

    useEffect(() => {
        return () => {
            activeSearch.current?.controller.abort();
        };
    }, []);

    const cancelSearch = useCallback((): void => {
        activeSearch.current?.controller.abort();
        activeSearch.current = null;

        setLoading(false);
        setResult((current) =>
            current
                ? {
                      ...current,
                      sri: current.sri.status === 'loading' ? cancelledSource : current.sri,
                      fiscalia:
                          current.fiscalia.status === 'loading'
                              ? cancelledSource
                              : current.fiscalia,
                  }
                : null,
        );
    }, []);

    const runSearch = useCallback(
        async (value: string): Promise<void> => {
            let normalized: string;

            try {
                normalized = normalizePlate(value);
            } catch (cause) {
                setError(cause instanceof Error ? cause.message : 'Revisa la placa.');
                return;
            }

            if (activeSearch.current?.plate === normalized) {
                return;
            }

            activeSearch.current?.controller.abort();

            const controller = new AbortController();

            activeSearch.current = { controller, plate: normalized };

            const isCurrent = () =>
                activeSearch.current?.controller === controller && !controller.signal.aborted;

            setLoading(true);
            setError(null);

            try {
                await searchPlate(normalized, {
                    signal: controller.signal,
                    onUpdate: (next) => {
                        if (isCurrent()) {
                            setResult(next);
                        }
                    },
                });

                if (!isCurrent()) {
                    return;
                }

                try {
                    const recent = await dbService.listLookupHistory();

                    if (isCurrent()) {
                        onHistoryChange(recent);
                    }
                } catch {
                    if (isCurrent()) {
                        onStorageError();
                    }
                }
            } catch (cause) {
                if (isCurrent()) {
                    setError(
                        cause instanceof Error ? cause.message : 'Ocurrió un error inesperado.',
                    );
                }
            } finally {
                if (isCurrent()) {
                    activeSearch.current = null;
                    setLoading(false);
                }
            }
        },
        [onHistoryChange, onStorageError],
    );

    const changePlate = useCallback((value: string): void => {
        const normalized = tryNormalizePlate(value);
        const active = activeSearch.current;

        if (active && active.plate !== normalized) {
            active.controller.abort();
            activeSearch.current = null;
            setLoading(false);
        }

        setPlate(value);
        setError(null);
        setResult((current) => (current?.plate === normalized ? current : null));
    }, []);

    return {
        plate,
        result,
        loading,
        error,
        changePlate,
        runSearch,
        cancelSearch,
    };
};
