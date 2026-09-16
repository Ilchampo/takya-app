import type * as types from '../types';

import { FiscaliaPlaceholder } from '../../components/FiscaliaPlaceholder/FiscaliaPlaceholder';
import { VehicleDetails } from '../../components/VehicleDetails/VehicleDetails';

const sri: types.ServiceConfig = {
    title: 'Vehículo',
    subtitle: 'Servicio de Rentas Internas',
    icon: 'car',
    Success: VehicleDetails,
};

const fiscalia: types.ServiceConfig = {
    title: 'Fiscalía',
    subtitle: 'Noticias del delito',
    icon: 'file',
    Success: FiscaliaPlaceholder,
};

export const getServiceConfig = (service: types.ServiceId): types.ServiceConfig => {
    switch (service) {
        case 'sri':
            return sri;
        case 'fiscalia':
            return fiscalia;
    }
};
