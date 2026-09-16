import React from 'react';

import type { AppTheme } from '../../theme/theme';

import { Image, Text, View } from 'react-native';
import { isLoaded } from 'expo-font';
import { Circle, Path } from 'react-native-svg';

import Svg from 'react-native-svg';
import styles from './Brand.styles';

interface TakyaBrandProps {
    theme: AppTheme;
    onOrange?: boolean;
}

interface AstrobitLogoProps {
    color?: string;
}

export const TakyaBrand: React.FC<TakyaBrandProps> = (props) => {
    const { theme, onOrange = false } = props;

    const color = onOrange ? theme.colors.onOrange : theme.colors.text;

    return (
        <View style={styles.takyaRow} accessibilityLabel="Takya">
            <Image
                source={require('../../../assets/icon.png')}
                style={styles.icon}
                accessibilityIgnoresInvertColors
            />
            <Text
                style={[
                    styles.wordmark,
                    {
                        color,
                        fontFamily: isLoaded('LeckerliOne') ? 'LeckerliOne' : undefined,
                    },
                ]}
            >
                Takya
            </Text>
        </View>
    );
};

export const AstrobitLogo: React.FC<AstrobitLogoProps> = (props) => {
    const { color = '#211B18' } = props;

    return (
        <View style={styles.astrobitRow} accessibilityLabel="Astrobit">
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
                <Circle cx="12" cy="12" r="3.2" fill={color} />
                <Path
                    d="M3.5 14.8c2.7 2 8.1 1.4 12.1-1.4s5-6.7 2.3-8.2c-2.1-1.2-5.8-.2-8.9 2"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <Circle cx="18.3" cy="5.4" r="1.4" fill={color} />
            </Svg>
            <Text style={[styles.astrobitText, { color }]}>ASTROBIT</Text>
        </View>
    );
};
