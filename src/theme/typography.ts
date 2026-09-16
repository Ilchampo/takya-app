import type { TextStyle } from 'react-native';

export const fonts = {
    title: 'LeckerliOne',
    regular: 'Avenir-Regular',
    medium: 'Avenir-Medium',
    heavy: 'Avenir-Heavy',
    black: 'Avenir-Black',
} as const;

export const fontFamilyForWeight = (weight?: TextStyle['fontWeight']): string => {
    const value = String(weight ?? '400');

    if (value === '500' || value === '600') {
        return fonts.medium;
    }

    if (value === '700' || value === '800' || value === 'bold') {
        return fonts.heavy;
    }

    if (value === '900') {
        return fonts.black;
    }

    return fonts.regular;
};
