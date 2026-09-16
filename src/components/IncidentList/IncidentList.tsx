import React from 'react';

import type { FiscaliaIncident } from '../../lib/interfaces/incident.interface';
import type * as types from '../../lib/types';

import { StyleSheet, Text, View } from 'react-native';
import { flaggedPersonFromSubject, projectedIncidentRecords } from '../../data/incidents.data';

import config from '../../lib/configs/app.config';
import styles from './IncidentList.styles';

type GeneralIncidentField = keyof Pick<
    FiscaliaIncident,
    'gen_delito_tipopenal' | 'ciudad' | 'fecha' | 'hora'
>;

const fields: { key: GeneralIncidentField; label: string }[] = [
    { key: 'gen_delito_tipopenal', label: 'Delito' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'hora', label: 'Hora' },
];

const displayValue = (value: string): string => (value.trim() ? value.trim() : 'No disponible');

export const IncidentList: React.FC<types.SuccessBodyProps> = (props) => {
    const { data, theme } = props;

    const incidents = projectedIncidentRecords(data);
    const months = config.service.incidentMonths;

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
                No se encontraron noticias del delito para esta placa en los últimos {months}{' '}
                {months === 1 ? 'mes' : 'meses'}.
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
                    <View
                        style={[
                            styles.people,
                            {
                                borderTopColor: theme.colors.border,
                                backgroundColor: theme.colors.surfaceMuted,
                            },
                        ]}
                    >
                        <Text style={[styles.peopleTitle, { color: theme.colors.text }]}>
                            Personas señaladas en el registro
                        </Text>
                        <Text style={[styles.peopleNotice, { color: theme.colors.textMuted }]}>
                            Estos estados no confirman culpabilidad ni que la persona sea
                            propietaria o conductora del vehículo.
                        </Text>
                        {incident.sujetos.length > 0 ? (
                            incident.sujetos.map((subject) => {
                                const person = flaggedPersonFromSubject(subject);

                                return (
                                    <View
                                        key={`${person.estado}-${person.nombreCompleto}`}
                                        style={[
                                            styles.person,
                                            {
                                                backgroundColor: theme.colors.surface,
                                                borderColor: theme.colors.border,
                                            },
                                        ]}
                                    >
                                        <Text
                                            selectable
                                            style={[
                                                styles.personName,
                                                { color: theme.colors.text },
                                            ]}
                                        >
                                            {person.nombreCompleto}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.personStatus,
                                                { color: theme.colors.primaryPressed },
                                            ]}
                                        >
                                            Estado registrado: {person.estado}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.surnameHint,
                                                { color: theme.colors.textMuted },
                                            ]}
                                        >
                                            Primer apellido para comparar: {person.primerApellido}
                                        </Text>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={[styles.noPeople, { color: theme.colors.textMuted }]}>
                                No hay nombres válidos con los estados seleccionados.
                            </Text>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
};
