import { jest } from '@jest/globals';

export const mockSearch = jest.fn(async (..._args: unknown[]): Promise<unknown> => undefined);

export const mockListHistory = jest.fn(async (..._args: unknown[]): Promise<unknown[]> => []);

export const mockGetCachedLookup = jest.fn(async (..._args: unknown[]): Promise<unknown> => null);
