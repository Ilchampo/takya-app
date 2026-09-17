import type { AppTheme } from '../../theme/theme';
import type * as types from '../../lib/types';

import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { displayPlate, tryNormalizePlate } from '../../lib/utils/licensePlate.utils';
import { formatLookupDate } from '../../lib/utils/date.utils';

import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { QueryStatus } from '../../components/QueryStatus/QueryStatus';
import { Text } from '../../components/Text/Text';
import { TopBar } from '../../components/TopBar/TopBar';

import styles from './ResultScreen.styles';

export interface ResultScreenProps {
    theme: AppTheme;
    plate: string;
    result: types.LookupProgress | null;
    loading: boolean;
    error: string | null;
    saved?: boolean;
    onBack: VoidFunction;
    onCancel?: VoidFunction;
    onRefresh: VoidFunction;
    onToggleTheme: VoidFunction;
    onOpenLegal: VoidFunction;
}

export const ResultScreen: React.FC<ResultScreenProps> = (props) => {
    const {
        theme,
        plate,
        result,
        loading,
        error,
        saved = false,
        onBack,
        onCancel,
        onRefresh,
        onToggleTheme,
        onOpenLegal,
    } = props;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TopBar
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                    onBack={onBack}
                    title={saved ? 'Consulta guardada' : 'Tu consulta'}
                />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heading}>
                    <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>
                        {saved || result?.fromCache
                            ? 'GUARDADA EN TU DISPOSITIVO'
                            : 'INFORMACIÓN DEL VEHÍCULO'}
                    </Text>
                    <Text
                        selectable
                        accessibilityRole="header"
                        style={[styles.plate, { color: theme.colors.text }]}
                    >
                        {displayPlate(result?.plate ?? tryNormalizePlate(plate) ?? plate)}
                    </Text>
                    <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                        {loading
                            ? 'Consultando fuentes públicas…'
                            : result
                              ? formatLookupDate(result.fetchedAt)
                              : 'Consulta no completada'}
                    </Text>
                </View>
                {error && (
                    <View
                        accessibilityRole="alert"
                        style={[styles.notice, { backgroundColor: theme.colors.dangerMuted }]}
                    >
                        <Icon name="info" color={theme.colors.danger} />
                        <Text style={[styles.noticeText, { color: theme.colors.danger }]}>
                            {error}
                        </Text>
                    </View>
                )}
                {!result && loading && (
                    <View style={styles.waiting}>
                        <ActivityIndicator color={theme.colors.text} />
                        <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                            Preparando la consulta…
                        </Text>
                    </View>
                )}
                {result && <QueryStatus theme={theme} result={result} />}
                <View style={[styles.notice, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Icon name="info" size={20} color={theme.colors.textMuted} />
                    <Text style={[styles.noticeText, { color: theme.colors.textMuted }]}>
                        Compara estos datos con el vehículo. La información pública no certifica su
                        seguridad.
                    </Text>
                </View>
                {loading && onCancel ? (
                    <Button
                        label="Cancelar consulta"
                        theme={theme}
                        variant="secondary"
                        onPress={onCancel}
                    />
                ) : (
                    <Button
                        label={saved ? 'Actualizar consulta' : 'Consultar de nuevo'}
                        theme={theme}
                        onPress={onRefresh}
                    />
                )}
                <Button
                    label="Consultar otra placa"
                    theme={theme}
                    variant="ghost"
                    onPress={onBack}
                />
                <Button
                    label="Privacidad y uso responsable"
                    theme={theme}
                    variant="ghost"
                    onPress={onOpenLegal}
                />
            </ScrollView>
        </SafeAreaView>
    );
};
