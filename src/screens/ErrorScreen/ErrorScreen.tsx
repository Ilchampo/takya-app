import React from 'react';

import type { AppTheme } from '../../theme/theme';

import { Pressable, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreditFooter } from '../../components/CreditFooter/CreditFooter';
import { Text } from '../../components/Text/Text';
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
    const resolvedTheme = theme ?? createTheme(systemScheme === 'dark' ? 'dark' : 'light');
    const colors = resolvedTheme.colors;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View style={styles.body}>
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
            </View>
            <CreditFooter theme={resolvedTheme} includeInset={false} />
        </SafeAreaView>
    );
};
