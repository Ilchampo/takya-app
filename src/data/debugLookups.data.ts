const calendarDaysAgo = (days: number): string => {
    const date = new Date();

    date.setDate(date.getDate() - days);

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
};

const vehicle = (
    plate: string,
    marca: string,
    modelo: string,
    color: string,
): Record<string, unknown> => ({
    numeroPlaca: plate,
    descripcionMarca: marca,
    descripcionModelo: modelo,
    colorVehiculo1: color,
});

const incident = (
    ciudad: string,
    daysAgo: number,
    hora: string,
    delito: string,
    sujetos: { persona: string; tipo: string }[] = [],
): Record<string, unknown> => ({
    ciudad,
    fecha: calendarDaysAgo(daysAgo),
    hora,
    gen_delito_tipopenal: delito,
    sujetos,
});

const vehicles: Record<string, Record<string, unknown>> = {
    ABC1111: vehicle('ABC1111', 'CHEVROLET', 'SAIL', 'BLANCO'),
    ABC2222: vehicle('ABC2222', 'HYUNDAI', 'ACCENT', 'GRIS'),
    ABC3333: vehicle('ABC3333', 'KIA', 'RIO', 'ROJO'),
    ABC4444: {
        sriVehicleNotFound: true,
        mensaje: 'El vehículo no existe',
    },
    ABC5555: vehicle('ABC5555', 'TOYOTA', 'YARIS', 'AZUL'),
};

const fiscalia: Record<string, Record<string, unknown>> = {
    ABC1111: { cabecera: [] },
    ABC2222: {
        cabecera: [
            incident('Quito', 18, '21:14:32', 'ROBO A PERSONAS', [
                { persona: 'PAREDES SALAZAR LUIS FERNANDO', tipo: 'SOSPECHOSO' },
            ]),
        ],
    },
    ABC3333: {
        cabecera: [
            incident('Guayaquil', 41, '03:22:08', 'ROBO DE VEHICULOS', [
                { persona: 'VEGA MORALES ANA LUCIA', tipo: 'APREHENDIDO' },
            ]),
            incident('Quito', 96, '18:47:11', 'HURTO', [
                { persona: 'CAMPOS RIVERA DIEGO ARMANDO', tipo: 'PROCESADO' },
                { persona: 'NUNEZ CASTILLO MARIA ELENA', tipo: 'SOSPECHOSO NO RECONOCIDO' },
            ]),
        ],
    },
    ABC4444: { cabecera: [] },
    ABC5555: {
        cabecera: [incident('Cuenca', 7, '12:05:44', 'ROBO A PERSONAS')],
    },
};

export const debugVehiclePayload = (plate: string): Record<string, unknown> =>
    vehicles[plate] ?? {
        sriVehicleNotFound: true,
        mensaje: 'El vehículo no existe',
    };

export const debugFiscaliaPayload = (plate: string): Record<string, unknown> =>
    fiscalia[plate] ?? { cabecera: [] };
