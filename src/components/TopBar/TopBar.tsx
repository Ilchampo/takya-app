import React from 'react';

import type { AppTheme } from '../../theme/theme';

import { Pressable, View } from 'react-native';
import { TakyaBrand } from '../Brand/Brand';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';

import styles from './TopBar.styles';

interface TopBarProps {
    theme: AppTheme;
    onToggleTheme: VoidFunction;
    onBack?: VoidFunction;
    title?: string;
    onPrimary?: boolean;
    hideBrand?: boolean;
}

export const TopBar: React.FC<TopBarProps> = (props) => {
    const { theme, onToggleTheme, onBack, title, onPrimary = false, hideBrand = false } = props;

    const ink = onPrimary ? theme.colors.onPrimary : theme.colors.text;
    const buttonBackground = onPrimary ? theme.colors.onPrimaryOverlay : theme.colors.surfaceMuted;

    return (
        <View style={styles.row}>
            {onBack ? (
                <Pressable
                    testID="nav-back"
                    accessibilityRole="button"
                    accessibilityLabel="Volver"
                    onPress={onBack}
                    style={({ pressed }) => [
                        styles.back,
                        { backgroundColor: buttonBackground, opacity: pressed ? 0.6 : 1 },
                    ]}
                >
                    <Icon name="back" color={ink} size={20} />
                </Pressable>
            ) : (
                <View style={hideBrand ? styles.hiddenBrand : undefined}>
                    <TakyaBrand theme={theme} onPrimary={onPrimary} />
                </View>
            )}
            {title && (
                <Text accessibilityRole="header" style={[styles.title, { color: ink }]}>
                    {title}
                </Text>
            )}
            <Pressable
                testID="toggle-theme"
                accessibilityRole="button"
                accessibilityLabel={`Cambiar a modo ${theme.dark ? 'claro' : 'oscuro'}`}
                onPress={onToggleTheme}
                style={({ pressed }) => [
                    styles.appearance,
                    { backgroundColor: buttonBackground, opacity: pressed ? 0.6 : 1 },
                ]}
            >
                <Icon name={theme.dark ? 'sun' : 'moon'} size={19} color={ink} />
            </Pressable>
        </View>
    );
};
