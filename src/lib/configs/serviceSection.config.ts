import type * as types from '../types';

import { IncidentList } from '../../components/IncidentList/IncidentList';
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
    Success: IncidentList,
};

export const getServiceConfig = (service: types.ServiceId): types.ServiceConfig => {
    switch (service) {
        case 'sri':
            return sri;
        case 'fiscalia':
            return fiscalia;
    }
};
