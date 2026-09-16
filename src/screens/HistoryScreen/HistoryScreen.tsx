import React from 'react';

import type { AppTheme } from '../../theme/theme';
import type * as types from '../../lib/types';

import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar/TopBar';
import { QueryStatus } from '../../components/QueryStatus/QueryStatus';
import { Button } from '../../components/Button/Button';
import { displayPlate } from '../../lib/utils/licensePlate.utils';

import styles from './HistoryScreen.styles';

interface HistoryScreenProps {
    theme: AppTheme;
    plate: string;
    result: types.LookupResult | null;
    loading: boolean;
    error: string | null;
    onBack: VoidFunction;
    onToggleTheme: VoidFunction;
    onOpenLegal: VoidFunction;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = (props) => {
    const { theme, plate, result, loading, error, onBack, onToggleTheme, onOpenLegal } = props;

    return (
        <SafeAreaView
            style={[styles.safe, { backgroundColor: theme.colors.background }]}
            edges={['top', 'bottom', 'left', 'right']}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <TopBar theme={theme} onBack={onBack} onToggleTheme={onToggleTheme} />
                <View style={[styles.ticket, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.eyebrow, { color: theme.colors.onPrimary }]}>
                        CONSULTA GUARDADA
                    </Text>
                    <Text selectable style={[styles.plate, { color: theme.colors.onPrimary }]}>
                        {displayPlate(plate)}
                    </Text>
                    <Text style={[styles.description, { color: theme.colors.onPrimary }]}>
                        El resumen de tu consulta, en un solo lugar.
                    </Text>
                </View>
                {loading && (
                    <ActivityIndicator
                        accessibilityLabel="Abriendo consulta guardada"
                        color={theme.colors.primaryPressed}
                    />
                )}
                {error && (
                    <Text
                        accessibilityLiveRegion="polite"
                        style={[styles.description, { color: theme.colors.textMuted }]}
                    >
                        {error}
                    </Text>
                )}
                {result && <QueryStatus result={result} theme={theme} expanded />}
                <Button label="Volver al inicio" onPress={onBack} theme={theme} />
                <Button
                    label="Privacidad y uso responsable"
                    onPress={onOpenLegal}
                    theme={theme}
                    variant="ghost"
                />
            </ScrollView>
        </SafeAreaView>
    );
};
