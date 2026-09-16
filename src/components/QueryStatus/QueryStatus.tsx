import React from 'react';

import type { AppTheme } from '../../theme/theme';
import type * as types from '../../lib/types';

import { Pressable, Text, View } from 'react-native';
import { displayPlate } from '../../lib/utils/licensePlate.utils';
import { formatLookupDate } from '../../lib/utils/date.utils';
import { ServiceSection } from '../ServiceSection/ServiceSection';

import styles from './QueryStatus.styles';

interface QueryStatusProps {
    result: types.LookupProgress;
    theme: AppTheme;
    onCancel?: VoidFunction;
    onRefresh?: VoidFunction;
    expanded?: boolean;
}

export const QueryStatus: React.FC<QueryStatusProps> = (props) => {
    const { result, theme, onCancel, onRefresh, expanded = false } = props;
    const { sri, fiscalia } = result;

    const loading = sri.status === 'loading' || fiscalia.status === 'loading';
    const hasSuccessfulSource = sri.status === 'success' || fiscalia.status === 'success';

    return (
        <View style={styles.wrapper}>
            <View style={styles.heading}>
                <Text
                    accessibilityRole="header"
                    style={[styles.title, { color: theme.colors.text }]}
                >
                    Estado de Consulta
                </Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                    {displayPlate(result.plate)}
                    {result.fromCache ? ' · Guardado' : ''}
                </Text>
            </View>
            <ServiceSection
                key={`sri-${result.plate}`}
                service="sri"
                source={sri}
                theme={theme}
                initiallyExpanded={expanded}
            />
            <ServiceSection
                key={`fiscalia-${result.plate}`}
                service="fiscalia"
                source={fiscalia}
                theme={theme}
                initiallyExpanded={expanded}
            />
            {loading && onCancel ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar consulta en curso"
                    onPress={onCancel}
                    style={styles.cancel}
                >
                    <Text style={[styles.meta, { color: theme.colors.orangePressed }]}>
                        Cancelar consulta
                    </Text>
                </Pressable>
            ) : (
                <>
                    <Text style={[styles.date, { color: theme.colors.textMuted }]}>
                        {hasSuccessfulSource ? 'Consultado' : 'Intento realizado'} el{' '}
                        {formatLookupDate(result.fetchedAt)}
                    </Text>
                    {onRefresh ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Volver a consultar esta placa"
                            onPress={onRefresh}
                            style={styles.cancel}
                        >
                            <Text style={[styles.meta, { color: theme.colors.orangePressed }]}>
                                Consultar de nuevo
                            </Text>
                        </Pressable>
                    ) : null}
                </>
            )}
        </View>
    );
};
