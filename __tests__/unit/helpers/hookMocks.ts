import { jest } from '@jest/globals';

export const mockSearch = jest.fn(async (..._args: unknown[]) => undefined as unknown);
export const mockListHistory = jest.fn(async (..._args: unknown[]) => [] as unknown[]);
export const mockGetCachedLookup = jest.fn(async (..._args: unknown[]) => null as unknown);
