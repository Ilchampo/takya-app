import type * as types from '../types.ts';

import { parseJson, stringifyJson } from '../utils/misc.utils.ts';
import { sanitizeGovernmentData } from '../utils/privacy.utils.ts';

import config from '../configs/app.config.ts';
import * as SQLite from 'expo-sqlite';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDatabase = (): Promise<SQLite.SQLiteDatabase> => {
    databasePromise ??= SQLite.openDatabaseAsync('takya.db');

    return databasePromise;
};

const scrubCachedSensitiveData = async (database: SQLite.SQLiteDatabase): Promise<void> => {
    const rows = await database.getAllAsync<
        Pick<types.LookupRow, 'plate' | 'sri_json' | 'fiscalia_json'>
    >('SELECT plate, sri_json, fiscalia_json FROM lookups');

    await database.withTransactionAsync(async () => {
        for (const row of rows) {
            const sri = parseJson(row.sri_json);
            const fiscalia = parseJson(row.fiscalia_json);

            if (!sri.valid || !fiscalia.valid) {
                await database.runAsync('DELETE FROM lookups WHERE plate = ?', row.plate);
                continue;
            }

            const sanitizedSri = stringifyJson(sanitizeGovernmentData(sri.data));
            const sanitizedFiscalia = stringifyJson(sanitizeGovernmentData(fiscalia.data));

            if (sanitizedSri !== row.sri_json || sanitizedFiscalia !== row.fiscalia_json) {
                await database.runAsync(
                    'UPDATE lookups SET sri_json = ?, fiscalia_json = ? WHERE plate = ?',
                    sanitizedSri,
                    sanitizedFiscalia,
                    row.plate,
                );
            }
        }
    });
};

export const initializeDatabase = async (now = Date.now()): Promise<void> => {
    const database = await getDatabase();

    await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS lookups (
      plate TEXT PRIMARY KEY NOT NULL,
      sri_json TEXT NOT NULL,
      fiscalia_json TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS lookups_fetched_at ON lookups(fetched_at DESC);
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

    await deleteExpiredLookups(now);
    await scrubCachedSensitiveData(database);
    await trimHistory();
};

export const deleteExpiredLookups = async (now = Date.now()): Promise<void> => {
    const database = await getDatabase();

    await database.runAsync('DELETE FROM lookups WHERE fetched_at <= ?', now - config.service.TTL);
};

const trimHistory = async (): Promise<void> => {
    const database = await getDatabase();

    await database.runAsync(
        `DELETE FROM lookups
            WHERE plate NOT IN (
            SELECT plate FROM lookups ORDER BY fetched_at DESC LIMIT ?
     )`,
        config.service.historyLimit,
    );
};

export const getCachedLookup = async (
    plate: string,
    now = Date.now(),
): Promise<types.LookupResult | null> => {
    const database = await getDatabase();

    const row = await database.getFirstAsync<types.LookupRow>(
        'SELECT plate, sri_json, fiscalia_json, fetched_at FROM lookups WHERE plate = ? AND fetched_at > ?',
        plate,
        now - config.service.TTL,
    );

    if (!row) {
        return null;
    }

    const sri = parseJson(row.sri_json);
    const fiscalia = parseJson(row.fiscalia_json);

    if (!sri.valid || !fiscalia.valid) {
        await database.runAsync('DELETE FROM lookups WHERE plate = ?', row.plate);
        return null;
    }

    return {
        plate: row.plate,
        sri: {
            status: 'success',
            data: sanitizeGovernmentData(sri.data),
        },
        fiscalia: {
            status: 'success',
            data: sanitizeGovernmentData(fiscalia.data),
        },
        fetchedAt: row.fetched_at,
        fromCache: true,
    };
};

export const saveLookup = async (result: types.LookupResult): Promise<void> => {
    if (result.sri.status !== 'success' || result.fiscalia.status !== 'success') {
        return;
    }

    const sriData = sanitizeGovernmentData(result.sri.data);
    const fiscaliaData = sanitizeGovernmentData(result.fiscalia.data);
    const database = await getDatabase();

    await database.withTransactionAsync(async () => {
        await database.runAsync(
            `INSERT INTO lookups (plate, sri_json, fiscalia_json, fetched_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(plate) DO UPDATE SET
                    sri_json = excluded.sri_json,
                    fiscalia_json = excluded.fiscalia_json,
                    fetched_at = excluded.fetched_at`,
            result.plate,
            stringifyJson(sriData),
            stringifyJson(fiscaliaData),
            result.fetchedAt,
        );

        await trimHistory();
    });
};

export const listLookupHistory = async (now = Date.now()): Promise<types.LookupHistoryItem[]> => {
    const database = await getDatabase();

    return database.getAllAsync<types.LookupHistoryItem>(
        'SELECT plate, fetched_at AS fetchedAt FROM lookups WHERE fetched_at > ? ORDER BY fetched_at DESC LIMIT ?',
        now - config.service.TTL,
        config.service.historyLimit,
    );
};

export const getThemeMode = async (): Promise<types.ThemeMode | null> => {
    const database = await getDatabase();

    const row = await database.getFirstAsync<{ value: string }>(
        "SELECT value FROM settings WHERE key = 'theme'",
    );

    return row?.value === 'light' || row?.value === 'dark' ? row.value : null;
};

export const setThemeMode = async (mode: types.ThemeMode): Promise<void> => {
    const database = await getDatabase();

    await database.runAsync(
        `INSERT INTO settings (key, value) VALUES ('theme', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        mode,
    );
};
