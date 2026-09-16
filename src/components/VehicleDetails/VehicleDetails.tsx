import React from 'react';

import type { AppTheme } from '../../theme/theme';

import { StyleSheet, Text, View } from 'react-native';
import { vehicleDetails, vehicleLookupNote } from '../../data/vehicle.data';

import styles from './VehicleDetails.styles';

interface VehicleDetailsProps {
    data: unknown;
    theme: AppTheme;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = (props) => {
    const { data, theme } = props;
    const details = vehicleDetails(data);
    const note = vehicleLookupNote(data);

    if (!details) {
        return (
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                {note ?? 'La respuesta no contiene una ficha vehicular que podamos mostrar.'}
            </Text>
        );
    }

    return (
        <>
            {details.map((detail, index) => (
                <View
                    key={detail.key}
                    style={[
                        styles.detail,
                        index > 0 && {
                            borderTopWidth: StyleSheet.hairlineWidth,
                            borderTopColor: theme.colors.border,
                        },
                    ]}
                >
                    <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                        {detail.label}
                    </Text>
                    <Text selectable style={[styles.value, { color: theme.colors.text }]}>
                        {detail.value}
                    </Text>
                </View>
            ))}
        </>
    );
};
