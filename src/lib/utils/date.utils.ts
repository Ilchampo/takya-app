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
