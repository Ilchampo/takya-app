export type FlaggedPersonStatus =
    'SOSPECHOSO' | 'APREHENDIDO' | 'SOSPECHOSO NO RECONOCIDO' | 'PROCESADO';

export interface FlaggedPerson {
    nombreCompleto: string;
    primerApellido: string;
    estado: FlaggedPersonStatus;
}

export interface FiscaliaSubject {
    persona: string;
    tipo: FlaggedPersonStatus;
}

export interface FiscaliaIncident {
    ciudad: string;
    fecha: string;
    hora: string;
    gen_delito_tipopenal: string;
    sujetos: FiscaliaSubject[];
}

export interface FiscaliaResponse {
    cabecera: FiscaliaIncident[];
}

export interface Incident {
    ciudad: string;
    fecha: string;
    hora: string;
    gen_delito_tipopenal: string;
    personasSenaladas: FlaggedPerson[];
}
