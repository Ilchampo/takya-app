import React from 'react';

import type { ReactNode } from 'react';
import type { AccessibilityRole } from 'react-native';

import { View } from 'react-native';
import { Text } from '../Text/Text';

import styles from './PlateFrame.styles';

const FLAG_YELLOW = '#FFD100';
const FLAG_BLUE = '#034EA2';
const FLAG_RED = '#CE1126';

export type PlateFrameSize = 'display' | 'input';

interface PlateFrameProps {
    children: ReactNode;
    size?: PlateFrameSize;
    focused?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: AccessibilityRole;
}

export const PlateFrame: React.FC<PlateFrameProps> = (props) => {
    const {
        children,
        size = 'display',
        focused = false,
        accessibilityLabel,
        accessibilityRole,
    } = props;
    const input = size === 'input';

    return (
        <View
            accessible={Boolean(accessibilityLabel)}
            accessibilityRole={accessibilityRole}
            accessibilityLabel={accessibilityLabel}
            style={[
                styles.plate,
                input ? styles.plateInput : styles.plateDisplay,
                focused && styles.plateFocused,
            ]}
        >
            <View style={[styles.header, input && styles.headerInput]}>
                <View
                    accessibilityElementsHidden
                    style={[styles.brand, input && styles.brandInput]}
                >
                    <View style={[styles.flagSlot, input && styles.flagSlotInput]}>
                        <View style={[styles.flag, input && styles.flagInput]}>
                            <View
                                style={[styles.stripe, { flex: 2, backgroundColor: FLAG_YELLOW }]}
                            />
                            <View
                                style={[styles.stripe, { flex: 1, backgroundColor: FLAG_BLUE }]}
                            />
                            <View style={[styles.stripe, { flex: 1, backgroundColor: FLAG_RED }]} />
                        </View>
                    </View>
                    <Text style={[styles.ant, input && styles.antInput]}>TKY</Text>
                </View>
                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    maxFontSizeMultiplier={1.15}
                    style={[styles.country, input && styles.countryInput]}
                >
                    ECUADOR
                </Text>
            </View>
            {children}
        </View>
    );
};
