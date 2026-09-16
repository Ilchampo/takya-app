import React from 'react';

import type { AppTheme } from '../../theme/theme';
import type { Incident } from '../../lib/interfaces/incident.interface';

import { StyleSheet, Text, View } from 'react-native';
import { incidentRecords } from '../../data/incidents.data';

import styles from './IncidentList.styles';

interface IncidentListProps {
    data: unknown;
    theme: AppTheme;
}

const fields: { key: keyof Incident; label: string }[] = [
    { key: 'gen_delito_tipopenal', label: 'Delito' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'hora', label: 'Hora' },
];

const displayValue = (value: string): string => (value.trim() ? value.trim() : 'No disponible');

export const IncidentList: React.FC<IncidentListProps> = (props) => {
    const { data, theme } = props;
    const incidents = incidentRecords(data);

    if (!incidents) {
        return (
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                La respuesta no contiene registros de Fiscalía que podamos mostrar.
            </Text>
        );
    }

    if (incidents.length === 0) {
        return (
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                No se encontraron noticias del delito para esta placa.
            </Text>
        );
    }

    return (
        <View style={styles.list}>
            {incidents.map((incident, index) => (
                <View
                    key={`${incident.fecha}-${incident.hora}-${incident.ciudad}-${index}`}
                    style={[
                        styles.card,
                        index > 0 && {
                            borderTopWidth: StyleSheet.hairlineWidth,
                            borderTopColor: theme.colors.border,
                        },
                    ]}
                >
                    {fields.map((field) => (
                        <View key={field.key} style={styles.detail}>
                            <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                                {field.label}
                            </Text>
                            <Text selectable style={[styles.value, { color: theme.colors.text }]}>
                                {displayValue(incident[field.key])}
                            </Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};
