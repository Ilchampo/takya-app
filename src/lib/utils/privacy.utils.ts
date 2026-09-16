import { incidentRecords } from '../../data/incidents.data.ts';
import { asRecord } from './misc.utils.ts';

const MAX_VEHICLE_FIELD_LENGTH = 120;
const MAX_INCIDENTS = 100;
const MAX_INCIDENT_PEOPLE = 100;
const MAX_INCIDENT_FIELD_LENGTH = 500;
const MAX_PERSON_NAME_LENGTH = 160;

const normalizedKey = (key: string): string =>
    key
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

const isCedulaKey = (key: string): boolean => normalizedKey(key).includes('cedula');

const sanitizeValue = (value: unknown, insideSubjects = false): unknown => {
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item, insideSubjects));
    }

    if (!value || typeof value !== 'object') {
        return value;
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
        if (isCedulaKey(key) || (insideSubjects && key === '0')) {
            continue;
        }

        const isSubjectsField = normalizedKey(key) === 'sujetos';

        sanitized[key] = sanitizeValue(item, insideSubjects || isSubjectsField);
    }

    return sanitized;
};

export const sanitizeGovernmentData = (data: unknown): unknown => sanitizeValue(data);

const safeVehicleValue = (value: unknown): string | number | boolean | null => {
    if (typeof value === 'string') {
        return value.trim().slice(0, MAX_VEHICLE_FIELD_LENGTH);
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    return typeof value === 'boolean' ? value : null;
};

export const projectVehicleData = (data: unknown): Record<string, unknown> | null => {
    const record = asRecord(sanitizeGovernmentData(data));

    if (!record || typeof record.numeroPlaca !== 'string' || !record.numeroPlaca.trim()) {
        return null;
    }

    const projected: Record<string, unknown> = {
        numeroPlaca: record.numeroPlaca.trim().slice(0, MAX_VEHICLE_FIELD_LENGTH),
    };

    for (const key of ['descripcionMarca', 'descripcionModelo', 'colorVehiculo1']) {
        if (key in record) {
            projected[key] = safeVehicleValue(record[key]);
        }
    }

    return projected;
};

export const projectFiscaliaData = (data: unknown): Record<string, unknown> | null => {
    const incidents = incidentRecords(sanitizeGovernmentData(data));

    if (!incidents) {
        return null;
    }

    let remainingPeople = MAX_INCIDENT_PEOPLE;

    return {
        cabecera: incidents.slice(0, MAX_INCIDENTS).map((incident) => {
            const people = incident.personasSenaladas.slice(0, remainingPeople).map((person) => ({
                persona: person.nombreCompleto.slice(0, MAX_PERSON_NAME_LENGTH),
                tipo: person.estado,
            }));

            remainingPeople -= people.length;

            return {
                ciudad: incident.ciudad.slice(0, MAX_INCIDENT_FIELD_LENGTH),
                fecha: incident.fecha.slice(0, MAX_INCIDENT_FIELD_LENGTH),
                hora: incident.hora.slice(0, MAX_INCIDENT_FIELD_LENGTH),
                gen_delito_tipopenal: incident.gen_delito_tipopenal.slice(
                    0,
                    MAX_INCIDENT_FIELD_LENGTH,
                ),
                sujetos: people,
            };
        }),
    };
};
