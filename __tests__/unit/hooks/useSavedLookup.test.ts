import type * as types from '../../../src/lib/types.ts';

import assert from 'node:assert/strict';
import { beforeEach, jest, test } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { mockGetCachedLookup, mockListHistory } from '../helpers/hookMocks.ts';
import { useSavedLookup } from '../../../src/hooks/useSavedLookup.ts';

jest.mock('../../../src/lib/services/database.service', () => ({
    getCachedLookup: (...args: unknown[]) =>
        require('../helpers/hookMocks').mockGetCachedLookup(...args),
    listLookupHistory: () => require('../helpers/hookMocks').mockListHistory(),
}));

const mockOnHistoryChange = jest.fn();

const cached: types.LookupResult = {
    plate: 'PBC1234',
    fetchedAt: 1,
    fromCache: true,
    sri: { status: 'success', data: { numeroPlaca: 'PBC1234' } },
    fiscalia: { status: 'success', data: { cabecera: [] } },
};

beforeEach(() => {
    mockGetCachedLookup.mockReset();
    mockListHistory.mockReset();
    mockOnHistoryChange.mockReset();
    mockListHistory.mockResolvedValue([]);
});

const renderSaved = async () =>
    renderHook(() => useSavedLookup({ onHistoryChange: mockOnHistoryChange }));

test('openHistory loads a cached lookup', async () => {
    mockGetCachedLookup.mockResolvedValue(cached);

    const { result } = await renderSaved();

    await act(async () => {
        await result.current?.openHistory('PBC1234');
    });

    assert.equal(result.current?.savedPlate, 'PBC1234');
    assert.equal(result.current?.savedResult, cached);
    assert.equal(result.current?.savedLoading, false);
    assert.equal(result.current?.savedError, null);
});

test('a missing saved lookup shows an error and refreshes history', async () => {
    mockGetCachedLookup.mockResolvedValue(null);
    mockListHistory.mockResolvedValue([]);

    const { result } = await renderSaved();

    await act(async () => {
        await result.current?.openHistory('PBC1234');
    });

    assert.equal(result.current?.savedResult, null);
    assert.match(result.current?.savedError ?? '', /ya no está guardada/);
    assert.equal(mockOnHistoryChange.mock.calls.length, 1);
});

test('a newer openHistory ignores a stale response', async () => {
    let releaseFirst!: (value: types.LookupResult | null) => void;

    mockGetCachedLookup
        .mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    releaseFirst = resolve;
                }),
        )
        .mockResolvedValueOnce(cached);

    const { result } = await renderSaved();

    let first: Promise<void> = Promise.resolve();

    await act(async () => {
        first = result.current?.openHistory('ABC0123') ?? first;
    });

    await act(async () => {
        await result.current?.openHistory('PBC1234');
        releaseFirst(cached);
        await first;
    });

    assert.equal(result.current?.savedPlate, 'PBC1234');
    assert.equal(result.current?.savedResult, cached);
});

test('closeHistory clears the saved lookup', async () => {
    mockGetCachedLookup.mockResolvedValue(cached);

    const { result } = await renderSaved();

    await act(async () => {
        await result.current?.openHistory('PBC1234');
        result.current?.closeHistory();
    });

    assert.equal(result.current?.savedPlate, null);
    assert.equal(result.current?.savedResult, null);
    assert.equal(result.current?.savedError, null);
});
