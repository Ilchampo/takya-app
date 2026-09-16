import React, { useState } from 'react';

import type { AppTheme } from '../../theme/theme';
import type * as types from '../../lib/types';

import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon } from '../Icon/Icon';
import { getServiceConfig } from '../../lib/configs/serviceSection.config';
import { sourcePresentation, toneColors } from '../../lib/utils/source.utils';

import styles from './ServiceSection.styles';

interface ServiceSectionProps {
    service: types.ServiceId;
    theme: AppTheme;
    source?: types.SourceProgress;
    initiallyExpanded?: boolean;
    fetchedAt: number;
}

interface HeaderProps {
    title: string;
    subtitle: string;
    icon: types.IconName;
    presentation: types.SourcePresentation;
    colors: types.ToneColors;
    expanded: boolean;
    onToggle: VoidFunction;
    theme: AppTheme;
}

const Header: React.FC<HeaderProps> = (props) => {
    const { title, subtitle, icon, presentation, colors, expanded, onToggle, theme } = props;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${presentation.label}`}
            accessibilityState={{ expanded }}
            onPress={onToggle}
            style={({ pressed }) => [styles.header, { opacity: pressed ? 0.6 : 1 }]}
        >
            <View style={[styles.serviceIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Icon name={icon} size={23} color={theme.colors.primaryPressed} />
            </View>
            <View style={styles.heading}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
            </View>
            <View style={[styles.statusIcon, { backgroundColor: colors.background }]}>
                {presentation.tone === 'loading' ? (
                    <ActivityIndicator
                        accessibilityLabel={`${title}: ${presentation.label}`}
                        size="small"
                        color={colors.color}
                    />
                ) : (
                    <Icon name={presentation.icon} size={22} color={colors.color} />
                )}
            </View>
            <View style={expanded ? styles.chevronExpanded : undefined}>
                <Icon name="chevron" size={14} color={theme.colors.textFaint} />
            </View>
        </Pressable>
    );
};

export const ServiceSection: React.FC<ServiceSectionProps> = (props) => {
    const { service, theme, source, initiallyExpanded = false, fetchedAt } = props;
    const { title, subtitle, icon, Success } = getServiceConfig(service);

    const [expanded, setExpanded] = useState(initiallyExpanded);

    const presentation = sourcePresentation(source);
    const colors = toneColors(presentation.tone, theme);

    return (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Header
                title={title}
                subtitle={subtitle}
                icon={icon}
                presentation={presentation}
                colors={colors}
                expanded={expanded}
                onToggle={() => setExpanded((value) => !value)}
                theme={theme}
            />
            <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.color }]}>
                {presentation.label}
            </Text>
            {expanded && (
                <View style={[styles.body, { borderTopColor: theme.colors.border }]}>
                    {presentation.tone === 'success' && source?.status === 'success' ? (
                        <Success data={source.data} theme={theme} fetchedAt={fetchedAt} />
                    ) : presentation.note ? (
                        <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                            {presentation.note}
                        </Text>
                    ) : null}
                </View>
            )}
        </View>
    );
};
