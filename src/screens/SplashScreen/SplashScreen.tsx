import React from 'react';

import type { AppTheme } from '../../theme/theme';

import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TakyaBrand } from '../../components/Brand/Brand';
import { Text } from '../../components/Text/Text';
import { createTheme } from '../../theme/theme';

import styles from './SplashScreen.styles';

interface SplashScreenProps {
    theme?: AppTheme;
}

export const SplashScreen: React.FC<SplashScreenProps> = (props) => {
    const { theme } = props;

    const system = useColorScheme();
    const current = theme ?? createTheme(system === 'dark' ? 'dark' : 'light');

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: current.colors.background }]}>
            <View style={styles.center}>
                <TakyaBrand theme={current} full width={154} />
                <Text style={[styles.tagline, { color: current.colors.textMuted }]}>
                    Información para tu camino.
                </Text>
                <ActivityIndicator
                    color={current.colors.text}
                    accessibilityLabel="Cargando Takya"
                />
            </View>
            <Text style={[styles.credit, { color: current.colors.textMuted }]}>
                Hecho por Astrobit
            </Text>
        </SafeAreaView>
    );
};
