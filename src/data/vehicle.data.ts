import type * as types from '../lib/types.ts';

import { displayPlate } from '../lib/utils/licensePlate.utils.ts';

const fields = [
    ['descripcionMarca', 'Marca'],
    ['descripcionModelo', 'Modelo'],
    ['numeroPlaca', 'Placa'],
    ['colorVehiculo1', 'Color'],
] as const;

const displayValue = (value: unknown): string => {
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    if (typeof value === 'boolean') {
        return value ? 'Sí' : 'No';
    }

    return 'No disponible';
};

export const vehicleDetails = (data: unknown): types.VehicleDetail[] | null => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return null;
    }

    const record = data as Record<string, unknown>;

    if (typeof record.numeroPlaca !== 'string' || !record.numeroPlaca.trim()) {
        return null;
    }

    return fields.map(([key, label]) => ({
        key,
        label,
        value:
            key === 'numeroPlaca'
                ? displayPlate(displayValue(record[key]))
                : displayValue(record[key]),
    }));
};
