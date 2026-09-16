import type { AppTheme } from '../theme/theme';
import type * as types from '../lib/types';

import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useFonts } from 'expo-font';

import { useAppTheme } from './useAppTheme';
import { usePlateSearch } from './usePlateSearch';
import { useSavedLookup } from './useSavedLookup';

import * as dbService from '../lib/services/database.service';

export interface AppState {
    fontsLoaded: boolean;
    fontError: Error | null;
    ready: boolean;
    storageAvailable: boolean;
    theme: AppTheme;
    showLegal: boolean;
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
    runSearch: (value: string) => Promise<void>;
    cancelSearch: VoidFunction;
    openHistory: (key: string) => Promise<void>;
    closeHistory: VoidFunction;
    openLegal: VoidFunction;
    closeLegal: VoidFunction;
    toggleTheme: VoidFunction;
}

export const useApp = (): AppState => {
    const [fontsLoaded, fontError] = useFonts({
        LeckerliOne: require('../../assets/LeckerliOne-Regular.ttf'),
    });

    const [ready, setReady] = useState(false);
    const [storageAvailable, setStorageAvailable] = useState(true);
    const [history, setHistory] = useState<types.LookupHistoryItem[]>([]);
    const [showLegal, setShowLegal] = useState(false);

    const onStorageError = useCallback((): void => {
        setStorageAvailable(false);
    }, []);

    const { theme, toggleTheme, hydrateTheme } = useAppTheme({
        onStorageError,
    });

    const { plate, result, loading, error, changePlate, runSearch, cancelSearch } = usePlateSearch({
        onHistoryChange: setHistory,
        onStorageError,
    });

    const { savedPlate, savedResult, savedLoading, savedError, openHistory, closeHistory } =
        useSavedLookup({
            onHistoryChange: setHistory,
        });

    useEffect(() => {
        let active = true;

        const prepare = async (): Promise<void> => {
            try {
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
    }, [hydrateTheme]);

    useEffect(() => {
        if (!showLegal && !savedPlate) {
            return;
        }

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (showLegal) {
                setShowLegal(false);
            } else {
                closeHistory();
            }

            return true;
        });

        return () => subscription.remove();
    }, [showLegal, savedPlate, closeHistory]);

    const openLegal = useCallback((): void => {
        setShowLegal(true);
    }, []);

    const closeLegal = useCallback((): void => {
        setShowLegal(false);
    }, []);

    return {
        fontsLoaded,
        fontError,
        ready,
        storageAvailable,
        theme,
        showLegal,
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
        closeLegal,
        toggleTheme,
    };
};
