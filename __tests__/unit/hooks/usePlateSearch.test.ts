import assert from 'node:assert/strict';
import { beforeEach, jest, test } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { mockListHistory, mockSearch } from '../helpers/hookMocks.ts';

jest.mock('../../../src/lib/services/search.service', () => ({
    createPlateSearch: () => require('../helpers/hookMocks').mockSearch,
}));

jest.mock('../../../src/lib/services/database.service', () => ({
    getCachedLookup: jest.fn(),
    saveLookup: jest.fn(),
    consumeLookupRateLimit: jest.fn(),
    getSourceCooldown: jest.fn(),
    setSourceCooldown: jest.fn(),
    listLookupHistory: () => require('../helpers/hookMocks').mockListHistory(),
}));

import { usePlateSearch } from '../../../src/hooks/usePlateSearch.ts';

const mockOnHistoryChange = jest.fn();
const mockOnStorageError = jest.fn();

const completed = {
    plate: 'ABC1234',
    fetchedAt: 1,
    fromCache: false,
    sri: { status: 'success' as const, data: { numeroPlaca: 'ABC1234' } },
    fiscalia: { status: 'success' as const, data: { cabecera: [] } },
};

beforeEach(() => {
    mockSearch.mockReset();
    mockListHistory.mockClear();
    mockOnHistoryChange.mockClear();
    mockOnStorageError.mockClear();
    mockListHistory.mockResolvedValue([]);
    mockSearch.mockImplementation(async (...args: unknown[]) => {
        const options = args[1] as { onUpdate: (value: unknown) => void };
        options.onUpdate(completed);
        return completed;
    });
});

const renderSearch = async () =>
    renderHook(() =>
        usePlateSearch({
            onHistoryChange: mockOnHistoryChange,
            onStorageError: mockOnStorageError,
        }),
    );

test('invalid plates set an error and never start a lookup', async () => {
    const { result } = await renderSearch();

    await act(async () => {
        await result.current?.runSearch('nope');
    });

    assert.match(result.current?.error ?? '', /3 letras/);
    assert.equal(mockSearch.mock.calls.length, 0);
    assert.equal(result.current?.loading, false);
});

test('the same in-flight plate is ignored unless the caller asks for a refresh', async () => {
    mockSearch.mockImplementation((...args: unknown[]) => {
        const options = args[1] as { signal: AbortSignal };
        return new Promise((_resolve, reject) => {
            options.signal.addEventListener(
                'abort',
                () => {
                    const error = new Error('Consulta cancelada.');
                    error.name = 'AbortError';
                    reject(error);
                },
                { once: true },
            );
        });
    });

    const { result } = await renderSearch();

    await act(async () => {
        void result.current?.runSearch('ABC-1234');
        void result.current?.runSearch('ABC-1234');
        void result.current?.runSearch('ABC-1234', { refresh: true });
    });

    assert.equal(mockSearch.mock.calls.length, 2);
});

test('cancelSearch marks in-flight sources as cancelled', async () => {
    mockSearch.mockImplementation((...args: unknown[]) => {
        const options = args[1] as { signal: AbortSignal; onUpdate: (value: unknown) => void };
        return new Promise((_resolve, reject) => {
            options.onUpdate({
                plate: 'ABC1234',
                fetchedAt: 1,
                fromCache: false,
                sri: { status: 'loading', attempt: 1 },
                fiscalia: { status: 'loading', attempt: 1 },
            });
            options.signal.addEventListener(
                'abort',
                () => {
                    const error = new Error('Consulta cancelada.');
                    error.name = 'AbortError';
                    reject(error);
                },
                { once: true },
            );
        });
    });

    const { result } = await renderSearch();

    let running: Promise<void> = Promise.resolve();
    await act(async () => {
        running = result.current?.runSearch('ABC-1234') ?? running;
    });

    await act(async () => {
        result.current?.cancelSearch();
        await running;
    });

    assert.equal(result.current?.loading, false);
    assert.equal(result.current?.result?.sri.status, 'error');
    assert.equal(result.current?.result?.fiscalia.status, 'error');
});

test('changing the plate aborts a lookup for a different plate', async () => {
    const { result } = await renderSearch();

    mockSearch.mockImplementation((...args: unknown[]) => {
        const options = args[1] as { signal: AbortSignal };
        return new Promise((_resolve, reject) => {
            options.signal.addEventListener(
                'abort',
                () => {
                    const error = new Error('Consulta cancelada.');
                    error.name = 'AbortError';
                    reject(error);
                },
                { once: true },
            );
        });
    });

    let running: Promise<void> = Promise.resolve();
    await act(async () => {
        running = result.current?.runSearch('ABC-1234') ?? running;
    });

    await act(async () => {
        result.current?.changePlate('PBC-1234');
        await running;
    });

    assert.equal(result.current?.plate, 'PBC-1234');
    assert.equal(result.current?.loading, false);
    assert.equal(result.current?.result, null);
});
