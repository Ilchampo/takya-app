import type * as types from '../types.ts';

import { parseJson, stringifyJson } from '../utils/misc.utils.ts';
import { projectFiscaliaData, projectVehicleData } from '../utils/privacy.utils.ts';

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

            const projectedSri = projectVehicleData(sri.data);
            const projectedFiscalia = projectFiscaliaData(fiscalia.data);

            if (!projectedSri || !projectedFiscalia) {
                await database.runAsync('DELETE FROM lookups WHERE plate = ?', row.plate);
                continue;
            }

            const sanitizedSri = stringifyJson(projectedSri);
            const sanitizedFiscalia = stringifyJson(projectedFiscalia);

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

    CREATE TABLE IF NOT EXISTS lookup_rate_events (
      requested_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS lookup_rate_events_requested_at
      ON lookup_rate_events(requested_at);

    CREATE TABLE IF NOT EXISTS source_cooldowns (
      source TEXT PRIMARY KEY NOT NULL,
      cooldown_until INTEGER NOT NULL
    );
  `);

    await deleteExpiredLookups(now);
    await scrubCachedSensitiveData(database);
    await trimHistory();

    await database.runAsync(
        'DELETE FROM lookup_rate_events WHERE requested_at <= ?',
        now - config.service.rateLimit.window,
    );

    await database.runAsync('DELETE FROM source_cooldowns WHERE cooldown_until <= ?', now);
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

    const projectedSri = projectVehicleData(sri.data);
    const projectedFiscalia = projectFiscaliaData(fiscalia.data);

    if (!projectedSri || !projectedFiscalia) {
        await database.runAsync('DELETE FROM lookups WHERE plate = ?', row.plate);
        return null;
    }

    return {
        plate: row.plate,
        sri: {
            status: 'success',
            data: projectedSri,
        },
        fiscalia: {
            status: 'success',
            data: projectedFiscalia,
        },
        fetchedAt: row.fetched_at,
        fromCache: true,
    };
};

export const saveLookup = async (result: types.LookupResult): Promise<void> => {
    if (result.sri.status !== 'success' || result.fiscalia.status !== 'success') {
        return;
    }

    const sriData = projectVehicleData(result.sri.data);
    const fiscaliaData = projectFiscaliaData(result.fiscalia.data);

    if (!sriData || !fiscaliaData) {
        return;
    }

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

export const clearLookupHistory = async (): Promise<void> => {
    const database = await getDatabase();

    await database.runAsync('DELETE FROM lookups');
};

export const consumeLookupRateLimit = async (
    now = Date.now(),
): Promise<types.RateLimitDecision> => {
    const database = await getDatabase();
    const windowStartedAt = now - config.service.rateLimit.window;

    let decision: types.RateLimitDecision = {
        allowed: false,
        retryAfterMs: config.service.rateLimit.window,
    };

    await database.withTransactionAsync(async () => {
        await database.runAsync(
            'DELETE FROM lookup_rate_events WHERE requested_at <= ?',
            windowStartedAt,
        );

        const state = await database.getFirstAsync<{
            requestCount: number;
            oldestRequest: number | null;
        }>(
            `SELECT
                COUNT(*) AS requestCount,
                MIN(requested_at) AS oldestRequest
             FROM lookup_rate_events`,
        );

        if ((state?.requestCount ?? 0) >= config.service.rateLimit.maxRequests) {
            const oldestRequest = state?.oldestRequest ?? now;

            decision = {
                allowed: false,
                retryAfterMs: Math.max(
                    1_000,
                    Math.min(
                        config.service.rateLimit.window,
                        oldestRequest + config.service.rateLimit.window - now,
                    ),
                ),
            };

            return;
        }

        await database.runAsync('INSERT INTO lookup_rate_events (requested_at) VALUES (?)', now);

        decision = { allowed: true };
    });

    return decision;
};

export const getSourceCooldown = async (
    source: types.ServiceId,
    now = Date.now(),
): Promise<number> => {
    const database = await getDatabase();

    const row = await database.getFirstAsync<{ cooldownUntil: number }>(
        'SELECT cooldown_until AS cooldownUntil FROM source_cooldowns WHERE source = ?',
        source,
    );

    if (!row) {
        return 0;
    }

    if (row.cooldownUntil <= now) {
        await database.runAsync('DELETE FROM source_cooldowns WHERE source = ?', source);
        return 0;
    }

    return row.cooldownUntil - now;
};

export const setSourceCooldown = async (
    source: types.ServiceId,
    cooldownUntil: number,
): Promise<void> => {
    if (!Number.isFinite(cooldownUntil) || cooldownUntil <= Date.now()) {
        return;
    }

    const database = await getDatabase();

    await database.runAsync(
        `INSERT INTO source_cooldowns (source, cooldown_until)
         VALUES (?, ?)
         ON CONFLICT(source) DO UPDATE SET
           cooldown_until = MAX(source_cooldowns.cooldown_until, excluded.cooldown_until)`,
        source,
        cooldownUntil,
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
