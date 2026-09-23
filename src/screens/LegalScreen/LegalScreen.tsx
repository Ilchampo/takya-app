import type { AppTheme } from '../../theme/theme';
import type { IconName } from '../../lib/types.ts';

import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { EdgeSwipeBack } from '../../components/EdgeSwipeBack/EdgeSwipeBack';
import { Hero } from '../../components/Hero/Hero';
import { Icon } from '../../components/Icon/Icon';
import { OfficialSourceLink } from '../../components/OfficialSourceLink/OfficialSourceLink';
import { Text } from '../../components/Text/Text';
import { TopBar } from '../../components/TopBar/TopBar';

import config from '../../lib/configs/app.config';
import { GOVERNMENT_DISCLAIMER, officialSources } from '../../lib/utils/source.utils';
import styles from './LegalScreen.styles';

interface LegalScreenProps {
    theme: AppTheme;
    onBack: VoidFunction;
    onToggleTheme: VoidFunction;
    onOpenPrivacyPolicy: VoidFunction;
    onOpenTermsOfService: VoidFunction;
}

interface DocumentLinkProps {
    theme: AppTheme;
    icon: IconName;
    title: string;
    subtitle: string;
    onPress: VoidFunction;
    testID?: string;
}

const DocumentLink: React.FC<DocumentLinkProps> = (props) => {
    const { theme, icon, title, subtitle, onPress, testID } = props;

    return (
        <Pressable
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={title}
            onPress={onPress}
            style={({ pressed }) => [
                styles.documentRow,
                { borderBottomColor: theme.colors.border, opacity: pressed ? 0.55 : 1 },
            ]}
        >
            <View style={[styles.documentIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Icon name={icon} size={21} color={theme.colors.text} />
            </View>
            <View style={styles.documentCopy}>
                <Text style={[styles.documentTitle, { color: theme.colors.text }]}>{title}</Text>
                <Text style={[styles.documentSubtitle, { color: theme.colors.textMuted }]}>
                    {subtitle}
                </Text>
            </View>
            <Icon name="chevron" size={18} color={theme.colors.textMuted} />
        </Pressable>
    );
};

export const LegalScreen: React.FC<LegalScreenProps> = (props) => {
    const { theme, onBack, onToggleTheme, onOpenPrivacyPolicy, onOpenTermsOfService } = props;

    return (
        <EdgeSwipeBack onBack={onBack}>
            <View style={[styles.safe, { backgroundColor: theme.colors.background }]}>
                <Hero theme={theme} compact>
                    <TopBar
                        theme={theme}
                        onBack={onBack}
                        title="Privacidad y uso"
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
                            La placa se consulta desde tu teléfono al SRI y a la Fiscalía. No
                            necesitas una cuenta y Takya no utiliza un servidor propio para
                            recolectar tus búsquedas.
                        </Text>
                        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
                            {GOVERNMENT_DISCLAIMER}
                        </Text>
                        <View style={styles.sources}>
                            {officialSources().map((source) => (
                                <View key={source.id} style={styles.source}>
                                    <Text style={[styles.sourceName, { color: theme.colors.text }]}>
                                        {source.name}
                                    </Text>
                                    <OfficialSourceLink
                                        testID={`legal-source-${source.id}`}
                                        theme={theme}
                                        source={source}
                                        style={styles.sourceUrl}
                                    >
                                        {source.url}
                                    </OfficialSourceLink>
                                </View>
                            ))}
                        </View>
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
                            {config.service.ttlDays === 1 ? 'día' : 'días'}. Puedes borrarlas desde
                            la pantalla de inicio.
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
                            La presencia o ausencia de registros no prueba culpabilidad, inocencia
                            ni la seguridad de un vehículo. Contrasta los datos con el vehículo que
                            observas y, cuando lo necesites, con las autoridades.
                        </Text>
                    </View>
                    <View style={[styles.note, { backgroundColor: theme.colors.surfaceMuted }]}>
                        <Icon name="info" size={20} color={theme.colors.textMuted} />
                        <Text style={[styles.noteText, { color: theme.colors.textMuted }]}>
                            Los nombres y estados que aparecen pertenecen al registro público. No
                            confirman quién conduce el vehículo.
                        </Text>
                    </View>
                    <View style={styles.documents}>
                        <Text
                            accessibilityRole="header"
                            style={[styles.documentsTitle, { color: theme.colors.text }]}
                        >
                            Documentos legales
                        </Text>
                        <DocumentLink
                            testID="open-privacy-policy"
                            theme={theme}
                            icon="shield"
                            title="Política de Privacidad"
                            subtitle="Qué información trata Takya y qué no recopila"
                            onPress={onOpenPrivacyPolicy}
                        />
                        <DocumentLink
                            testID="open-terms"
                            theme={theme}
                            icon="file"
                            title="Términos y Condiciones"
                            subtitle="Uso permitido, límites y responsabilidades"
                            onPress={onOpenTermsOfService}
                        />
                    </View>
                </ScrollView>
            </View>
        </EdgeSwipeBack>
    );
};
