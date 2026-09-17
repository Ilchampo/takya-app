import React from 'react';

import { View } from 'react-native';
import { displayPlate } from '../../lib/utils/licensePlate.utils';
import { Text } from '../Text/Text';

import styles from './LicensePlate.styles';

const FLAG_YELLOW = '#FFD100';
const FLAG_BLUE = '#034EA2';
const FLAG_RED = '#CE1126';

interface LicensePlateProps {
    plate: string;
}

const plateSerial = (value: string): string => displayPlate(value).replace('-', ' - ');

export const LicensePlate: React.FC<LicensePlateProps> = (props) => {
    const serial = plateSerial(props.plate);

    return (
        <View
            accessible
            accessibilityRole="header"
            accessibilityLabel={serial}
            style={styles.plate}
        >
            <View style={styles.header}>
                <View accessibilityElementsHidden style={styles.brand}>
                    <View style={styles.flagSlot}>
                        <View style={styles.flag}>
                            <View
                                style={[styles.stripe, { flex: 2, backgroundColor: FLAG_YELLOW }]}
                            />
                            <View
                                style={[styles.stripe, { flex: 1, backgroundColor: FLAG_BLUE }]}
                            />
                            <View style={[styles.stripe, { flex: 1, backgroundColor: FLAG_RED }]} />
                        </View>
                    </View>
                    <Text style={styles.ant}>TKY</Text>
                </View>
                <Text style={styles.country}>ECUADOR</Text>
            </View>
            <Text selectable numberOfLines={1} adjustsFontSizeToFit style={styles.serial}>
                {serial}
            </Text>
        </View>
    );
};
