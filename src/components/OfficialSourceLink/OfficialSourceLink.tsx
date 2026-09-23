import React from 'react';

import type { StyleProp, TextStyle } from 'react-native';
import type { AppTheme } from '../../theme/theme';
import type { OfficialSource } from '../../lib/utils/source.utils';

import { Alert, Linking } from 'react-native';

import { Text } from '../Text/Text';

import styles from './OfficialSourceLink.styles';

interface OfficialSourceLinkProps {
    theme: AppTheme;
    source: OfficialSource;
    children: string;
    style?: StyleProp<TextStyle>;
    testID?: string;
}

const confirmOfficialSource = (source: OfficialSource): void => {
    Alert.alert(source.name, `Vas a abrir la fuente oficial en ${source.host}.`, [
        { text: 'Cancelar', style: 'cancel' },
        {
            text: 'Continuar',
            onPress: () => {
                void Linking.openURL(source.url).catch(() => undefined);
            },
        },
    ]);
};

export const OfficialSourceLink: React.FC<OfficialSourceLinkProps> = (props) => {
    const { theme, source, children, style, testID } = props;

    return (
        <Text
            testID={testID}
            accessibilityRole="link"
            accessibilityLabel={`${source.name}. Fuente oficial: ${source.url}`}
            onPress={() => confirmOfficialSource(source)}
            style={[styles.link, { color: theme.colors.text }, style]}
        >
            {children}
        </Text>
    );
};
