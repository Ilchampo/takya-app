import React from 'react';

import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './ErrorScreen.styles';

interface ErrorScreenProps {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: VoidFunction;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = (props) => {
    const { title, message, actionLabel, onAction } = props;

    return (
        <SafeAreaView style={styles.safe}>
            <View accessibilityRole="alert" style={styles.card}>
                <Text accessibilityRole="header" style={styles.title}>
                    {title}
                </Text>
                <Text style={styles.message}>{message}</Text>
                {actionLabel && onAction && (
                    <Pressable
                        accessibilityRole="button"
                        onPress={onAction}
                        style={({ pressed }) => [styles.button, pressed && { opacity: 0.75 }]}
                    >
                        <Text style={styles.buttonText}>{actionLabel}</Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
};
