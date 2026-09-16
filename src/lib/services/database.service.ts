import type * as types from '../types.ts';

import { asRecord, parseJson, stringifyJson } from '../utils/misc.utils.ts';
import { tryNormalizePlate } from '../utils/licensePlate.utils.ts';
import {
    isVehicleNotFoundProjection,
    projectFiscaliaData,
    projectVehicleData,
} from '../utils/privacy.utils.ts';
import { Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import config from '../configs/app.config.ts';
import * as SQLite from 'expo-sqlite';

const SOURCE_UNAVAILABLE_KEY = '__sourceUnavailable';

const MISSING_CACHED_SOURCE: types.FailedSource = {
    status: 'error',
    message: 'Sin respuesta guardada para esta fuente.',
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const unavailablePayload = (): Record<string, unknown> => ({
    [SOURCE_UNAVAILABLE_KEY]: true,
});

const isUnavailablePayload = (data: Record<string, unknown>): boolean =>
    data[SOURCE_UNAVAILABLE_KEY] === true;

const matchesLookupPlate = (data: Record<string, unknown>, plate: string): boolean =>
    isVehicleNotFoundProjection(data) || tryNormalizePlate(String(data.numeroPlaca)) === plate;

const payloadForSri = (
    result: types.SourceResult,
    plate: string,
): Record<string, unknown> | null => {
    if (result.status !== 'success') {
        return null;
    }

    const data = projectVehicleData(result.data);

    if (!data || !matchesLookupPlate(data, plate)) {
        return null;
    }

    return data;
};

const payloadForFiscalia = (
    result: types.SourceResult,
    endDate: number,
): Record<string, unknown> | null => {
    if (result.status !== 'success') {
        return null;
    }

    return projectFiscaliaData(result.data, endDate, config.service.incidentMonths);
};

const sourceFromSriPayload = (
    data: Record<string, unknown>,
    plate: string,
): types.SuccessfulSource | null => {
    if (isUnavailablePayload(data)) {
        return null;
    }

    const projected = projectVehicleData(data);

    if (!projected || !matchesLookupPlate(projected, plate)) {
        return null;
    }

    return {
        status: 'success',
        data: projected,
    };
};

const sourceFromFiscaliaPayload = (
    data: Record<string, unknown>,
    endDate: number,
): types.SuccessfulSource | null => {
    if (isUnavailablePayload(data)) {
        return null;
    }

    const projected = projectFiscaliaData(data, endDate, config.service.incidentMonths);

    if (!projected) {
        return null;
    }

    return {
        status: 'success',
        data: projected,
    };
};

const recordFromSource = (source: types.SuccessfulSource | null): Record<string, unknown> | null =>
    source ? asRecord(source.data) : null;

const persistableLookupPayloads = (
    result: types.LookupResult,
    existing?: {
        sri: Record<string, unknown> | null;
        fiscalia: Record<string, unknown> | null;
        fetchedAt: number;
    },
): { sri: Record<string, unknown>; fiscalia: Record<string, unknown> } | null => {
    const sri =
        payloadForSri(result.sri, result.plate) ??
        recordFromSource(existing?.sri ? sourceFromSriPayload(existing.sri, result.plate) : null);

    const fiscalia =
        payloadForFiscalia(result.fiscalia, result.fetchedAt) ??
        recordFromSource(
            existing?.fiscalia
                ? sourceFromFiscaliaPayload(existing.fiscalia, existing.fetchedAt)
                : null,
        );

    if (!sri && !fiscalia) {
        return null;
    }

    return {
        sri: sri ?? unavailablePayload(),
        fiscalia: fiscalia ?? unavailablePayload(),
    };
};

const lookupFromCachedPayloads = (
    plate: string,
    sriData: Record<string, unknown> | null,
    fiscaliaData: Record<string, unknown> | null,
    endDate: number,
): { sri: types.SuccessfulSource | null; fiscalia: types.SuccessfulSource | null } | null => {
    const sri = sriData ? sourceFromSriPayload(sriData, plate) : null;
    const fiscalia = fiscaliaData ? sourceFromFiscaliaPayload(fiscaliaData, endDate) : null;

    if (!sri && !fiscalia) {
        return null;
    }

    return { sri, fiscalia };
};

const cachedSourceResult = (source: types.SuccessfulSource | null): types.SourceResult =>
    source ?? MISSING_CACHED_SOURCE;

const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (Platform.OS === 'ios') {
        await SQLite.deleteDatabaseAsync('takya.db').catch(() => undefined);
        return SQLite.openDatabaseAsync('takya.db', {}, Paths.cache.uri);
    }

    return SQLite.openDatabaseAsync('takya.db');
};

const getDatabase = (): Promise<SQLite.SQLiteDatabase> => {
    databasePromise ??= openDatabase();

    return databasePromise;
};

const scrubCachedSensitiveData = async (database: SQLite.SQLiteDatabase): Promise<void> => {
    const rows = await database.getAllAsync<
        Pick<types.LookupRow, 'plate' | 'sri_json' | 'fiscalia_json' | 'fetched_at'>
    >('SELECT plate, sri_json, fiscalia_json, fetched_at FROM lookups');

    await database.withTransactionAsync(async () => {
        for (const row of rows) {
            const sri = parseJson(row.sri_json);
            const fiscalia = parseJson(row.fiscalia_json);

            const sources = lookupFromCachedPayloads(
                row.plate,
                sri.valid ? sri.data : null,
                fiscalia.valid ? fiscalia.data : null,
                row.fetched_at,
            );

            if (!sources) {
                await database.runAsync('DELETE FROM lookups WHERE plate = ?', row.plate);
                continue;
            }

            const sanitizedSri = stringifyJson(
                sources.sri ? sources.sri.data : unavailablePayload(),
            );

            const sanitizedFiscalia = stringifyJson(
                sources.fiscalia ? sources.fiscalia.data : unavailablePayload(),
            );

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
    PRAGMA secure_delete = ON;
    
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

    PRAGMA user_version = 1;
  `);

    await deleteExpiredLookups(now);
    await scrubCachedSensitiveData(database);
    await trimHistory();

    await database.runAsync(
        'DELETE FROM lookup_rate_events WHERE requested_at <= ? OR requested_at > ?',
        now - config.service.rateLimit.window,
        now,
    );

    await database.runAsync('DELETE FROM source_cooldowns WHERE cooldown_until <= ?', now);
    await database.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
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
    const sources = lookupFromCachedPayloads(
        row.plate,
        sri.valid ? sri.data : null,
        fiscalia.valid ? fiscalia.data : null,
        row.fetched_at,
    );

    if (!sources) {
        await database.runAsync('DELETE FROM lookups WHERE plate = ?', row.plate);
        return null;
    }

    return {
        plate: row.plate,
        sri: cachedSourceResult(sources.sri),
        fiscalia: cachedSourceResult(sources.fiscalia),
        fetchedAt: row.fetched_at,
        fromCache: true,
    };
};

export const saveLookup = async (result: types.LookupResult): Promise<void> => {
    const database = await getDatabase();

    await database.withTransactionAsync(async () => {
        const row = await database.getFirstAsync<types.LookupRow>(
            'SELECT plate, sri_json, fiscalia_json, fetched_at FROM lookups WHERE plate = ?',
            result.plate,
        );

        const sriJson = row ? parseJson(row.sri_json) : { valid: false as const };
        const fiscaliaJson = row ? parseJson(row.fiscalia_json) : { valid: false as const };

        const payloads = persistableLookupPayloads(result, {
            sri: sriJson.valid ? sriJson.data : null,
            fiscalia: fiscaliaJson.valid ? fiscaliaJson.data : null,
            fetchedAt: row?.fetched_at ?? result.fetchedAt,
        });

        if (!payloads) {
            return;
        }

        await database.runAsync(
            `INSERT INTO lookups (plate, sri_json, fiscalia_json, fetched_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(plate) DO UPDATE SET
                    sri_json = excluded.sri_json,
                    fiscalia_json = excluded.fiscalia_json,
                    fetched_at = excluded.fetched_at`,
            result.plate,
            stringifyJson(payloads.sri),
            stringifyJson(payloads.fiscalia),
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

    await database.execAsync(`
      PRAGMA secure_delete = ON;
      DELETE FROM lookups;
      PRAGMA wal_checkpoint(TRUNCATE);
      VACUUM;
      PRAGMA wal_checkpoint(TRUNCATE);
    `);
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
            'DELETE FROM lookup_rate_events WHERE requested_at <= ? OR requested_at > ?',
            windowStartedAt,
            now,
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
