import type { AppTheme } from '../../theme/theme';
import type * as types from '../../lib/types';

import { ActivityIndicator, ScrollView, View } from 'react-native';
import { tryNormalizePlate } from '../../lib/utils/licensePlate.utils';
import { formatLookupDate } from '../../lib/utils/date.utils';

import { Button } from '../../components/Button/Button';
import { EdgeSwipeBack } from '../../components/EdgeSwipeBack/EdgeSwipeBack';
import { Hero } from '../../components/Hero/Hero';
import { Icon } from '../../components/Icon/Icon';
import { LicensePlate } from '../../components/LicensePlate/LicensePlate';
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
        <EdgeSwipeBack onBack={onBack}>
            <View style={[styles.safe, { backgroundColor: theme.colors.background }]}>
                <Hero theme={theme} compact>
                    <TopBar
                        theme={theme}
                        onToggleTheme={onToggleTheme}
                        onBack={onBack}
                        title={saved ? 'Consulta guardada' : 'Tu consulta'}
                        onPrimary
                    />
                </Hero>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.heading}>
                        <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>
                            {saved || result?.fromCache
                                ? 'GUARDADA EN TU DISPOSITIVO'
                                : 'INFORMACIÓN DEL VEHÍCULO'}
                        </Text>
                        <LicensePlate plate={result?.plate ?? tryNormalizePlate(plate) ?? plate} />
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
                            Compara estos datos con el vehículo. La información pública no certifica
                            su seguridad.
                        </Text>
                    </View>
                    <Button
                        testID="search-another-plate"
                        label="Consultar otra placa"
                        theme={theme}
                        onPress={onBack}
                    />
                    {loading && onCancel ? (
                        <Button
                            testID="cancel-lookup"
                            label="Cancelar consulta"
                            theme={theme}
                            variant="secondary"
                            onPress={onCancel}
                        />
                    ) : (
                        <Button
                            testID="refresh-lookup"
                            label="Actualizar consulta"
                            theme={theme}
                            variant="secondary"
                            onPress={onRefresh}
                        />
                    )}
                    <Button
                        testID="open-legal-from-result"
                        label="Privacidad y uso responsable"
                        theme={theme}
                        variant="ghost"
                        onPress={onOpenLegal}
                    />
                </ScrollView>
            </View>
        </EdgeSwipeBack>
    );
};
