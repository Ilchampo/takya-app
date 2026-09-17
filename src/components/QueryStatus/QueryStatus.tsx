import React from 'react';

import type { AppTheme } from '../../theme/theme';
import type * as types from '../../lib/types';

import { View } from 'react-native';
import { ServiceSection } from '../ServiceSection/ServiceSection';

import styles from './QueryStatus.styles';

interface QueryStatusProps {
    result: types.LookupProgress;
    theme: AppTheme;
}

export const QueryStatus: React.FC<QueryStatusProps> = (props) => {
    const { result, theme } = props;

    return (
        <View style={styles.sections}>
            <ServiceSection
                key={`sri-${result.plate}`}
                service="sri"
                source={result.sri}
                theme={theme}
                fetchedAt={result.fetchedAt}
            />
            <ServiceSection
                key={`fiscalia-${result.plate}`}
                service="fiscalia"
                source={result.fiscalia}
                theme={theme}
                fetchedAt={result.fetchedAt}
            />
        </View>
    );
};
