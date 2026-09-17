import type { AppTheme } from '../../theme/theme';
import type * as types from '../../lib/types';

import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    View,
} from 'react-native';
import { displayPlate, isValidPlate } from '../../lib/utils/licensePlate.utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { describeLookupAge } from '../../lib/utils/date.utils';

import { Button } from '../../components/Button/Button';
import { Hero } from '../../components/Hero/Hero';
import { Icon } from '../../components/Icon/Icon';
import { PlateInput } from '../../components/PlateInput/PlateInput';
import { Text } from '../../components/Text/Text';
import { TopBar } from '../../components/TopBar/TopBar';

import config from '../../lib/configs/app.config';
import styles from './HomeScreen.styles';

interface HomeScreenProps {
    theme: AppTheme;
    plate: string;
    history: types.LookupHistoryItem[];
    loading: boolean;
    error: string | null;
    storageAvailable: boolean;
    onPlateChange: (value: string) => void;
    onSubmit: VoidFunction;
    onOpenHistory: (plate: string) => void;
    onOpenLegal: VoidFunction;
    onToggleTheme: VoidFunction;
    onClearHistory: () => Promise<boolean>;
}

export const HomeScreen: React.FC<HomeScreenProps> = (props) => {
    const {
        theme,
        plate,
        history,
        loading,
        error,
        storageAvailable,
        onPlateChange,
        onSubmit,
        onOpenHistory,
        onOpenLegal,
        onToggleTheme,
        onClearHistory,
    } = props;

    const insets = useSafeAreaInsets();

    const submit = (): void => {
        if (!loading && isValidPlate(plate)) {
            Keyboard.dismiss();
            onSubmit();
        }
    };

    const clearHistory = async (): Promise<void> => {
        const cleared = await onClearHistory();

        if (!cleared) {
            Alert.alert(
                'No se pudo borrar el historial',
                'Intenta nuevamente desde los ajustes del dispositivo.',
            );
        }
    };

    const confirmClearHistory = (): void => {
        Alert.alert(
            'Borrar historial',
            'Se eliminarán las consultas guardadas en este dispositivo.',
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
        <View
            style={[
                styles.safe,
                { backgroundColor: theme.colors.background, paddingBottom: insets.bottom },
            ]}
        >
            <View
                pointerEvents="none"
                style={[
                    styles.statusFill,
                    { height: insets.top, backgroundColor: theme.colors.primary },
                ]}
            />
            <KeyboardAvoidingView
                style={styles.safe}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <Hero theme={theme}>
                        <TopBar theme={theme} onToggleTheme={onToggleTheme} onPrimary />
                        <View style={styles.intro}>
                            <Text style={[styles.eyebrow, { color: theme.colors.onPrimaryFaint }]}>
                                ANTES DE SUBIR
                            </Text>
                            <Text
                                accessibilityRole="header"
                                style={[styles.title, { color: theme.colors.onPrimary }]}
                            >
                                Conoce el vehículo.{'\n'}Elige con información.
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.colors.onPrimaryMuted }]}>
                                Consulta su placa en fuentes públicas de Ecuador.
                            </Text>
                        </View>
                    </Hero>
                    <View style={styles.body}>
                        <View
                            style={[
                                styles.form,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    shadowColor: theme.colors.shadow,
                                },
                            ]}
                        >
                            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                                ¿Cuál es la placa?
                            </Text>
                            <PlateInput
                                value={plate}
                                onChange={onPlateChange}
                                onSubmit={submit}
                                theme={theme}
                            />
                            {error && (
                                <Text
                                    accessibilityRole="alert"
                                    style={[styles.error, { color: theme.colors.danger }]}
                                >
                                    {error}
                                </Text>
                            )}
                            <Button
                                label="Consultar vehículo"
                                onPress={submit}
                                theme={theme}
                                disabled={!isValidPlate(plate) || loading}
                                loading={loading}
                            />
                            <View style={[styles.sources, { borderTopColor: theme.colors.border }]}>
                                <Icon name="database" color={theme.colors.textMuted} size={16} />
                                <Text
                                    style={[styles.sourceText, { color: theme.colors.textMuted }]}
                                >
                                    SRI <Text style={{ color: theme.colors.textFaint }}> · </Text>{' '}
                                    Fiscalía General del Estado
                                </Text>
                            </View>
                        </View>
                        <View style={styles.recent}>
                            <View style={styles.sectionHeader}>
                                <Text
                                    accessibilityRole="header"
                                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                                >
                                    Consultas recientes
                                </Text>
                                {history.length > 0 && (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Borrar historial"
                                        onPress={confirmClearHistory}
                                        style={styles.clear}
                                    >
                                        <Text
                                            style={[
                                                styles.action,
                                                { color: theme.colors.textMuted },
                                            ]}
                                        >
                                            Borrar
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                            {history.length ? (
                                history.map((item) => (
                                    <Pressable
                                        key={item.plate}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Ver consulta de ${displayPlate(item.plate)}`}
                                        onPress={() => onOpenHistory(item.plate)}
                                        style={({ pressed }) => [
                                            styles.historyRow,
                                            {
                                                borderBottomColor: theme.colors.border,
                                                opacity: pressed ? 0.55 : 1,
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
                                                name="clock"
                                                size={21}
                                                color={theme.colors.text}
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
                                                {describeLookupAge(item.fetchedAt)} · Guardada
                                            </Text>
                                        </View>
                                        <Icon
                                            name="chevron"
                                            size={18}
                                            color={theme.colors.textMuted}
                                        />
                                    </Pressable>
                                ))
                            ) : (
                                <View style={[styles.empty, { borderColor: theme.colors.border }]}>
                                    <Icon name="clock" color={theme.colors.textMuted} size={24} />
                                    <View style={styles.historyCopy}>
                                        <Text
                                            style={[
                                                styles.emptyTitle,
                                                { color: theme.colors.text },
                                            ]}
                                        >
                                            {storageAvailable
                                                ? 'Tu historial empieza aquí'
                                                : 'Historial no disponible'}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.historyAge,
                                                { color: theme.colors.textMuted },
                                            ]}
                                        >
                                            {storageAvailable
                                                ? `Tus últimas ${config.service.historyLimit} consultas, a mano durante ${config.service.ttlDays} días.`
                                                : 'Puedes consultar sin guardar los resultados.'}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            onPress={onOpenLegal}
                            style={({ pressed }) => [
                                styles.privacy,
                                { borderTopColor: theme.colors.border, opacity: pressed ? 0.6 : 1 },
                            ]}
                        >
                            <View
                                style={[
                                    styles.privacyIcon,
                                    { backgroundColor: theme.colors.surfaceMuted },
                                ]}
                            >
                                <Icon name="shield" size={21} color={theme.colors.text} />
                            </View>
                            <View style={styles.historyCopy}>
                                <Text style={[styles.privacyTitle, { color: theme.colors.text }]}>
                                    Tu consulta, en tus manos
                                </Text>
                                <Text
                                    style={[styles.historyAge, { color: theme.colors.textMuted }]}
                                >
                                    Privacidad y uso responsable
                                </Text>
                            </View>
                            <Icon name="chevron" size={18} color={theme.colors.textMuted} />
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};
