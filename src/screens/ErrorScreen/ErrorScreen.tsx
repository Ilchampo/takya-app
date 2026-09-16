import React from 'react';

import type { AppTheme } from '../../theme/theme';

import { Pressable, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createTheme } from '../../theme/theme';

import styles from './ErrorScreen.styles';

interface ErrorScreenProps {
    title: string;
    message: string;
    theme?: AppTheme;
    actionLabel?: string;
    onAction?: VoidFunction;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = (props) => {
    const { title, message, actionLabel, onAction, theme } = props;
    const systemScheme = useColorScheme();
    const colors = (theme ?? createTheme(systemScheme === 'dark' ? 'dark' : 'light')).colors;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View
                accessibilityRole="alert"
                style={[styles.card, { backgroundColor: colors.surface }]}
            >
                <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
                    {title}
                </Text>
                <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
                {actionLabel && onAction && (
                    <Pressable
                        accessibilityRole="button"
                        onPress={onAction}
                        style={({ pressed }) => [
                            styles.button,
                            { backgroundColor: colors.primary },
                            pressed && { opacity: 0.75 },
                        ]}
                    >
                        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                            {actionLabel}
                        </Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
};
