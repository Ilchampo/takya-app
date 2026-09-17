import type { LookupRow } from '../../../src/lib/types.ts';

const compactSql = (sql: string): string => sql.replace(/\s+/g, ' ').trim().toLowerCase();

export class FakeSqliteDatabase {
    lookups = new Map<string, LookupRow>();
    settings = new Map<string, string>();
    rateEvents: number[] = [];
    cooldowns = new Map<string, number>();
    deletedDatabases: string[] = [];

    clear(): void {
        this.lookups.clear();
        this.settings.clear();
        this.rateEvents = [];
        this.cooldowns.clear();
        this.deletedDatabases = [];
    }

    async execAsync(sql: string): Promise<void> {
        for (const statement of sql.split(';').map(compactSql).filter(Boolean)) {
            if (statement === 'delete from lookups') {
                this.lookups.clear();
            }
        }
    }

    async runAsync(sql: string, ...params: unknown[]): Promise<void> {
        const statement = compactSql(sql);

        if (statement.startsWith('delete from lookups where fetched_at <= ?')) {
            const threshold = Number(params[0]);
            for (const [plate, row] of this.lookups) {
                if (row.fetched_at <= threshold) {
                    this.lookups.delete(plate);
                }
            }
            return;
        }

        if (statement.includes('delete from lookups') && statement.includes('not in')) {
            const limit = Number(params[0]);
            const keep = [...this.lookups.values()]
                .sort((left, right) => right.fetched_at - left.fetched_at)
                .slice(0, limit)
                .map((row) => row.plate);
            for (const plate of [...this.lookups.keys()]) {
                if (!keep.includes(plate)) {
                    this.lookups.delete(plate);
                }
            }
            return;
        }

        if (statement.startsWith('delete from lookups where plate = ?')) {
            this.lookups.delete(String(params[0]));
            return;
        }

        if (statement.startsWith('update lookups set sri_json')) {
            const row = this.lookups.get(String(params[2]));

            if (row) {
                row.sri_json = String(params[0]);
                row.fiscalia_json = String(params[1]);
            }
            return;
        }

        if (statement.startsWith('insert into lookups')) {
            const plate = String(params[0]);
            this.lookups.set(plate, {
                plate,
                sri_json: String(params[1]),
                fiscalia_json: String(params[2]),
                fetched_at: Number(params[3]),
            });
            return;
        }

        if (statement.startsWith('delete from lookup_rate_events')) {
            const windowStartedAt = Number(params[0]);
            const now = Number(params[1]);
            this.rateEvents = this.rateEvents.filter(
                (requestedAt) => requestedAt > windowStartedAt && requestedAt <= now,
            );
            return;
        }

        if (statement.startsWith('insert into lookup_rate_events')) {
            this.rateEvents.push(Number(params[0]));
            return;
        }

        if (statement.startsWith('delete from source_cooldowns where source = ?')) {
            this.cooldowns.delete(String(params[0]));
            return;
        }

        if (statement.startsWith('delete from source_cooldowns where cooldown_until <= ?')) {
            const now = Number(params[0]);
            for (const [source, until] of this.cooldowns) {
                if (until <= now) {
                    this.cooldowns.delete(source);
                }
            }
            return;
        }

        if (statement.startsWith('insert into source_cooldowns')) {
            const source = String(params[0]);
            const cooldownUntil = Number(params[1]);
            const current = this.cooldowns.get(source) ?? 0;
            this.cooldowns.set(source, Math.max(current, cooldownUntil));
            return;
        }

        if (statement.startsWith('insert into settings')) {
            this.settings.set('theme', String(params[0]));
        }
    }

    async getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null> {
        const statement = compactSql(sql);

        if (statement.includes('from lookups where plate = ? and fetched_at > ?')) {
            const row = this.lookups.get(String(params[0]));
            if (!row || row.fetched_at <= Number(params[1])) {
                return null;
            }
            return row as T;
        }

        if (statement.includes('from lookups where plate = ?')) {
            return (this.lookups.get(String(params[0])) as T | undefined) ?? null;
        }

        if (statement.includes('from lookup_rate_events')) {
            return {
                requestCount: this.rateEvents.length,
                oldestRequest: this.rateEvents.length ? Math.min(...this.rateEvents) : null,
            } as T;
        }

        if (statement.includes('from source_cooldowns')) {
            const cooldownUntil = this.cooldowns.get(String(params[0]));
            return cooldownUntil === undefined ? null : ({ cooldownUntil } as T);
        }

        if (statement.includes("from settings where key = 'theme'")) {
            const value = this.settings.get('theme');
            return value === undefined ? null : ({ value } as T);
        }

        return null;
    }

    async getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
        const statement = compactSql(sql);

        if (statement.includes('fetched_at as fetchedat')) {
            const threshold = Number(params[0]);
            const limit = Number(params[1]);
            return [...this.lookups.values()]
                .filter((row) => row.fetched_at > threshold)
                .sort((left, right) => right.fetched_at - left.fetched_at)
                .slice(0, limit)
                .map((row) => ({ plate: row.plate, fetchedAt: row.fetched_at })) as T[];
        }

        if (statement.includes('from lookups')) {
            return [...this.lookups.values()] as T[];
        }

        return [];
    }

    async withTransactionAsync(work: () => Promise<void>): Promise<void> {
        await work();
    }
}

const fakeDatabase = new FakeSqliteDatabase();

export const getFakeDatabase = (): FakeSqliteDatabase => fakeDatabase;

export const resetFakeDatabase = (): FakeSqliteDatabase => {
    fakeDatabase.clear();
    return fakeDatabase;
};
