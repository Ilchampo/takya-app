import type {
    FlaggedPerson,
    FlaggedPersonStatus,
    FiscaliaIncident,
    FiscaliaSubject,
    Incident,
} from '../lib/interfaces/incident.interface.ts';

import { isWithinLookback, parseCalendarDate } from '../lib/utils/date.utils.ts';
import { asRecord, asText } from '../lib/utils/misc.utils.ts';
import { maskPersonName } from '../lib/utils/personName.utils.ts';

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

const flaggedSubjects = (value: unknown): FiscaliaSubject[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    const people: FiscaliaSubject[] = [];
    const seen = new Set<string>();

    for (const item of value) {
        const subject = asRecord(item);
        const tipo = flaggedStatus(asText(subject?.tipo) || asText(subject?.estado));

        if (!subject || !tipo) {
            continue;
        }

        const names = splitReportedNames(
            asText(subject.persona) || asText(subject.nombres_completos),
        );

        for (const persona of names) {
            const key = `${tipo}:${persona.toLocaleUpperCase('es-EC')}`;

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            people.push({ persona: maskPersonName(persona), tipo });
        }
    }

    return people;
};

const toFiscaliaIncident = (value: unknown): FiscaliaIncident | null => {
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
        sujetos: flaggedSubjects(row.sujetos),
    };
};

const compareIncidents = (left: FiscaliaIncident, right: FiscaliaIncident): number => {
    const leftTime = parseCalendarDate(left.fecha)?.getTime() ?? 0;
    const rightTime = parseCalendarDate(right.fecha)?.getTime() ?? 0;

    if (rightTime !== leftTime) {
        return rightTime - leftTime;
    }

    return right.hora.localeCompare(left.hora);
};

const toIncident = (incident: FiscaliaIncident): Incident => ({
    ciudad: incident.ciudad,
    fecha: incident.fecha,
    hora: incident.hora,
    gen_delito_tipopenal: incident.gen_delito_tipopenal,
    personasSenaladas: incident.sujetos.map(flaggedPersonFromSubject),
});

export const flaggedPersonFromSubject = (subject: FiscaliaSubject): FlaggedPerson => {
    const nombreCompleto = maskPersonName(subject.persona);

    return {
        nombreCompleto,
        primerApellido: nombreCompleto.split(' ')[0] || nombreCompleto,
        estado: subject.tipo,
    };
};

export const fiscaliaIncidents = (
    data: unknown,
    endDate = Date.now(),
    months = 24,
): FiscaliaIncident[] | null => {
    const header = asRecord(data)?.cabecera;

    if (!Array.isArray(header)) {
        return null;
    }

    const incidents: FiscaliaIncident[] = [];

    let parsedAny = false;

    for (const item of header) {
        const incident = toFiscaliaIncident(item);

        if (!incident) {
            continue;
        }

        parsedAny = true;

        if (!isWithinLookback(incident.fecha, endDate, months)) {
            continue;
        }

        incidents.push(incident);
    }

    if (!parsedAny) {
        return header.length === 0 ? incidents : null;
    }

    return incidents.sort(compareIncidents);
};

export const projectedIncidentRecords = (data: unknown): FiscaliaIncident[] | null => {
    const header = asRecord(data)?.cabecera;

    if (!Array.isArray(header)) {
        return null;
    }

    const incidents: FiscaliaIncident[] = [];

    for (const item of header) {
        const incident = toFiscaliaIncident(item);

        if (incident) {
            incidents.push(incident);
        }
    }

    if (incidents.length === 0) {
        return header.length === 0 ? incidents : null;
    }

    return incidents;
};

export const incidentRecords = (
    data: unknown,
    endDate = Date.now(),
    months = 24,
): Incident[] | null => {
    const incidents = fiscaliaIncidents(data, endDate, months);

    return incidents ? incidents.map(toIncident) : null;
};
