import React from 'react';

import type * as types from '../../lib/types';

import { View, useWindowDimensions } from 'react-native';
import { vehicleDetails, vehicleLookupNote } from '../../data/vehicle.data';
import { Text } from '../Text/Text';

import styles from './VehicleDetails.styles';

export const VehicleDetails: React.FC<types.SuccessBodyProps> = (props) => {
    const { data, theme } = props;

    const details = vehicleDetails(data);
    const { fontScale } = useWindowDimensions();

    if (!details) {
        return (
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                {vehicleLookupNote(data) ?? 'No hay una ficha vehicular disponible.'}
            </Text>
        );
    }

    return (
        <View style={styles.grid}>
            {details.map((detail) => (
                <View
                    key={detail.key}
                    style={[styles.detail, { width: fontScale > 1.3 ? '100%' : '46%' }]}
                >
                    <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                        {detail.label}
                    </Text>
                    <Text selectable style={[styles.value, { color: theme.colors.text }]}>
                        {detail.value}
                    </Text>
                </View>
            ))}
        </View>
    );
};
