export const formatLookupDate = (timestamp: number): string =>
    new Intl.DateTimeFormat('es-EC', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(timestamp));

export const describeLookupAge = (timestamp: number, now = Date.now()): string => {
    const elapsedMinutes = Math.max(0, Math.floor((now - timestamp) / 60_000));

    if (elapsedMinutes < 1) {
        return 'Ahora';
    }

    if (elapsedMinutes < 60) {
        return `Hace ${elapsedMinutes} min`;
    }

    const hours = Math.floor(elapsedMinutes / 60);

    if (hours < 24) {
        return `Hace ${hours} h`;
    }

    const days = Math.floor(hours / 24);

    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
};

export const daysToMilliSeconds = (days: number): number => days * 24 * 60 * 60 * 1_000;

export const secondsTomilliSeconds = (seconds: number): number => seconds * 1_000;

const lastDayOfMonth = (year: number, month: number): number =>
    new Date(year, month + 1, 0).getDate();

export const startOfLocalDay = (timestamp: number): Date => {
    const date = new Date(timestamp);

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const subtractMonths = (timestamp: number, months: number): Date => {
    const end = startOfLocalDay(timestamp);
    const year = end.getFullYear();
    const month = end.getMonth() - months;
    const start = new Date(year, month, 1);

    start.setDate(Math.min(end.getDate(), lastDayOfMonth(start.getFullYear(), start.getMonth())));

    return start;
};

export const parseCalendarDate = (value: string): Date | null => {
    const trimmed = value.trim();
    const iso = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T\s].*)?$/);

    if (iso) {
        return calendarDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    }

    const dayFirst = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s.*)?$/);

    if (!dayFirst) {
        return null;
    }

    return calendarDate(Number(dayFirst[3]), Number(dayFirst[2]), Number(dayFirst[1]));
};

const calendarDate = (year: number, month: number, day: number): Date | null => {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return null;
    }

    if (month < 1 || month > 12 || day < 1 || day > lastDayOfMonth(year, month - 1)) {
        return null;
    }

    return new Date(year, month - 1, day);
};

export const isWithinLookback = (value: string, endDate: number, months: number): boolean => {
    const incident = parseCalendarDate(value);

    if (!incident) {
        return false;
    }

    const start = subtractMonths(endDate, months).getTime();
    const end = startOfLocalDay(endDate).getTime() + 24 * 60 * 60 * 1_000 - 1;

    const time = incident.getTime();

    return time >= start && time <= end;
};
