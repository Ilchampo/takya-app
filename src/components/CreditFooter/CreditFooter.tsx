import React from 'react';

import type { AppTheme } from '../../theme/theme';

import { Alert, Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AstrobitLogo } from '../Brand/AstrobitLogo';
import { Text } from '../Text/Text';

import styles from './CreditFooter.styles';

const ASTROBIT_HOST = 'www.goastrobit.com';
const ASTROBIT_URL = `https://${ASTROBIT_HOST}`;

interface CreditFooterProps {
    theme: AppTheme;
    includeInset?: boolean;
}

const openAstrobit = (): void => {
    Alert.alert('Astrobit', `Vas a ser redirigido a ${ASTROBIT_HOST}.`, [
        { text: 'Cancelar', style: 'cancel' },
        {
            text: 'Continuar',
            onPress: () => {
                void Linking.openURL(ASTROBIT_URL).catch(() => undefined);
            },
        },
    ]);
};

export const CreditFooter: React.FC<CreditFooterProps> = (props) => {
    const { theme, includeInset = true } = props;
    const insets = useSafeAreaInsets();
    const logoColor = theme.dark ? '#FFFFFF' : theme.colors.textFaint;

    return (
        <View
            style={[
                styles.footer,
                {
                    backgroundColor: theme.colors.background,
                    paddingBottom: includeInset ? Math.max(insets.bottom, 8) : 8,
                },
            ]}
        >
            <Text style={[styles.label, { color: theme.colors.textFaint }]}>Desarrollado por</Text>
            <Pressable
                accessibilityRole="link"
                accessibilityLabel={ASTROBIT_HOST}
                onPress={openAstrobit}
                style={({ pressed }) => [styles.logo, { opacity: pressed ? 0.55 : 0.85 }]}
            >
                <AstrobitLogo color={logoColor} width={52} />
            </Pressable>
        </View>
    );
};
