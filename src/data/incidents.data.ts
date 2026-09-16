import type { Incident } from '../lib/interfaces/incident.interface.ts';

import { asRecord, asText } from '../lib/utils/misc.utils.ts';

const toIncident = (value: unknown): Incident | null => {
    const row = asRecord(value);

    if (!row) {
        return null;
    }

    const ciudad = asText(row.ciudad);
    const fecha = asText(row.fecha);
    const hora = asText(row.hora);
    const gen_delito_tipopenal = asText(row.gen_delito_tipopenal);

    if (!ciudad && !fecha && !hora && !gen_delito_tipopenal) {
        return null;
    }

    return {
        ciudad,
        fecha,
        hora,
        gen_delito_tipopenal,
    };
};

export const incidentRecords = (data: unknown): Incident[] | null => {
    const header = asRecord(data)?.cabecera;

    if (!Array.isArray(header)) {
        return null;
    }

    const incidents: Incident[] = [];

    for (const item of header) {
        const incident = toIncident(item);

        if (!incident) {
            return null;
        }

        incidents.push(incident);
    }

    return incidents;
};
