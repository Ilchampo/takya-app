import React from 'react';

import type { AppTheme } from '../../theme/theme';

import Svg, { G, Path } from 'react-native-svg';

import { logoPaths } from './logoPaths';

interface LogoProps {
    theme: AppTheme;
    full?: boolean;
    width?: number;
    onPrimary?: boolean;
}

export const TakyaBrand: React.FC<LogoProps> = (props) => {
    const { theme, full = false, width, onPrimary = false } = props;

    const ink = onPrimary ? theme.colors.onPrimary : theme.colors.text;
    const size = width ?? (full ? 144 : 112);

    return (
        <Svg
            width={size}
            height={full ? (size * 119.45782) / 94.294677 : (size * 42) / 126}
            viewBox={full ? '0 0 94.294677 119.45782' : '0 0 126 42'}
            accessibilityRole="image"
            accessibilityLabel="Takya"
        >
            {full ? (
                <G transform="translate(-3081.4359,671.749)">
                    {logoPaths.map((p) => (
                        <Path
                            key={p.id}
                            d={p.d}
                            fill={p.yellow && !onPrimary ? theme.colors.primary : ink}
                        />
                    ))}
                </G>
            ) : (
                <>
                    <G transform="scale(0.42) translate(-3081.4359,671.749)">
                        {logoPaths
                            .filter((p) => p.id !== 'text91')
                            .map((p) => (
                                <Path
                                    key={p.id}
                                    d={p.d}
                                    fill={p.yellow && !onPrimary ? theme.colors.primary : ink}
                                />
                            ))}
                    </G>
                    <G transform="translate(48,8) scale(1.38) translate(-3101.7925,572)">
                        <Path d={logoPaths[0].d} fill={ink} />
                    </G>
                </>
            )}
        </Svg>
    );
};
