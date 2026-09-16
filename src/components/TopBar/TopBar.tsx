import React from 'react';

import type { AppTheme } from '../../theme/theme';

import { Pressable, View } from 'react-native';
import { TakyaBrand } from '../Brand/Brand';
import { Icon } from '../Icon/Icon';

import styles from './TopBar.styles';

interface TopBarProps {
    theme: AppTheme;
    onToggleTheme: VoidFunction;
    onBack?: VoidFunction;
    onPrimary?: boolean;
}

export const TopBar: React.FC<TopBarProps> = (props) => {
    const { theme, onToggleTheme, onBack, onPrimary = false } = props;

    return (
        <View style={styles.row}>
            {onBack ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Volver"
                    hitSlop={10}
                    onPress={onBack}
                    style={[
                        styles.iconButton,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border,
                        },
                    ]}
                >
                    <Icon name="back" color={theme.colors.text} />
                </Pressable>
            ) : (
                <TakyaBrand theme={theme} onPrimary={onPrimary} />
            )}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Cambiar a modo ${theme.dark ? 'claro' : 'oscuro'}`}
                hitSlop={10}
                onPress={onToggleTheme}
                style={[
                    styles.iconButton,
                    {
                        backgroundColor: onPrimary
                            ? theme.colors.onPrimaryOverlay
                            : theme.colors.surface,
                        borderColor: theme.colors.border,
                    },
                ]}
            >
                <Icon
                    name={theme.dark ? 'sun' : 'moon'}
                    color={onPrimary ? theme.colors.onPrimary : theme.colors.text}
                />
            </Pressable>
        </View>
    );
};
