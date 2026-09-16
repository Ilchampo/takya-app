import type { AppTheme } from '../../theme/theme';
import type * as types from '../../lib/types';

import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { displayPlate, isValidPlate, normalizePlate } from '../../lib/utils/licensePlate.utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { describeLookupAge } from '../../lib/utils/date.utils';

import { Icon } from '../../components/Icon/Icon';
import { PlateInput } from '../../components/PlateInput/PlateInput';
import { QueryStatus } from '../../components/QueryStatus/QueryStatus';
import { TopBar } from '../../components/TopBar/TopBar';

import config from '../../lib/configs/app.config';
import styles from './HomeScreen.styles';

interface HomeScreenProps {
    theme: AppTheme;
    plate: string;
    result: types.LookupProgress | null;
    history: types.LookupHistoryItem[];
    loading: boolean;
    error: string | null;
    storageAvailable: boolean;
    onPlateChange: (value: string) => void;
    onSubmit: VoidFunction;
    onRefresh: VoidFunction;
    onCancel: VoidFunction;
    onOpenHistory: (plate: string) => void;
    onOpenLegal: VoidFunction;
    onToggleTheme: VoidFunction;
    onClearHistory: () => Promise<boolean>;
}

export const HomeScreen: React.FC<HomeScreenProps> = (props) => {
    const {
        theme,
        plate,
        result,
        history,
        loading,
        error,
        storageAvailable,
        onPlateChange,
        onSubmit,
        onRefresh,
        onCancel,
        onOpenHistory,
        onOpenLegal,
        onToggleTheme,
        onClearHistory,
    } = props;

    const valid = isValidPlate(plate);
    const normalizedPlate = valid ? normalizePlate(plate) : null;
    const visibleResult = result?.plate === normalizedPlate ? result : null;

    const searchingThisPlate = loading;

    const submitDisabled = !valid || searchingThisPlate;

    const submit = () => {
        Keyboard.dismiss();
        onSubmit();
    };

    const clearHistory = async (): Promise<void> => {
        const cleared = await onClearHistory();

        if (!cleared) {
            Alert.alert(
                'No se pudo borrar el historial',
                'Intenta nuevamente o elimina los datos de Takya desde los ajustes del dispositivo.',
            );
        }
    };

    const confirmClearHistory = (): void => {
        Alert.alert(
            'Borrar historial',
            'Se eliminarán permanentemente todas las consultas guardadas en este dispositivo.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Borrar',
                    style: 'destructive',
                    onPress: () => void clearHistory(),
                },
            ],
        );
    };

    return (
        <SafeAreaView
            style={[styles.safe, { backgroundColor: theme.colors.primary }]}
            edges={['top', 'bottom', 'left', 'right']}
        >
            <KeyboardAvoidingView
                style={[styles.safe, { backgroundColor: theme.colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
                        <TopBar theme={theme} onToggleTheme={onToggleTheme} onPrimary />
                        <Text
                            accessibilityRole="header"
                            style={[styles.title, { color: theme.colors.onPrimary }]}
                        >
                            Una placa.{'\n'}Más información.
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.colors.onPrimary }]}>
                            Consulta tu vehículo, sin complicaciones.
                        </Text>
                    </View>

                    <View style={styles.main}>
                        <View
                            style={[
                                styles.form,
                                {
                                    backgroundColor: theme.colors.surface,
                                    shadowColor: theme.colors.shadow,
                                },
                            ]}
                        >
                            <Text
                                accessibilityRole="header"
                                style={[styles.formTitle, { color: theme.colors.text }]}
                            >
                                Placa del vehículo
                            </Text>
                            <PlateInput
                                value={plate}
                                onChange={onPlateChange}
                                onSubmit={() => !searchingThisPlate && submit()}
                                theme={theme}
                            />
                            {error && (
                                <Text
                                    accessibilityLiveRegion="polite"
                                    style={[styles.error, { color: theme.colors.danger }]}
                                >
                                    {error}
                                </Text>
                            )}
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ disabled: submitDisabled }}
                                disabled={submitDisabled}
                                onPress={submit}
                                style={({ pressed }) => [
                                    styles.submit,
                                    {
                                        backgroundColor: submitDisabled
                                            ? theme.colors.surfaceStrong
                                            : theme.colors.primary,
                                        opacity: pressed ? 0.75 : 1,
                                    },
                                ]}
                            >
                                <Icon
                                    name="search"
                                    size={21}
                                    color={
                                        submitDisabled
                                            ? theme.colors.textMuted
                                            : theme.colors.onPrimary
                                    }
                                />
                                <Text
                                    style={[
                                        styles.submitText,
                                        {
                                            color: submitDisabled
                                                ? theme.colors.textMuted
                                                : theme.colors.onPrimary,
                                        },
                                    ]}
                                >
                                    {searchingThisPlate ? 'Consultando…' : 'Consultar placa'}
                                </Text>
                            </Pressable>
                        </View>

                        {visibleResult && (
                            <QueryStatus
                                result={visibleResult}
                                theme={theme}
                                onCancel={onCancel}
                                onRefresh={onRefresh}
                            />
                        )}

                        <View style={styles.recent}>
                            <View style={styles.recentHeader}>
                                <Text
                                    accessibilityRole="header"
                                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                                >
                                    Recientes
                                </Text>
                                {history.length > 0 && (
                                    <View style={styles.recentActions}>
                                        <Text
                                            style={[
                                                styles.historyCount,
                                                { color: theme.colors.textMuted },
                                            ]}
                                        >
                                            {history.length} de {config.service.historyLimit}
                                        </Text>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Borrar historial de consultas"
                                            accessibilityState={{ disabled: loading }}
                                            disabled={loading}
                                            hitSlop={8}
                                            onPress={confirmClearHistory}
                                            style={({ pressed }) => [
                                                { opacity: loading ? 0.4 : 1 },
                                                pressed && !loading && { opacity: 0.6 },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.clearHistory,
                                                    { color: theme.colors.danger },
                                                ]}
                                            >
                                                Borrar
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                            {history.length === 0 ? (
                                <View
                                    style={[
                                        styles.empty,
                                        { backgroundColor: theme.colors.surface },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.emptyIcon,
                                            { backgroundColor: theme.colors.surfaceMuted },
                                        ]}
                                    >
                                        <Icon
                                            name="clock"
                                            size={25}
                                            color={theme.colors.primaryPressed}
                                        />
                                    </View>
                                    <View style={styles.emptyCopy}>
                                        <Text
                                            style={[
                                                styles.emptyTitle,
                                                { color: theme.colors.text },
                                            ]}
                                        >
                                            {storageAvailable
                                                ? 'Tu próxima consulta empieza aquí'
                                                : 'Historial no disponible'}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.emptyText,
                                                { color: theme.colors.textMuted },
                                            ]}
                                        >
                                            {storageAvailable
                                                ? `Aquí encontrarás tus últimas consultas, disponibles durante ${config.service.ttlDays} ${
                                                      config.service.ttlDays === 1 ? 'día' : 'días'
                                                  }.`
                                                : 'Las consultas funcionan, pero no se guardarán en este dispositivo.'}
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <View
                                    style={[
                                        styles.historyList,
                                        { backgroundColor: theme.colors.surface },
                                    ]}
                                >
                                    {history.map((item, index) => (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel={`Abrir resumen de ${displayPlate(item.plate)}`}
                                            accessibilityState={{ disabled: loading }}
                                            disabled={loading}
                                            key={item.plate}
                                            onPress={() => {
                                                Keyboard.dismiss();
                                                onOpenHistory(item.plate);
                                            }}
                                            style={({ pressed }) => [
                                                styles.historyRow,
                                                {
                                                    borderTopWidth:
                                                        index > 0 ? StyleSheet.hairlineWidth : 0,
                                                    borderTopColor: theme.colors.border,
                                                    opacity: loading || pressed ? 0.5 : 1,
                                                },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.historyIcon,
                                                    { backgroundColor: theme.colors.surfaceMuted },
                                                ]}
                                            >
                                                <Icon
                                                    name="car"
                                                    size={23}
                                                    color={theme.colors.primaryPressed}
                                                />
                                            </View>
                                            <View style={styles.historyCopy}>
                                                <Text
                                                    style={[
                                                        styles.historyPlate,
                                                        { color: theme.colors.text },
                                                    ]}
                                                >
                                                    {displayPlate(item.plate)}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.historyAge,
                                                        { color: theme.colors.textMuted },
                                                    ]}
                                                >
                                                    {describeLookupAge(item.fetchedAt)} · Ver
                                                    resumen
                                                </Text>
                                            </View>
                                            <Icon
                                                name="chevron"
                                                size={18}
                                                color={theme.colors.primaryPressed}
                                            />
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>

                        {!storageAvailable && (
                            <Text style={[styles.smallText, { color: theme.colors.textMuted }]}>
                                El historial no está disponible en este dispositivo.
                            </Text>
                        )}
                        <View style={styles.footer}>
                            <Pressable
                                accessibilityRole="link"
                                onPress={onOpenLegal}
                                style={styles.privacyLink}
                            >
                                <Icon name="shield" size={17} color={theme.colors.primaryPressed} />
                                <Text style={[styles.smallText, { color: theme.colors.textMuted }]}>
                                    Privacidad y uso responsable
                                </Text>
                            </Pressable>
                            <Text style={[styles.disclaimer, { color: theme.colors.textMuted }]}>
                                La información pública no certifica la seguridad de un vehículo.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
