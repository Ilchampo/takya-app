import assert from 'node:assert/strict';
import { beforeEach, jest, test } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { BackHandler } from 'react-native';

import {
    backHandlers,
    mockClearHistory,
    mockGetThemeMode,
    mockInitializeDatabase,
    mockListHistory,
    mockSaved,
    mockSearch,
    mockTheme,
} from '../helpers/appHookMocks.ts';

jest.mock('expo-font', () => ({
    useFonts: () => [true, null],
}));

jest.mock('../../../src/hooks/usePlateSearch', () => ({
    usePlateSearch: () => require('../helpers/appHookMocks').mockSearch,
}));

jest.mock('../../../src/hooks/useSavedLookup', () => ({
    useSavedLookup: () => require('../helpers/appHookMocks').mockSaved,
}));

jest.mock('../../../src/hooks/useAppTheme', () => ({
    useAppTheme: () => require('../helpers/appHookMocks').mockTheme,
}));

jest.mock('../../../src/lib/services/database.service', () => ({
    initializeDatabase: () => require('../helpers/appHookMocks').mockInitializeDatabase(),
    getThemeMode: () => require('../helpers/appHookMocks').mockGetThemeMode(),
    listLookupHistory: () => require('../helpers/appHookMocks').mockListHistory(),
    clearLookupHistory: () => require('../helpers/appHookMocks').mockClearHistory(),
}));

jest.mock('../../../src/lib/services/governementApi.service', () => ({
    validateGovernmentApiConfig: () => null,
}));

import { useApp } from '../../../src/hooks/useApp.ts';

beforeEach(() => {
    mockSearch.plate = 'ABC-1234';
    mockSearch.result = null;
    mockSearch.loading = false;
    mockSearch.error = null;
    mockSearch.changePlate.mockClear();
    mockSearch.runSearch.mockClear();
    mockSearch.cancelSearch.mockClear();
    mockSaved.savedPlate = null;
    mockSaved.openHistory.mockClear();
    mockSaved.closeHistory.mockClear();
    mockTheme.hydrateTheme.mockClear();
    mockInitializeDatabase.mockClear();
    mockClearHistory.mockClear();
    mockListHistory.mockResolvedValue([]);
    mockGetThemeMode.mockResolvedValue(null);
    backHandlers.length = 0;
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((...args: unknown[]) => {
        backHandlers.push(args[1] as () => boolean);
        return { remove: jest.fn() } as never;
    });
});

const renderApp = async () => renderHook(() => useApp());

test('startup hydrates storage and a valid plate opens the result view', async () => {
    const { result } = await renderApp();

    await act(async () => {
        await Promise.resolve();
    });

    assert.equal(result.current?.ready, true);
    assert.equal(mockInitializeDatabase.mock.calls.length, 1);
    assert.equal(result.current?.showResult, false);

    await act(async () => {
        await result.current?.runSearch('ABC-1234');
    });

    assert.equal(result.current?.showResult, true);
    assert.equal(mockSearch.runSearch.mock.calls.length, 1);
});

test('closeResult cancels the lookup and clears the plate', async () => {
    const { result } = await renderApp();

    await act(async () => {
        await result.current?.runSearch('ABC-1234');
        result.current?.closeResult();
    });

    assert.equal(result.current?.showResult, false);
    assert.equal(mockSearch.cancelSearch.mock.calls.length, 1);
    assert.equal(mockSearch.changePlate.mock.calls.at(-1)?.[0], '');
});

test('legal pages stack and pop', async () => {
    const { result } = await renderApp();

    await act(async () => {
        result.current?.openLegal();
        result.current?.openLegalPage('privacy');
        result.current?.openLegalPage('privacy');
    });

    assert.equal(result.current?.legalPage, 'privacy');
    assert.equal(result.current?.showLegal, true);

    await act(async () => {
        result.current?.closeLegal();
    });

    assert.equal(result.current?.legalPage, 'hub');

    await act(async () => {
        result.current?.closeLegal();
    });

    assert.equal(result.current?.showLegal, false);
});

test('refreshHistory re-queries the saved plate', async () => {
    mockSaved.savedPlate = 'PBC1234';
    const { result } = await renderApp();

    await act(async () => {
        result.current?.refreshHistory();
        await Promise.resolve();
    });

    assert.equal(mockSaved.closeHistory.mock.calls.length, 1);
    assert.equal(mockSearch.changePlate.mock.calls.at(-1)?.[0], 'PBC1234');
    assert.equal(mockSearch.runSearch.mock.calls.at(-1)?.[0], 'PBC1234');
    assert.deepEqual(mockSearch.runSearch.mock.calls.at(-1)?.[1], { refresh: true });
});

test('clearHistory empties local history when storage succeeds', async () => {
    const { result } = await renderApp();

    let cleared = false;
    await act(async () => {
        cleared = (await result.current?.clearHistory()) ?? false;
    });

    assert.equal(cleared, true);
    assert.equal(mockClearHistory.mock.calls.length, 1);
    assert.deepEqual(result.current?.history, []);
});

test('hardware back closes the result view', async () => {
    const { result } = await renderApp();

    await act(async () => {
        await result.current?.runSearch('ABC-1234');
    });

    const handler = backHandlers.at(-1);
    assert.equal(typeof handler, 'function');

    await act(async () => {
        handler?.();
    });

    assert.equal(result.current?.showResult, false);
});
