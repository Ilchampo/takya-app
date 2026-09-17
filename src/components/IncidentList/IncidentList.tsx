import React, { useState } from 'react';

import type { FiscaliaIncident } from '../../lib/interfaces/incident.interface';
import type * as types from '../../lib/types';
import type { AppTheme } from '../../theme/theme';

import { Pressable, View } from 'react-native';
import { projectedIncidentRecords } from '../../data/incidents.data';
import {
    MASKED_NAME_PRIVACY_LABEL,
    maskPersonName,
    PEOPLE_NAME_PRIVACY_NOTE,
} from '../../lib/utils/personName.utils';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';

import config from '../../lib/configs/app.config';
import styles from './IncidentList.styles';

interface IncidentItemProps {
    incident: FiscaliaIncident;
    theme: AppTheme;
}

const IncidentItem: React.FC<IncidentItemProps> = (props) => {
    const { incident, theme } = props;
    const [open, setOpen] = useState(false);

    return (
        <View style={[styles.record, { borderTopColor: theme.colors.border }]}>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                accessibilityLabel={`${incident.gen_delito_tipopenal}, ${incident.fecha}. ${open ? 'Ocultar' : 'Ver'} detalle`}
                onPress={() => setOpen(!open)}
                style={({ pressed }) => [styles.recordHeader, { opacity: pressed ? 0.6 : 1 }]}
            >
                <View style={styles.copy}>
                    <Text style={[styles.recordTitle, { color: theme.colors.text }]}>
                        {incident.gen_delito_tipopenal}
                    </Text>
                    <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                        {incident.ciudad} · {incident.fecha}
                    </Text>
                    <Text style={[styles.link, { color: theme.colors.text }]}>
                        {open ? 'Ocultar detalle' : 'Ver detalle'}
                    </Text>
                </View>
                <View style={open ? styles.chevronOpen : undefined}>
                    <Icon name="chevron" color={theme.colors.textMuted} size={18} />
                </View>
            </Pressable>
            {open && (
                <View style={styles.details}>
                    <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                        Hora del registro: {incident.hora}
                    </Text>
                    <Text style={[styles.recordTitle, { color: theme.colors.text }]}>
                        Personas señaladas
                    </Text>
                    <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                        {PEOPLE_NAME_PRIVACY_NOTE}
                    </Text>
                    <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                        El estado registrado no confirma culpabilidad ni que la persona sea
                        propietaria o conductora del vehículo.
                    </Text>
                    {incident.sujetos.length ? (
                        incident.sujetos.map((person, index) => {
                            const displayName = maskPersonName(person.persona);

                            return (
                                <View
                                    key={`${person.tipo}-${displayName}-${index}`}
                                    style={[
                                        styles.person,
                                        { backgroundColor: theme.colors.surfaceMuted },
                                    ]}
                                >
                                    <Text
                                        selectable
                                        style={[styles.personName, { color: theme.colors.text }]}
                                    >
                                        {displayName}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.privacyLabel,
                                            { color: theme.colors.textMuted },
                                        ]}
                                    >
                                        {MASKED_NAME_PRIVACY_LABEL}
                                    </Text>
                                    <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                                        Estado: {person.tipo}
                                    </Text>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                            No hay nombres disponibles con los estados seleccionados.
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

export const IncidentList: React.FC<types.SuccessBodyProps> = (props) => {
    const { data, theme } = props;

    const incidents = projectedIncidentRecords(data);
    const months = config.service.incidentMonths;

    if (!incidents) {
        return (
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                La fuente no devolvió registros que podamos mostrar.
            </Text>
        );
    }

    return (
        <View style={styles.list}>
            <Text style={[styles.summary, { color: theme.colors.text }]}>
                {incidents.length === 0
                    ? 'Sin registros en el período consultado'
                    : `${incidents.length} ${incidents.length === 1 ? 'registro encontrado' : 'registros encontrados'}`}
            </Text>
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                Noticias del delito · Últimos {months} {months === 1 ? 'mes' : 'meses'}
            </Text>
            {incidents.map((incident, index) => (
                <IncidentItem
                    key={`${incident.fecha}-${index}`}
                    incident={incident}
                    theme={theme}
                />
            ))}
        </View>
    );
};
