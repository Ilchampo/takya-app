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
}

export const TopBar: React.FC<TopBarProps> = (props) => {
    const { theme, onToggleTheme, onBack, title } = props;

    return (
        <View style={styles.row}>
            {onBack ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Volver"
                    onPress={onBack}
                    style={({ pressed }) => [
                        styles.back,
                        { backgroundColor: theme.colors.surfaceMuted, opacity: pressed ? 0.6 : 1 },
                    ]}
                >
                    <Icon name="back" color={theme.colors.text} size={20} />
                </Pressable>
            ) : (
                <TakyaBrand theme={theme} />
            )}
            {title && (
                <Text
                    accessibilityRole="header"
                    style={[styles.title, { color: theme.colors.text }]}
                >
                    {title}
                </Text>
            )}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Cambiar a modo ${theme.dark ? 'claro' : 'oscuro'}`}
                onPress={onToggleTheme}
                style={({ pressed }) => [
                    styles.appearance,
                    { backgroundColor: theme.colors.surfaceMuted, opacity: pressed ? 0.6 : 1 },
                ]}
            >
                <Icon name={theme.dark ? 'sun' : 'moon'} size={19} color={theme.colors.text} />
            </Pressable>
        </View>
    );
};
