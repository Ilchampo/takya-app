import type { AppTheme } from '../../theme/theme';

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon/Icon';
import { TopBar } from '../../components/TopBar/TopBar';

import styles from './LegalScreen.styles';

interface LegalScreenProps {
    theme: AppTheme;
    onBack: VoidFunction;
    onToggleTheme: VoidFunction;
}

export const LegalScreen: React.FC<LegalScreenProps> = (props) => {
    const { theme, onBack, onToggleTheme } = props;

    return (
        <SafeAreaView
            style={[styles.safe, { backgroundColor: theme.colors.background }]}
            edges={['top', 'bottom', 'left', 'right']}
        >
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <TopBar theme={theme} onBack={onBack} onToggleTheme={onToggleTheme} />
                <View style={styles.heading}>
                    <View style={[styles.icon, { backgroundColor: theme.colors.surfaceMuted }]}>
                        <Icon name="shield" size={26} color={theme.colors.orangePressed} />
                    </View>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Privacidad y uso responsable
                    </Text>
                    <Text style={[styles.intro, { color: theme.colors.textMuted }]}>
                        Takya acerca información pública sin convertirla en un juicio sobre una
                        persona o un vehículo.
                    </Text>
                </View>

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border,
                        },
                    ]}
                >
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                        Tus datos permanecen contigo
                    </Text>
                    <Text style={[styles.body, { color: theme.colors.textMuted }]}>
                        No necesitas crear una cuenta. La placa se consulta directamente desde tu
                        teléfono a las fuentes públicas y Takya no usa un servidor propio para
                        recolectar, vender o analizar tus búsquedas.
                    </Text>
                    <View style={[styles.fact, { borderTopColor: theme.colors.border }]}>
                        <Icon name="database" size={20} color={theme.colors.orangePressed} />
                        <Text style={[styles.factText, { color: theme.colors.text }]}>
                            El historial local guarda hasta 5 consultas y elimina cada registro
                            después de 3 días.
                        </Text>
                    </View>
                </View>

                <View style={[styles.notice, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Icon name="info" size={22} color={theme.colors.orangePressed} />
                    <Text style={[styles.noticeText, { color: theme.colors.text }]}>
                        La presencia o ausencia de registros no prueba culpabilidad, inocencia, ni
                        que un vehículo sea seguro o inseguro. Contrasta siempre la información con
                        las autoridades y con el vehículo que observas.
                    </Text>
                </View>

                <View style={styles.disclaimer}>
                    <Text style={[styles.kicker, { color: theme.colors.orangePressed }]}>
                        AVISO DE LA FISCALÍA GENERAL DEL ESTADO
                    </Text>
                    <Text selectable style={[styles.body, { color: theme.colors.textMuted }]}>
                        ACA EL LEGAL DISCLAIMER
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
