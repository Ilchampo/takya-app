import { jest } from '@jest/globals';

import { createTheme } from '../../../src/theme/theme.ts';

export const mockSearch = {
    plate: 'ABC-1234',
    result: null as unknown,
    loading: false,
    error: null as string | null,
    changePlate: jest.fn((...args: unknown[]) => {
        mockSearch.plate = String(args[0] ?? '');
    }),
    runSearch: jest.fn(async (..._args: unknown[]): Promise<void> => undefined),
    cancelSearch: jest.fn(),
};

export const mockSaved = {
    savedPlate: null as string | null,
    savedResult: null as unknown,
    savedLoading: false,
    savedError: null as string | null,
    openHistory: jest.fn(async (...args: unknown[]) => {
        mockSaved.savedPlate = String(args[0] ?? '');
    }),
    closeHistory: jest.fn(() => {
        mockSaved.savedPlate = null;
    }),
};

export const mockTheme = {
    theme: createTheme('light'),
    toggleTheme: jest.fn(),
    hydrateTheme: jest.fn(),
};

export const mockInitializeDatabase = jest.fn(async (): Promise<void> => undefined);

export const mockGetThemeMode = jest.fn(
    async (..._args: unknown[]): Promise<'light' | 'dark' | null> => null,
);

export const mockListHistory = jest.fn(async (..._args: unknown[]): Promise<unknown[]> => []);

export const mockClearHistory = jest.fn(async (..._args: unknown[]): Promise<void> => undefined);

export const backHandlers: (() => boolean)[] = [];
