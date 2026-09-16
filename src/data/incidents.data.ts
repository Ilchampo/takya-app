import type {
    FlaggedPerson,
    FlaggedPersonStatus,
    Incident,
} from '../lib/interfaces/incident.interface.ts';

import { isWithinLookback, parseCalendarDate } from '../lib/utils/date.utils.ts';
import { asRecord, asText } from '../lib/utils/misc.utils.ts';

const flaggedStatuses = new Set<FlaggedPersonStatus>([
    'SOSPECHOSO',
    'APREHENDIDO',
    'SOSPECHOSO NO RECONOCIDO',
    'PROCESADO',
]);

const normalizeWhitespace = (value: string): string => value.trim().replace(/\s+/g, ' ');

const flaggedStatus = (value: unknown): FlaggedPersonStatus | null => {
    const status = normalizeWhitespace(asText(value)).toUpperCase() as FlaggedPersonStatus;

    return flaggedStatuses.has(status) ? status : null;
};

const splitReportedNames = (value: unknown): string[] =>
    asText(value)
        .split(';')
        .map(normalizeWhitespace)
        .filter((name) => name.split(' ').length >= 2);

const flaggedPeople = (value: unknown): FlaggedPerson[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    const people: FlaggedPerson[] = [];
    const seen = new Set<string>();

    for (const item of value) {
        const subject = asRecord(item);
        const estado = flaggedStatus(asText(subject?.tipo) || asText(subject?.estado));

        if (!subject || !estado) {
            continue;
        }

        const names = splitReportedNames(
            asText(subject.persona) || asText(subject.nombres_completos),
        );

        for (const nombreCompleto of names) {
            const key = `${estado}:${nombreCompleto.toLocaleUpperCase('es-EC')}`;

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);

            people.push({
                nombreCompleto,
                primerApellido: nombreCompleto.split(' ')[0]!,
                estado,
            });
        }
    }

    return people;
};

const toIncident = (value: unknown): Incident | null => {
    const row = asRecord(value);

    if (!row) {
        return null;
    }

    const ciudad = asText(row.ciudad);
    const fecha = asText(row.fecha);
    const hora = asText(row.hora);
    const gen_delito_tipopenal = asText(row.gen_delito_tipopenal);

    if (!ciudad || !fecha || !hora || !gen_delito_tipopenal) {
        return null;
    }

    return {
        ciudad,
        fecha,
        hora,
        gen_delito_tipopenal,
        personasSenaladas: flaggedPeople(row.sujetos),
    };
};

const compareIncidents = (left: Incident, right: Incident): number => {
    const leftTime = parseCalendarDate(left.fecha)?.getTime() ?? 0;
    const rightTime = parseCalendarDate(right.fecha)?.getTime() ?? 0;

    if (rightTime !== leftTime) {
        return rightTime - leftTime;
    }

    return right.hora.localeCompare(left.hora);
};

export const incidentRecords = (
    data: unknown,
    endDate = Date.now(),
    months = 24,
): Incident[] | null => {
    const header = asRecord(data)?.cabecera;

    if (!Array.isArray(header)) {
        return null;
    }

    const incidents: Incident[] = [];

    for (const item of header) {
        const incident = toIncident(item);

        if (!incident) {
            continue;
        }

        incidents.push(incident);
    }

    if (incidents.length === 0) {
        return header.length === 0 ? incidents : null;
    }

    return incidents
        .filter((incident) => isWithinLookback(incident.fecha, endDate, months))
        .sort(compareIncidents);
};
