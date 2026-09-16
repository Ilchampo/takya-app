export interface Incident {
    ciudad: string;
    fecha: string;
    hora: string;
    gen_delito_tipopenal: string;
}

export interface FiscaliaResponse {
    cabecera: Incident[];
}
