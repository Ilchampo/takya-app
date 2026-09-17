import type { AppTheme } from '../theme/theme';
import type * as types from '../lib/types';

import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useFonts } from 'expo-font';

import { validateGovernmentApiConfig } from '../lib/services/governementApi.service';
import { useAppTheme } from './useAppTheme';
import { usePlateSearch } from './usePlateSearch';
import { useSavedLookup } from './useSavedLookup';
import { isValidPlate } from '../lib/utils/licensePlate.utils';

import * as dbService from '../lib/services/database.service';

export interface AppState {
    fontsLoaded: boolean;
    fontError: Error | null;
    ready: boolean;
    configurationError: string | null;
    storageAvailable: boolean;
    theme: AppTheme;
    showLegal: boolean;
    legalPage: types.LegalPage | null;
    showResult: boolean;
    closeResult: VoidFunction;
    refreshHistory: VoidFunction;
    plate: string;
    history: types.LookupHistoryItem[];
    result: types.LookupProgress | null;
    loading: boolean;
    error: string | null;
    savedPlate: string | null;
    savedResult: types.LookupResult | null;
    savedLoading: boolean;
    savedError: string | null;
    changePlate: (value: string) => void;
    runSearch: (value: string, options?: { refresh?: boolean }) => Promise<void>;
    cancelSearch: VoidFunction;
    openHistory: (key: string) => Promise<void>;
    closeHistory: VoidFunction;
    openLegal: VoidFunction;
    openLegalPage: (page: Exclude<types.LegalPage, 'hub'>) => void;
    closeLegal: VoidFunction;
    toggleTheme: VoidFunction;
    clearHistory: () => Promise<boolean>;
}

export const useApp = (): AppState => {
    const [fontsLoaded, fontError] = useFonts({
        LeckerliOne: require('../../assets/fonts/LeckerliOne-Regular.ttf'),
        'Avenir-Regular': require('../../assets/fonts/Avenir-Regular.otf'),
        'Avenir-Medium': require('../../assets/fonts/Avenir-Medium.otf'),
        'Avenir-Heavy': require('../../assets/fonts/Avenir-Heavy.otf'),
        'Avenir-Black': require('../../assets/fonts/Avenir-Black.otf'),
    });

    const [ready, setReady] = useState(false);
    const [configurationError] = useState(validateGovernmentApiConfig);
    const [storageAvailable, setStorageAvailable] = useState(true);
    const [history, setHistory] = useState<types.LookupHistoryItem[]>([]);
    const [legalStack, setLegalStack] = useState<types.LegalPage[]>([]);
    const [showResult, setShowResult] = useState(false);

    const onStorageError = useCallback((): void => {
        setStorageAvailable(false);
    }, []);

    const { theme, toggleTheme, hydrateTheme } = useAppTheme({
        onStorageError,
    });

    const {
        plate,
        result,
        loading,
        error,
        changePlate,
        runSearch: searchPlate,
        cancelSearch,
    } = usePlateSearch({
        onHistoryChange: setHistory,
        onStorageError,
    });

    const {
        savedPlate,
        savedResult,
        savedLoading,
        savedError,
        openHistory: openSavedHistory,
        closeHistory,
    } = useSavedLookup({
        onHistoryChange: setHistory,
    });

    const runSearch = useCallback(
        async (value: string, options?: { refresh?: boolean }): Promise<void> => {
            if (isValidPlate(value)) {
                setShowResult(true);
            }

            await searchPlate(value, options);
        },
        [searchPlate],
    );

    const closeResult = useCallback((): void => {
        cancelSearch();
        setShowResult(false);
        changePlate('');
    }, [cancelSearch, changePlate]);

    const refreshHistory = useCallback((): void => {
        if (!savedPlate) {
            return;
        }

        const value = savedPlate;

        closeHistory();
        changePlate(value);
        void runSearch(value, { refresh: true });
    }, [savedPlate, closeHistory, changePlate, runSearch]);

    useEffect(() => {
        let active = true;

        const prepare = async (): Promise<void> => {
            try {
                if (configurationError) {
                    return;
                }

                await dbService.initializeDatabase();

                const [savedTheme, recentLookups] = await Promise.all([
                    dbService.getThemeMode(),
                    dbService.listLookupHistory(),
                ]);

                if (active) {
                    hydrateTheme(savedTheme);
                    setHistory(recentLookups);
                }
            } catch {
                if (active) {
                    setStorageAvailable(false);
                }
            } finally {
                if (active) {
                    setReady(true);
                }
            }
        };

        void prepare();

        return () => {
            active = false;
        };
    }, [configurationError, hydrateTheme]);

    const legalPage = legalStack[legalStack.length - 1] ?? null;
    const showLegal = legalPage !== null;

    useEffect(() => {
        if (!showLegal && !savedPlate && !showResult) {
            return;
        }

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (showLegal) {
                setLegalStack((stack) => stack.slice(0, -1));
            } else if (showResult) {
                closeResult();
            } else {
                closeHistory();
            }

            return true;
        });

        return () => subscription.remove();
    }, [showLegal, savedPlate, showResult, closeHistory, closeResult]);

    const openHistory = useCallback(
        async (key: string): Promise<void> => {
            cancelSearch();
            setShowResult(false);
            await openSavedHistory(key);
        },
        [cancelSearch, openSavedHistory],
    );

    const openLegal = useCallback((): void => {
        cancelSearch();
        setLegalStack(['hub']);
    }, [cancelSearch]);

    const openLegalPage = useCallback((page: Exclude<types.LegalPage, 'hub'>): void => {
        setLegalStack((stack) => {
            const current = stack[stack.length - 1];

            if (current === page) {
                return stack;
            }

            return [...stack, page];
        });
    }, []);

    const closeLegal = useCallback((): void => {
        setLegalStack((stack) => stack.slice(0, -1));
    }, []);

    const clearHistory = useCallback(async (): Promise<boolean> => {
        cancelSearch();

        try {
            await dbService.clearLookupHistory();
            setHistory([]);
            return true;
        } catch {
            onStorageError();
            return false;
        }
    }, [cancelSearch, onStorageError]);

    return {
        fontsLoaded,
        fontError,
        ready,
        configurationError,
        storageAvailable,
        theme,
        showLegal,
        legalPage,
        showResult,
        closeResult,
        refreshHistory,
        plate,
        history,
        result,
        loading,
        error,
        savedPlate,
        savedResult,
        savedLoading,
        savedError,
        changePlate,
        runSearch,
        cancelSearch,
        openHistory,
        closeHistory,
        openLegal,
        openLegalPage,
        closeLegal,
        toggleTheme,
        clearHistory,
    };
};
