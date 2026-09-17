import React from 'react';

import type { AppTheme } from '../../theme/theme';

import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { fonts } from '../../theme/typography';
import { Text } from '../Text/Text';

import { logoPaths } from './logoPaths';
import styles from './Brand.styles';

export const MARK_VIEW_WIDTH = 48;
export const MARK_VIEW_HEIGHT = 42;
export const MARK_RATIO = MARK_VIEW_HEIGHT / MARK_VIEW_WIDTH;
export const HEADER_MARK_WIDTH = 36;
export const HEADER_WORD_SIZE = 30;
export const HEADER_BRAND_GAP = 10;
export const SPLASH_MARK_WIDTH = 148;
export const SPLASH_WORD_SIZE = 54;

interface MarkProps {
    theme: AppTheme;
    width?: number;
    onPrimary?: boolean;
}

interface WordmarkProps {
    color: string;
    fontSize: number;
}

interface BrandProps {
    theme: AppTheme;
    onPrimary?: boolean;
}

const markPaths = logoPaths.filter((path) => path.id !== 'text91');

export const markHeight = (width: number): number => width * MARK_RATIO;

export const TakyaMark: React.FC<MarkProps> = (props) => {
    const { theme, width = HEADER_MARK_WIDTH, onPrimary = false } = props;
    const ink = onPrimary ? theme.colors.onPrimary : theme.colors.text;
    const height = markHeight(width);

    return (
        <Svg
            width={width}
            height={height}
            viewBox={`0 0 ${MARK_VIEW_WIDTH} ${MARK_VIEW_HEIGHT}`}
            accessibilityElementsHidden
        >
            <G transform="scale(0.42) translate(-3081.4359,671.749)">
                {markPaths.map((path) => (
                    <Path
                        key={path.id}
                        d={path.d}
                        fill={path.yellow && !onPrimary ? theme.colors.primary : ink}
                    />
                ))}
            </G>
        </Svg>
    );
};

export const TakyaWordmark: React.FC<WordmarkProps> = (props) => {
    const { color, fontSize } = props;

    return (
        <Text
            style={[
                styles.wordmark,
                {
                    color,
                    fontFamily: fonts.title,
                    fontSize,
                    lineHeight: Math.round(fontSize * 1.15),
                },
            ]}
        >
            Takya
        </Text>
    );
};

export const TakyaBrand: React.FC<BrandProps> = (props) => {
    const { theme, onPrimary = false } = props;
    const ink = onPrimary ? theme.colors.onPrimary : theme.colors.text;

    return (
        <View accessibilityRole="image" accessibilityLabel="Takya" style={styles.lockup}>
            <TakyaMark theme={theme} width={HEADER_MARK_WIDTH} onPrimary={onPrimary} />
            <TakyaWordmark color={ink} fontSize={HEADER_WORD_SIZE} />
        </View>
    );
};
