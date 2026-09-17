import React from 'react';

import { displayPlate } from '../../lib/utils/licensePlate.utils';
import { Text } from '../Text/Text';
import { PlateFrame } from './PlateFrame';

import styles from './PlateFrame.styles';

interface LicensePlateProps {
    plate: string;
}

const plateSerial = (value: string): string => displayPlate(value).replace('-', ' - ');

export const LicensePlate: React.FC<LicensePlateProps> = (props) => {
    const serial = plateSerial(props.plate);

    return (
        <PlateFrame accessibilityRole="header" accessibilityLabel={serial}>
            <Text selectable numberOfLines={1} adjustsFontSizeToFit style={styles.serial}>
                {serial}
            </Text>
        </PlateFrame>
    );
};
