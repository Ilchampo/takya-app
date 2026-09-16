import React from 'react';

import { StyleSheet, Text as RNText, type TextProps } from 'react-native';
import { fontFamilyForWeight } from '../../theme/typography';

export const Text: React.FC<TextProps> = ({ style, ...props }) => {
    const flattened = StyleSheet.flatten(style);
    const { fontFamily: explicitFamily, fontWeight, ...rest } = flattened ?? {};
    const fontFamily = explicitFamily ?? fontFamilyForWeight(fontWeight);

    return <RNText {...props} style={[rest, { fontFamily }]} />;
};
