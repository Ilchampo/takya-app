import type * as types from "../lib/types";

import { asRecord, asText } from "../lib/utils/misc.utils";

export const incidentRecords = (
  data: unknown,
  plate: string,
): types.Incident[] | null => {
  const header = asRecord(data)?.cabecera;

  if (!Array.isArray(header)) {
    return null;
  }

  const incidents: types.Incident[] = [];

  for (const item of header) {
    const row = asRecord(item);

    if (!row || !asText(row.ndd)) {
      return null;
    }

    const plates = Array.isArray(row.vehiculos)
      ? row.vehiculos
          .map((vehicle) => asText(asRecord(vehicle)?.placa).toUpperCase())
          .filter(Boolean)
      : [];

    incidents.push({
      id: asText(row.ndd),
      date: asText(row.fecha),
      title: asText(row.gen_delito_tipopenal) ?? "Registro de Fiscalía",
      city: asText(row.ciudad),
      province: asText(row.pro_descripcion),
      unit: asText(row.unidad),
      plates,
      matchesPlate: plates.includes(plate.trim().toUpperCase()),
    });
  }

  return incidents;
};
