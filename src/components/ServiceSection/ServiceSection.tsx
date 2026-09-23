import React from 'react';

import type { AppTheme } from '../../theme/theme';
import type * as types from '../../lib/types';

import { ActivityIndicator, View } from 'react-native';
import { Icon } from '../Icon/Icon';
import { OfficialSourceLink } from '../OfficialSourceLink/OfficialSourceLink';
import { Text } from '../Text/Text';
import { getServiceConfig } from '../../lib/configs/serviceSection.config';
import { officialSource, sourcePresentation } from '../../lib/utils/source.utils';

import styles from './ServiceSection.styles';

interface ServiceSectionProps {
    service: types.ServiceId;
    theme: AppTheme;
    source?: types.SourceProgress;
    fetchedAt: number;
}

export const ServiceSection: React.FC<ServiceSectionProps> = (props) => {
    const { service, theme, source, fetchedAt } = props;

    const { title, subtitle, icon, Success } = getServiceConfig(service);
    const presentation = sourcePresentation(source);
    const citation = officialSource(service);

    return (
        <View
            style={[
                styles.section,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
        >
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <View style={[styles.icon, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Icon name={icon} color={theme.colors.text} size={22} />
                </View>
                <View style={styles.copy}>
                    <Text
                        accessibilityRole="header"
                        style={[styles.title, { color: theme.colors.text }]}
                    >
                        {title}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                        {subtitle}
                    </Text>
                    {citation && (
                        <OfficialSourceLink
                            testID={`section-source-${service}`}
                            theme={theme}
                            source={citation}
                            style={styles.sourceLink}
                        >
                            {citation.host}
                        </OfficialSourceLink>
                    )}
                </View>
                {source?.status === 'loading' && (
                    <ActivityIndicator
                        color={theme.colors.text}
                        accessibilityLabel={presentation.label}
                    />
                )}
            </View>
            {source?.status === 'success' ? (
                <View style={styles.body}>
                    <Success data={source.data} theme={theme} fetchedAt={fetchedAt} />
                </View>
            ) : (
                <View style={styles.state}>
                    <Text
                        accessibilityLiveRegion="polite"
                        style={[
                            styles.stateTitle,
                            {
                                color:
                                    source?.status === 'error'
                                        ? theme.colors.danger
                                        : theme.colors.text,
                            },
                        ]}
                    >
                        {presentation.label}
                    </Text>
                    <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                        {presentation.note}
                    </Text>
                </View>
            )}
        </View>
    );
};
