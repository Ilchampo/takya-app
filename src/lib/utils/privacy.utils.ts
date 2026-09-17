import { fiscaliaIncidents } from '../../data/incidents.data.ts';
import { asRecord, asText } from './misc.utils.ts';
import { maskPersonName } from './personName.utils.ts';

const MAX_VEHICLE_FIELD_LENGTH = 120;
const MAX_INCIDENTS = 100;
const MAX_INCIDENT_PEOPLE = 100;
const MAX_INCIDENT_FIELD_LENGTH = 500;
const MAX_PERSON_NAME_LENGTH = 160;

const VEHICLE_DETAIL_KEYS = ['descripcionMarca', 'descripcionModelo', 'colorVehiculo1'] as const;

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

const clip = (value: string, maxLength: number): string => value.slice(0, maxLength);

const safeVehicleValue = (value: unknown): string | number | boolean | null => {
    if (typeof value === 'string') {
        return clip(value.trim(), MAX_VEHICLE_FIELD_LENGTH);
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    return typeof value === 'boolean' ? value : null;
};

const vehicleNotFoundMessage = (record: Record<string, unknown>): string | null => {
    if (record.sriVehicleNotFound === true) {
        return asText(record.mensaje) || 'El vehículo no existe';
    }

    const mensajeServidor = asRecord(record.mensajeServidor);
    const mensaje = asText(mensajeServidor?.texto);

    if (record.objeto !== null || !Array.isArray(record.data) || !mensaje) {
        return null;
    }

    return mensaje;
};

export const projectVehicleData = (data: unknown): Record<string, unknown> | null => {
    const record = asRecord(data);

    if (!record) {
        return null;
    }

    if (typeof record.numeroPlaca === 'string' && record.numeroPlaca.trim()) {
        const projected: Record<string, unknown> = {
            numeroPlaca: clip(record.numeroPlaca.trim(), MAX_VEHICLE_FIELD_LENGTH),
        };

        for (const key of VEHICLE_DETAIL_KEYS) {
            if (key in record) {
                projected[key] = safeVehicleValue(record[key]);
            }
        }

        return projected;
    }

    const mensaje = vehicleNotFoundMessage(record);

    if (!mensaje) {
        return null;
    }

    return {
        sriVehicleNotFound: true,
        mensaje: clip(mensaje, MAX_VEHICLE_FIELD_LENGTH),
    };
};

export const isVehicleNotFoundProjection = (data: Record<string, unknown>): boolean =>
    data.sriVehicleNotFound === true;

export const projectFiscaliaData = (
    data: unknown,
    endDate = Date.now(),
    months = 24,
): Record<string, unknown> | null => {
    const incidents = fiscaliaIncidents(data, endDate, months);

    if (!incidents) {
        return null;
    }

    let remainingPeople = MAX_INCIDENT_PEOPLE;

    return {
        cabecera: incidents.slice(0, MAX_INCIDENTS).map((incident) => {
            const people = incident.sujetos.slice(0, remainingPeople).map((person) => ({
                persona: clip(maskPersonName(person.persona), MAX_PERSON_NAME_LENGTH),
                tipo: person.tipo,
            }));

            remainingPeople -= people.length;

            return {
                ciudad: clip(incident.ciudad, MAX_INCIDENT_FIELD_LENGTH),
                fecha: clip(incident.fecha, MAX_INCIDENT_FIELD_LENGTH),
                hora: clip(incident.hora, MAX_INCIDENT_FIELD_LENGTH),
                gen_delito_tipopenal: clip(
                    incident.gen_delito_tipopenal,
                    MAX_INCIDENT_FIELD_LENGTH,
                ),
                sujetos: people,
            };
        }),
    };
};
