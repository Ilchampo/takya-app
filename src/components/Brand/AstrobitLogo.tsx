import React from 'react';

import { SvgXml } from 'react-native-svg';

import { astrobitSvg } from './astrobitSvg';

const RATIO = 79.550171 / 204.42895;

interface AstrobitLogoProps {
    color: string;
    width?: number;
}

export const AstrobitLogo: React.FC<AstrobitLogoProps> = (props) => {
    const { color, width = 132 } = props;
    const height = width * RATIO;

    return (
        <SvgXml
            xml={astrobitSvg(color)}
            width={width}
            height={height}
            accessibilityElementsHidden
        />
    );
};
