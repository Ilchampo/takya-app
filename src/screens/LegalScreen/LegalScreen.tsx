import type { AppTheme } from '../../theme/theme';

import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Hero } from '../../components/Hero/Hero';
import { Icon } from '../../components/Icon/Icon';
import { Text } from '../../components/Text/Text';
import { TopBar } from '../../components/TopBar/TopBar';

import config from '../../lib/configs/app.config';
import styles from './LegalScreen.styles';

interface LegalScreenProps {
    theme: AppTheme;
    onBack: VoidFunction;
    onToggleTheme: VoidFunction;
}

export const LegalScreen: React.FC<LegalScreenProps> = (props) => {
    const { theme, onBack, onToggleTheme } = props;
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.safe,
                { backgroundColor: theme.colors.background, paddingBottom: insets.bottom },
            ]}
        >
            <Hero theme={theme} compact>
                <TopBar
                    theme={theme}
                    onBack={onBack}
                    title="Privacidad"
                    onToggleTheme={onToggleTheme}
                    onPrimary
                />
            </Hero>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.symbol, { backgroundColor: theme.colors.primary }]}>
                    <Icon name="shield" size={29} color={theme.colors.onPrimary} />
                </View>
                <Text
                    accessibilityRole="header"
                    style={[styles.title, { color: theme.colors.text }]}
                >
                    Tu información.{'\n'}Bajo tu control.
                </Text>
                <Text style={[styles.intro, { color: theme.colors.textMuted }]}>
                    Conoce qué consultas, dónde se guarda y cómo interpretar los resultados.
                </Text>
                <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
                    <Text
                        accessibilityRole="header"
                        style={[styles.subtitle, { color: theme.colors.text }]}
                    >
                        Directo a las fuentes
                    </Text>
                    <Text style={[styles.body, { color: theme.colors.textMuted }]}>
                        La placa se consulta desde tu teléfono al SRI y a la Fiscalía. No necesitas
                        una cuenta y Takya no utiliza un servidor propio para recolectar tus
                        búsquedas.
                    </Text>
                </View>
                <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
                    <Text
                        accessibilityRole="header"
                        style={[styles.subtitle, { color: theme.colors.text }]}
                    >
                        Un historial que tú controlas
                    </Text>
                    <Text style={[styles.body, { color: theme.colors.textMuted }]}>
                        Se guardan hasta {config.service.historyLimit} consultas en este
                        dispositivo, disponibles durante {config.service.ttlDays}{' '}
                        {config.service.ttlDays === 1 ? 'día' : 'días'}. Puedes borrarlas desde la
                        pantalla de inicio.
                    </Text>
                </View>
                <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
                    <Text
                        accessibilityRole="header"
                        style={[styles.subtitle, { color: theme.colors.text }]}
                    >
                        Información para decidir
                    </Text>
                    <Text style={[styles.body, { color: theme.colors.textMuted }]}>
                        La presencia o ausencia de registros no prueba culpabilidad, inocencia ni la
                        seguridad de un vehículo. Contrasta los datos con el vehículo que observas
                        y, cuando lo necesites, con las autoridades.
                    </Text>
                </View>
                <View style={[styles.note, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Icon name="info" size={20} color={theme.colors.textMuted} />
                    <Text style={[styles.noteText, { color: theme.colors.textMuted }]}>
                        Los nombres y estados que aparecen pertenecen al registro público. No
                        confirman quién conduce el vehículo.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};
