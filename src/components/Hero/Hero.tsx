import React from 'react';

import type { ReactNode } from 'react';
import type { AppTheme } from '../../theme/theme';

import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styles from './Hero.styles';

interface HeroProps {
    theme: AppTheme;
    children: ReactNode;
    compact?: boolean;
}

export const Hero: React.FC<HeroProps> = (props) => {
    const { theme, children, compact = false } = props;
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.hero,
                compact ? styles.compact : styles.default,
                {
                    backgroundColor: theme.colors.primary,
                    paddingTop: insets.top + 12,
                },
            ]}
        >
            <View style={styles.inner}>{children}</View>
        </View>
    );
};
